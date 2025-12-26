#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>
#include <SPIFFS.h>
#include <XPT2046_Touchscreen.h>

// === PINS ===
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  4
#define TOUCH_CS 15
#define TOUCH_IRQ 27
#define FINGER_RX 21
#define FINGER_TX 22
#define BUTTON_PIN 14  // Bouton pour changer de mode

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen touch(TOUCH_CS, TOUCH_IRQ);
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// === MODES ===
enum SystemMode {
  MODE_VERIFICATION,   // Mode vérification (par défaut)
  MODE_ENROLL_CHOICE,  // Choix Élève/Prof (sous-menu)
  MODE_ENROLL          // Enregistrement actif
};

SystemMode currentMode = MODE_VERIFICATION;  // DÉMARRAGE EN VERIFICATION
bool isTeacherMode = false; // false = Élève, true = Prof

// === Variables ===
bool enrollMode = false;
int enrollID = 1;
int enrollStage = 0;
String tempMatricule = "";
bool waitingForMatricule = false;
bool wasTouched = false;

// Bouton
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 500;

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

// === FONCTIONS FICHIER ===
bool saveMatricule(int id, String matricule, bool isTeacher) {
  String filename = isTeacher ? "/prof.txt" : "/matricule.txt";
  
  File file = SPIFFS.open(filename, "a");
  if (!file) {
    Serial.println("Erreur ouverture fichier");
    return false;
  }
  
  file.print(id);
  file.print(",");
  file.println(matricule);
  file.close();
  
  Serial.print("Sauvegarde: ID ");
  Serial.print(id);
  Serial.print(" -> ");
  Serial.print(matricule);
  Serial.println(isTeacher ? " (Prof)" : " (Eleve)");
  
  return true;
}

String getMatricule(int id) {
  // Chercher dans prof.txt
  if (SPIFFS.exists("/prof.txt")) {
    File file = SPIFFS.open("/prof.txt", "r");
    if (file) {
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        int commaIndex = line.indexOf(',');
        if (commaIndex > 0) {
          int fileID = line.substring(0, commaIndex).toInt();
          if (fileID == id) {
            file.close();
            return line.substring(commaIndex + 1);
          }
        }
      }
      file.close();
    }
  }
  
  // Chercher dans matricule.txt
  if (SPIFFS.exists("/matricule.txt")) {
    File file = SPIFFS.open("/matricule.txt", "r");
    if (file) {
      while (file.available()) {
        String line = file.readStringUntil('\n');
        line.trim();
        int commaIndex = line.indexOf(',');
        if (commaIndex > 0) {
          int fileID = line.substring(0, commaIndex).toInt();
          if (fileID == id) {
            file.close();
            return line.substring(commaIndex + 1);
          }
        }
      }
      file.close();
    }
  }
  
  return "";
}

bool matriculeExists(String matricule) {
  String files[] = {"/matricule.txt", "/prof.txt"};
  
  for (int f = 0; f < 2; f++) {
    if (!SPIFFS.exists(files[f])) continue;
    
    File file = SPIFFS.open(files[f], "r");
    if (!file) continue;
    
    while (file.available()) {
      String line = file.readStringUntil('\n');
      line.trim();
      int commaIndex = line.indexOf(',');
      if (commaIndex > 0) {
        String mat = line.substring(commaIndex + 1);
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

void listMatricules() {
  Serial.println("\n=== ELEVES ===");
  if (SPIFFS.exists("/matricule.txt")) {
    File file = SPIFFS.open("/matricule.txt", "r");
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
  if (SPIFFS.exists("/prof.txt")) {
    File file = SPIFFS.open("/prof.txt", "r");
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
  Serial.println("==================\n");
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

void displayEnrollChoice() {
  tft.fillScreen(ILI9341_BLACK);
  
  // Titre
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(30, 20);
  tft.print("CHOIX ENREGISTREMENT");
  
  // Bouton Élève
  tft.fillRect(40, 80, 240, 60, ILI9341_BLUE);
  tft.drawRect(40, 80, 240, 60, ILI9341_WHITE);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(3);
  tft.setCursor(90, 100);
  tft.print("ELEVE");
  
  // Bouton Prof
  tft.fillRect(40, 160, 240, 60, ILI9341_GREEN);
  tft.drawRect(40, 160, 240, 60, ILI9341_WHITE);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(3);
  tft.setCursor(75, 180);
  tft.print("PROF");
}

void displayCurrentMode() {
  tft.fillRect(0, 0, 320, 30, ILI9341_NAVY);
  tft.setTextSize(2);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(10, 8);
  
  if (currentMode == MODE_VERIFICATION) {
    tft.print("MODE: VERIFICATION");
  } else if (currentMode == MODE_ENROLL || currentMode == MODE_ENROLL_CHOICE) {
    tft.print("MODE: ENREGISTREMENT");
  }
  
  // Afficher le type si en enregistrement
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

void drawInputBox() {
  tft.fillRect(0, 30, 320, startY - 30, ILI9341_BLACK);
  tft.drawRect(5, 35, 310, 20, ILI9341_WHITE);
  
  tft.setCursor(15, 38);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(2);
  
  // Format selon le type
  if (isTeacherMode) {
    // Format: **M*** (ex: 24M123)
    if (tempMatricule.length() >= 2) {
      tft.print(tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2));
    } else {
      tft.print(tempMatricule);
    }
  } else {
    // Format: **P*** ou **P**** (ex: 24P123 ou 24P1234)
    if (tempMatricule.length() >= 2) {
      tft.print(tempMatricule.substring(0, 2) + "P" + tempMatricule.substring(2));
    } else {
      tft.print(tempMatricule);
    }
  }
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
  for (int id = 1; id <= finger.capacity; id++) {
    if (finger.loadModel(id) != FINGERPRINT_OK) {
      return id;
    }
  }
  return 1;
}

bool enrollFingerprint() {
  int p = -1;
  
  if (enrollStage == 0) {
    displayThreeLines("Enregistrement", "Placez votre doigt", "", ILI9341_CYAN);
    
    while (p != FINGERPRINT_OK) {
      p = finger.getImage();
      delay(50);
    }
    
    displayCenteredMessage("Image capturee!", "Retirez le doigt", ILI9341_GREEN);
    delay(1000);
    
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
    displayThreeLines("Enregistrement", "Replacez le doigt", "", ILI9341_CYAN);
    
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
        displayCenteredMessage("Matricule Prof", "Format: **M***", ILI9341_CYAN);
      } else {
        displayCenteredMessage("Matricule Eleve", "Format: **P***", ILI9341_CYAN);
      }
      delay(2000);
      
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
      
      // Basculer entre VERIFICATION et ENREGISTREMENT
      if (currentMode == MODE_VERIFICATION) {
        // Passer en mode ENREGISTREMENT (afficher le choix)
        currentMode = MODE_ENROLL_CHOICE;
        Serial.println(">>> PASSAGE EN MODE ENREGISTREMENT");
        displayEnrollChoice();
      } 
      else {
        // Retour en mode VERIFICATION (depuis n'importe quel sous-mode)
        currentMode = MODE_VERIFICATION;
        Serial.println(">>> PASSAGE EN MODE VERIFICATION");
        displayCenteredMessage("MODE VERIFICATION", "Actif", ILI9341_GREEN);
        delay(1500);
        displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
      }
      
      // Réinitialiser les variables
      enrollMode = false;
      enrollStage = 0;
      waitingForMatricule = false;
      tempMatricule = "";
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n=================================");
  Serial.println("  SYSTEME DE POINTAGE");
  Serial.println("=================================\n");
  
  // Init bouton
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.println("1. Bouton configure (GPIO 0)\n");
  
  // Init SPIFFS
  Serial.println("2. Init SPIFFS...");
  if (!SPIFFS.begin(true)) {
    Serial.println("   [ERREUR] SPIFFS KO");
    while(1) delay(1000);
  }
  Serial.println("   [OK]\n");
  
  // Init écran
  Serial.println("3. Init ecran...");
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  Serial.println("   [OK]\n");
  
  // Init touch
  Serial.println("4. Init touch...");
  touch.begin();
  Serial.println("   [OK]\n");
  
  displayCenteredMessage("Initialisation...", "Patientez", ILI9341_CYAN);
  delay(1000);
  
  // Init lecteur avec 5 tentatives
  Serial.println("5. Init lecteur...");
  displayCenteredMessage("Init lecteur...", "", ILI9341_CYAN);
  
  mySerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  delay(2000);
  
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
      delay(1000);
    }
  }
  
  if (lecteurOK) {
    Serial.println("   [OK] Lecteur detecte\n");
    displayCenteredMessage("Lecteur OK!", "", ILI9341_GREEN);
    delay(1500);
    
    finger.getTemplateCount();
    Serial.print("   Capacite: "); Serial.println(finger.capacity);
    Serial.print("   Empreintes: "); Serial.println(finger.templateCount);
  } else {
    Serial.println("   [ERREUR] Lecteur KO\n");
    displayCenteredMessage("ERREUR Lecteur!", "Redemarrage...", ILI9341_RED);
    delay(3000);
    ESP.restart();
  }
  
  listMatricules();
  
  Serial.println("=================================");
  Serial.println("  SYSTEME PRET");
  Serial.println("=================================\n");
  Serial.println("Bouton: Changer de mode");
  Serial.println("Mode actuel: VERIFICATION\n");
  
  // DEMARRAGE EN MODE VERIFICATION
  displayCenteredMessage("MODE VERIFICATION", "Placez empreinte", ILI9341_WHITE);
}

void loop() {
  // Vérifier le bouton en permanence
  checkButton();
  
  // === MODE CHOIX ELEVE/PROF ===
  if (currentMode == MODE_ENROLL_CHOICE) {
    bool isTouched = touch.touched();
    
    if (wasTouched && !isTouched) {
      TS_Point p = touch.getPoint();
      
      int x = map(p.x, 3900, 200, 0, 320);
      int y = map(p.y, 3900, 200, 0, 240);
      
      // Zone Élève
      if (x >= 40 && x <= 280 && y >= 80 && y <= 140) {
        isTeacherMode = false;
        currentMode = MODE_ENROLL;
        Serial.println("Choix: ELEVE");
        
        displayCenteredMessage("Mode Eleve", "Selectione", ILI9341_GREEN);
        delay(1500);
        displayCurrentMode();
        displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
      }
      // Zone Prof
      else if (x >= 40 && x <= 280 && y >= 160 && y <= 220) {
        isTeacherMode = true;
        currentMode = MODE_ENROLL;
        Serial.println("Choix: PROF");
        
        displayCenteredMessage("Mode Prof", "Selectione", ILI9341_GREEN);
        delay(1500);
        displayCurrentMode();
        displayCenteredMessage("Placez empreinte", "a enregistrer", ILI9341_WHITE);
      }
    }
    
    wasTouched = isTouched;
    delay(10);
    return;
  }
  
  // === GESTION SAISIE MATRICULE ===
  if (waitingForMatricule) {
    bool isTouched = touch.touched();
    
    if (wasTouched && !isTouched) {
      TS_Point p = touch.getPoint();
      
      int x = map(p.x, 3900, 200, 0, 320);
      int y = map(p.y, 3900, 200, 0, 240);
      
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
            // Format: **M*** (2 + M + 3)
            fullMatricule = tempMatricule.substring(0, 2) + "M" + tempMatricule.substring(2);
            formatOK = true;
          } else if (!isTeacherMode && (tempMatricule.length() == 5 || tempMatricule.length() == 6)) {
            // Format: **P*** ou **P**** (2 + P + 3 ou 4)
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
              saveMatricule(enrollID, fullMatricule, isTeacherMode);
              
              displayCenteredMessage("Matricule OK!", fullMatricule, ILI9341_GREEN);
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
              
              // Retour au menu de choix
              currentMode = MODE_ENROLL_CHOICE;
              displayEnrollChoice();
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
      if (enrollFingerprint()) {
        enrollMode = false;
      }
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
    } else if (result == FINGERPRINT_NOFINGER) {
      delay(50);
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
            Serial.print("Present: ");
            Serial.print(matricule);
            Serial.print(" (ID ");
            Serial.print(finger.fingerID);
            Serial.println(")");
            
            displayCenteredMessage("Present!", matricule, ILI9341_GREEN);
            
            tft.setTextSize(2);
            tft.setTextColor(ILI9341_CYAN);
            tft.setCursor(110, 160);
            tft.print("ID: ");
            tft.print(finger.fingerID);
          } else {
            Serial.print("Present: ID ");
            Serial.println(finger.fingerID);
            
            displayCenteredMessage("Empreinte lue", "ID non associe", ILI9341_ORANGE);
            
            tft.setTextSize(3);
            tft.setTextColor(ILI9341_CYAN);
            tft.setCursor(100, 160);
            tft.print("ID: ");
            tft.print(finger.fingerID);
          }
          
          delay(2000);
          
        } else {
          Serial.println("Empreinte non reconnue");
          displayCenteredMessage("Non reconnue", "", ILI9341_RED);
          delay(1500);
        }
      } else {
        displayCenteredMessage("Erreur", "Reessayez", ILI9341_RED);
        delay(1500);
      }
      
      displayCenteredMessage("Placez empreinte", "pour verifier", ILI9341_WHITE);
      
      delay(1000);
      
    } else if (result ==FINGERPRINT_NOFINGER) {
      delay(50);
    }
    
    return;
  }
}
