#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_Fingerprint.h>

// === TFT Pins ===
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  4

// === Fingerprint Pins (Hardware Serial 2) ===
#define FINGER_RX 21  // ESP32 RX <- AS608 TX
#define FINGER_TX 22  // ESP32 TX -> AS608 RX

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

// Utilisation du Serial2 pour le lecteur d'empreinte
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// === Variables ===
bool enrollMode = false;
int enrollID = 1;
int enrollStage = 0;

// === Fonctions d'affichage ===
void displayCenteredMessage(String line1, String line2, uint16_t color) {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(color);
  
  // Ligne 1
  int x1 = (320 - line1.length() * 12) / 2;
  tft.setCursor(x1, 80);
  tft.print(line1);
  
  // Ligne 2
  if (line2.length() > 0) {
    int x2 = (320 - line2.length() * 12) / 2;
    tft.setCursor(x2, 120);
    tft.print(line2);
  }
}

void displayThreeLines(String line1, String line2, String line3, uint16_t color) {
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);
  tft.setTextColor(color);
  
  int x1 = (320 - line1.length() * 12) / 2;
  tft.setCursor(x1, 60);
  tft.print(line1);
  
  if (line2.length() > 0) {
    int x2 = (320 - line2.length() * 12) / 2;
    tft.setCursor(x2, 100);
    tft.print(line2);
  }
  
  if (line3.length() > 0) {
    int x3 = (320 - line3.length() * 12) / 2;
    tft.setCursor(x3, 140);
    tft.print(line3);
  }
}

// Trouve le prochain ID disponible
int getNextFreeID() {
  for (int id = 1; id <= finger.capacity; id++) {
    if (finger.loadModel(id) != FINGERPRINT_OK) {
      return id;
    }
  }
  return 1; // Si tout est plein, retourne 1
}

// Fonction d'enregistrement d'une nouvelle empreinte
bool enrollFingerprint() {
  int p = -1;
  
  if (enrollStage == 0) {
    // Première capture
    displayThreeLines("Enregistrement", "Placez votre doigt", "", ILI9341_CYAN);
    Serial.println("Placez le doigt pour la 1ère capture...");
    
    while (p != FINGERPRINT_OK) {
      p = finger.getImage();
      delay(50);
    }
    
    Serial.println("Image capturée !");
    displayCenteredMessage("Image capturee!", "Retirez le doigt", ILI9341_GREEN);
    delay(1000);
    
    p = finger.image2Tz(1);
    if (p != FINGERPRINT_OK) {
      Serial.println("Erreur de conversion");
      displayCenteredMessage("Erreur!", "Reessayez", ILI9341_RED);
      delay(2000);
      return false;
    }
    
    enrollStage = 1;
    
    // Attendre que le doigt soit retiré
    while (finger.getImage() != FINGERPRINT_NOFINGER) {
      delay(50);
    }
    
    delay(500);
    return false; // Pas encore terminé
  }
  
  if (enrollStage == 1) {
    // Deuxième capture
    displayThreeLines("Enregistrement", "Replacez le meme", "doigt", ILI9341_CYAN);
    Serial.println("Replacez le même doigt pour la 2ème capture...");
    
    p = -1;
    while (p != FINGERPRINT_OK) {
      p = finger.getImage();
      delay(50);
    }
    
    Serial.println("Image capturée !");
    displayCenteredMessage("Image capturee!", "Traitement...", ILI9341_GREEN);
    delay(1000);
    
    p = finger.image2Tz(2);
    if (p != FINGERPRINT_OK) {
      Serial.println("Erreur de conversion");
      displayCenteredMessage("Erreur!", "Reessayez", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
    
    // Créer le modèle
    Serial.println("Création du modèle...");
    p = finger.createModel();
    if (p != FINGERPRINT_OK) {
      Serial.println("Erreur: Les empreintes ne correspondent pas");
      displayCenteredMessage("Erreur!", "Empreintes differentes", ILI9341_RED);
      delay(2000);
      enrollStage = 0;
      return false;
    }
    
    // Enregistrer le modèle
    Serial.print("Enregistrement à l'ID #");
    Serial.println(enrollID);
    
    p = finger.storeModel(enrollID);
    if (p == FINGERPRINT_OK) {
      Serial.println("Empreinte enregistrée avec succès !");
      
      displayCenteredMessage("Empreinte", "enregistree!", ILI9341_GREEN);
      tft.setTextSize(3);
      tft.setTextColor(ILI9341_CYAN);
      tft.setCursor(120, 160);
      tft.print("ID: ");
      tft.print(enrollID);
      
      delay(3000);
      enrollStage = 0;
      return true; // Enregistrement terminé
    } else {
      Serial.println("Erreur d'enregistrement");
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
  Serial.println("\n=== Système de reconnaissance d'empreintes ===");
  
  // === Initialisation de l'écran TFT ===
  Serial.println("Initialisation de l'écran...");
  tft.begin();
  tft.setRotation(1); // Mode paysage
  tft.fillScreen(ILI9341_BLACK);
  
  displayCenteredMessage("Initialisation...", "", ILI9341_CYAN);
  delay(1000);
  
  // === Initialisation du lecteur d'empreinte ===
  Serial.println("Initialisation du lecteur d'empreinte...");
  mySerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  
  delay(500);
  
  if (finger.verifyPassword()) {
    Serial.println("Lecteur d'empreinte AS608 détecté !");
    displayCenteredMessage("Lecteur OK!", "", ILI9341_GREEN);
    delay(1500);
  } else {
    Serial.println("ERREUR: Lecteur d'empreinte non détecté !");
    displayCenteredMessage("ERREUR Lecteur!", "", ILI9341_RED);
    while (1) { delay(1); } // Blocage si erreur
  }
  
  // Affichage des informations du capteur
  Serial.print("Capacité: "); Serial.println(finger.capacity);
  finger.getTemplateCount();
  Serial.print("Empreintes enregistrées: "); Serial.println(finger.templateCount);
  
  // Message d'accueil
  displayCenteredMessage("Bienvenue!", "Placez votre empreinte", ILI9341_WHITE);
  Serial.println("\n=== Système prêt ===");
  Serial.println("En attente d'empreinte...\n");
}

void loop() {
  // Si on est en mode enregistrement
  if (enrollMode) {
    if (enrollFingerprint()) {
      // Enregistrement terminé avec succès
      enrollMode = false;
      displayCenteredMessage("Bienvenue!", "Placez votre empreinte", ILI9341_WHITE);
      Serial.println("En attente d'empreinte...\n");
    }
    return;
  }
  
  // Mode normal: vérification d'empreinte
  int result = finger.getImage();
  
  if (result == FINGERPRINT_OK) {
    Serial.println("Empreinte détectée !");
    displayCenteredMessage("Empreinte", "detectee...", ILI9341_YELLOW);
    delay(500);
    
    // Convertir l'image en template
    result = finger.image2Tz();
    
    if (result == FINGERPRINT_OK) {
      Serial.println("Empreinte convertie avec succès !");
      
      // Rechercher dans la base de données
      result = finger.fingerSearch();
      
      if (result == FINGERPRINT_OK) {
        // ===== EMPREINTE RECONNUE =====
        Serial.print("Empreinte trouvée ! ID #");
        Serial.print(finger.fingerID);
        Serial.print(" avec confiance de ");
        Serial.println(finger.confidence);
        
        displayCenteredMessage("Empreinte lue", "avec succes!", ILI9341_GREEN);
        
        // Afficher l'ID
        tft.setTextSize(3);
        tft.setTextColor(ILI9341_CYAN);
        tft.setCursor(120, 160);
        tft.print("ID: ");
        tft.print(finger.fingerID);
        
        delay(3000);
        
      } else {
        // ===== EMPREINTE NON RECONNUE -> ENREGISTREMENT =====
        Serial.println("Empreinte non reconnue ! Démarrage de l'enregistrement...");
        displayCenteredMessage("Nouvelle empreinte", "Enregistrement...", ILI9341_ORANGE);
        delay(2000);
        
        // Trouver le prochain ID disponible
        enrollID = getNextFreeID();
        Serial.print("Attribution de l'ID #");
        Serial.println(enrollID);
        
        // Attendre que le doigt soit retiré
        while (finger.getImage() != FINGERPRINT_NOFINGER) {
          delay(50);
        }
        
        // Passer en mode enregistrement
        enrollMode = true;
        enrollStage = 0;
      }
      
    } else {
      Serial.println("Erreur de conversion d'empreinte");
      displayCenteredMessage("Erreur", "Reessayez", ILI9341_RED);
      delay(2000);
    }
    
    // Retour au message d'accueil (sauf si on est en mode enregistrement)
    if (!enrollMode) {
      displayCenteredMessage("Bienvenue!", "Placez votre empreinte", ILI9341_WHITE);
      Serial.println("En attente d'empreinte...\n");
    }
    
    delay(1000); // Délai avant prochaine lecture
    
  } else if (result == FINGERPRINT_NOFINGER) {
    // Pas de doigt détecté (normal)
    delay(50);
  } else {
    // Autre erreur
    Serial.print("Erreur capteur: ");
    Serial.println(result);
    delay(500);
  }
}
