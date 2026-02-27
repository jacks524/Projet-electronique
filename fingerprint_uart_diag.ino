#include <Arduino.h>
#include <Adafruit_Fingerprint.h>
#include "esp_system.h"

// Diagnostic UART pour capteur d'empreintes
// Flash ce sketch seul (il ne tourne pas en parallele avec ton application principale).
// Moniteur serie: 115200 bauds.

#define FINGER_RX 21
#define FINGER_TX 22

// RX sniffer optionnel: relier TX capteur -> GPIO25 en plus de GPIO21
// (simple "Y" sur TX capteur) pour voir les octets bruts sans toucher au flux principal.
#define SNIFF_RX 25

HardwareSerial fingerUart(2);
HardwareSerial sniffUart(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fingerUart);

uint32_t currentBaud = 57600;
bool sniffEnabled = false;
unsigned long lastProbeMs = 0;
int commErrStreak = 0;

const uint32_t baudsToTry[] = {57600, 115200, 38400, 19200};

const char *fpCodeToText(int code) {
  switch (code) {
    case FINGERPRINT_OK: return "OK";
    case FINGERPRINT_PACKETRECIEVEERR: return "PACKETRECIEVEERR";
    case FINGERPRINT_NOFINGER: return "NOFINGER";
    case FINGERPRINT_IMAGEFAIL: return "IMAGEFAIL";
    case FINGERPRINT_IMAGEMESS: return "IMAGEMESS";
    case FINGERPRINT_FEATUREFAIL: return "FEATUREFAIL";
    case FINGERPRINT_INVALIDIMAGE: return "INVALIDIMAGE";
    case FINGERPRINT_NOTFOUND: return "NOTFOUND";
    default: return "OTHER";
  }
}

void beginFingerAtBaud(uint32_t baud) {
  fingerUart.end();
  delay(50);
  fingerUart.begin(baud, SERIAL_8N1, FINGER_RX, FINGER_TX);
  finger.begin(baud);
  currentBaud = baud;
}

void beginSniffer(uint32_t baud) {
  sniffUart.end();
  delay(20);
  sniffUart.begin(baud, SERIAL_8N1, SNIFF_RX, -1);
}

void flushFingerRx(unsigned long drainMs = 25) {
  unsigned long start = millis();
  while (millis() - start < drainMs) {
    while (fingerUart.available() > 0) {
      fingerUart.read();
    }
    delay(1);
  }
}

bool recoverFingerprintLink() {
  Serial.println("[RECOVER] Restart UART and rescan bauds...");
  tryDetectBaud();
  bool ok = finger.verifyPassword();
  Serial.print("[RECOVER] verifyPassword=");
  Serial.println(ok ? "OK" : "FAIL");
  if (ok) commErrStreak = 0;
  return ok;
}

void tryDetectBaud() {
  Serial.println("\n[DIAG] Scan bauds...");
  for (uint8_t i = 0; i < sizeof(baudsToTry) / sizeof(baudsToTry[0]); i++) {
    uint32_t b = baudsToTry[i];
    beginFingerAtBaud(b);
    delay(120);
    bool ok = finger.verifyPassword();
    Serial.print("[DIAG] ");
    Serial.print(b);
    Serial.print(" -> ");
    Serial.println(ok ? "verifyPassword=OK" : "verifyPassword=FAIL");
    if (ok) {
      if (sniffEnabled) beginSniffer(currentBaud);
      return;
    }
  }
  Serial.println("[DIAG] Aucun baud valide detecte.");
}

void printSniffBytes() {
  while (sniffUart.available()) {
    uint8_t b = sniffUart.read();
    Serial.print("[SNIFF] 0x");
    if (b < 16) Serial.print("0");
    Serial.println(b, HEX);
  }
}

void runProbe() {
  flushFingerRx(10);
  unsigned long t0 = millis();
  bool ok = finger.verifyPassword();
  unsigned long dt = millis() - t0;

  Serial.print("[PROBE] baud=");
  Serial.print(currentBaud);
  Serial.print(" verifyPassword=");
  Serial.print(ok ? "OK" : "FAIL");
  Serial.print(" dt=");
  Serial.print(dt);
  Serial.println("ms");

  if (!ok) {
    commErrStreak++;
    int r = finger.getImage();
    Serial.print("[PROBE] getImage=");
    Serial.println(fpCodeToText(r));
    if (commErrStreak >= 3) {
      recoverFingerprintLink();
    }
    return;
  }
  commErrStreak = 0;
  delay(20); // laisse le module souffler entre 2 commandes

  // Test presence doigt + conversion + recherche rapide
  int img = finger.getImage();
  if (img == FINGERPRINT_NOFINGER) {
    Serial.println("[PROBE] finger_detect=NOFINGER");
    return;
  }

  if (img != FINGERPRINT_OK) {
    commErrStreak++;
    Serial.print("[PROBE] finger_detect=ERR ");
    Serial.println(fpCodeToText(img));
    if (commErrStreak >= 3) {
      recoverFingerprintLink();
    }
    return;
  }

  Serial.println("[PROBE] finger_detect=OK");

  int conv = finger.image2Tz(1);
  Serial.print("[PROBE] image2Tz=");
  Serial.println(fpCodeToText(conv));
  if (conv != FINGERPRINT_OK) {
    commErrStreak++;
    if (commErrStreak >= 3) {
      recoverFingerprintLink();
    }
    return;
  }

  int s = finger.fingerFastSearch();
  if (s == FINGERPRINT_OK) {
    Serial.print("[PROBE] search=OK id=");
    Serial.print(finger.fingerID);
    Serial.print(" conf=");
    Serial.println(finger.confidence);
  } else if (s == FINGERPRINT_NOTFOUND) {
    Serial.println("[PROBE] search=NOTFOUND");
  } else {
    Serial.print("[PROBE] search=ERR ");
    Serial.println(fpCodeToText(s));
    commErrStreak++;
    if (commErrStreak >= 3) {
      recoverFingerprintLink();
    }
  }
}

void handleConsole() {
  if (!Serial.available()) return;
  String cmd = Serial.readStringUntil('\n');
  cmd.trim();

  if (cmd == "help") {
    Serial.println("Commandes:");
    Serial.println("  help           -> aide");
    Serial.println("  scan           -> scan des bauds");
    Serial.println("  sniff on       -> active sniffer RX(GPIO25)");
    Serial.println("  sniff off      -> desactive sniffer");
    Serial.println("  b57600         -> force baud (ex: b115200)");
    return;
  }

  if (cmd == "scan") {
    tryDetectBaud();
    return;
  }

  if (cmd == "sniff on") {
    sniffEnabled = true;
    beginSniffer(currentBaud);
    Serial.println("[DIAG] Sniffer ON");
    return;
  }

  if (cmd == "sniff off") {
    sniffEnabled = false;
    sniffUart.end();
    Serial.println("[DIAG] Sniffer OFF");
    return;
  }

  if (cmd.length() > 1 && cmd.charAt(0) == 'b') {
    uint32_t b = (uint32_t)cmd.substring(1).toInt();
    if (b > 0) {
      beginFingerAtBaud(b);
      if (sniffEnabled) beginSniffer(b);
      Serial.print("[DIAG] Baud force a ");
      Serial.println(b);
      return;
    }
  }

  Serial.println("[DIAG] Commande inconnue. Tape 'help'.");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== FINGERPRINT UART DIAG ===");
  Serial.println("Moniteur serie a 115200.");
  Serial.println("Tape 'help' pour les commandes.");
  Serial.print("Reset reason: ");
  Serial.println((int)esp_reset_reason());

  beginFingerAtBaud(currentBaud);
  delay(120);
  tryDetectBaud();
}

void loop() {
  handleConsole();

  if (sniffEnabled) {
    printSniffBytes();
  }

  if (millis() - lastProbeMs >= 1000) {
    lastProbeMs = millis();
    runProbe();
  }
}
