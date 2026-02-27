#include <Adafruit_Fingerprint.h>

// Adapte ici si tu changes les pins UART
#define FINGER_RX 21  // ESP32 RX2 <- TX capteur
#define FINGER_TX 22  // ESP32 TX2 -> RX capteur

HardwareSerial fingerSerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fingerSerial);

unsigned long lastInfo = 0;

const char* fpCodeToText(int code) {
  switch (code) {
    case FINGERPRINT_OK: return "OK";
    case FINGERPRINT_NOFINGER: return "NOFINGER";
    case FINGERPRINT_PACKETRECIEVEERR: return "PACKETRECIEVEERR";
    case FINGERPRINT_IMAGEFAIL: return "IMAGEFAIL";
    case FINGERPRINT_IMAGEMESS: return "IMAGEMESS";
    case FINGERPRINT_FEATUREFAIL: return "FEATUREFAIL";
    case FINGERPRINT_INVALIDIMAGE: return "INVALIDIMAGE";
    case FINGERPRINT_NOTFOUND: return "NOTFOUND";
    case FINGERPRINT_ENROLLMISMATCH: return "ENROLLMISMATCH";
    case FINGERPRINT_BADLOCATION: return "BADLOCATION";
    case FINGERPRINT_FLASHERR: return "FLASHERR";
    default: return "OTHER";
  }
}

void printSensorInfo() {
  finger.getParameters();
  Serial.println("----- Fingerprint Sensor Info -----");
  Serial.print("Status: 0x"); Serial.println(finger.status_reg, HEX);
  Serial.print("System ID: 0x"); Serial.println(finger.system_id, HEX);
  Serial.print("Capacity: "); Serial.println(finger.capacity);
  Serial.print("Security level: "); Serial.println(finger.security_level);
  Serial.print("Device address: 0x"); Serial.println(finger.device_addr, HEX);
  Serial.print("Packet len: "); Serial.println(finger.packet_len);
  Serial.print("Baud rate: "); Serial.println(finger.baud_rate);
  Serial.println("-----------------------------------");
}

void setup() {
  Serial.begin(115200);
  delay(800);

  Serial.println();
  Serial.println("=== TEST LECTEUR EMPREINTE ESP32 ===");
  Serial.println("Init UART2...");

  fingerSerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  finger.begin(57600);
  delay(300);

  bool ok = false;
  for (int i = 1; i <= 5; i++) {
    Serial.print("verifyPassword tentative ");
    Serial.print(i);
    Serial.print("/5: ");
    if (finger.verifyPassword()) {
      Serial.println("OK");
      ok = true;
      break;
    }
    Serial.println("ECHEC");
    delay(300);
  }

  if (!ok) {
    Serial.println("ECHEC: lecteur non detecte.");
    Serial.println("Verifier alimentation, GND commun, RX/TX croises, et pins.");
    return;
  }

  printSensorInfo();

  finger.getTemplateCount();
  Serial.print("Empreintes en memoire: ");
  Serial.println(finger.templateCount);
  Serial.println("Place ton doigt sur le capteur...");
}

void loop() {
  static int packetErrStreak = 0;

  int p = finger.getImage();

  if (p == FINGERPRINT_NOFINGER) {
    if (millis() - lastInfo > 2000) {
      lastInfo = millis();
      Serial.println("En attente de doigt...");
    }
    delay(50);
    return;
  }

  Serial.print("getImage: ");
  Serial.println(fpCodeToText(p));

  if (p == FINGERPRINT_PACKETRECIEVEERR) {
    packetErrStreak++;

    if (packetErrStreak >= 10) {
      Serial.println("Trop d'erreurs UART -> reinit liaison...");
      fingerSerial.end();
      delay(120);
      fingerSerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
      finger.begin(57600);
      delay(200);

      if (finger.verifyPassword()) {
        Serial.println("Recovery UART OK");
      } else {
        Serial.println("Recovery UART KO");
      }
      packetErrStreak = 0;
    }

    delay(80);
    return;
  }

  packetErrStreak = 0;

  if (p != FINGERPRINT_OK) {
    delay(100);
    return;
  }

  p = finger.image2Tz();
  Serial.print("image2Tz: ");
  Serial.println(fpCodeToText(p));
  if (p != FINGERPRINT_OK) {
    delay(300);
    return;
  }

  p = finger.fingerSearch();
  Serial.print("fingerSearch: ");
  Serial.println(fpCodeToText(p));

  if (p == FINGERPRINT_OK) {
    Serial.print("MATCH ID=");
    Serial.print(finger.fingerID);
    Serial.print(" confidence=");
    Serial.println(finger.confidence);
  } else {
    Serial.println("Doigt detecte mais non enregistre.");
  }

  while (finger.getImage() != FINGERPRINT_NOFINGER) {
    delay(30);
  }
  Serial.println("Doigt retire. Pret pour un nouveau test.");
  delay(200);
}
