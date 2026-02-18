#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>
#include <SPIFFS.h>
#include <XPT2046_Touchscreen.h>

// === WIFI / HTTP ===
#include <WiFi.h>
#include <HTTPClient.h>

// === PINS ===
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  4
#define TOUCH_CS 15
#define TOUCH_IRQ 27
#define FINGER_RX 21
#define FINGER_TX 22
#define BUTTON_PIN 14

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen touch(TOUCH_CS, TOUCH_IRQ);
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// === MODES ===
enum SystemMode {
  MODE_VERIFICATION,
  MODE_VERIFICATION_IN_PROGRESS,
  MODE_MAIN_MENU,
  MODE_ENROLL_CHOICE,
  MODE_PASSWORD,
  MODE_ENROLL,
  MODE_ADMIN_PASSWORD,
  MODE_ADMIN_MENU,
  MODE_MODIFICATION,
  MODE_MODIFY_CHOICE,
  MODE_SELECT_MATIERES,
  MODE_RESET_SYSTEM,
  MODE_DELETE_FINGERPRINT,
  MODE_SEARCH_MATRICULE,
  MODE_VERIFICATION_SETUP,
  MODE_ADMIN_EDIT_TIER,
  MODE_ADMIN_EDIT_SEARCHMODE
};

SystemMode currentMode = MODE_VERIFICATION;
bool isTeacherMode = false;
bool verificationActive = false;
String currentTeacherMatricule = "";
String currentMatiere = "";

// === PASSWORD ===
const String STUDENT_PASSWORD = "1234";
const String TEACHER_PASSWORD = "12345";
const String RESET_PASSWORD = "123456";
const String VERIFICATION_STOP_PASSWORD = "12345";
String tempPassword = "";
bool waitingForPassword = false;

// === FICHIERS ===
const String FILE_ELEVES = "/matricule.txt";
const String FILE_PROFS = "/prof.txt";
const String FILE_MATIERES = "/matiere.txt";
const String FILE_PRESENCE = "/presence.txt";

// === CONFIGURATION WIFI ===
//const char* WIFI_SSID = "Galaxy S95f5c";
//const char* WIFI_PASSWORD = "Un big 1";
const char* WIFI_SSID = "TECNO SPARK 10C";
const char* WIFI_PASSWORD = "987654321";
const char* BACKEND_URL = "https://projet-electronique.onrender.com/api/fingerprint/text";

// === MODIFICATION ===
int modifyID = 0;
String oldMatricule = "";
String newMatricule = "";
bool isModifyingTeacher = false;
bool waitingForNewMatricule = false;
bool isEditingMatieres = false;

// === ADMIN (ciblage + mode recherche) ===
bool adminTargetIsTeacher = false;        // true = enseignant, false = eleve
bool adminSearchByFingerprint = true;     // true = empreinte, false = matricule

// === RESET WARNING ===
bool resetWarningShown = false;
unsigned long resetWarningStartMs = 0;

// === PRESENCE SESSION (anti-doublon + format fichier) ===
bool sessionHeaderWritten = false;
String sessionPresentList = "|"; // ex: |23P001|23P002|

// === PAGINATION MATIERES (3 par slide) ===
int matierePage = 0;

// === VARIABLES ENREGISTREMENT ===
bool enrollMode = false;
int enrollID = 1;
int enrollStage = 0;
String tempMatricule = "";
bool waitingForMatricule = false;
bool wasTouched = false;
// Dernier point touch (pour fiabiliser les clics)
int lastTouchRawX = 0;
int lastTouchRawY = 0;
String selectedMatieres = "";

// === VARIABLES RECHERCHE ===
String searchMatricule = "";
bool searchingMatricule = false;

// === CLAVIER ===
const int keyW = 106;
const int keyH = 50;
const int startY = 60;

const char* keys[4][3] = {
  {"1", "2", "3"},
  {"4", "5", "6"},
  {"7", "8", "9"},
  {"DEL", "0", "OK"}
};

// Bouton debounce
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 500;

// === FONCTIONS FICHIER ===
bool saveMatricule(int id, String matricule, bool isTeacher, String matieres = "") {
  String filename = isTeacher ? FILE_PROFS : FILE_ELEVES;
  
  File file = SPIFFS.open(filename, "a");
  if (!file) {
    Serial.println("Erreur ouverture fichier");
    return false;
  }
  
  file.print(id);
  file.print(",");
  file.print(matricule);
  if (isTeacher && matieres != "") {
    file.print(",");
    file.print(matieres);
  }
  file.println();
  file.close();
  
  Serial.print("Sauvegarde: ID ");
  Serial.print(id);
  Serial.print(" -> ");
  Serial.print(matricule);
  if (isTeacher && matieres != "") {
    Serial.print(" Matieres: ");
    Serial.print(matieres);
  }
  Serial.println(isTeacher ? " (Prof)" : " (Eleve)");
  
  return true;
}

String getMatricule(int id) {
  String files[] = {FILE_PROFS, FILE_ELEVES};
  
  for (int f = 0; f < 2; f++) {
    if (!SPIFFS.exists(files[f])) continue;
    
    File file = SPIFFS.open(files[f], "r");
    if (!file) continue;
    
    while (file.available()) {
      String line = file.readStringUntil('\n');
      line.trim();
      int firstComma = line.indexOf(',');
      if (firstComma > 0) {
        int fileID = line.substring(0, firstComma).toInt();
        if (fileID == id) {
          int secondComma = line.indexOf(',', firstComma + 1);
          if (secondComma > 0) {
            file.close();
            return line.substring(firstComma + 1, secondComma);
          } else {
            file.close();
            return line.substring(firstComma + 1);
          }
        }
      }
    }
    file.close();
  }
  
  return "";
}

String getMatieresForTeacher(int id) {
  if (!SPIFFS.exists(FILE_PROFS)) return "";
  
  File file = SPIFFS.open(FILE_PROFS, "r");
  if (!file) return "";
  
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    int firstComma = line.indexOf(',');
    if (firstComma > 0) {
      int fileID = line.substring(0, firstComma).toInt();
      if (fileID == id) {
        int secondComma = line.indexOf(',', firstComma + 1);
        if (secondComma > 0) {
          file.close();
          return line.substring(secondComma + 1);
        }
      }
    }
  }
  file.close();
  return "";
}

bool updateMatricule(int id, String newMatricule, bool isTeacher, String newMatieres = "") {
  String filename = isTeacher ? FILE_PROFS : FILE_ELEVES;
  
  if (!SPIFFS.exists(filename)) {
    Serial.println("Fichier n'existe pas");
    return false;
  }
  
  File file = SPIFFS.open(filename, "r");
  if (!file) {
    Serial.println("Erreur ouverture fichier");
    return false;
  }
  
  String content = "";
  bool found = false;
  
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    int firstComma = line.indexOf(',');
    
    if (firstComma > 0) {
      int fileID = line.substring(0, firstComma).toInt();
      
      if (fileID == id) {
        if (isTeacher && newMatieres != "") {
          content += String(id) + "," + newMatricule + "," + newMatieres + "\n";
        } else {
          content += String(id) + "," + newMatricule + "\n";
        }
        found = true;
      } else {
        content += line + "\n";
      }
    }
  }
  file.close();
  
  if (!found) return false;
  
  file = SPIFFS.open(filename, "w");
  if (!file) {
    Serial.println("Erreur réécriture fichier");
    return false;
  }
  
  file.print(content);
  file.close();
  return true;
}

bool matriculeExists(String matricule) {
  String files[] = {FILE_ELEVES, FILE_PROFS};
  
  for (int f = 0; f < 2; f++) {
    if (!SPIFFS.exists(files[f])) continue;
    
    File file = SPIFFS.open(files[f], "r");
    if (!file) continue;
    
    while (file.available()) {
      String line = file.readStringUntil('\n');
      line.trim();
      int firstComma = line.indexOf(',');
      if (firstComma > 0) {
        int secondComma = line.indexOf(',', firstComma + 1);
        String mat = line.substring(firstComma + 1, secondComma > 0 ? secondComma : line.length());
        if (mat == matricule) {
          file.close();
          return true;
        }
      }
    }
    file.close();
  }
  
  return false;
}

int getIdByMatricule(String matricule) {
  String files[] = {FILE_PROFS, FILE_ELEVES};
  
  for (int f = 0; f < 2; f++) {
    if (!SPIFFS.exists(files[f])) continue;
    
    File file = SPIFFS.open(files[f], "r");
    if (!file) continue;
    
    while (file.available()) {
      String line = file.readStringUntil('\n');
      line.trim();
      int firstComma = line.indexOf(',');
      if (firstComma > 0) {
        int secondComma = line.indexOf(',', firstComma + 1);
        String mat = line.substring(firstComma + 1, secondComma > 0 ? secondComma : line.length());
        if (mat == matricule) {
          int id = line.substring(0, firstComma).toInt();
          file.close();
          return id;
        }
      }
    }
    file.close();
  }
  
  return -1;
}

void initializeMatieresFile() {
  if (!SPIFFS.exists(FILE_MATIERES)) {
    File file = SPIFFS.open(FILE_MATIERES, "w");
    if (file) {
      file.println("Machine Learning");
      file.println("Analyse des Donnees");
      file.println("Gestion de Projet");
      file.println("Grammaire et Langage");
      file.println("Programmation Web");
      file.println("IHM");
      file.println("Admin Reseau");
      file.println("Management");
      file.println("Anglais");
      file.close();
      Serial.println("Fichier matieres initialise");
    }
  }
}

int countMatieres() {
  if (!SPIFFS.exists(FILE_MATIERES)) return 0;
  
  File file = SPIFFS.open(FILE_MATIERES, "r");
  int count = 0;
  while (file.available()) {
    file.readStringUntil('\n');
    count++;
  }
  file.close();
  return count;
}

String getMatiereAt(int index) {
  if (!SPIFFS.exists(FILE_MATIERES)) return "";
  
  File file = SPIFFS.open(FILE_MATIERES, "r");
  for (int i = 0; i <= index; i++) {
    if (!file.available()) {
      file.close();
      return "";
    }
    String matiere = file.readStringUntil('\n');
    matiere.trim();
    if (i == index) {
      file.close();
      return matiere;
    }
  }
  file.close();
  return "";
}

void listMatricules() {
  Serial.println("\n=== ELEVES ===");
  if (SPIFFS.exists(FILE_ELEVES)) {
    File file = SPIFFS.open(FILE_ELEVES, "r");
    if (file) {
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        int commaIndex = line.indexOf(',');
        if (commaIndex > 0) {
          Serial.print("ID ");
          Serial.print(line.substring(0, commaIndex));
          Serial.print(" -> ");
          Serial.println(line.substring(commaIndex + 1));
        }
      }
      file.close();
    }
  }
  
  Serial.println("\n=== ENSEIGNANTS ===");
  if (SPIFFS.exists(FILE_PROFS)) {
    File file = SPIFFS.open(FILE_PROFS, "r");
    if (file) {
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        int firstComma = line.indexOf(',');
        if (firstComma > 0) {
          int secondComma = line.indexOf(',', firstComma + 1);
          Serial.print("ID ");
          Serial.print(line.substring(0, firstComma));
          Serial.print(" -> ");
          if (secondComma > 0) {
            Serial.print(line.substring(firstComma + 1, secondComma));
            Serial.print(" Matieres: ");
            Serial.println(line.substring(secondComma + 1));
          } else {
            Serial.println(line.substring(firstComma + 1));
          }
        }
      }
      file.close();
    }
  }
  Serial.println("==================\n");
}

bool resetSystem() {
  bool success = true;
  
  // Supprimer les empreintes du lecteur
  for (int id = 1; id <= 127; id++) { // Capacité typique du lecteur
    if (finger.deleteModel(id) != FINGERPRINT_OK) {
      // Ignorer les erreurs (empreintes inexistantes)
    }
    delay(10);
  }
  
  // Supprimer les fichiers
  String files[] = {FILE_ELEVES, FILE_PROFS, FILE_PRESENCE};
  for (int i = 0; i < 3; i++) {
    if (SPIFFS.exists(files[i])) {
      if (!SPIFFS.remove(files[i])) {
        success = false;
      }
    }
  }
  
  // Réinitialiser le fichier des matières
  initializeMatieresFile();
  
  return success;
}

bool deleteFingerprint(int id) {
  if (finger.deleteModel(id) == FINGERPRINT_OK) {
    // Supprimer du fichier correspondant
    String files[] = {FILE_PROFS, FILE_ELEVES};
    
    for (int f = 0; f < 2; f++) {
      if (!SPIFFS.exists(files[f])) continue;
      
      File file = SPIFFS.open(files[f], "r");
      if (!file) continue;
      
      String content = "";
      bool found = false;
      
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        int commaIndex = line.indexOf(',');
        if (commaIndex > 0) {
          int fileID = line.substring(0, commaIndex).toInt();
          if (fileID == id) {
            found = true;
          } else {
            content += line + "\n";
          }
        }
      }
      file.close();
      
      if (found) {
        file = SPIFFS.open(files[f], "w");
        if (file) {
          file.print(content);
          file.close();
          return true;
        }
      }
    }
  }
  return false;
}

// === WIFI HELPERS ===
bool wifiEnsureConnected(unsigned long timeoutMs = 15000) {
  if (WiFi.status() == WL_CONNECTED) return true;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(200);
  }
  return (WiFi.status() == WL_CONNECTED);
}

bool sendPresenceFileOverWifi() {
  if (!SPIFFS.exists(FILE_PRESENCE)) return false;
  if (!wifiEnsureConnected()) return false;

  File file = SPIFFS.open(FILE_PRESENCE, "r");
  if (!file) return false;

  String payload = file.readString();
  file.close();

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "text/plain");
  int code = http.POST(payload);
  http.end();

  // Politique: couper le WiFi apres tentative pour economiser l'energie
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);

  return (code >= 200 && code < 300);
}

// === PRESENCE (nouveau format + anti-doublon) ===
void beginVerificationSession() {
  // Reset anti-doublon
  sessionPresentList = "|";

  File file = SPIFFS.open(FILE_PRESENCE, "a");
  if (file) {
    // Ligne header unique de session
    // Exemple: 1665678900,23M001,Machine Learning
    file.print(millis());
    file.print(",");
    file.print(currentTeacherMatricule);
    file.print(",");
    file.println(currentMatiere);
    file.close();
    sessionHeaderWritten = true;
  }
}

bool recordStudentPresenceOnce(const String& studentMatricule) {
  if (!sessionHeaderWritten) return false;

  String tag = "|" + studentMatricule + "|";
  if (sessionPresentList.indexOf(tag) >= 0) {
    return false; // deja present
  }

  File file = SPIFFS.open(FILE_PRESENCE, "a");
  if (!file) return false;

  // Exemple: 1665678915,23P001
  file.print(millis());
  file.print(",");
  file.println(studentMatricule);
  file.close();

  sessionPresentList += studentMatricule + "|";
  return true;
}

void endVerificationSession() {
  File file = SPIFFS.open(FILE_PRESENCE, "a");
  if (file) {
    file.println("--- SESSION TERMINEE PAR: " + currentTeacherMatricule + " ---");
    file.close();
  }

  // Tentative d'envoi via WiFi (non bloquant pour l'utilisateur)
  sendPresenceFileOverWifi();

  verificationActive = false;
  sessionHeaderWritten = false;
  sessionPresentList = "|";
  currentTeacherMatricule = "";
  currentMatiere = "";
}


// === OUTILS AFFICHAGE TEXTE (retour a la ligne) ===
void printWrapped(const String& text, int x, int y, int maxWidth, int lineHeight, int maxLines, uint16_t color, uint8_t textSize) {
  tft.setTextSize(textSize);
  tft.setTextColor(color);

  String remaining = text;
  int line = 0;
  while (remaining.length() > 0 && line < maxLines) {
    String part = remaining;

    // couper au maxWidth (approximation: 6px * textSize par caractere)
    int maxChars = max(1, maxWidth / (6 * (int)textSize));
    if ((int)part.length() > maxChars) {
      part = remaining.substring(0, maxChars);
      int lastSpace = part.lastIndexOf(' ');
      if (lastSpace > 5) {
        part = remaining.substring(0, lastSpace);
      }
    }

    part.trim();
    tft.setCursor(x, y + line * lineHeight);
    tft.print(part);

    remaining = remaining.substring(part.length());
    remaining.trim();
    line++;
  }
}

String formatMatriculeFromRaw(const String& rawDigits, bool isTeacher) {
  // rawDigits: l'utilisateur saisit sans la lettre (ex: 23001 => 23M001)
  if (rawDigits.length() < 2) return rawDigits;
  String out = rawDigits.substring(0, 2);
  out += (isTeacher ? "M" : "P");
  out += rawDigits.substring(2);
  return out;
}

void displaySearchMatriculeScreen() {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(35, 10);
  tft.print("RECHERCHE MATRICULE");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(10, 35);
  tft.print(adminTargetIsTeacher ? "Type: Enseignant (lettre M auto)" : "Type: Eleve (lettre P auto)");

  drawSearchBox();
  drawKeyboard();
}

void displayResetWarningScreen() {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_RED);
  tft.setCursor(20, 10);
  tft.print("ATTENTION: RESET");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_WHITE);
  printWrapped("Cette action supprime toutes les empreintes, les listes (eleves/profs) et le fichier de presence. Elle est irreversible.",
               10, 40, 300, 12, 6, ILI9341_WHITE, 1);

  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 125);
  tft.print("Attente securite: 30s avant code");

  // Bouton ANNULER
  tft.fillRect(90, 190, 140, 35, ILI9341_DARKGREY);
  tft.drawRect(90, 190, 140, 35, ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 200);
  tft.print("ANNULER");
}
// === AFFICHAGE ===
void displayCenteredMessage(String line1, String line2, uint16_t color) {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(color);
  
  int x1 = (320 - line1.length() * 12) / 2;
  if (x1 < 10) x1 = 10;
  tft.setCursor(x1, 80);
  tft.print(line1);
  
  if (line2.length() > 0) {
    int x2 = (320 - line2.length() * 12) / 2;
    if (x2 < 10) x2 = 10;
    tft.setCursor(x2, 120);
    tft.print(line2);
  }
}

void displayThreeLines(String line1, String line2, String line3, uint16_t color) {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(color);
  
  int x1 = (320 - line1.length() * 12) / 2;
  if (x1 < 10) x1 = 10;
  tft.setCursor(x1, 60);
  tft.print(line1);
  
  if (line2.length() > 0) {
    int x2 = (320 - line2.length() * 12) / 2;
    if (x2 < 10) x2 = 10;
    tft.setCursor(x2, 100);
    tft.print(line2);
  }
  
  if (line3.length() > 0) {
    int x3 = (320 - line3.length() * 12) / 2;
    if (x3 < 10) x3 = 10;
    tft.setCursor(x3, 140);
    tft.print(line3);
  }
}

void displayMainMenu() {
  tft.fillScreen(ILI9341_BLACK);
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(60, 10);
  tft.print("MENU PRINCIPAL");
  
  tft.fillRect(40, 50, 240, 40, ILI9341_GREEN);
  tft.drawRect(40, 50, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(65, 60);
  tft.print("1. VERIFICATION");
  
  tft.fillRect(40, 100, 240, 40, ILI9341_BLUE);
  tft.drawRect(40, 100, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(50, 110);
  tft.print("2. ENREGISTREMENT");
  
  tft.fillRect(40, 150, 240, 40, ILI9341_RED);
  tft.drawRect(40, 150, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(2);
  tft.setCursor(50, 160);
  tft.print("3. ADMINISTRATION");
  tft.setTextSize(1);
  tft.setCursor(250, 175);
  tft.print("PROF");
}

void displayEnrollChoice() {
  tft.fillScreen(ILI9341_BLACK);
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(30, 20);
  tft.print("CHOIX ENREGISTREMENT");
  
  tft.fillRect(40, 80, 240, 50, ILI9341_BLUE);
  tft.drawRect(40, 80, 240, 50, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(3);
  tft.setCursor(90, 95);
  tft.print("ELEVE");
  
  tft.fillRect(40, 150, 240, 50, ILI9341_GREEN);
  tft.drawRect(40, 150, 240, 50, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(3);
  tft.setCursor(75, 165);
  tft.print("PROF");
}

void displayAdminMenu() {
  tft.fillScreen(ILI9341_BLACK);

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_RED);
  tft.setCursor(60, 10);
  tft.print("ADMINISTRATION");

  // 1) Editer une empreinte
  tft.fillRect(40, 55, 240, 40, ILI9341_BLUE);
  tft.drawRect(40, 55, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(55, 67);
  tft.print("1. Editer empreinte");

  // 2) Reinitialiser systeme
  tft.fillRect(40, 110, 240, 40, ILI9341_RED);
  tft.drawRect(40, 110, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(2);
  tft.setCursor(50, 122);
  tft.print("2. Reinitialiser");

  // 3) Retour
  tft.fillRect(40, 165, 240, 40, ILI9341_DARKGREY);
  tft.drawRect(40, 165, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(115, 177);
  tft.print("3. Retour");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(10, 225);
  tft.print("Option suppression retiree");
}

void displayAdminEditTier() {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(35, 10);
  tft.print("EDITER UNE EMPREINTE");

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(50, 40);
  tft.print("Choisir categorie:");

  // Enseignants
  tft.fillRect(40, 80, 240, 45, ILI9341_GREEN);
  tft.drawRect(40, 80, 240, 45, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setCursor(85, 95);
  tft.print("Enseignants");

  // Eleves
  tft.fillRect(40, 135, 240, 45, ILI9341_BLUE);
  tft.drawRect(40, 135, 240, 45, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(110, 150);
  tft.print("Eleves");

  // Retour
  tft.fillRect(40, 190, 240, 35, ILI9341_DARKGREY);
  tft.drawRect(40, 190, 240, 35, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 200);
  tft.print("Retour");
}

void displayAdminEditSearchMode() {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(35, 10);
  tft.print("MODE RECHERCHE");

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(25, 40);
  tft.print("Chercher l'empreinte:");

  // Par empreinte
  tft.fillRect(40, 80, 240, 45, ILI9341_PURPLE);
  tft.drawRect(40, 80, 240, 45, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(80, 95);
  tft.print("Par empreinte");

  // Par matricule
  tft.fillRect(40, 135, 240, 45, ILI9341_ORANGE);
  tft.drawRect(40, 135, 240, 45, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setCursor(80, 150);
  tft.print("Par matricule");

  // Retour
  tft.fillRect(40, 190, 240, 35, ILI9341_DARKGREY);
  tft.drawRect(40, 190, 240, 35, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 200);
  tft.print("Retour");
}


void displayModificationChoice() {
  tft.fillScreen(ILI9341_BLACK);
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(40, 10);
  tft.print("ACTIONS DISPONIBLES");
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 40);
  tft.print("Matricule: ");
  tft.print(oldMatricule);
  
  tft.setCursor(10, 65);
  tft.print("ID: ");
  tft.print(modifyID);
  
  tft.setCursor(10, 90);
  tft.print("Type: ");
  tft.print(isModifyingTeacher ? "Enseignant" : "Eleve");
  
  // Afficher les matières si enseignant
  if (isModifyingTeacher) {
    String matieres = getMatieresForTeacher(modifyID);
    tft.setCursor(10, 115);
    tft.print("Matieres: ");
    if (matieres.length() > 20) {
      tft.print(matieres.substring(0, 20) + "...");
    } else {
      tft.print(matieres);
    }
  }
  
  // Bouton Modifier matricule
  tft.fillRect(40, 140, 240, 40, ILI9341_ORANGE);
  tft.drawRect(40, 140, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(45, 150);
  tft.print("MODIFIER MATRICULE");
  
  // Bouton Éditer matières (enseignant seulement)
  if (isModifyingTeacher) {
    tft.fillRect(40, 185, 240, 40, ILI9341_BLUE);
    tft.drawRect(40, 185, 240, 40, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(60, 195);
    tft.print("EDITER MATIERES");
  } else {
    // Bouton Annuler pour élève
    tft.fillRect(40, 185, 240, 40, ILI9341_DARKGREY);
    tft.drawRect(40, 185, 240, 40, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(100, 195);
    tft.print("ANNULER");
  }
}

void displayMatieresSelection(String selected) {
  tft.fillScreen(ILI9341_BLACK);

  int count = countMatieres();
  int perPage = 3;
  int totalPages = (count + perPage - 1) / perPage;
  if (matierePage < 0) matierePage = 0;
  if (matierePage >= totalPages) matierePage = max(0, totalPages - 1);

  // Titre
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(25, 10);
  tft.print(isEditingMatieres ? "EDITER MATIERES" : "CHOISIR MATIERES");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(10, 32);
  tft.print("Page ");
  tft.print(matierePage + 1);
  tft.print("/");
  tft.print(max(1, totalPages));

  // Afficher 3 matieres
  int startIndex = matierePage * perPage;
  int boxX = 20;
  int boxW = 280;
  int boxH = 45;
  int startY = 50;

  for (int i = 0; i < perPage; i++) {
    int idx = startIndex + i;
    if (idx >= count) break;

    String mat = getMatiereAt(idx);
    bool sel = (selected.indexOf(mat) >= 0);

    uint16_t bg = sel ? ILI9341_GREEN : ILI9341_BLACK;
    uint16_t fg = sel ? ILI9341_BLACK : ILI9341_WHITE;

    int y = startY + i * (boxH + 10);
    tft.fillRect(boxX, y, boxW, boxH, bg);
    tft.drawRect(boxX, y, boxW, boxH, ILI9341_WHITE);

    // wrap matiere sur 2 lignes max
    printWrapped(mat, boxX + 8, y + 8, boxW - 16, 14, 2, fg, 2);
  }

  // Boutons Prev/Next
  tft.fillRect(20, 200, 80, 30, ILI9341_DARKGREY);
  tft.drawRect(20, 200, 80, 30, ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(30, 207);
  tft.print("<");
  tft.setCursor(45, 207);
  tft.print("Prev");

  tft.fillRect(220, 200, 80, 30, ILI9341_DARKGREY);
  tft.drawRect(220, 200, 80, 30, ILI9341_WHITE);
  tft.setCursor(230, 207);
  tft.print("Next");
  tft.setCursor(290, 207);
  tft.print(">");

  // Bouton OK
  tft.fillRect(110, 200, 100, 30, ILI9341_BLUE);
  tft.drawRect(110, 200, 100, 30, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(145, 207);
  tft.print("OK");
}


void displayVerificationSetup() {
  tft.fillScreen(ILI9341_BLACK);
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(50, 10);
  tft.print("SETUP VERIFICATION");
  
  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 40);
  tft.print("Enseignant: ");
  tft.println(currentTeacherMatricule);
  
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(10, 60);
  tft.print("Choisissez la matiere:");
  
  int y = 80;
  String matieres = getMatieresForTeacher(getIdByMatricule(currentTeacherMatricule));
  
  int startPos = 0;
  int endPos = matieres.indexOf(',');
  int index = 1;
  while (startPos < matieres.length()) {
    String matiere;
    if (endPos > 0) {
      matiere = matieres.substring(startPos, endPos);
    } else {
      matiere = matieres.substring(startPos);
    }
    
    tft.fillRect(10, y, 300, 25, ILI9341_BLUE);
    tft.drawRect(10, y, 300, 25, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setCursor(15, y + 8);
    tft.print(String(index) + ". " + matiere);
    
    y += 30;
    index++;
    
    if (endPos > 0) {
      startPos = endPos + 1;
      endPos = matieres.indexOf(',', startPos);
    } else {
      break;
    }
  }
  
  if (y < 200) {
    tft.fillRect(100, 210, 120, 25, ILI9341_RED);
    tft.drawRect(100, 210, 120, 25, ILI9341_WHITE);
    tft.setTextColor(ILI9341_YELLOW);
    tft.setTextSize(2);
    tft.setCursor(135, 215);
    tft.print("ANNULER");
  }
}

void displayCurrentMode() {
  tft.fillRect(0, 0, 320, 30, ILI9341_NAVY);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 8);
  
  if (currentMode == MODE_VERIFICATION || currentMode == MODE_VERIFICATION_IN_PROGRESS) {
    tft.print("MODE: VERIFICATION");
    if (verificationActive) {
      tft.setTextSize(1);
      tft.setCursor(250, 15);
      tft.print("[ACTIVE]");
    }
  } else if (currentMode == MODE_ENROLL || currentMode == MODE_ENROLL_CHOICE || currentMode == MODE_PASSWORD) {
    tft.print("MODE: ENREGISTREMENT");
  } else if (currentMode >= MODE_ADMIN_PASSWORD && currentMode <= MODE_SEARCH_MATRICULE) {
    tft.print("MODE: ADMINISTRATION");
  }
  
  if (currentMode == MODE_ENROLL) {
    tft.setTextSize(1);
    tft.setCursor(240, 15);
    tft.print(isTeacherMode ? "[PROF]" : "[ELEVE]");
  }
}

// === CLAVIER ===
void drawKey(int row, int col, bool pressed = false) {
  int x = col * keyW;
  int y = startY + row * keyH;
  
  uint16_t bgColor = pressed ? ILI9341_DARKGREY : ILI9341_BLUE;
  
  tft.fillRect(x + 2, y + 2, keyW - 4, keyH - 4, bgColor);
  tft.drawRect(x, y, keyW, keyH, ILI9341_WHITE);
  
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(2);
  
  int textWidth = strlen(keys[row][col]) * 12;
  int textX = x + (keyW - textWidth) / 2;
  int textY = y + (keyH - 16) / 2;
  
  tft.setCursor(textX, textY);
  tft.print(keys[row][col]);
}

void drawKeyboard() {
  tft.fillRect(0, startY, 320, 240 - startY, ILI9341_BLACK);
  
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 3; c++) {
      drawKey(r, c);
    }
  }
}

void drawPasswordBox() {
  tft.fillRect(0, 30, 320, startY - 30, ILI9341_BLACK);
  tft.drawRect(5, 35, 310, 20, ILI9341_WHITE);
  
  tft.setCursor(15, 38);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(2);
  
  String hidden = "";
  for (int i = 0; i < tempPassword.length(); i++) {
    hidden += "*";
  }
  tft.print(hidden);
}

void drawInputBox(String label = "Matricule:") {
  tft.fillRect(0, 30, 320, startY - 30, ILI9341_BLACK);
  
  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 32);
  tft.print(label);
  
  tft.drawRect(5, 45, 310, 20, ILI9341_WHITE);
  
  tft.setCursor(15, 48);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(2);
  
  if (isTeacherMode || (isModifyingTeacher && !newMatricule.isEmpty())) {
    if (tempMatricule.length() >= 2) {
      tft.print(tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2));
    } else {
      tft.print(tempMatricule);
    }
  } else {
    if (tempMatricule.length() >= 2) {
      tft.print(tempMatricule.substring(0, 2) + "P" + tempMatricule.substring(2));
    } else {
      tft.print(tempMatricule);
    }
  }
}

void drawSearchBox() {
  // Zone d'affichage du matricule recherche
  tft.fillRect(40, 40, 240, 40, ILI9341_BLACK);
  tft.drawRect(40, 40, 240, 40, ILI9341_WHITE);

  String shown = formatMatriculeFromRaw(searchMatricule, adminTargetIsTeacher);

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(50, 52);
  tft.print(shown);

  // Aide format
  tft.setTextSize(1);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(40, 82);
  tft.print(adminTargetIsTeacher ? "Saisir 5 chiffres: AAMBBB => AA M BBB" : "Saisir 5 chiffres: AAPBBB => AA P BBB");
}


void getKeyPosition(int x, int y, int &row, int &col) {
  row = -1;
  col = -1;
  
  if (y < startY) return;
  
  col = x / keyW;
  row = (y - startY) / keyH;
  
  if (col < 0 || col > 2 || row < 0 || row > 3) {
    row = -1;
    col = -1;
  }
}

// === ENREGISTREMENT ===
int getNextFreeID() {
  for (int id = 1; id <= 127; id++) {
    if (finger.loadModel(id) != FINGERPRINT_OK) {
      return id;
    }
  }
  return 1;
}

bool enrollFingerprint() {
  int p = -1;
  
  if (enrollStage == 0) {
    displayThreeLines("Enregistrement", "Placez votre doigt", "(1ere lecture)", ILI9341_CYAN);
    
    while (p != FINGERPRINT_OK) {
      p = finger.getImage();
      delay(50);
    }
    
    displayCenteredMessage("Image capturee!", "RETIREZ LE DOIGT", ILI9341_GREEN);
    Serial.println(">>> PREMIERE LECTURE OK - Retirez le doigt");
    delay(2000);
    
    p = finger.image2Tz(1);
    if (p != FINGERPRINT_OK) {
      displayCenteredMessage("Erreur!", "Reessayez", ILI9341_RED);
      delay(2000);
      return false;
    }
    
    enrollStage = 1;
    
    while (finger.getImage() != FINGERPRINT_NOFINGER) {
      delay(50);
    }
    
    delay(500);
    return false;
  }
  
  if (enrollStage == 1) {
    displayThreeLines("Enregistrement", "REPLACEZ le doigt", "(2eme lecture)", ILI9341_CYAN);
    
    p = -1;
    while (p != FINGERPRINT_OK) {
      p = finger.getImage();
      delay(50);
    }
    
    displayCenteredMessage("Image capturee!", "Traitement...", ILI9341_GREEN);
    delay(1000);
    
    p = finger.image2Tz(2);
    if (p != FINGERPRINT_OK) {
      displayCenteredMessage("Erreur!", "Reessayez", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
    
    p = finger.createModel();
    if (p != FINGERPRINT_OK) {
      displayCenteredMessage("Erreur!", "Empreintes differentes", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
    
    p = finger.storeModel(enrollID);
    if (p == FINGERPRINT_OK) {
      Serial.println("Empreinte enregistree!");
      
      waitingForMatricule = true;
      tempMatricule = "";
      enrollStage = 0;
      
      if (isTeacherMode) {
        displayCenteredMessage("Empreinte OK!", "Matricule Prof:", ILI9341_CYAN);
        tft.setTextSize(2);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(80, 160);
        tft.print("Format: **M***");
      } else {
        displayCenteredMessage("Empreinte OK!", "Matricule Eleve:", ILI9341_CYAN);
        tft.setTextSize(2);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(60, 160);
        tft.print("Format: **P***");
      }
      delay(3000);
      
      displayCurrentMode();
      drawInputBox();
      drawKeyboard();
      
      return false;
    } else {
      displayCenteredMessage("Erreur!", "Enregistrement echoue", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
  }
  
  return false;
}

// === GESTION BOUTON ===
void checkButton() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    unsigned long currentTime = millis();
    
    if (currentTime - lastButtonPress > debounceDelay) {
      lastButtonPress = currentTime;
      
      // Si une vérification est en cours
      if (verificationActive) {
        Serial.println(">>> Bouton presse - Verification active");
        displayCenteredMessage("Verification en cours", "Entrez code pour arreter", ILI9341_RED);
        delay(2000);
        
        currentMode = MODE_PASSWORD;
        waitingForPassword = true;
        tempPassword = "";
        
        displayCurrentMode();
        drawPasswordBox();
        drawKeyboard();
        return;
      }
      
      // Navigation normale
      if (currentMode == MODE_VERIFICATION) {
        currentMode = MODE_MAIN_MENU;
        Serial.println(">>> PASSAGE AU MENU PRINCIPAL");
        displayMainMenu();
      } 
      else if (currentMode == MODE_VERIFICATION_IN_PROGRESS) {
        // Même traitement que vérification active
        displayCenteredMessage("Verification en cours", "Entrez code pour arreter", ILI9341_RED);
        delay(2000);
        
        currentMode = MODE_PASSWORD;
        waitingForPassword = true;
        tempPassword = "";
        
        displayCurrentMode();
        drawPasswordBox();
        drawKeyboard();
      }
      else {
        currentMode = MODE_VERIFICATION;
        Serial.println(">>> PASSAGE EN MODE VERIFICATION");
        displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
        delay(2000);
        displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
      }
      
      // Réinitialiser toutes les variables
      enrollMode = false;
      enrollStage = 0;
      waitingForMatricule = false;
      waitingForPassword = false;
      waitingForNewMatricule = false;
      searchingMatricule = false;
      tempMatricule = "";
      tempPassword = "";
      newMatricule = "";
      searchMatricule = "";
      selectedMatieres = "";
      isEditingMatieres = false;
    }
  }
}

// === SETUP ===
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("  SYSTEME DE POINTAGE AMELIORE");
  Serial.println("=================================\n");
  
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.println("1. Bouton configure\n");
  
  Serial.println("2. Init SPIFFS...");
  if (!SPIFFS.begin(true)) {
    Serial.println("   [ERREUR] SPIFFS KO");
    while(1) delay(1000);
  }
  Serial.println("   [OK]\n");
  
  Serial.println("3. Init fichiers matieres...");
  initializeMatieresFile();
  Serial.println("   [OK]\n");
  
  Serial.println("4. Init ecran...");
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  Serial.println("   [OK]\n");
  
  Serial.println("5. Init touch...");
  touch.begin();
  Serial.println("   [OK]\n");
  
  displayCenteredMessage("Initialisation...", "Patientez", ILI9341_CYAN);
  delay(1000);
  
  Serial.println("6. Init lecteur...");
  displayCenteredMessage("Init lecteur...", "", ILI9341_CYAN);
  
  mySerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  delay(1000);
  
  bool lecteurOK = false;
  for (int attempt = 1; attempt <= 5; attempt++) {
    Serial.print("   Tentative ");
    Serial.print(attempt);
    Serial.print("/5... ");
    
    if (finger.verifyPassword()) {
      lecteurOK = true;
      Serial.println("OK!");
      break;
    } else {
      Serial.println("Echec");
      delay(500);
    }
  }
  
  if (lecteurOK) {
    Serial.println("   [OK] Lecteur detecte\n");
    displayCenteredMessage("Lecteur OK!", "", ILI9341_GREEN);
    delay(1000);
    
    finger.getTemplateCount();
    Serial.print("   Capacite: "); Serial.println(finger.capacity);
    Serial.print("   Empreintes: "); Serial.println(finger.templateCount);
  } else {
    Serial.println("   [ERREUR] Lecteur KO\n");
    displayCenteredMessage("ERREUR Lecteur!", "Redemarrage...", ILI9341_RED);
    delay(2000);
    ESP.restart();
  }
  
  listMatricules();
  
  Serial.println("=================================");
  Serial.println("  SYSTEME PRET");
  Serial.println("=================================\n");
  Serial.println("Bouton: Menu principal");
  Serial.println("Mode actuel: VERIFICATION\n");
  Serial.println("Passwords:");
  Serial.println("  Eleves: 4 chiffres (1234)");
  Serial.println("  Profs: 5 chiffres (12345)");
  Serial.println("  Reset: 6 chiffres (123456)");
  Serial.println("  Arret verification: 5 chiffres (12345)\n");
  
  displayCenteredMessage("SYSTEME DE POINTAGE", "Pret", ILI9341_GREEN);
  delay(2000);
  displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
}

// === LOOP PRINCIPAL ===
void loop() {
  checkButton();
  
  bool isTouched = touch.touched();
  TS_Point p;
  int x = 0, y = 0;

  // Lire le point pendant l'appui (plus fiable), puis utiliser la derniere position au relachement
  if (isTouched) {
    p = touch.getPoint();
    lastTouchRawX = p.x;
    lastTouchRawY = p.y;
  }

  if (wasTouched && !isTouched) {
    x = map(lastTouchRawX, 3900, 200, 0, 320);
    y = map(lastTouchRawY, 3900, 200, 0, 240);
  }
  
  // === MODE MENU PRINCIPAL ===
  if (currentMode == MODE_MAIN_MENU) {
    if (wasTouched && !isTouched) {
      if (x >= 40 && x <= 280 && y >= 50 && y <= 90) {
        currentMode = MODE_VERIFICATION;
        Serial.println(">>> Choix: VERIFICATION");
        displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
        delay(2000);
        displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
      }
      else if (x >= 40 && x <= 280 && y >= 100 && y <= 140) {
        currentMode = MODE_ENROLL_CHOICE;
        Serial.println(">>> Choix: ENREGISTREMENT");
        displayEnrollChoice();
      }
      else if (x >= 40 && x <= 280 && y >= 150 && y <= 190) {
        currentMode = MODE_ADMIN_PASSWORD;
        waitingForPassword = true;
        tempPassword = "";
        Serial.println(">>> Choix: ADMINISTRATION");
        
        displayCenteredMessage("ADMINISTRATION", "Reserve aux profs", ILI9341_RED);
        delay(2000);
        displayCenteredMessage("Entrez password:", "(5 chiffres)", ILI9341_CYAN);
        delay(2000);
        
        displayCurrentMode();
        drawPasswordBox();
        drawKeyboard();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE CHOIX ELEVE/PROF ===
  if (currentMode == MODE_ENROLL_CHOICE) {
    if (wasTouched && !isTouched) {
      if (x >= 40 && x <= 280 && y >= 80 && y <= 130) {
        isTeacherMode = false;
        currentMode = MODE_PASSWORD;
        waitingForPassword = true;
        tempPassword = "";
        Serial.println("Choix: ELEVE");
        
        displayCenteredMessage("Mode Eleve", "Entrez password:", ILI9341_CYAN);
        tft.setTextSize(2);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(90, 160);
        tft.print("(4 chiffres)");
        delay(2000);
        
        displayCurrentMode();
        drawPasswordBox();
        drawKeyboard();
      }
      else if (x >= 40 && x <= 280 && y >= 150 && y <= 200) {
        isTeacherMode = true;
        currentMode = MODE_PASSWORD;
        waitingForPassword = true;
        tempPassword = "";
        Serial.println("Choix: PROF");
        
        displayCenteredMessage("Mode Prof", "Entrez password:", ILI9341_CYAN);
        tft.setTextSize(2);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(90, 160);
        tft.print("(5 chiffres)");
        delay(2000);
        
        displayCurrentMode();
        drawPasswordBox();
        drawKeyboard();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE RESET: AVERTISSEMENT 30s (avant saisie du code) ===
  if (currentMode == MODE_RESET_SYSTEM && resetWarningShown && !waitingForPassword) {
    // Annuler
    if (wasTouched && !isTouched) {
      if (x >= 90 && x <= 230 && y >= 190 && y <= 225) {
        resetWarningShown = false;
        currentMode = MODE_ADMIN_MENU;
        displayAdminMenu();
      }
    }

    unsigned long elapsed = millis() - resetWarningStartMs;
    int remaining = 30 - (int)(elapsed / 1000);
    if (remaining < 0) remaining = 0;

    // Afficher le decompte
    tft.fillRect(10, 145, 300, 30, ILI9341_BLACK);
    tft.setTextSize(2);
    tft.setTextColor(ILI9341_YELLOW);
    tft.setCursor(10, 150);
    tft.print("Code dans: ");
    tft.print(remaining);
    tft.print("s");

    if (elapsed >= 30000) {
      // Autoriser saisie du code
      waitingForPassword = true;
      tempPassword = "";
      displayCenteredMessage("REINITIALISATION", "Code de securite:", ILI9341_RED);
      tft.setTextSize(2);
      tft.setTextColor(ILI9341_YELLOW);
      tft.setCursor(90, 160);
      tft.print("(6 chiffres)");
      delay(1200);
      displayCurrentMode();
      drawPasswordBox();
      drawKeyboard();
    }

    wasTouched = isTouched;
    delay(50);
    return;
  }

  // === MODE SAISIE PASSWORD (TOUS TYPES) ===
  if ((currentMode == MODE_PASSWORD || currentMode == MODE_RESET_SYSTEM || currentMode == MODE_DELETE_FINGERPRINT) && waitingForPassword) {
    if (wasTouched && !isTouched) {
      int row, col;
      getKeyPosition(x, y, row, col);
      
      if (row >= 0 && col >= 0) {
        String key = String(keys[row][col]);
        
        drawKey(row, col, true);
        delay(100);
        drawKey(row, col, false);
        
        if (key == "DEL") {
          if (tempPassword.length() > 0)
            tempPassword.remove(tempPassword.length() - 1);
        }
        else if (key == "OK") {
          bool passwordOK = false;
          
          if (currentMode == MODE_PASSWORD) {
            if (isTeacherMode && tempPassword == TEACHER_PASSWORD) {
              passwordOK = true;
              Serial.println(">>> PASSWORD PROF OK");
            } else if (!isTeacherMode && tempPassword == STUDENT_PASSWORD) {
              passwordOK = true;
              Serial.println(">>> PASSWORD ELEVE OK");
            } else if (verificationActive && tempPassword == VERIFICATION_STOP_PASSWORD) {
              passwordOK = true;
              Serial.println(">>> CODE ARRET VERIFICATION OK");
            }
            
            if (passwordOK) {
              waitingForPassword = false;
              
              if (verificationActive) {
                // Arrêt de la vérification
                endVerificationSession();
                displayCenteredMessage("Verification terminee", "Fichier presence sauvegarde", ILI9341_GREEN);
                delay(2000);
                currentMode = MODE_VERIFICATION;
                displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
                delay(2000);
                displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
              } else {
                // Mode enregistrement normal
                currentMode = MODE_ENROLL;
                tempPassword = "";
                
                displayCenteredMessage("PASSWORD OK!", "Acces autorise", ILI9341_GREEN);
                delay(2000);
                displayCurrentMode();
                displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
              }
            } else {
              if (verificationActive) {
                displayCenteredMessage("Code incorrect", "Verification continue", ILI9341_RED);
                delay(2000);
                currentMode = MODE_VERIFICATION_IN_PROGRESS;
                displayCurrentMode();
                displayCenteredMessage("Verification en cours", "Placez empreinte", ILI9341_WHITE);
              } else {
                displayCenteredMessage("PASSWORD INCORRECT!", "Reessayez", ILI9341_RED);
                delay(2000);
                tempPassword = "";
                displayCurrentMode();
                drawPasswordBox();
                drawKeyboard();
              }
            }
          }
          else if (currentMode == MODE_RESET_SYSTEM) {
            if (tempPassword == RESET_PASSWORD) {
              if (resetSystem()) {
                displayCenteredMessage("SYSTEME REINITIALISE!", "Redemarrage...", ILI9341_GREEN);
                delay(2000);
                ESP.restart();
              } else {
                displayCenteredMessage("Erreur reinitialisation", "", ILI9341_RED);
                delay(2000);
              }
            } else {
              displayCenteredMessage("PASSWORD INCORRECT!", "Acces refuse", ILI9341_RED);
              delay(2000);
            }
            currentMode = MODE_ADMIN_MENU;
            displayAdminMenu();
          }
          else if (currentMode == MODE_DELETE_FINGERPRINT) {
            if (tempPassword == RESET_PASSWORD) {
              if (deleteFingerprint(modifyID)) {
                displayCenteredMessage("Empreinte supprimee!", "ID: " + String(modifyID), ILI9341_GREEN);
                delay(2000);
              } else {
                displayCenteredMessage("Erreur suppression", "", ILI9341_RED);
                delay(2000);
              }
            } else {
              displayCenteredMessage("PASSWORD INCORRECT!", "Acces refuse", ILI9341_RED);
              delay(2000);
            }
            currentMode = MODE_ADMIN_MENU;
            displayAdminMenu();
          }
        }
        else {
          int maxLength = 6;
          if (tempPassword.length() < maxLength) {
            tempPassword += key;
          }
        }
        
        drawPasswordBox();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE ADMIN PASSWORD ===
  if (currentMode == MODE_ADMIN_PASSWORD && waitingForPassword) {
    if (wasTouched && !isTouched) {
      int row, col;
      getKeyPosition(x, y, row, col);
      
      if (row >= 0 && col >= 0) {
        String key = String(keys[row][col]);
        
        drawKey(row, col, true);
        delay(100);
        drawKey(row, col, false);
        
        if (key == "DEL") {
          if (tempPassword.length() > 0)
            tempPassword.remove(tempPassword.length() - 1);
        }
        else if (key == "OK") {
          if (tempPassword == TEACHER_PASSWORD) {
            Serial.println(">>> PASSWORD ADMIN OK");
            waitingForPassword = false;
            currentMode = MODE_ADMIN_MENU;
            tempPassword = "";
            displayAdminMenu();
          } else {
            Serial.println(">>> PASSWORD ADMIN INCORRECT");
            displayCenteredMessage("ACCES REFUSE!", "Reserve aux profs", ILI9341_RED);
            delay(2000);
            tempPassword = "";
            currentMode = MODE_MAIN_MENU;
            displayMainMenu();
          }
        }
        else {
          if (tempPassword.length() < 5) {
            tempPassword += key;
          }
        }
        
        drawPasswordBox();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE ADMIN MENU ===
  if (currentMode == MODE_ADMIN_MENU) {
    if (wasTouched && !isTouched) {
      // 1) Editer une empreinte
      if (x >= 40 && x <= 280 && y >= 55 && y <= 95) {
        currentMode = MODE_ADMIN_EDIT_TIER;
        adminTargetIsTeacher = false;
        adminSearchByFingerprint = true;
        Serial.println(">>> Admin: EDITER UNE EMPREINTE");
        displayAdminEditTier();
      }
      // 2) Reinitialiser systeme (avec avertissement 30s)
      else if (x >= 40 && x <= 280 && y >= 110 && y <= 150) {
        Serial.println(">>> Admin: REINITIALISER SYSTEME (AVERTISSEMENT 30s)");
        currentMode = MODE_RESET_SYSTEM;
        resetWarningShown = true;
        resetWarningStartMs = millis();
        waitingForPassword = false;
        tempPassword = "";
        displayResetWarningScreen();
      }
      // 3) Retour
      else if (x >= 40 && x <= 280 && y >= 165 && y <= 205) {
        currentMode = MODE_MAIN_MENU;
        Serial.println(">>> Admin: RETOUR");
        displayMainMenu();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  // === MODE ADMIN: CHOIX CATEGORIE (ENSEIGNANT/ELEVE) ===
  if (currentMode == MODE_ADMIN_EDIT_TIER) {
    if (wasTouched && !isTouched) {
      // Enseignants
      if (x >= 40 && x <= 280 && y >= 80 && y <= 125) {
        adminTargetIsTeacher = true;
        currentMode = MODE_ADMIN_EDIT_SEARCHMODE;
        displayAdminEditSearchMode();
      }
      // Eleves
      else if (x >= 40 && x <= 280 && y >= 135 && y <= 180) {
        adminTargetIsTeacher = false;
        currentMode = MODE_ADMIN_EDIT_SEARCHMODE;
        displayAdminEditSearchMode();
      }
      // Retour
      else if (x >= 40 && x <= 280 && y >= 190 && y <= 225) {
        currentMode = MODE_ADMIN_MENU;
        displayAdminMenu();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  // === MODE ADMIN: CHOIX MODE RECHERCHE ===
  if (currentMode == MODE_ADMIN_EDIT_SEARCHMODE) {
    if (wasTouched && !isTouched) {
      // Par empreinte
      if (x >= 40 && x <= 280 && y >= 80 && y <= 125) {
        adminSearchByFingerprint = true;
        currentMode = MODE_MODIFICATION;
        waitingForNewMatricule = false;
        isEditingMatieres = false;
        Serial.println(">>> Admin: Recherche par empreinte");
        displayCurrentMode();
        displayCenteredMessage("Placez l'empreinte", "a editer", ILI9341_WHITE);
      }
      // Par matricule
      else if (x >= 40 && x <= 280 && y >= 135 && y <= 180) {
        adminSearchByFingerprint = false;
        currentMode = MODE_SEARCH_MATRICULE;
        searchingMatricule = true;
        searchMatricule = "";
        Serial.println(">>> Admin: Recherche par matricule");
        displaySearchMatriculeScreen();
      }
      // Retour
      else if (x >= 40 && x <= 280 && y >= 190 && y <= 225) {
        currentMode = MODE_ADMIN_EDIT_TIER;
        displayAdminEditTier();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE SELECTION MATIERES (3 par slide + prev/next) ===
  if (currentMode == MODE_SELECT_MATIERES) {
    if (wasTouched && !isTouched) {
      int count = countMatieres();
      int perPage = 3;
      int startIndex = matierePage * perPage;

      int boxX = 20;
      int boxW = 280;
      int boxH = 45;
      int startY = 50;

      // Click sur une matiere (seulement celles de la page)
      for (int i = 0; i < perPage; i++) {
        int idx = startIndex + i;
        if (idx >= count) break;

        int yBox = startY + i * (boxH + 10);
        if (x >= boxX && x <= boxX + boxW && y >= yBox && y <= yBox + boxH) {
          String matiere = getMatiereAt(idx);

          if (selectedMatieres.indexOf(matiere) >= 0) {
            selectedMatieres.replace(matiere + ",", "");
            selectedMatieres.replace("," + matiere, "");
            selectedMatieres.replace(matiere, "");
          } else {
            if (selectedMatieres.length() > 0 && !selectedMatieres.endsWith(",")) {
              selectedMatieres += ",";
            }
            selectedMatieres += matiere;
          }

          selectedMatieres.replace(",,", ",");
          if (selectedMatieres.startsWith(",")) selectedMatieres = selectedMatieres.substring(1);
          if (selectedMatieres.endsWith(",")) selectedMatieres = selectedMatieres.substring(0, selectedMatieres.length() - 1);

          displayMatieresSelection(selectedMatieres);
          break;
        }
      }

      // Prev
      if (x >= 20 && x <= 100 && y >= 200 && y <= 230) {
        matierePage--;
        displayMatieresSelection(selectedMatieres);
      }
      // Next
      else if (x >= 220 && x <= 300 && y >= 200 && y <= 230) {
        matierePage++;
        displayMatieresSelection(selectedMatieres);
      }
      // OK
      else if (x >= 110 && x <= 210 && y >= 200 && y <= 230) {
        if (selectedMatieres.length() > 0) {
          if (isEditingMatieres) {
            if (updateMatricule(modifyID, oldMatricule, true, selectedMatieres)) {
              displayCenteredMessage("MATIERES MISES A JOUR!", "", ILI9341_GREEN);
              delay(2000);
              isEditingMatieres = false;
              currentMode = MODE_ADMIN_MENU;
              displayAdminMenu();
            } else {
              displayCenteredMessage("Erreur mise a jour", "", ILI9341_RED);
              delay(2000);
              displayMatieresSelection(selectedMatieres);
            }
          } else {
            String fullMatricule = tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2);
            if (saveMatricule(enrollID, fullMatricule, true, selectedMatieres)) {
              displayCenteredMessage("PROF ENREGISTRE!", fullMatricule, ILI9341_GREEN);
              delay(2500);

              waitingForMatricule = false;
              enrollMode = false;
              tempMatricule = "";
              selectedMatieres = "";
              matierePage = 0;

              listMatricules();

              currentMode = MODE_ENROLL;
              displayCurrentMode();
              displayCenteredMessage("Enseignant enregistre!", "Nouvelle empreinte?", ILI9341_GREEN);
              delay(2000);
              displayCurrentMode();
              displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
            }
          }
        } else {
          displayCenteredMessage("Aucune matiere", "Selectionnez au moins 1", ILI9341_ORANGE);
          delay(2000);
          displayMatieresSelection(selectedMatieres);
        }
      }
    }

    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE VERIFICATION SETUP ===
  if (currentMode == MODE_VERIFICATION_SETUP) {
    if (wasTouched && !isTouched) {
      int y_start = 80;
      String matieres = getMatieresForTeacher(getIdByMatricule(currentTeacherMatricule));
      
      int startPos = 0;
      int endPos = matieres.indexOf(',');
      int index = 0;
      
      while (startPos < matieres.length()) {
        String matiere;
        if (endPos > 0) {
          matiere = matieres.substring(startPos, endPos);
        } else {
          matiere = matieres.substring(startPos);
        }
        
        int y_pos = y_start + index * 30;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 25) {
          currentMatiere = matiere;
          verificationActive = true;
          currentMode = MODE_VERIFICATION_IN_PROGRESS;
          
          displayCenteredMessage("VERIFICATION ACTIVE", "Matiere: " + currentMatiere, ILI9341_GREEN);
          tft.setTextSize(1);
          tft.setTextColor(ILI9341_YELLOW);
          tft.setCursor(50, 120);
          tft.print("Enseignant: " + currentTeacherMatricule);
          tft.setTextSize(2);
          tft.setCursor(50, 150);
          tft.print("En attente eleves...");
          
          // Enregistrer le début de session (nouveau format)
          beginVerificationSession();
          
          delay(3000);
          displayCurrentMode();
          displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
          break;
        }
        
        index++;
        if (endPos > 0) {
          startPos = endPos + 1;
          endPos = matieres.indexOf(',', startPos);
        } else {
          break;
        }
      }
      
      // Bouton ANNULER
      if (x >= 100 && x <= 220 && y >= 210 && y <= 235) {
        currentMode = MODE_VERIFICATION;
        currentTeacherMatricule = "";
        displayCenteredMessage("Setup annule", "Retour verification", ILI9341_ORANGE);
        delay(2000);
        displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE RECHERCHE MATRICULE ===
  if (currentMode == MODE_SEARCH_MATRICULE && searchingMatricule) {
    if (wasTouched && !isTouched) {
      int row, col;
      getKeyPosition(x, y, row, col);
      
      if (row >= 0 && col >= 0) {
        String key = String(keys[row][col]);
        
        drawKey(row, col, true);
        delay(100);
        drawKey(row, col, false);
        
        if (key == "DEL") {
          if (searchMatricule.length() > 0)
            searchMatricule.remove(searchMatricule.length() - 1);
        }
        else if (key == "OK") {
          if (searchMatricule.length() > 0) {
            int id = getIdByMatricule(formatMatriculeFromRaw(searchMatricule, adminTargetIsTeacher));
            if (id > 0) {
              modifyID = id;
              oldMatricule = formatMatriculeFromRaw(searchMatricule, adminTargetIsTeacher);
              
              // Déterminer si c'est un prof ou élève
              isModifyingTeacher = (oldMatricule.indexOf('M') > 0);

              // Verifier que le type correspond au palier choisi
              if (adminTargetIsTeacher != isModifyingTeacher) {
                displayCenteredMessage("Type incorrect", adminTargetIsTeacher ? "Attendu: ENSEIGNANT" : "Attendu: ELEVE", ILI9341_RED);
                delay(2500);
                displaySearchMatriculeScreen();
                return;
              }
              
              currentMode = MODE_MODIFY_CHOICE;
              displayModificationChoice();
            } else {
              displayCenteredMessage("Matricule non trouve", "", ILI9341_RED);
              delay(2000);
              displayCurrentMode();
              drawSearchBox();
              drawKeyboard();
            }
          }
        }
        else {
          if (searchMatricule.length() < 6) {
            searchMatricule += key;
          }
        }
        
        drawSearchBox();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE MODIFICATION (Attente empreinte) ===
  if (currentMode == MODE_MODIFICATION && !waitingForNewMatricule && !isEditingMatieres) {
    int result = finger.getImage();
    
    if (result == FINGERPRINT_OK) {
      displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
      delay(500);
      
      result = finger.image2Tz();
      
      if (result == FINGERPRINT_OK) {
        result = finger.fingerSearch();
        
        if (result == FINGERPRINT_OK) {
          modifyID = finger.fingerID;
          oldMatricule = getMatricule(modifyID);
          
          if (oldMatricule.length() > 0) {
            isModifyingTeacher = (oldMatricule.indexOf('M') > 0);

            // Verifier palier selectionne (enseignant/eleve)
            if (adminTargetIsTeacher != isModifyingTeacher) {
              displayCenteredMessage("Type incorrect", adminTargetIsTeacher ? "Attendu: ENSEIGNANT" : "Attendu: ELEVE", ILI9341_RED);
              delay(2500);
              displayCurrentMode();
              displayCenteredMessage("Placez l'empreinte", "a editer", ILI9341_WHITE);
              return;
            }
            
            Serial.print(">>> Empreinte detectee: ID ");
            Serial.print(modifyID);
            Serial.print(" - Matricule: ");
            Serial.println(oldMatricule);
            
            currentMode = MODE_MODIFY_CHOICE;
            displayModificationChoice();
          } else {
            displayCenteredMessage("ERREUR", "Matricule introuvable", ILI9341_RED);
            delay(2000);
            displayCurrentMode();
            displayCenteredMessage("Placez l'empreinte", "a modifier", ILI9341_WHITE);
          }
        } else {
          displayCenteredMessage("EMPREINTE INCONNUE", "Non enregistree", ILI9341_RED);
          delay(2000);
          displayCurrentMode();
          displayCenteredMessage("Placez l'empreinte", "a modifier", ILI9341_WHITE);
        }
      }
      delay(500);
    }
    return;
  }
  
  // === MODE CHOIX MODIFICATION ===
  if (currentMode == MODE_MODIFY_CHOICE) {
    if (wasTouched && !isTouched) {
      // Bouton Modifier matricule
      if (x >= 40 && x <= 280 && y >= 140 && y <= 180) {
        Serial.println(">>> Choix: MODIFIER MATRICULE");
        waitingForNewMatricule = true;
        newMatricule = "";
        tempMatricule = "";
        currentMode = MODE_MODIFICATION;
        
        displayCurrentMode();
        displayCenteredMessage("Ancien: " + oldMatricule, "Nouveau matricule:", ILI9341_CYAN);
        tft.setTextSize(2);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(80, 160);
        tft.print("Format: ");
        tft.print(isModifyingTeacher ? "**M***" : "**P***");
        delay(2000);
        
        displayCurrentMode();
        drawInputBox("Nouveau matricule:");
        drawKeyboard();
      }
      // Bouton Éditer matières (enseignant seulement) ou Annuler
      else if (x >= 40 && x <= 280 && y >= 185 && y <= 225) {
        if (isModifyingTeacher) {
          Serial.println(">>> Choix: EDITER MATIERES");
          isEditingMatieres = true;
          matierePage = 0;
          matierePage = 0;
            currentMode = MODE_SELECT_MATIERES;
          selectedMatieres = getMatieresForTeacher(modifyID);
          displayMatieresSelection(selectedMatieres);
        } else {
          Serial.println(">>> Choix: ANNULER");
          currentMode = MODE_ADMIN_MENU;
          displayAdminMenu();
        }
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === SAISIE NOUVEAU MATRICULE ===
  if (currentMode == MODE_MODIFICATION && waitingForNewMatricule) {
    if (wasTouched && !isTouched) {
      int row, col;
      getKeyPosition(x, y, row, col);
      
      if (row >= 0 && col >= 0) {
        String key = String(keys[row][col]);
        
        drawKey(row, col, true);
        delay(100);
        drawKey(row, col, false);
        
        if (key == "DEL") {
          if (tempMatricule.length() > 0)
            tempMatricule.remove(tempMatricule.length() - 1);
        }
        else if (key == "OK") {
          bool formatOK = false;
          String fullMatricule = "";
          
          if (isModifyingTeacher && tempMatricule.length() == 5) {
            fullMatricule = tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2);
            formatOK = true;
          } else if (!isModifyingTeacher && (tempMatricule.length() == 5 || tempMatricule.length() == 6)) {
            fullMatricule = tempMatricule.substring(0, 2) + "P" + tempMatricule.substring(2);
            formatOK = true;
          }
          
          if (formatOK) {
            if (matriculeExists(fullMatricule) && fullMatricule != oldMatricule) {
              displayCenteredMessage("MATRICULE EXISTE!", "Choisissez-en un autre", ILI9341_RED);
              delay(2000);
              tempMatricule = "";
              displayCurrentMode();
              drawInputBox("Nouveau matricule:");
              drawKeyboard();
            } else {
              // Garder les matières existantes pour les enseignants
              String matieres = "";
              if (isModifyingTeacher) {
                matieres = getMatieresForTeacher(modifyID);
              }
              
              bool success = updateMatricule(modifyID, fullMatricule, isModifyingTeacher, matieres);
              
              if (success) {
                displayCenteredMessage("MODIFICATION REUSSIE!", "", ILI9341_GREEN);
                tft.setTextSize(2);
                tft.setTextColor(ILI9341_CYAN);
                tft.setCursor(10, 120);
                tft.print("Ancien: ");
                tft.print(oldMatricule);
                tft.setCursor(10, 145);
                tft.print("Nouveau: ");
                tft.print(fullMatricule);
                tft.setCursor(100, 175);
                tft.print("ID: ");
                tft.print(modifyID);
                
                Serial.print(">>> Modification OK: ");
                Serial.print(oldMatricule);
                Serial.print(" -> ");
                Serial.println(fullMatricule);
                
                delay(3000);
                
                waitingForNewMatricule = false;
                tempMatricule = "";
                
                listMatricules();
                
                currentMode = MODE_ADMIN_MENU;
                displayAdminMenu();
              } else {
                displayCenteredMessage("ERREUR!", "Modification echouee", ILI9341_RED);
                delay(2000);
                waitingForNewMatricule = false;
                currentMode = MODE_ADMIN_MENU;
                displayAdminMenu();
              }
            }
          } else {
            displayCenteredMessage("FORMAT INVALIDE!", isModifyingTeacher ? "**M***" : "**P***/**P****", ILI9341_RED);
            delay(2000);
            displayCurrentMode();
            drawInputBox("Nouveau matricule:");
            drawKeyboard();
          }
        }
        else {
          if (tempMatricule.length() < 6) {
            tempMatricule += key;
          }
        }
        
        drawInputBox("Nouveau matricule:");
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === GESTION SAISIE MATRICULE ENREGISTREMENT ===
  if (waitingForMatricule && currentMode == MODE_ENROLL) {
    if (wasTouched && !isTouched) {
      int row, col;
      getKeyPosition(x, y, row, col);
      
      if (row >= 0 && col >= 0) {
        String key = String(keys[row][col]);
        
        drawKey(row, col, true);
        delay(100);
        drawKey(row, col, false);
        
        if (key == "DEL") {
          if (tempMatricule.length() > 0)
            tempMatricule.remove(tempMatricule.length() - 1);
        }
        else if (key == "OK") {
          bool formatOK = false;
          String fullMatricule = "";
          
          if (isTeacherMode && tempMatricule.length() == 5) {
            fullMatricule = tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2);
            formatOK = true;
          } else if (!isTeacherMode && (tempMatricule.length() == 5 || tempMatricule.length() == 6)) {
            fullMatricule = tempMatricule.substring(0, 2) + "P" + tempMatricule.substring(2);
            formatOK = true;
          }
          
          if (formatOK) {
            if (matriculeExists(fullMatricule)) {
              displayCenteredMessage("Matricule existe!", "Reessayez", ILI9341_RED);
              delay(2000);
              tempMatricule = "";
              displayCurrentMode();
              drawInputBox();
              drawKeyboard();
            } else {
              if (isTeacherMode) {
                // Pour les enseignants, passer à la sélection des matières
                currentMode = MODE_SELECT_MATIERES;
                selectedMatieres = "";
                displayMatieresSelection(selectedMatieres);
              } else {
                // Pour les élèves, sauvegarder directement
                saveMatricule(enrollID, fullMatricule, false);
                
                displayCenteredMessage("ELEVE ENREGISTRE!", fullMatricule, ILI9341_GREEN);
                tft.setTextSize(2);
                tft.setTextColor(ILI9341_CYAN);
                tft.setCursor(100, 160);
                tft.print("ID: ");
                tft.print(enrollID);
                
                delay(3000);
                
                waitingForMatricule = false;
                enrollMode = false;
                tempMatricule = "";
                
                listMatricules();
                
                Serial.println(">>> Enregistrement termine");
                displayCurrentMode();
                displayCenteredMessage("Eleve enregistre!", "Nouvelle empreinte?", ILI9341_GREEN);
                delay(3000);
                displayCurrentMode();
                displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
              }
            }
          } else {
            displayCenteredMessage("Format invalide!", isTeacherMode ? "**M***" : "**P***/**P****", ILI9341_RED);
            delay(2000);
            displayCurrentMode();
            drawInputBox();
            drawKeyboard();
          }
        }
        else {
          if (tempMatricule.length() < 6) {
            tempMatricule += key;
          }
        }
        
        drawInputBox();
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === MODE ENREGISTREMENT ===
  if (currentMode == MODE_ENROLL) {
    if (enrollMode) {
      enrollFingerprint();
      return;
    }
    
    int result = finger.getImage();
    
    if (result == FINGERPRINT_OK) {
      displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
      delay(500);
      
      result = finger.image2Tz();
      
      if (result == FINGERPRINT_OK) {
        result = finger.fingerSearch();
        
        if (result == FINGERPRINT_OK) {
          displayCenteredMessage("Empreinte", "deja enregistree!", ILI9341_ORANGE);
          delay(2000);
          displayCurrentMode();
          displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
        } else {
          enrollID = getNextFreeID();
          
          while (finger.getImage() != FINGERPRINT_NOFINGER) {
            delay(50);
          }
          
          enrollMode = true;
          enrollStage = 0;
        }
      }
      delay(500);
    }
    return;
  }
  
  // === MODE VERIFICATION ===
  if (currentMode == MODE_VERIFICATION) {
    int result = finger.getImage();
    
    if (result == FINGERPRINT_OK) {
      displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
      delay(500);
      
      result = finger.image2Tz();
      
      if (result == FINGERPRINT_OK) {
        result = finger.fingerSearch();
        
        if (result == FINGERPRINT_OK) {
          String matricule = getMatricule(finger.fingerID);
          
          if (matricule.length() > 0) {
            // Vérifier si c'est un enseignant
            if (matricule.indexOf('M') > 0) {
              // C'est un enseignant, démarrer le setup de vérification
              currentTeacherMatricule = matricule;
              currentMode = MODE_VERIFICATION_SETUP;
              
              displayCenteredMessage("ENSEIGNANT DETECTE", matricule, ILI9341_GREEN);
              tft.setTextSize(2);
              tft.setTextColor(ILI9341_CYAN);
              tft.setCursor(110, 160);
              tft.print("ID: ");
              tft.print(finger.fingerID);
              delay(2000);
              displayVerificationSetup();
            } else {
              // C'est un élève, mais aucune session n'est active
              // IMPORTANT: afficher le matricule (pas l'ID)
              displayCenteredMessage("AUCUNE SESSION ACTIVE", matricule, ILI9341_ORANGE);
              delay(2500);
              displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
            }
          }
        } else {
          displayCenteredMessage("Empreinte non reconnue", "", ILI9341_RED);
          delay(2000);
          displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
        }
      }
      delay(500);
    }
    return;
  }
  
  // === MODE VERIFICATION EN COURS ===
  if (currentMode == MODE_VERIFICATION_IN_PROGRESS) {
    int result = finger.getImage();
    
    if (result == FINGERPRINT_OK) {
      displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
      delay(500);
      
      result = finger.image2Tz();
      
      if (result == FINGERPRINT_OK) {
        result = finger.fingerSearch();
        
        if (result == FINGERPRINT_OK) {
          String matricule = getMatricule(finger.fingerID);
          
          if (matricule.length() > 0) {
            if (matricule.indexOf('M') > 0) {
              // Enseignant - vérifier si c'est le même
              if (matricule == currentTeacherMatricule) {
                // Terminer la session
                endVerificationSession();
                displayCenteredMessage("SESSION TERMINEE", "Par: " + matricule, ILI9341_GREEN);
                delay(2000);
                currentMode = MODE_VERIFICATION;
                displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
                delay(2000);
                displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
              } else {
                displayCenteredMessage("Enseignant different", "Session en cours", ILI9341_ORANGE);
                delay(2000);
                displayCurrentMode();
                displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
              }
            } else {
              // Élève - enregistrer la présence (anti-doublon)
              bool ok = recordStudentPresenceOnce(matricule);
              if (ok) {
                displayCenteredMessage("PRESENCE ENREGISTREE", matricule, ILI9341_GREEN);
              } else {
                displayCenteredMessage("DEJA PRESENT", matricule, ILI9341_ORANGE);
              }
              tft.setTextSize(1);
              tft.setTextColor(ILI9341_CYAN);
              tft.setCursor(50, 120);
              tft.print("Matiere: " + currentMatiere);
              tft.setTextSize(2);
              tft.setCursor(110, 160);
              tft.print("ID: ");
              tft.print(finger.fingerID);
              delay(2000);
              displayCurrentMode();
              displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
            }
          }
        } else {
          displayCenteredMessage("Empreinte non reconnue", "", ILI9341_RED);
          delay(2000);
          displayCurrentMode();
          displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
        }
      }
      delay(500);
    }
    return;
  }
  
  wasTouched = isTouched;
  delay(10);
}
