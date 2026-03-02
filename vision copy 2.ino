#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>
#include <SPIFFS.h> 
#include <XPT2046_Touchscreen.h>

// === WIFI / HTTP ===
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

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
  MODE_ADD_MATIERE_SCAN,
  MODE_ADD_MATIERE_CONFIRM,
  MODE_PASSWORD,
  MODE_PROF_ENROLL_TYPE,
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
  MODE_VERIFICATION_SEMESTRE,
  MODE_VERIFICATION_SETUP_V2,
  MODE_VERIFICATION_V2_LEVEL,
  MODE_VERIFICATION_V2_SEM,
  MODE_VERIFICATION_V2_MAT,
  MODE_ADMIN_EDIT_TIER,
  MODE_ADMIN_EDIT_SEARCHMODE
};

SystemMode currentMode = MODE_VERIFICATION;
bool isTeacherMode = false;
bool verificationActive = false;
String currentTeacherMatricule = "";
String currentMatiere = "";
String currentSemestre = "";  // S1 ou S2

// === PROF V2 / CONFIG ===
int teacherEnrollType = 1; // 1=manuel, 2=config distante
String currentTeacherName = "";
String currentProfV2Line = "";
String currentDeptField = "";
String currentAffectField = "";
String pendingTeacherMatricule = "";
bool teacherType1EnrollSelection = false;
bool addTeacherMatiereMode = false;
int addTeacherMatiereFingerId = 0;
String addTeacherMatiereMatricule = "";

String v2_selectedDept = "";
int    v2_selectedLevel = 0;
String v2_selectedSem = "";
String v2_selectedMatiere = "";

String v2_depts[10];   int v2_deptCount = 0;
int    v2_levels[10];  int v2_levelCount = 0;
String v2_sems[3];     int v2_semCount = 0;
String v2_mats[24];    int v2_matCount = 0;

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
const String FILE_CONFIG = "/config.txt";
const String FILE_PROFS_V2 = "/prof1.txt";
const String FILE_MATIERES = "/matiere.txt";
const String FILE_PRESENCE = "/presence.txt";

// === CONFIGURATION WIFI ===
//const char* WIFI_SSID = "Galaxy S95f5c";
//const char* WIFI_PASSWORD = "Un big 1";
const char* WIFI_SSID = "TECNO SPARK 10C";
const char* WIFI_PASSWORD = "987654321";
const char* BACKEND_URL = "https://projet-electronique.onrender.com/api/fingerprint/text";
const char* CONFIG_URL  = "https://projet-electronique.onrender.com/api/fingerprint/config/published";
const char* REMOTE_LAUNCH_URL = "https://projet-electronique.onrender.com/api/attendance-session/launch/pending";

// Prototypes explicites pour eviter les erreurs d'ordre de declaration Arduino.
bool wifiEnsureConnected(unsigned long timeoutMs = 15000);
void wifiStartBackgroundConnection();
void wifiLogStatus(const char* context);
void pollRemoteAttendanceLaunch();
void startRemoteVerificationSession(const String& teacherMatricule, const String& teacherName, const String& subjectName, const String& semester);
String extractJsonString(const String& json, const String& key);
long extractJsonLong(const String& json, const String& key, long fallbackValue = -1);
String normalizeSubjectLabel(const String& raw);
void resetAddTeacherMatiereState();
String buildMergedStructuredTeacherData(const String& existingData, const String& dep, int level, const String& sem, const String& selected);
String buildDeptFieldFromAffectField(const String& affectField);
String mergeAffectField(const String& affectField, const String& dep, int level, const String& sem, const String& selected);
String normalizeAffectField(const String& affectField);
String normalizeStructuredTeacherConfigLine(const String& line);
void displayAddMatiereConfirm();

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
unsigned long lastRemoteLaunchPollMs = 0;
unsigned long lastLocalActivityMs = 0;
unsigned long lastWifiConnectKickMs = 0;
const unsigned long REMOTE_LAUNCH_POLL_INTERVAL_MS = 12000;
const unsigned long REMOTE_LAUNCH_IDLE_BEFORE_POLL_MS = 15000;
const unsigned long WIFI_RECONNECT_KICK_INTERVAL_MS = 10000;
const unsigned long PRESENCE_UPLOAD_RETRY_WINDOW_MS = 60000;
const unsigned long PRESENCE_UPLOAD_RETRY_DELAY_MS = 3000;
const unsigned long REMOTE_LAUNCH_HTTP_TIMEOUT_MS = 5000;
unsigned long lastWifiStatusLogMs = 0;

String availableMatieres[32];
int availableMatiereCount = 0;

const char* SUBJECT_CATALOG[] = {
  "GEL;3;S1;Analyse des circuits",
  "GEL;3;S1;Electronique analogique 1",
  "GEL;3;S1;Automatique de base",
  "GEL;3;S1;Electronique numerique",
  "GEL;3;S1;Electromagnetisme et ondes",
  "GEL;3;S1;Gestion de projet",
  "GEL;3;S1;Mathematiques pour ingenieurs",
  "GEL;3;S1;Schema electrique",
  "GEL;3;S2;Techniques de communication",
  "GEL;3;S2;Traitement du signal",
  "GEL;3;S2;Electronique analogique II",
  "GEL;3;S2;Concepts de base des telecommunications",
  "GEL;3;S2;Programmation informatique",
  "GEL;3;S2;Installation Protection Securite electrique",
  "GEL;3;S2;TP Electronique 1",
  "GEL;3;S2;TP Automatique 1",
  "GEL;3;S2;Genie electrique",
  "GEL;3;S2;Architecture et reseaux d ordinateurs",
  "GEL;3;S2;Machines electriques 1",
  "GEL;3;S2;Microprocesseurs",
  "GEL;3;S2;Electronique de puissance 1",
  "GEL;4;S1;Electronique de puissance II",
  "GEL;4;S1;Micro-electronique",
  "GEL;4;S1;Travaux pratiques electronique II",
  "GEL;4;S1;Travaux pratiques en genie electrique",
  "GEL;4;S1;Recherche operationnelle",
  "GEL;4;S1;Machines electriques II",
  "GEL;4;S1;Qualite de l alimentation",
  "GEL;4;S1;Informatique Industrielle",
  "GEL;4;S2;Controle sequentiel",
  "GEL;4;S2;Energies renouvelables",
  "GEL;4;S2;Instruments electriques",
  "GEL;4;S2;Controle de la tension et de la puissance reactive",
  "GEL;4;S2;Reseaux electroniques",
  "GEL;4;S2;Commande de machine",
  "GEL;4;S2;Automatique II Travaux Pratiques",
  "GEL;4;S2;Traitement numerique du signal",
  "GEL;4;S2;Informatique Industrielle II",
  "GEL;5;S1;Methodes d analyse des reseaux electriques",
  "GEL;5;S1;Protection des installations electriques",
  "GEL;5;S1;Systemes electriques restructures",
  "GEL;5;S1;Projet d ingenieur",
  "GEL;5;S1;Controle du modem",
  "GEL;5;S1;TP Automatique",
  "GEL;5;S1;Technique de creation d entreprise",
  "GEL;5;S1;Gestion",
  "GEL;5;S1;Seminaire",
  "GI;3;S1;Architecture des ordinateurs",
  "GI;3;S1;Fondamentaux de BD",
  "GI;3;S1;Systeme d exploitation",
  "GI;3;S1;Programmation par Objets I",
  "GI;3;S1;Outils mathematiques pour l informatique",
  "GI;3;S1;Science de l information",
  "GI;3;S1;Mathematiques de base",
  "GI;3;S1;Probabilites et statistiques",
  "GI;3;S2;Systemes formels et Bases de l IA",
  "GI;3;S2;Algorithmique",
  "GI;3;S2;Analyse Numerique I",
  "GI;3;S2;Programmation par objets 2",
  "GI;3;S2;Conception des SI UML",
  "GI;3;S2;Introduction a la data science",
  "GI;3;S2;Introduction aux Reseaux",
  "GI;3;S2;Programmation systeme",
  "GI;4;S1;Electronique",
  "GI;4;S1;Machine Learning",
  "GI;4;S1;Analyse des donnees",
  "GI;4;S1;IHM",
  "GI;4;S1;Programmation web",
  "GI;4;S1;Grammaire",
  "GI;4;S1;Management",
  "GI;4;S1;Admin Reseau",
  "GI;4;S1;Gestion de Projet",
  "GI;4;S2;SMA et projet Systeme Expert",
  "GI;4;S2;Genie Logiciel 1",
  "GI;4;S2;Informatique Decisionnelle",
  "GI;4;S2;Recherche Operationnelle",
  "GI;4;S2;Analyse Numerique II",
  "GI;4;S2;Ingenierie des Telecommunications",
  "GI;4;S2;Reseaux intelligents et mobiles",
  "GI;4;S2;Introduction a l informatique quantique",
  "GI;4;S2;Securite informatique",
  "GI;5;S1;Deep Learning",
  "GI;5;S1;Genie Logiciel II",
  "GI;5;S1;Traitement d Images SIG et Webmapping",
  "GI;5;S1;Systeme Tuteur Intelligent",
  "GI;5;S1;Systemes distribues virtualisation",
  "GI;5;S1;e-Commerce",
  "GI;5;S1;Systemes temps-reel et embarques",
  "GIND;3;S1;Genie mecanique",
  "GIND;3;S1;Algorithme et programmation",
  "GIND;3;S1;Esclavage",
  "GIND;3;S1;DAO",
  "GIND;3;S1;Anglais Francais",
  "GIND;3;S1;Electronique",
  "GIND;3;S1;Resistance elasticite du materiau",
  "GIND;3;S1;Mecanique des fluides appliquee et turbomachines",
  "GIND;3;S1;Transfert de chaleur",
  "GIND;3;S2;Science des materiaux",
  "GIND;3;S2;Recherche operationnelle",
  "GIND;3;S2;Informatique",
  "GIND;3;S2;Processus de fabrication",
  "GIND;3;S2;Genie electrique",
  "GIND;3;S2;Automatisation",
  "GIND;3;S2;Genie mecanique",
  "GIND;5;S1;CAO FAO CNC",
  "GIND;5;S1;Projet de production",
  "GIND;5;S1;Gestion de l environnement",
  "GIND;5;S1;Methodes de conception securite et fiabilite",
  "GIND;5;S1;Projet mecanique",
  "GIND;5;S1;Projet energetique",
  "GIND;5;S1;Gestion d entreprise et developpement"
};
const int SUBJECT_CATALOG_COUNT = sizeof(SUBJECT_CATALOG) / sizeof(SUBJECT_CATALOG[0]);

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

  if (SPIFFS.exists(FILE_PROFS_V2)) {
    File file = SPIFFS.open(FILE_PROFS_V2, "r");
    if (file) {
      String prefix = String(id) + ";";
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        if (line.startsWith(prefix)) {
          file.close();
          String matricule = getFieldSemicolon(line, 1);
          matricule.trim();
          return matricule;
        }
      }
      file.close();
    }
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
      file.println("Grammaire");
      file.println("Programmation web");
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
  return availableMatiereCount;
}

String getMatiereAt(int index) {
  if (index < 0 || index >= availableMatiereCount) return "";
  return availableMatieres[index];
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

  if (SPIFFS.exists(FILE_PROFS_V2)) {
    File file = SPIFFS.open(FILE_PROFS_V2, "r");
    if (file) {
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        if (line.length() == 0) continue;
        String id = getFieldSemicolon(line, 0);
        String matricule = getFieldSemicolon(line, 1);
        String name = getFieldSemicolon(line, 2);
        String dept = getFieldSemicolon(line, 3);
        String affect = getFieldSemicolon(line, 4);
        Serial.print("ID ");
        Serial.print(id);
        Serial.print(" -> ");
        Serial.print(matricule);
        Serial.print(" [V2] Nom: ");
        Serial.print(name);
        Serial.print(" Dept: ");
        Serial.print(dept);
        Serial.print(" Affect: ");
        Serial.println(affect);
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
  String files[] = {
    FILE_ELEVES,
    FILE_PROFS,
    FILE_PROFS_V2,
    FILE_CONFIG,
    FILE_MATIERES,
    FILE_PRESENCE
  };
  for (int i = 0; i < 6; i++) {
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

String getCatalogField(const String& row, int index) {
  int start = 0;
  int current = 0;
  while (true) {
    int sep = row.indexOf(';', start);
    if (sep < 0) {
      return current == index ? row.substring(start) : "";
    }
    if (current == index) return row.substring(start, sep);
    start = sep + 1;
    current++;
  }
}

bool containsCsvValue(const String& csv, const String& value) {
  if (csv.length() == 0 || value.length() == 0) return false;
  String token = "," + value + ",";
  return ("," + csv + ",").indexOf(token) >= 0;
}

void addAvailableMatiere(const String& value) {
  String normalized = normalizeSubjectLabel(value);
  if (normalized.length() == 0 || availableMatiereCount >= 32) return;
  for (int i = 0; i < availableMatiereCount; i++) {
    if (availableMatieres[i] == normalized) return;
  }
  availableMatieres[availableMatiereCount++] = normalized;
}

void clearAvailableMatieres() {
  availableMatiereCount = 0;
}

void setAvailableMatieresFromCatalogAll() {
  clearAvailableMatieres();
  for (int i = 0; i < SUBJECT_CATALOG_COUNT; i++) {
    addAvailableMatiere(getCatalogField(String(SUBJECT_CATALOG[i]), 3));
  }
}

void setAvailableMatieresForSelection(const String& dep, int level, const String& sem) {
  clearAvailableMatieres();
  for (int i = 0; i < SUBJECT_CATALOG_COUNT; i++) {
    String row = SUBJECT_CATALOG[i];
    if (getCatalogField(row, 0) == dep &&
        getCatalogField(row, 1).toInt() == level &&
        getCatalogField(row, 2) == sem) {
      addAvailableMatiere(getCatalogField(row, 3));
    }
  }
}

String getTeacherStructuredDeptField(const String& data) {
  int sep = data.indexOf(';');
  if (sep <= 0) return "";
  return data.substring(0, sep);
}

String getTeacherStructuredAffectField(const String& data) {
  int sep = data.indexOf(';');
  if (sep <= 0 || sep + 1 >= data.length()) return "";
  return data.substring(sep + 1);
}

bool teacherDataIsStructured(const String& data) {
  return data.indexOf(';') > 0 && data.indexOf(':') > 0;
}

String normalizeSubjectLabel(const String& raw) {
  String value = raw;
  value.trim();

  if (value == "Grammaire et Langage") return "Grammaire";
  if (value == "Programmation Web") return "Programmation web";
  if (value == "Machine learning") return "Machine Learning";

  return value;
}

int extractLevelNumber(const String& rawLevel) {
  for (int i = 0; i < rawLevel.length(); i++) {
    char c = rawLevel.charAt(i);
    if (c >= '0' && c <= '9') return c - '0';
  }
  return 0;
}

String getFieldSemicolon(const String& line, int index) {
  int start = 0;
  int current = 0;
  while (true) {
    int sep = line.indexOf(';', start);
    if (sep < 0) {
      return current == index ? line.substring(start) : "";
    }
    if (current == index) return line.substring(start, sep);
    start = sep + 1;
    current++;
  }
}

int findTopLevelSeparator(const String& text, char separator, int startIndex) {
  int depth = 0;
  for (int i = startIndex; i < text.length(); i++) {
    char c = text.charAt(i);
    if (c == '(') {
      depth++;
    } else if (c == ')') {
      if (depth > 0) depth--;
    } else if (c == separator && depth == 0) {
      return i;
    }
  }
  return -1;
}

void resetAddTeacherMatiereState() {
  addTeacherMatiereMode = false;
  addTeacherMatiereFingerId = 0;
  addTeacherMatiereMatricule = "";
}

void resetV2Selections() {
  v2_selectedDept = "";
  v2_selectedLevel = 0;
  v2_selectedSem = "";
  v2_selectedMatiere = "";
  v2_deptCount = 0;
  v2_levelCount = 0;
  v2_semCount = 0;
  v2_matCount = 0;
}

void setManualDeptChoices() {
  resetV2Selections();
  v2_depts[v2_deptCount++] = "GI";
  v2_depts[v2_deptCount++] = "GEL";
  v2_depts[v2_deptCount++] = "GIND";
}

String deptSpecForCode(const String& deptField, const String& code) {
  int start = 0;
  while (start < deptField.length()) {
    int bar = findTopLevelSeparator(deptField, '|', start);
    String part = (bar >= 0) ? deptField.substring(start, bar) : deptField.substring(start);
    part.trim();
    if (part.startsWith(code + "(") && part.endsWith(")")) {
      return part;
    }
    if (bar < 0) break;
    start = bar + 1;
  }
  return "";
}

void parseDeptCodes(const String& deptField) {
  v2_deptCount = 0;
  int start = 0;
  while (start < deptField.length() && v2_deptCount < 10) {
    int bar = findTopLevelSeparator(deptField, '|', start);
    String part = (bar >= 0) ? deptField.substring(start, bar) : deptField.substring(start);
    part.trim();
    if (part.length() > 0) {
      int par = part.indexOf('(');
      String code = par > 0 ? part.substring(0, par) : part;
      code.trim();
      if (code.length() > 0) v2_depts[v2_deptCount++] = code;
    }
    if (bar < 0) break;
    start = bar + 1;
  }
}

void buildLevelsForDept(const String& deptField, const String& code) {
  v2_levelCount = 0;
  String spec = deptSpecForCode(deptField, code);
  if (spec.length() == 0) return;

  int open = spec.indexOf('(');
  int close = spec.lastIndexOf(')');
  if (open < 0 || close <= open) return;

  String inside = spec.substring(open + 1, close);
  int start = 0;
  while (start < inside.length() && v2_levelCount < 10) {
    int comma = inside.indexOf(',', start);
    String item = (comma >= 0) ? inside.substring(start, comma) : inside.substring(start);
    item.trim();
    int par = item.indexOf('(');
    String lvlStr = par > 0 ? item.substring(0, par) : item;
    int lvl = lvlStr.toInt();
    if (lvl > 0) v2_levels[v2_levelCount++] = lvl;
    if (comma < 0) break;
    start = comma + 1;
  }
}

void buildSemsForDeptLevel(const String& deptField, const String& code, int level) {
  v2_semCount = 0;
  String spec = deptSpecForCode(deptField, code);
  if (spec.length() == 0) return;

  int open = spec.indexOf('(');
  int close = spec.lastIndexOf(')');
  if (open < 0 || close <= open) return;

  String inside = spec.substring(open + 1, close);
  int start = 0;
  while (start < inside.length()) {
    int comma = inside.indexOf(',', start);
    String item = (comma >= 0) ? inside.substring(start, comma) : inside.substring(start);
    item.trim();

    int par1 = item.indexOf('(');
    int par2 = item.lastIndexOf(')');
    if (par1 > 0 && par2 > par1 && item.substring(0, par1).toInt() == level) {
      String sems = item.substring(par1 + 1, par2);
      int s = 0;
      while (s < sems.length() && v2_semCount < 3) {
        int bar = sems.indexOf('|', s);
        String one = (bar >= 0) ? sems.substring(s, bar) : sems.substring(s);
        one.trim();
        if (one.length() > 0) v2_sems[v2_semCount++] = one;
        if (bar < 0) break;
        s = bar + 1;
      }
      return;
    }

    if (comma < 0) break;
    start = comma + 1;
  }
}

void buildMatieresForSelection(const String& affectField, const String& dep, int level, const String& sem) {
  v2_matCount = 0;
  int start = 0;
  while (start < affectField.length() && v2_matCount < 24) {
    int bar = affectField.indexOf('|', start);
    String item = (bar >= 0) ? affectField.substring(start, bar) : affectField.substring(start);
    item.trim();

    int p1 = item.indexOf(':');
    int p2 = item.indexOf(':', p1 + 1);
    int p3 = item.indexOf(':', p2 + 1);
    if (p1 > 0 && p2 > p1 && p3 > p2) {
      String d = item.substring(0, p1);
      int lvl = item.substring(p1 + 1, p2).toInt();
      String s = item.substring(p2 + 1, p3);
      String mat = normalizeSubjectLabel(item.substring(p3 + 1));
      d.trim();
      s.trim();
      mat.trim();
      if (d == dep && lvl == level && s == sem) {
        bool exists = false;
        for (int i = 0; i < v2_matCount; i++) {
          if (v2_mats[i] == mat) exists = true;
        }
        if (!exists && mat.length() > 0) v2_mats[v2_matCount++] = mat;
      }
    }

    if (bar < 0) break;
    start = bar + 1;
  }
}

String buildSingleDeptField(const String& dep, int level, const String& sem) {
  return dep + "(" + String(level) + "(" + sem + "))";
}

String buildAffectFieldFromSelection(const String& selected, const String& dep, int level, const String& sem) {
  String affect = "";
  int start = 0;
  while (start < selected.length()) {
    int comma = selected.indexOf(',', start);
    String mat = (comma >= 0) ? selected.substring(start, comma) : selected.substring(start);
    mat.trim();
    if (mat.length() > 0) {
      if (affect.length() > 0) affect += "|";
      affect += dep + ":" + String(level) + ":" + sem + ":" + mat;
    }
    if (comma < 0) break;
    start = comma + 1;
  }
  return affect;
}

String mergeAffectField(const String& affectField, const String& dep, int level, const String& sem, const String& selected) {
  String merged = affectField;
  int start = 0;

  while (start < selected.length()) {
    int comma = selected.indexOf(',', start);
    String mat = (comma >= 0) ? selected.substring(start, comma) : selected.substring(start);
    mat = normalizeSubjectLabel(mat);
    mat.trim();

    if (mat.length() > 0) {
      String entry = dep + ":" + String(level) + ":" + sem + ":" + mat;
      bool exists = false;

      int affectStart = 0;
      while (affectStart < affectField.length()) {
        int bar = affectField.indexOf('|', affectStart);
        String item = (bar >= 0) ? affectField.substring(affectStart, bar) : affectField.substring(affectStart);
        item.trim();
        if (item == entry) {
          exists = true;
          break;
        }
        if (bar < 0) break;
        affectStart = bar + 1;
      }

      if (!exists) {
        if (merged.length() > 0) merged += "|";
        merged += entry;
      }
    }

    if (comma < 0) break;
    start = comma + 1;
  }

  return merged;
}

String normalizeAffectField(const String& affectField) {
  String normalized = "";
  int start = 0;

  while (start < affectField.length()) {
    int bar = affectField.indexOf('|', start);
    String item = (bar >= 0) ? affectField.substring(start, bar) : affectField.substring(start);
    item.trim();

    int p1 = item.indexOf(':');
    int p2 = item.indexOf(':', p1 + 1);
    int p3 = item.indexOf(':', p2 + 1);
    if (p1 > 0 && p2 > p1 && p3 > p2) {
      String dep = item.substring(0, p1);
      int level = extractLevelNumber(item.substring(p1 + 1, p2));
      String sem = item.substring(p2 + 1, p3);
      String mat = normalizeSubjectLabel(item.substring(p3 + 1));
      dep.trim();
      sem.trim();
      mat.trim();

      if (dep.length() > 0 && level > 0 && sem.length() > 0 && mat.length() > 0) {
        String entry = dep + ":" + String(level) + ":" + sem + ":" + mat;
        bool exists = false;

        int existingStart = 0;
        while (existingStart < normalized.length()) {
          int existingBar = normalized.indexOf('|', existingStart);
          String existingItem = (existingBar >= 0) ? normalized.substring(existingStart, existingBar)
                                                   : normalized.substring(existingStart);
          existingItem.trim();
          if (existingItem == entry) {
            exists = true;
            break;
          }
          if (existingBar < 0) break;
          existingStart = existingBar + 1;
        }

        if (!exists) {
          if (normalized.length() > 0) normalized += "|";
          normalized += entry;
        }
      }
    }

    if (bar < 0) break;
    start = bar + 1;
  }

  return normalized;
}

String buildDeptFieldFromAffectField(const String& affectField) {
  String deps[20];
  int levels[20];
  String sems[20];
  int tripleCount = 0;

  int start = 0;
  while (start < affectField.length() && tripleCount < 20) {
    int bar = affectField.indexOf('|', start);
    String item = (bar >= 0) ? affectField.substring(start, bar) : affectField.substring(start);
    item.trim();

    int p1 = item.indexOf(':');
    int p2 = item.indexOf(':', p1 + 1);
    int p3 = item.indexOf(':', p2 + 1);
    if (p1 > 0 && p2 > p1 && p3 > p2) {
      String dep = item.substring(0, p1);
      int level = item.substring(p1 + 1, p2).toInt();
      String sem = item.substring(p2 + 1, p3);
      dep.trim();
      sem.trim();

      bool exists = false;
      for (int i = 0; i < tripleCount; i++) {
        if (deps[i] == dep && levels[i] == level && sems[i] == sem) {
          exists = true;
          break;
        }
      }

      if (!exists && dep.length() > 0 && level > 0 && sem.length() > 0) {
        deps[tripleCount] = dep;
        levels[tripleCount] = level;
        sems[tripleCount] = sem;
        tripleCount++;
      }
    }

    if (bar < 0) break;
    start = bar + 1;
  }

  String deptField = "";
  String seenDept[10];
  int seenDeptCount = 0;

  for (int i = 0; i < tripleCount; i++) {
    String dep = deps[i];
    bool deptAlreadyDone = false;
    for (int d = 0; d < seenDeptCount; d++) {
      if (seenDept[d] == dep) {
        deptAlreadyDone = true;
        break;
      }
    }
    if (deptAlreadyDone) continue;

    seenDept[seenDeptCount++] = dep;
    if (deptField.length() > 0) deptField += "|";
    deptField += dep + "(";

    int seenLevels[10];
    int seenLevelCount = 0;
    bool firstLevel = true;

    for (int j = 0; j < tripleCount; j++) {
      if (deps[j] != dep) continue;

      int level = levels[j];
      bool levelAlreadyDone = false;
      for (int l = 0; l < seenLevelCount; l++) {
        if (seenLevels[l] == level) {
          levelAlreadyDone = true;
          break;
        }
      }
      if (levelAlreadyDone) continue;

      seenLevels[seenLevelCount++] = level;
      if (!firstLevel) deptField += ",";
      firstLevel = false;
      deptField += String(level) + "(";

      bool firstSem = true;
      for (int k = 0; k < tripleCount; k++) {
        if (deps[k] == dep && levels[k] == level) {
          bool semAlreadyDone = false;
          for (int m = 0; m < k; m++) {
            if (deps[m] == dep && levels[m] == level && sems[m] == sems[k]) {
              semAlreadyDone = true;
              break;
            }
          }
          if (semAlreadyDone) continue;

          if (!firstSem) deptField += "|";
          firstSem = false;
          deptField += sems[k];
        }
      }

      deptField += ")";
    }

    deptField += ")";
  }

  return deptField;
}

String buildMergedStructuredTeacherData(const String& existingData, const String& dep, int level, const String& sem, const String& selected) {
  String existingAffect = teacherDataIsStructured(existingData) ? getTeacherStructuredAffectField(existingData) : "";
  String mergedAffect = mergeAffectField(existingAffect, dep, level, sem, selected);
  String mergedDept = buildDeptFieldFromAffectField(mergedAffect);
  return mergedDept + ";" + mergedAffect;
}

String normalizeStructuredTeacherConfigLine(const String& line) {
  String matricule = getFieldSemicolon(line, 0);
  String name = getFieldSemicolon(line, 1);
  String affect = getFieldSemicolon(line, 3);

  matricule.trim();
  name.trim();
  affect.trim();

  String normalizedAffect = normalizeAffectField(affect);
  if (normalizedAffect.length() == 0) return line;

  String dept = buildDeptFieldFromAffectField(normalizedAffect);
  return matricule + ";" + name + ";" + dept + ";" + normalizedAffect;
}

bool downloadAndSaveConfig() {
  if (!wifiEnsureConnected(20000)) return false;

  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();
  http.setTimeout(15000);

  if (!http.begin(client, CONFIG_URL)) return false;

  int code = http.GET();
  if (code < 200 || code >= 300) {
    http.end();
    return false;
  }

  String body = http.getString();
  http.end();

  File f = SPIFFS.open(FILE_CONFIG, "w");
  if (!f) return false;
  f.print(body);
  f.close();

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  return true;
}

String findProfLineInConfig(const String& fullMatricule) {
  if (!SPIFFS.exists(FILE_CONFIG)) return "";
  File f = SPIFFS.open(FILE_CONFIG, "r");
  if (!f) return "";

  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0 || line.startsWith("#")) continue;
    if (getFieldSemicolon(line, 0) == fullMatricule) {
      f.close();
      return normalizeStructuredTeacherConfigLine(line);
    }
  }

  f.close();
  return "";
}

bool appendProfV2(int fingerId, const String& configLine) {
  File f = SPIFFS.open(FILE_PROFS_V2, "a");
  if (!f) return false;
  f.print(fingerId);
  f.print(";");
  f.println(normalizeStructuredTeacherConfigLine(configLine));
  f.close();
  return true;
}

String findProfV2LineByFingerId(int fingerId) {
  if (!SPIFFS.exists(FILE_PROFS_V2)) return "";
  File f = SPIFFS.open(FILE_PROFS_V2, "r");
  if (!f) return "";

  String prefix = String(fingerId) + ";";
  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.startsWith(prefix)) {
      f.close();
      int firstSep = line.indexOf(';');
      if (firstSep < 0 || firstSep + 1 >= line.length()) return line;
      String fingerIdPart = line.substring(0, firstSep);
      String configLine = line.substring(firstSep + 1);
      return fingerIdPart + ";" + normalizeStructuredTeacherConfigLine(configLine);
    }
  }

  f.close();
  return "";
}

bool isFingerIdInProfV2(int fingerId) {
  return findProfV2LineByFingerId(fingerId).length() > 0;
}

// === WIFI HELPERS ===
void wifiStartBackgroundConnection() {
  if (WiFi.status() == WL_CONNECTED) return;

  unsigned long now = millis();
  if ((now - lastWifiConnectKickMs) < WIFI_RECONNECT_KICK_INTERVAL_MS) return;
  lastWifiConnectKickMs = now;

  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("WiFi connexion demandee a ");
  Serial.println(WIFI_SSID);
}

void wifiLogStatus(const char* context) {
  Serial.print("[WiFi] ");
  Serial.print(context);
  Serial.print(" status=");
  Serial.print((int)WiFi.status());
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" ip=");
    Serial.print(WiFi.localIP());
  }
  Serial.println();
}

bool wifiEnsureConnected(unsigned long timeoutMs) {
  if (WiFi.status() == WL_CONNECTED) return true;

  wifiStartBackgroundConnection();

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(100);
  }
  wifiLogStatus("wifiEnsureConnected");
  return (WiFi.status() == WL_CONNECTED);
}

String extractJsonString(const String& json, const String& key) {
  String needle = "\"" + key + "\"";
  int keyPos = json.indexOf(needle);
  if (keyPos < 0) return "";

  int colonPos = json.indexOf(':', keyPos + needle.length());
  if (colonPos < 0) return "";

  int valueStart = json.indexOf('"', colonPos + 1);
  if (valueStart < 0) return "";

  int valueEnd = json.indexOf('"', valueStart + 1);
  if (valueEnd < 0) return "";

  return json.substring(valueStart + 1, valueEnd);
}

long extractJsonLong(const String& json, const String& key, long fallbackValue) {
  String needle = "\"" + key + "\"";
  int keyPos = json.indexOf(needle);
  if (keyPos < 0) return fallbackValue;

  int colonPos = json.indexOf(':', keyPos + needle.length());
  if (colonPos < 0) return fallbackValue;

  int start = colonPos + 1;
  while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '\n' || json.charAt(start) == '\r')) {
    start++;
  }

  int end = start;
  while (end < json.length() && isDigit(json.charAt(end))) {
    end++;
  }

  if (end <= start) return fallbackValue;
  return json.substring(start, end).toInt();
}

void startRemoteVerificationSession(const String& teacherMatricule, const String& teacherName, const String& subjectName, const String& semester) {
  currentTeacherMatricule = teacherMatricule;
  currentTeacherName = teacherName.length() > 0 ? teacherName : teacherMatricule;
  currentMatiere = normalizeSubjectLabel(subjectName);
  currentSemestre = semester;
  currentProfV2Line = "";
  currentDeptField = "";
  currentAffectField = "";
  resetV2Selections();

  verificationActive = true;
  currentMode = MODE_VERIFICATION_IN_PROGRESS;

  displayCenteredMessage("APPEL WEB ACTIF", currentMatiere + " " + currentSemestre, ILI9341_GREEN);
  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(50, 120);
  tft.print("Enseignant: " + currentTeacherMatricule);

  beginVerificationSession();

  delay(2500);
  displayCurrentMode();
  displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
}

void pollRemoteAttendanceLaunch() {
  if (currentMode != MODE_VERIFICATION || verificationActive) return;

  unsigned long now = millis();
  if ((now - lastRemoteLaunchPollMs) < REMOTE_LAUNCH_POLL_INTERVAL_MS) return;
  if ((now - lastLocalActivityMs) < REMOTE_LAUNCH_IDLE_BEFORE_POLL_MS) return;
  lastRemoteLaunchPollMs = now;

  wifiStartBackgroundConnection();

  if (WiFi.status() != WL_CONNECTED) {
    if ((now - lastWifiStatusLogMs) > 5000) {
      lastWifiStatusLogMs = now;
      Serial.println("Polling appel distant: WiFi non connecte");
    }
    return;
  }

  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();
  http.setTimeout(REMOTE_LAUNCH_HTTP_TIMEOUT_MS);

  if (!http.begin(client, REMOTE_LAUNCH_URL)) {
    Serial.println("Polling appel distant KO: http.begin");
    return;
  }

  int code = http.GET();
  String body = code > 0 ? http.getString() : "";
  http.end();

  if (code == 204 || code == 404) return;

  if (code < 200 || code >= 300) {
    Serial.print("Polling appel distant KO, code=");
    Serial.println(code);
    if (body.length() > 0) {
      Serial.println(body);
    }
    return;
  }

  long launchId = extractJsonLong(body, "launchId", -1);
  String teacherMatricule = extractJsonString(body, "teacherMatricule");
  String teacherName = extractJsonString(body, "teacherName");
  String subjectName = extractJsonString(body, "subjectName");
  String semester = extractJsonString(body, "semester");

  if (launchId <= 0 || teacherMatricule.length() == 0 || subjectName.length() == 0 || semester.length() == 0) {
    Serial.println("Polling appel distant: payload incomplet");
    Serial.println(body);
    return;
  }

  Serial.println("===== APPEL DISTANT RECU =====");
  Serial.print("launchId=");
  Serial.println(launchId);
  Serial.print("teacher=");
  Serial.println(teacherMatricule);
  Serial.print("subject=");
  Serial.println(subjectName);
  Serial.print("semester=");
  Serial.println(semester);
  Serial.println("==============================");

  startRemoteVerificationSession(teacherMatricule, teacherName, subjectName, semester);
}

bool clearPresenceFile() {
  if (SPIFFS.exists(FILE_PRESENCE)) {
    if (!SPIFFS.remove(FILE_PRESENCE)) return false;
  }
  File f = SPIFFS.open(FILE_PRESENCE, "w");
  if (!f) return false;
  f.close();
  return true;
}

bool sendPresenceFileOverWifi() {
  if (!SPIFFS.exists(FILE_PRESENCE)) return false;

  if (sessionPresentList == "|") {
    Serial.println("Aucune presence eleve a envoyer");
    displayCenteredMessage("Aucune presence", "Session vide", ILI9341_ORANGE);
    return true;
  }

  File file = SPIFFS.open(FILE_PRESENCE, "r");
  if (!file) return false;

  String payload = file.readString();
  file.close();

  payload.trim();
  if (payload.length() == 0) return false;

  unsigned long retryStartMs = millis();
  int attempt = 0;
  int lastCode = -999;
  String lastResponseBody = "";
  bool ok = false;

  Serial.println("===== TXT ENVOYE =====");
  Serial.println(payload);
  Serial.println("======================");

  while ((millis() - retryStartMs) < PRESENCE_UPLOAD_RETRY_WINDOW_MS) {
    attempt++;

    displayCenteredMessage("Transfert en cours", "Tentative " + String(attempt), ILI9341_CYAN);

    if (!wifiEnsureConnected(20000)) {
      lastCode = -1;
      lastResponseBody = "WiFi non connecte";
      Serial.println("Tentative envoi KO: WiFi non connecte");
    } else {
      HTTPClient http;
      WiFiClientSecure client;
      client.setInsecure();

      http.setTimeout(15000);
      if (!http.begin(client, BACKEND_URL)) {
        lastCode = -2;
        lastResponseBody = "HTTP begin error";
        Serial.println("Tentative envoi KO: HTTP begin error");
      } else {
        http.addHeader("Content-Type", "text/plain");
        lastCode = http.POST(payload);
        lastResponseBody = http.getString();
        http.end();

        Serial.print("Tentative ");
        Serial.print(attempt);
        Serial.print(" HTTP CODE: ");
        Serial.println(lastCode);
        Serial.print("Tentative ");
        Serial.print(attempt);
        Serial.print(" HTTP BODY: ");
        Serial.println(lastResponseBody);

        ok = (lastCode >= 200 && lastCode < 300);
        if (ok) break;
      }
    }

    displayCenteredMessage("Transfert echoue", "Nouvel essai...", ILI9341_ORANGE);
    delay(PRESENCE_UPLOAD_RETRY_DELAY_MS);
  }

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);

  if (ok) {
    displayCenteredMessage("Transfert OK", "Fichier envoye", ILI9341_GREEN);
  } else {
    Serial.print("ECHEC FINAL HTTP CODE: ");
    Serial.println(lastCode);
    Serial.print("ECHEC FINAL HTTP BODY: ");
    Serial.println(lastResponseBody);
    displayCenteredMessage("Transfert echoue", "Code: " + String(lastCode), ILI9341_RED);
  }

  return ok;
}

// === PRESENCE (nouveau format + anti-doublon) ===
void beginVerificationSession() {
  // Reset anti-doublon
  sessionPresentList = "|";

  // Nouvelle session: on repart d'un fichier propre.
  File file = SPIFFS.open(FILE_PRESENCE, "w");
  if (file) {
    // Ligne header: timestamp,matricule_prof,matiere,semestre
    file.print(millis());
    file.print(",");
    file.print(currentTeacherMatricule);
    file.print(",");
    file.print(normalizeSubjectLabel(currentMatiere));
    file.print(",");
    file.println(currentSemestre);
    file.close();
    sessionHeaderWritten = true;
  } else {
    sessionHeaderWritten = false;
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

  // Tentative d'envoi (reussite ou echec)
  sendPresenceFileOverWifi();

  // REGLE DEMANDEE : on supprime TOUJOURS le fichier presence.txt, meme en cas d'echec
  if (!clearPresenceFile()) {
    Serial.println("Erreur: impossible de vider presence.txt");
    displayCenteredMessage("Attention", "Echec nettoyage fichier", ILI9341_YELLOW);
    delay(1200);
  }

  verificationActive = false;
  sessionHeaderWritten = false;
  sessionPresentList = "|";
  currentTeacherMatricule = "";
  currentTeacherName = "";
  currentProfV2Line = "";
  currentDeptField = "";
  currentAffectField = "";
  currentMatiere = "";
  currentSemestre = "";
  resetV2Selections();
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
  tft.setCursor(18, 15);
  tft.print("CHOIX ENREGISTREMENT");
  
  tft.fillRect(30, 60, 260, 42, ILI9341_BLUE);
  tft.drawRect(30, 60, 260, 42, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(105, 73);
  tft.print("ELEVE");
  
  tft.fillRect(30, 112, 260, 42, ILI9341_GREEN);
  tft.drawRect(30, 112, 260, 42, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(112, 125);
  tft.print("PROF");

  tft.fillRect(30, 164, 260, 42, ILI9341_ORANGE);
  tft.drawRect(30, 164, 260, 42, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setCursor(55, 177);
  tft.print("AJOUTER MATIERE");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(18, 220);
  tft.print("Ajouter une ou plusieurs matieres a un enseignant local");
}

void displayAddMatiereConfirm() {
  tft.fillScreen(ILI9341_BLACK);
  displayCurrentMode();

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_GREEN);
  tft.setCursor(25, 55);
  tft.print("MATIERE AJOUTEE");

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(20, 90);
  tft.print("Ajouter une autre");
  tft.setCursor(95, 115);
  tft.print("matiere ?");

  tft.fillRect(35, 165, 110, 42, ILI9341_GREEN);
  tft.drawRect(35, 165, 110, 42, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setCursor(72, 178);
  tft.print("OUI");

  tft.fillRect(175, 165, 110, 42, ILI9341_RED);
  tft.drawRect(175, 165, 110, 42, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(185, 178);
  tft.print("ANNULER");
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

void displayProfEnrollTypeMenu() {
  tft.fillScreen(ILI9341_BLACK);
  displayCurrentMode();

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(35, 40);
  tft.print("ENREGISTREMENT PROF");

  tft.fillRoundRect(40, 80, 240, 45, 8, ILI9341_BLUE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(65, 95);
  tft.print("TYPE 1 (LOCAL)");

  tft.fillRoundRect(40, 140, 240, 45, 8, ILI9341_BLUE);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(65, 155);
  tft.print("TYPE 2 (CONFIG)");

  tft.fillRoundRect(40, 200, 240, 30, 8, ILI9341_DARKGREY);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 208);
  tft.print("RETOUR");
}

void displayVerificationSetupV2_Title(const String& stepTitle) {
  tft.fillScreen(ILI9341_BLACK);
  displayCurrentMode();

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_GREEN);
  tft.setCursor(10, 35);
  tft.print("ENSEIGNANT:");

  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(10, 58);
  String shown = currentTeacherName.length() > 0 ? currentTeacherName : currentTeacherMatricule;
  if (shown.length() > 20) shown = shown.substring(0, 20);
  tft.print(shown);

  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 85);
  tft.print(stepTitle);

  tft.fillRect(100, 210, 120, 25, ILI9341_RED);
  tft.drawRect(100, 210, 120, 25, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(130, 216);
  tft.print("RETOUR");
}

void displayVerificationV2_Departements() {
  displayVerificationSetupV2_Title("Choisir Departement");
  int y_start = 110;
  tft.setTextSize(2);
  for (int i = 0; i < v2_deptCount; i++) {
    int y = y_start + i * 30;
    tft.fillRect(10, y, 300, 25, ILI9341_BLUE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setCursor(20, y + 4);
    tft.print(v2_depts[i]);
  }
}

void displayVerificationV2_Levels() {
  displayVerificationSetupV2_Title("Choisir Niveau");
  int y_start = 110;
  tft.setTextSize(2);
  for (int i = 0; i < v2_levelCount; i++) {
    int y = y_start + i * 30;
    tft.fillRect(10, y, 300, 25, ILI9341_BLUE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setCursor(20, y + 4);
    tft.print("Niveau ");
    tft.print(v2_levels[i]);
  }
}

void displayVerificationV2_Semestres() {
  displayVerificationSetupV2_Title("Choisir Semestre");
  int y_start = 110;
  tft.setTextSize(2);
  for (int i = 0; i < v2_semCount; i++) {
    int y = y_start + i * 30;
    tft.fillRect(10, y, 300, 25, ILI9341_BLUE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setCursor(20, y + 4);
    tft.print(v2_sems[i]);
  }
}

void displayVerificationV2_Matieres() {
  displayVerificationSetupV2_Title("Choisir Matiere");
  int y_start = 110;
  tft.setTextSize(2);
  for (int i = 0; i < v2_matCount; i++) {
    int y = y_start + i * 30;
    tft.fillRect(10, y, 300, 25, ILI9341_BLUE);
    tft.setTextColor(ILI9341_WHITE);
    tft.setCursor(15, y + 4);
    String m = v2_mats[i];
    if (m.length() > 22) m = m.substring(0, 22);
    tft.print(m);
  }
}


void displaySemestreChoice() {
  tft.fillScreen(ILI9341_BLACK);

  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(55, 10);
  tft.print("CHOIX SEMESTRE");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 38);
  tft.print("Enseignant: ");
  tft.print(currentTeacherMatricule);
  tft.setCursor(10, 52);
  tft.print("Matiere: ");
  tft.print(currentMatiere);

  // Bouton S1
  tft.fillRoundRect(30, 80, 260, 55, 10, ILI9341_BLUE);
  tft.drawRoundRect(30, 80, 260, 55, 10, ILI9341_WHITE);
  tft.setTextSize(3);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 95);
  tft.print("S1");

  // Bouton S2
  tft.fillRoundRect(30, 150, 260, 55, 10, ILI9341_DARKGREY);
  tft.drawRoundRect(30, 150, 260, 55, 10, ILI9341_WHITE);
  tft.setTextSize(3);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(120, 165);
  tft.print("S2");

  // Bouton ANNULER
  tft.fillRoundRect(80, 218, 160, 28, 6, ILI9341_RED);
  tft.drawRoundRect(80, 218, 160, 28, 6, ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(112, 225);
  tft.print("ANNULER");
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
  } else if (currentMode == MODE_ENROLL || currentMode == MODE_ENROLL_CHOICE || currentMode == MODE_ADD_MATIERE_SCAN || currentMode == MODE_ADD_MATIERE_CONFIRM || currentMode == MODE_PASSWORD || currentMode == MODE_PROF_ENROLL_TYPE) {
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
      lastLocalActivityMs = currentTime;
      
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
        wifiStartBackgroundConnection();
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
      teacherEnrollType = 1;
      teacherType1EnrollSelection = false;
      resetAddTeacherMatiereState();
      pendingTeacherMatricule = "";
      currentTeacherName = "";
      currentProfV2Line = "";
      currentDeptField = "";
      currentAffectField = "";
      resetV2Selections();
    }
  }
}

// === SETUP ===
void setup() {
  Serial.begin(115200);
  delay(1000);
  lastLocalActivityMs = millis();
  
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
  setAvailableMatieresFromCatalogAll();
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

  wifiStartBackgroundConnection();
  delay(500);
  wifiLogStatus("setup");
  
  displayCenteredMessage("SYSTEME DE POINTAGE", "Pret", ILI9341_GREEN);
  delay(2000);
  displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
}

// === LOOP PRINCIPAL ===
void loop() {
  checkButton();

  if (currentMode == MODE_VERIFICATION && !verificationActive) {
    wifiStartBackgroundConnection();
  }
  
  bool isTouched = touch.touched();
  TS_Point p;
  int x = 0, y = 0;

  // Lire le point pendant l'appui (plus fiable), puis utiliser la derniere position au relachement
  if (isTouched) {
    lastLocalActivityMs = millis();
    p = touch.getPoint();
    lastTouchRawX = p.x;
    lastTouchRawY = p.y;
  }

  if (wasTouched && !isTouched) {
    lastLocalActivityMs = millis();
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
      if (x >= 30 && x <= 290 && y >= 60 && y <= 102) {
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
      else if (x >= 30 && x <= 290 && y >= 112 && y <= 154) {
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
      else if (x >= 30 && x <= 290 && y >= 164 && y <= 206) {
        resetAddTeacherMatiereState();
        currentMode = MODE_ADD_MATIERE_SCAN;
        Serial.println("Choix: AJOUTER MATIERE");
        displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  if (currentMode == MODE_ADD_MATIERE_CONFIRM) {
    if (wasTouched && !isTouched) {
      if (x >= 35 && x <= 145 && y >= 165 && y <= 207) {
        currentMode = MODE_ADD_MATIERE_SCAN;
        displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
      } else if (x >= 175 && x <= 285 && y >= 165 && y <= 207) {
        resetAddTeacherMatiereState();
        currentMode = MODE_ENROLL_CHOICE;
        displayEnrollChoice();
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

  // === MODE CHOIX TYPE ENREGISTREMENT PROF ===
  if (currentMode == MODE_PROF_ENROLL_TYPE) {
    if (wasTouched && !isTouched) {
      if (x >= 40 && x <= 280 && y >= 80 && y <= 125) {
        teacherEnrollType = 1;
        currentMode = MODE_ENROLL;
        displayCurrentMode();
        displayCenteredMessage("TYPE 1", "Selection locale", ILI9341_GREEN);
        delay(1200);
        displayCurrentMode();
        displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
      }
      else if (x >= 40 && x <= 280 && y >= 140 && y <= 185) {
        teacherEnrollType = 2;
        displayCenteredMessage("Connexion Internet", "Recup config...", ILI9341_CYAN);
        bool ok = downloadAndSaveConfig();
        if (!ok) {
          displayCenteredMessage("ERREUR", "Config indisponible", ILI9341_RED);
          delay(2000);
          displayProfEnrollTypeMenu();
        } else {
          displayCenteredMessage("CONFIG OK", "Pret a enregistrer", ILI9341_GREEN);
          delay(1200);
          currentMode = MODE_ENROLL;
          displayCurrentMode();
          displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
        }
      }
      else if (x >= 40 && x <= 280 && y >= 200 && y <= 230) {
        currentMode = MODE_ENROLL_CHOICE;
        displayEnrollChoice();
      }
    }
    wasTouched = isTouched;
    delay(10);
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
                delay(1500);
                currentMode = MODE_VERIFICATION;
                displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
                delay(2000);
                displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
              } else {
                tempPassword = "";
                displayCenteredMessage("PASSWORD OK!", "Acces autorise", ILI9341_GREEN);
                delay(1200);

                if (isTeacherMode) {
                  teacherEnrollType = 1;
                  currentMode = MODE_PROF_ENROLL_TYPE;
                  displayProfEnrollTypeMenu();
                } else {
                  currentMode = MODE_ENROLL;
                  displayCurrentMode();
                  displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
                }
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
          if (teacherType1EnrollSelection) {
            String payload = "";
            bool success = false;

            if (addTeacherMatiereMode) {
              String existingData = getMatieresForTeacher(addTeacherMatiereFingerId);
              payload = buildMergedStructuredTeacherData(existingData, v2_selectedDept, v2_selectedLevel, v2_selectedSem, selectedMatieres);
              success = updateMatricule(addTeacherMatiereFingerId, addTeacherMatiereMatricule, true, payload);
            } else {
              String deptField = buildSingleDeptField(v2_selectedDept, v2_selectedLevel, v2_selectedSem);
              String affectField = buildAffectFieldFromSelection(selectedMatieres, v2_selectedDept, v2_selectedLevel, v2_selectedSem);
              payload = deptField + ";" + affectField;
              success = saveMatricule(enrollID, pendingTeacherMatricule, true, payload);
            }

            if (success) {
              waitingForMatricule = false;
              enrollMode = false;
              teacherType1EnrollSelection = false;
              pendingTeacherMatricule = "";
              tempMatricule = "";
              selectedMatieres = "";
              currentDeptField = "";
              currentAffectField = "";
              resetV2Selections();
              matierePage = 0;

              listMatricules();

              if (addTeacherMatiereMode) {
                displayCenteredMessage("MATIERE AJOUTEE!", addTeacherMatiereMatricule, ILI9341_GREEN);
                delay(1800);
                currentMode = MODE_ADD_MATIERE_CONFIRM;
                displayAddMatiereConfirm();
              } else {
                displayCenteredMessage("PROF ENREGISTRE!", pendingTeacherMatricule, ILI9341_GREEN);
                delay(2500);
                currentMode = MODE_ENROLL;
                displayCurrentMode();
                displayCenteredMessage("Enseignant enregistre!", "Nouvelle empreinte?", ILI9341_GREEN);
                delay(2000);
                displayCurrentMode();
                displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
              }
            } else {
              displayCenteredMessage("Erreur sauvegarde", "", ILI9341_RED);
              delay(2000);
              displayMatieresSelection(selectedMatieres);
            }
          } else if (isEditingMatieres) {
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
  
  // === MODE CHOIX SEMESTRE ===
  if (currentMode == MODE_VERIFICATION_SEMESTRE) {
    if (wasTouched && !isTouched) {
      // S1
      if (x >= 30 && x <= 290 && y >= 80 && y <= 135) {
        currentSemestre = "S1";
        verificationActive = true;
        currentMode = MODE_VERIFICATION_IN_PROGRESS;

        displayCenteredMessage("VERIFICATION ACTIVE", currentMatiere + " " + currentSemestre, ILI9341_GREEN);
        tft.setTextSize(1);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(50, 130);
        tft.print("Enseignant: " + currentTeacherMatricule);

        beginVerificationSession();

        delay(2500);
        displayCurrentMode();
        displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
      }
      // S2
      else if (x >= 30 && x <= 290 && y >= 150 && y <= 205) {
        currentSemestre = "S2";
        verificationActive = true;
        currentMode = MODE_VERIFICATION_IN_PROGRESS;

        displayCenteredMessage("VERIFICATION ACTIVE", currentMatiere + " " + currentSemestre, ILI9341_GREEN);
        tft.setTextSize(1);
        tft.setTextColor(ILI9341_YELLOW);
        tft.setCursor(50, 130);
        tft.print("Enseignant: " + currentTeacherMatricule);

        beginVerificationSession();

        delay(2500);
        displayCurrentMode();
        displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
      }
      // ANNULER
      else if (x >= 80 && x <= 240 && y >= 218 && y <= 246) {
        currentMatiere = "";
        currentMode = MODE_VERIFICATION_SETUP;
        displayVerificationSetup();
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
          currentMode = MODE_VERIFICATION_SEMESTRE;

          displaySemestreChoice();
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

  // === MODE VERIFICATION STRUCTUREE / DEPARTEMENT ===
  if (currentMode == MODE_VERIFICATION_SETUP_V2) {
    if (wasTouched && !isTouched) {
      if (x >= 100 && x <= 220 && y >= 210 && y <= 235) {
        resetV2Selections();
        currentDeptField = "";
        currentAffectField = "";
        currentProfV2Line = "";
        currentTeacherName = "";
        if (addTeacherMatiereMode) {
          teacherType1EnrollSelection = false;
          pendingTeacherMatricule = "";
          currentTeacherMatricule = "";
          currentMode = MODE_ADD_MATIERE_SCAN;
          displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
        } else if (teacherType1EnrollSelection) {
          teacherType1EnrollSelection = false;
          pendingTeacherMatricule = "";
          currentMode = MODE_ENROLL;
          displayCurrentMode();
          drawInputBox("Matricule Prof:");
          drawKeyboard();
        } else {
          currentTeacherMatricule = "";
          currentMode = MODE_VERIFICATION;
          displayCenteredMessage("Setup annule", "Retour verification", ILI9341_ORANGE);
          delay(1500);
          displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
        }
        wasTouched = isTouched;
        delay(10);
        return;
      }

      int y_start = 110;
      for (int i = 0; i < v2_deptCount; i++) {
        int y_pos = y_start + i * 30;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 25) {
          v2_selectedDept = v2_depts[i];

          if (teacherType1EnrollSelection) {
            v2_levelCount = 0;
            for (int c = 0; c < SUBJECT_CATALOG_COUNT && v2_levelCount < 10; c++) {
              String row = SUBJECT_CATALOG[c];
              if (getCatalogField(row, 0) == v2_selectedDept) {
                int lvl = getCatalogField(row, 1).toInt();
                bool exists = false;
                for (int j = 0; j < v2_levelCount; j++) if (v2_levels[j] == lvl) exists = true;
                if (!exists) v2_levels[v2_levelCount++] = lvl;
              }
            }
          } else {
            buildLevelsForDept(currentDeptField, v2_selectedDept);
          }

          currentMode = MODE_VERIFICATION_V2_LEVEL;
          displayVerificationV2_Levels();
          break;
        }
      }

    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  // === MODE VERIFICATION STRUCTUREE / NIVEAU ===
  if (currentMode == MODE_VERIFICATION_V2_LEVEL) {
    if (wasTouched && !isTouched) {
      if (x >= 100 && x <= 220 && y >= 210 && y <= 235) {
        currentMode = MODE_VERIFICATION_SETUP_V2;
        displayVerificationV2_Departements();
        wasTouched = isTouched;
        delay(10);
        return;
      }

      int y_start = 110;
      for (int i = 0; i < v2_levelCount; i++) {
        int y_pos = y_start + i * 30;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 25) {
          v2_selectedLevel = v2_levels[i];

          if (teacherType1EnrollSelection) {
            v2_semCount = 0;
            for (int c = 0; c < SUBJECT_CATALOG_COUNT && v2_semCount < 3; c++) {
              String row = SUBJECT_CATALOG[c];
              if (getCatalogField(row, 0) == v2_selectedDept &&
                  getCatalogField(row, 1).toInt() == v2_selectedLevel) {
                String sem = getCatalogField(row, 2);
                bool exists = false;
                for (int j = 0; j < v2_semCount; j++) if (v2_sems[j] == sem) exists = true;
                if (!exists) v2_sems[v2_semCount++] = sem;
              }
            }
          } else {
            buildSemsForDeptLevel(currentDeptField, v2_selectedDept, v2_selectedLevel);
          }

          currentMode = MODE_VERIFICATION_V2_SEM;
          displayVerificationV2_Semestres();
          break;
        }
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  // === MODE VERIFICATION STRUCTUREE / SEMESTRE ===
  if (currentMode == MODE_VERIFICATION_V2_SEM) {
    if (wasTouched && !isTouched) {
      if (x >= 100 && x <= 220 && y >= 210 && y <= 235) {
        currentMode = MODE_VERIFICATION_V2_LEVEL;
        displayVerificationV2_Levels();
        wasTouched = isTouched;
        delay(10);
        return;
      }

      int y_start = 110;
      for (int i = 0; i < v2_semCount; i++) {
        int y_pos = y_start + i * 30;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 25) {
          v2_selectedSem = v2_sems[i];

          if (teacherType1EnrollSelection) {
            setAvailableMatieresForSelection(v2_selectedDept, v2_selectedLevel, v2_selectedSem);
            selectedMatieres = "";
            matierePage = 0;
            currentMode = MODE_SELECT_MATIERES;
            displayMatieresSelection(selectedMatieres);
          } else {
            buildMatieresForSelection(currentAffectField, v2_selectedDept, v2_selectedLevel, v2_selectedSem);
            currentMode = MODE_VERIFICATION_V2_MAT;
            displayVerificationV2_Matieres();
          }
          break;
        }
      }
    }
    wasTouched = isTouched;
    delay(10);
    return;
  }

  // === MODE VERIFICATION STRUCTUREE / MATIERE ===
  if (currentMode == MODE_VERIFICATION_V2_MAT) {
    if (wasTouched && !isTouched) {
      if (x >= 100 && x <= 220 && y >= 210 && y <= 235) {
        currentMode = MODE_VERIFICATION_V2_SEM;
        displayVerificationV2_Semestres();
        wasTouched = isTouched;
        delay(10);
        return;
      }

      int y_start = 110;
      for (int i = 0; i < v2_matCount; i++) {
        int y_pos = y_start + i * 30;
        if (x >= 10 && x <= 310 && y >= y_pos && y <= y_pos + 25) {
          v2_selectedMatiere = v2_mats[i];
          currentMatiere = v2_selectedMatiere;
          currentSemestre = v2_selectedSem;
          verificationActive = true;
          currentMode = MODE_VERIFICATION_IN_PROGRESS;

          displayCenteredMessage("VERIFICATION ACTIVE", currentMatiere + " " + currentSemestre, ILI9341_GREEN);
          tft.setTextSize(1);
          tft.setTextColor(ILI9341_YELLOW);
          tft.setCursor(50, 120);
          tft.print("Enseignant: " + currentTeacherMatricule);

          beginVerificationSession();

          delay(2500);
          displayCurrentMode();
          displayCenteredMessage("Verification active", "Placez empreinte eleve", ILI9341_WHITE);
          break;
        }
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
          setAvailableMatieresFromCatalogAll();
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
                if (teacherEnrollType == 2) {
                  String configLine = findProfLineInConfig(fullMatricule);
                  if (configLine.length() == 0) {
                    displayCenteredMessage("INCONNU DANS CONFIG", fullMatricule, ILI9341_RED);
                    delay(2500);
                    tempMatricule = "";
                    displayCurrentMode();
                    drawInputBox("Matricule Prof:");
                    drawKeyboard();
                    wasTouched = isTouched;
                    delay(10);
                    return;
                  }

                  if (!appendProfV2(enrollID, configLine)) {
                    displayCenteredMessage("ERREUR", "Ecriture prof1.txt", ILI9341_RED);
                    delay(2000);
                    tempMatricule = "";
                    displayCurrentMode();
                    drawInputBox("Matricule Prof:");
                    drawKeyboard();
                    wasTouched = isTouched;
                    delay(10);
                    return;
                  }

                  displayCenteredMessage("PROF V2 ENREGISTRE!", fullMatricule, ILI9341_GREEN);
                  delay(3000);
                  waitingForMatricule = false;
                  enrollMode = false;
                  tempMatricule = "";
                  displayCurrentMode();
                  displayCenteredMessage("Prof enregistre!", "Nouvelle empreinte?", ILI9341_GREEN);
                  delay(2500);
                  displayCurrentMode();
                  displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
                } else {
                  pendingTeacherMatricule = fullMatricule;
                  currentTeacherMatricule = fullMatricule;
                  currentTeacherName = fullMatricule;
                  teacherType1EnrollSelection = true;
                  setManualDeptChoices();
                  currentMode = MODE_VERIFICATION_SETUP_V2;
                  displayVerificationV2_Departements();
                }
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

  if (currentMode == MODE_ADD_MATIERE_SCAN) {
    int result = finger.getImage();

    if (result == FINGERPRINT_OK) {
      displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
      delay(500);

      result = finger.image2Tz();
      if (result == FINGERPRINT_OK) {
        result = finger.fingerSearch();

        if (result == FINGERPRINT_OK) {
          String matricule = getMatricule(finger.fingerID);
          if (matricule.length() == 0 || matricule.indexOf('M') <= 0) {
            displayCenteredMessage("Empreinte invalide", "Prof requis", ILI9341_RED);
            delay(2000);
            displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
            return;
          }

          if (isFingerIdInProfV2(finger.fingerID)) {
            displayCenteredMessage("Type 2 non modifie", "Utilisez config distante", ILI9341_ORANGE);
            delay(2200);
            displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
            return;
          }

          String teacherData = getMatieresForTeacher(finger.fingerID);
          if (!teacherDataIsStructured(teacherData)) {
            displayCenteredMessage("Prof local ancien", "Reenregistrer en Type 1", ILI9341_ORANGE);
            delay(2200);
            displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
            return;
          }

          addTeacherMatiereMode = true;
          addTeacherMatiereFingerId = finger.fingerID;
          addTeacherMatiereMatricule = matricule;
          pendingTeacherMatricule = matricule;
          currentTeacherMatricule = matricule;
          currentTeacherName = matricule;
          teacherType1EnrollSelection = true;
          setManualDeptChoices();
          currentMode = MODE_VERIFICATION_SETUP_V2;

          displayCenteredMessage("PROF DETECTE", matricule, ILI9341_GREEN);
          delay(1500);
          displayVerificationV2_Departements();
        } else {
          displayCenteredMessage("Empreinte inconnue", "", ILI9341_RED);
          delay(2000);
          displayCenteredMessage("AJOUT MATIERE", "Placez empreinte prof", ILI9341_CYAN);
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
      lastLocalActivityMs = millis();
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
              if (isFingerIdInProfV2(finger.fingerID)) {
                currentProfV2Line = findProfV2LineByFingerId(finger.fingerID);
                currentTeacherMatricule = getFieldSemicolon(currentProfV2Line, 1);
                currentTeacherName = getFieldSemicolon(currentProfV2Line, 2);
                currentDeptField = getFieldSemicolon(currentProfV2Line, 3);
                currentAffectField = getFieldSemicolon(currentProfV2Line, 4);
                resetV2Selections();
                parseDeptCodes(currentDeptField);
                currentMode = MODE_VERIFICATION_SETUP_V2;

                displayCenteredMessage("ENSEIGNANT V2", currentTeacherMatricule, ILI9341_GREEN);
                delay(1500);
                displayVerificationV2_Departements();
              } else {
                currentTeacherMatricule = matricule;
                currentTeacherName = matricule;
                String teacherData = getMatieresForTeacher(getIdByMatricule(matricule));

                if (teacherDataIsStructured(teacherData)) {
                  currentDeptField = getTeacherStructuredDeptField(teacherData);
                  currentAffectField = getTeacherStructuredAffectField(teacherData);
                  resetV2Selections();
                  parseDeptCodes(currentDeptField);
                  currentMode = MODE_VERIFICATION_SETUP_V2;

                  displayCenteredMessage("ENSEIGNANT DETECTE", matricule, ILI9341_GREEN);
                  delay(1500);
                  displayVerificationV2_Departements();
                } else {
                  currentMode = MODE_VERIFICATION_SETUP;
                  displayCenteredMessage("ENSEIGNANT DETECTE", matricule, ILI9341_GREEN);
                  tft.setTextSize(2);
                  tft.setTextColor(ILI9341_CYAN);
                  tft.setCursor(110, 160);
                  tft.print("ID: ");
                  tft.print(finger.fingerID);
                  delay(2000);
                  displayVerificationSetup();
                }
              }
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

    wasTouched = isTouched;
    pollRemoteAttendanceLaunch();
    return;
  }
  
  // === MODE VERIFICATION EN COURS ===
  if (currentMode == MODE_VERIFICATION_IN_PROGRESS) {
    int result = finger.getImage();
    
    if (result == FINGERPRINT_OK) {
      lastLocalActivityMs = millis();
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
                delay(1500);
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
    wasTouched = isTouched;
    return;
  }

  pollRemoteAttendanceLaunch();
  
  wasTouched = isTouched;
  delay(10);
}
