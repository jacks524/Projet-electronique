#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>
#include <SPIFFS.h>
#include <XPT2046_Touchscreen.h>

// === TFT Pins ===
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  4

// === TOUCH Pins ===
#define TOUCH_CS 15
#define TOUCH_IRQ 27

// === Fingerprint Pins ===
#define FINGER_RX 21
#define FINGER_TX 22

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen touch(TOUCH_CS, TOUCH_IRQ);
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// === Variables ===
bool enrollMode = false;
int enrollID = 1;
int enrollStage = 0;
String tempMatricule = ""; // Matricule temporaire pendant l'enregistrement
bool waitingForMatricule = false;

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

bool wasTouched = false;

// === FONCTIONS FICHIER ===
// Sauvegarder association ID -> Matricule
bool saveMatricule(int id, String matricule) {
  File file = SPIFFS.open("/matricules.txt", "a");
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
  Serial.println(matricule);
  
  return true;
}

// Récupérer le matricule associé à un ID
String getMatricule(int id) {
  if (!SPIFFS.exists("/matricules.txt")) {
    return "";
  }
  
  File file = SPIFFS.open("/matricules.txt", "r");
  if (!file) {
    return "";
  }
  
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    
    int commaIndex = line.indexOf(',');
    if (commaIndex > 0) {
      int fileID = line.substring(0, commaIndex).toInt();
      if (fileID == id) {
        String matricule = line.substring(commaIndex + 1);
        file.close();
        return matricule;
      }
    }
  }
  
  file.close();
  return "";
}

// Vérifier si un matricule existe déjà
bool matriculeExists(String matricule) {
  if (!SPIFFS.exists("/matricules.txt")) {
    return false;
  }
  
  File file = SPIFFS.open("/matricules.txt", "r");
  if (!file) {
    return false;
  }
  
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
  return false;
}

// Lister tous les matricules
void listMatricules() {
  Serial.println("\n=== LISTE DES MATRICULES ===");
  
  if (!SPIFFS.exists("/matricules.txt")) {
    Serial.println("Aucun matricule enregistre");
    return;
  }
  
  File file = SPIFFS.open("/matricules.txt", "r");
  if (!file) {
    Serial.println("Erreur lecture fichier");
    return;
  }
  
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    
    int commaIndex = line.indexOf(',');
    if (commaIndex > 0) {
      int id = line.substring(0, commaIndex).toInt();
      String matricule = line.substring(commaIndex + 1);
      Serial.print("ID ");
      Serial.print(id);
      Serial.print(" -> ");
      Serial.println(matricule);
    }
  }
  
  file.close();
  Serial.println("=============================\n");
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
  tft.fillRect(0, 0, 320, startY, ILI9341_BLACK);
  tft.drawRect(5, 5, 310, startY - 10, ILI9341_WHITE);
  
  tft.setCursor(15, 20);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(3);
  tft.print("P" + tempMatricule);
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
    Serial.println("Placez le doigt...");
    
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
      
      // Demander le matricule
      waitingForMatricule = true;
      tempMatricule = "";
      enrollStage = 0;
      
      displayCenteredMessage("Entrez matricule", "(ex: P123 ou P1234)", ILI9341_CYAN);
      delay(2000);
      
      drawInputBox();
      drawKeyboard();
      
      return false; // Attendre la saisie du matricule
    } else {
      displayCenteredMessage("Erreur!", "Enregistrement echoue", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
  }
  
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(2000); // Délai plus long au démarrage
  
  Serial.println("\n=================================");
  Serial.println("  SYSTEME EMPREINTES + MATRICULES");
  Serial.println("=================================\n");
  
  // Init SPIFFS
  Serial.println("1. Init SPIFFS...");
  if (!SPIFFS.begin(true)) {
    Serial.println("   [ERREUR] SPIFFS KO");
    while(1) delay(1000);
  }
  Serial.println("   [OK]\n");
  
  // Init écran
  Serial.println("2. Init ecran...");
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);
  Serial.println("   [OK]\n");
  
  // Init touch
  Serial.println("3. Init touch...");
  touch.begin();
  Serial.println("   [OK]\n");
  
  displayCenteredMessage("Initialisation...", "Patientez", ILI9341_CYAN);
  delay(1000);
  
  // Init lecteur avec plusieurs tentatives
  Serial.println("4. Init lecteur...");
  displayCenteredMessage("Init lecteur...", "", ILI9341_CYAN);
  
  mySerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  delay(2000); // Délai important pour le lecteur
  
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
    Serial.println("Verifications:");
    Serial.println("- VCC (5V) connecte?");
    Serial.println("- GND connecte?");
    Serial.println("- TX/RX bien branches?");
    Serial.println("- LED capteur allume?");
    
    displayCenteredMessage("ERREUR Lecteur!", "Verifiez connexions", ILI9341_RED);
    delay(5000);
    
    // Redémarrage automatique
    Serial.println("\nRedemarrage dans 3 secondes...");
    displayCenteredMessage("Redemarrage...", "3s", ILI9341_YELLOW);
    delay(3000);
    ESP.restart();
  }
  
  // Lister les matricules
  listMatricules();
  
  Serial.println("=================================");
  Serial.println("  SYSTEME PRET");
  Serial.println("=================================\n");
  
  displayCenteredMessage("Bienvenue!", "Placez votre doigt", ILI9341_WHITE);
}

void loop() {
  // Gestion du clavier pour le matricule
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
          // Valider le matricule
          if (tempMatricule.length() >= 3 && tempMatricule.length() <= 4) {
            String fullMatricule = "P" + tempMatricule;
            
            if (matriculeExists(fullMatricule)) {
              displayCenteredMessage("Matricule existe!", "Reessayez", ILI9341_RED);
              delay(2000);
              tempMatricule = "";
              drawInputBox();
              drawKeyboard();
            } else {
              saveMatricule(enrollID, fullMatricule);
              
              displayCenteredMessage("Matricule OK!", fullMatricule, ILI9341_GREEN);
              tft.setTextSize(3);
              tft.setTextColor(ILI9341_CYAN);
              tft.setCursor(100, 160);
              tft.print("ID: ");
              tft.print(enrollID);
              
              delay(3000);
              
              waitingForMatricule = false;
              enrollMode = false;
              tempMatricule = "";
              
              displayCenteredMessage("Bienvenue!", "Placez votre doigt", ILI9341_WHITE);
              listMatricules();
            }
          } else {
            displayCenteredMessage("Format invalide!", "3 ou 4 chiffres", ILI9341_RED);
            delay(2000);
            drawInputBox();
            drawKeyboard();
          }
        }
        else {
          if (tempMatricule.length() < 4) {
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
  
  // Mode enregistrement
  if (enrollMode) {
    if (enrollFingerprint()) {
      enrollMode = false;
      displayCenteredMessage("Bienvenue!", "Placez votre doigt", ILI9341_WHITE);
    }
    return;
  }
  
  // Mode vérification
  int result = finger.getImage();
  
  if (result == FINGERPRINT_OK) {
    Serial.println("Doigt detecte!");
    displayCenteredMessage("Lecture...", "", ILI9341_YELLOW);
    delay(500);
    
    result = finger.image2Tz();
    
    if (result == FINGERPRINT_OK) {
      result = finger.fingerSearch();
      
      if (result == FINGERPRINT_OK) {
        // RECONNUE - Afficher le matricule
        String matricule = getMatricule(finger.fingerID);
        
        if (matricule.length() > 0) {
          Serial.print("Matricule: ");
          Serial.print(matricule);
          Serial.print(" (ID ");
          Serial.print(finger.fingerID);
          Serial.println(")");
          
          displayCenteredMessage("Bienvenue!", matricule, ILI9341_GREEN);
          
          tft.setTextSize(2);
          tft.setTextColor(ILI9341_CYAN);
          tft.setCursor(110, 160);
          tft.print("ID: ");
          tft.print(finger.fingerID);
        } else {
          Serial.print("ID: ");
          Serial.println(finger.fingerID);
          
          displayCenteredMessage("Empreinte lue", "ID non associe", ILI9341_ORANGE);
          
          tft.setTextSize(3);
          tft.setTextColor(ILI9341_CYAN);
          tft.setCursor(100, 160);
          tft.print("ID: ");
          tft.print(finger.fingerID);
        }
        
        delay(3000);
        
      } else {
        // NON RECONNUE - Enregistrer
        Serial.println("Non reconnue - Enregistrement");
        displayCenteredMessage("Nouvelle empreinte", "Enregistrement...", ILI9341_ORANGE);
        delay(2000);
        
        enrollID = getNextFreeID();
        
        while (finger.getImage() != FINGERPRINT_NOFINGER) {
          delay(50);
        }
        
        enrollMode = true;
        enrollStage = 0;
      }
      
    } else {
      displayCenteredMessage("Erreur", "Reessayez", ILI9341_RED);
      delay(1500);
    }
    
    if (!enrollMode && !waitingForMatricule) {
      displayCenteredMessage("Bienvenue!", "Placez votre doigt", ILI9341_WHITE);
    }
    
    delay(1000);
    
  } else if (result == FINGERPRINT_NOFINGER) {
    delay(50);
  }
}
