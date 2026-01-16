16011546;22M451;22p368;
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>
#include <SPIFFS.h>
#include <XPT2046_Touchscreen.h>
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

// === WIFI ===
const char* WIFI_SSID = "YOUR_SSID";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";
const char* BACKEND_URL = "https://projet-electronique.onrender.com/api/fingerprint/text";

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
  MODE_VERIFICATION_SETUP
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

// === MODIFICATION ===
int modifyID = 0;
String oldMatricule = "";
String newMatricule = "";
bool isModifyingTeacher = false;
bool waitingForNewMatricule = false;
bool isEditingMatieres = false;

// === VARIABLES ENREGISTREMENT ===
bool enrollMode = false;
int enrollID = 1;
int enrollStage = 0;
String tempMatricule = "";
bool waitingForMatricule = false;
bool wasTouched = false;
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

// === MATIERES PAGINATION ===
const int MATIERES_PER_PAGE = 3;
int matieresPage = 0;

// === FONCTIONS WIFI ===
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    if (millis() - start > 15000) {
      break;
    }
  }
}

void sendPresenceFile() {
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi non connecte, envoi annule");
    return;
  }

  File f = SPIFFS.open(FILE_PRESENCE, "r");
  if (!f) {
    Serial.println("presence.txt introuvable");
    return;
  }

  String payload = f.readString();
  f.close();

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "text/plain");
  int code = http.POST(payload);
  String resp = http.getString();
  http.end();

  Serial.print("Envoi presence: ");
  Serial.print(code);
  Serial.print(" - ");
  Serial.println(resp);
}

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
  
  for (int id = 1; id <= 127; id++) {
    if (finger.deleteModel(id) != FINGERPRINT_OK) {
    }
    delay(10);
  }
  
  String files[] = {FILE_ELEVES, FILE_PROFS, FILE_PRESENCE};
  for (int i = 0; i < 3; i++) {
    if (SPIFFS.exists(files[i])) {
      if (!SPIFFS.remove(files[i])) {
        success = false;
      }
    }
  }
  
  initializeMatieresFile();
  
  return success;
}

bool deleteFingerprint(int id) {
  if (finger.deleteModel(id) == FINGERPRINT_OK) {
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

void recordPresence(String matricule) {
  File file = SPIFFS.open(FILE_PRESENCE, "a");
  if (file) {
    file.print(millis());
    file.print(",");
    file.print(currentTeacherMatricule);
    file.print(",");
    file.print(currentMatiere);
    file.print(",");
    file.println(matricule);
    file.close();
  }
}

void endVerificationSession() {
  File file = SPIFFS.open(FILE_PRESENCE, "a");
  if (file) {
    file.println("--- SESSION TERMINEE PAR: " + currentTeacherMatricule + " ---");
    file.close();
  }

  sendPresenceFile();
  
  verificationActive = false;
  currentTeacherMatricule = "";
  currentMatiere = "";
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
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(40, 10);
  tft.print("MENU ADMINISTRATION");
  
  int y = 50;
  int h = 35;
  
  tft.fillRect(40, y, 240, h, ILI9341_BLUE);
  tft.drawRect(40, y, 240, h, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(45, y + 10);
  tft.print("1. Modifier matricule");
  y += h + 10;
  
  tft.fillRect(40, y, 240, h, ILI9341_GREEN);
  tft.drawRect(40, y, 240, h, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setCursor(45, y + 10);
  tft.print("2. Rechercher matricule");
  y += h + 10;
  
  tft.fillRect(40, y, 240, h, ILI9341_ORANGE);
  tft.drawRect(40, y, 240, h, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setCursor(45, y + 10);
  tft.print("3. Supprimer empreinte");
  y += h + 10;
  
  tft.fillRect(40, y, 240, h, ILI9341_RED);
  tft.drawRect(40, y, 240, h, ILI9341_WHITE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(45, y + 10);
  tft.print("4. Reinitialiser systeme");
  y += h + 10;
  
  tft.fillRect(40, y, 240, h, ILI9341_DARKGREY);
  tft.drawRect(40, y, 240, h, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(110, y + 10);
  tft.print("5. RETOUR");
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
  
  tft.fillRect(40, 140, 240, 40, ILI9341_ORANGE);
  tft.drawRect(40, 140, 240, 40, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(45, 150);
  tft.print("MODIFIER MATRICULE");
  
  if (isModifyingTeacher) {
    tft.fillRect(40, 185, 240, 40, ILI9341_BLUE);
    tft.drawRect(40, 185, 240, 40, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(60, 195);
    tft.print("EDITER MATIERES");
  } else {
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
  
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(50, 10);
  tft.print("SELECTION MATIERES");
  
  int total = countMatieres();
  int totalPages = (total + MATIERES_PER_PAGE - 1) / MATIERES_PER_PAGE;
  if (matieresPage >= totalPages && totalPages > 0) matieresPage = totalPages - 1;

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 35);
  tft.print("Page ");
  tft.print(matieresPage + 1);
  tft.print("/");
  tft.print(totalPages);

  int y = 60;
  int startIndex = matieresPage * MATIERES_PER_PAGE;
  for (int i = 0; i < MATIERES_PER_PAGE; i++) {
    int index = startIndex + i;
    if (index >= total) break;
    String matiere = getMatiereAt(index);
    if (matiere.length() > 0) {
      bool isSelected = selected.indexOf(matiere) >= 0;
      
      if (isSelected) {
        tft.fillRect(10, y, 300, 30, ILI9341_GREEN);
        tft.setTextColor(ILI9341_BLACK);
      } else {
        tft.fillRect(10, y, 300, 30, ILI9341_BLUE);
        tft.setTextColor(ILI9341_WHITE);
      }
      
      tft.drawRect(10, y, 300, 30, ILI9341_WHITE);
      tft.setCursor(15, y + 10);
      tft.print(String(index + 1) + ". " + matiere);
      y += 35;
    }
  }

  if (matieresPage > 0) {
    tft.fillRect(20, 195, 40, 30, ILI9341_DARKGREY);
    tft.drawRect(20, 195, 40, 30, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(32, 203);
    tft.print("<");
  }

  if (matieresPage < totalPages - 1) {
    tft.fillRect(260, 195, 40, 30, ILI9341_DARKGREY);
    tft.drawRect(260, 195, 40, 30, ILI9341_WHITE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(272, 203);
    tft.print(">");
  }
  
  tft.fillRect(80, 195, 70, 30, ILI9341_GREEN);
  tft.drawRect(80, 195, 70, 30, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(95, 203);
  tft.print("OK");
  
  tft.fillRect(160, 195, 90, 30, ILI9341_RED);
  tft.drawRect(160, 195, 90, 30, ILI9341_WHITE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(170, 203);
  tft.print("ANNUL");
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
  tft.fillRect(0, 30, 320, startY - 30, ILI9341_BLACK);
  
  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 32);
  tft.print("Rechercher matricule:");
  
  tft.drawRect(5, 45, 310, 20, ILI9341_WHITE);
  
  tft.setCursor(15, 48);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(2);
  tft.print(searchMatricule);
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
      
      if (currentMode == MODE_VERIFICATION) {
        currentMode = MODE_MAIN_MENU;
        Serial.println(">>> PASSAGE AU MENU PRINCIPAL");
        displayMainMenu();
      } 
      else if (currentMode == MODE_VERIFICATION_IN_PROGRESS) {
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
      matieresPage = 0;
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

  connectWiFi();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connecte");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi non connecte");
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
  
  if (wasTouched && !isTouched) {
    p = touch.getPoint();
    x = map(p.x, 3900, 200, 0, 320);
    y = map(p.y, 3900, 200, 0, 240);
  }
  
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

  if (currentMode == MODE_SELECT_MATIERES) {
    if (wasTouched && !isTouched) {
      int total = countMatieres();
      int totalPages = (total + MATIERES_PER_PAGE - 1) / MATIERES_PER_PAGE;

      if (x >= 20 && x <= 60 && y >= 195 && y <= 225 && matieresPage > 0) {
        matieresPage--;
        displayMatieresSelection(selectedMatieres);
        wasTouched = isTouched;
        return;
      }

      if (x >= 260 && x <= 300 && y >= 195 && y <= 225 && matieresPage < totalPages - 1) {
        matieresPage++;
        displayMatieresSelection(selectedMatieres);
        wasTouched = isTouched;
        return;
      }

      int startY = 60;
      int itemH = 35;
      for (int i = 0; i < MATIERES_PER_PAGE; i++) {
        int y_pos = startY + i * itemH;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 30) {
          int index = matieresPage * MATIERES_PER_PAGE + i;
          if (index >= total) break;
          String matiere = getMatiereAt(index);

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

      if (x >= 80 && x <= 150 && y >= 195 && y <= 225) {
        if (selectedMatieres.length() > 0) {
          if (isEditingMatieres) {
            if (updateMatricule(modifyID, oldMatricule, true, selectedMatieres)) {
              displayCenteredMessage("MATIERES MISES A JOUR!", "", ILI9341_GREEN);
              delay(3000);
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
              delay(3000);
              
              waitingForMatricule = false;
              enrollMode = false;
              tempMatricule = "";
              selectedMatieres = "";
              matieresPage = 0;
              
              listMatricules();
              
              currentMode = MODE_ENROLL;
              displayCurrentMode();
              displayCenteredMessage("Enseignant enregistre!", "Nouvelle empreinte?", ILI9341_GREEN);
              delay(3000);
              displayCurrentMode();
              displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
            }
          }
        } else {
          displayCenteredMessage("Selectionnez au moins", "une matiere!", ILI9341_RED);
          delay(2000);
          displayMatieresSelection(selectedMatieres);
        }
      } else if (x >= 160 && x <= 250 && y >= 195 && y <= 225) {
        if (isEditingMatieres) {
          currentMode = MODE_MODIFY_CHOICE;
          displayModificationChoice();
        } else {
          displayCenteredMessage("Enregistrement annule", "", ILI9341_ORANGE);
          delay(2000);
          currentMode = MODE_ENROLL;
          displayCurrentMode();
          displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
        }
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  wasTouched = isTouched;
  delay(10);
}
