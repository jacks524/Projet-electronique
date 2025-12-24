#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <XPT2046_Touchscreen.h>

// === TFT Pins ===
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  4

// === TOUCH Pins ===
#define TOUCH_CS 15
#define TOUCH_IRQ 27

// === SPI Pins ===
// SCK  = 18
// MOSI = 23
// MISO = 19

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen touch(TOUCH_CS, TOUCH_IRQ);

String inputText = "";
bool wasTouched = false;

// ---- CONFIG CLAVIER ----
const int keyW = 106;
const int keyH = 50;
const int startY = 60;

// Labels du clavier
const char* keys[4][3] = {
  {"1", "2", "3"},
  {"4", "5", "6"},
  {"7", "8", "9"},
  {"DEL", "0", "OK"}
};

// ---- Dessine une touche ----
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

// ---- Dessine l'ensemble du clavier ----
void drawKeyboard() {
  tft.fillRect(0, startY, 320, 240 - startY, ILI9341_BLACK);
  
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 3; c++) {
      drawKey(r, c);
    }
  }
}

// ---- Dessine la zone de saisie ----
void drawInputBox() {
  tft.fillRect(0, 0, 320, startY, ILI9341_BLACK);
  tft.drawRect(5, 5, 310, startY - 10, ILI9341_WHITE);
  
  tft.setCursor(15, 20);
  tft.setTextColor(ILI9341_GREEN);
  tft.setTextSize(3);
  tft.print(inputText);
}

// ---- Détermine quelle touche a été pressée ----
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

void setup() {
  Serial.begin(115200);
  
  tft.begin();
  touch.begin();
  
  tft.setRotation(1); // Paysage
  tft.fillScreen(ILI9341_BLACK);
  
  drawInputBox();
  drawKeyboard();
  
  Serial.println("Clavier numérique initialisé");
  Serial.println("Touchez l'écran pour voir les coordonnées brutes");
}

void loop() {
  bool isTouched = touch.touched();
  
  if (wasTouched && !isTouched) {
    TS_Point p = touch.getPoint();
    
    // ESSAI 1 : Inversion X et Y avec différentes plages
    int x = map(p.x, 3900, 200, 0, 320);  // Inversé
    int y = map(p.y, 3900, 200, 0, 240);  // Inversé
    
    // Affichage des coordonnées brutes pour debug
    Serial.print("Brut: p.x="); Serial.print(p.x);
    Serial.print(" p.y="); Serial.print(p.y);
    Serial.print(" | Mappé: x="); Serial.print(x);
    Serial.print(" y="); Serial.println(y);
    
    int row, col;
    getKeyPosition(x, y, row, col);
    
    if (row >= 0 && col >= 0) {
      String key = String(keys[row][col]);
      Serial.println("Touche détectée: " + key);
      
      drawKey(row, col, true);
      delay(100);
      drawKey(row, col, false);
      
      if (key == "DEL") {
        if (inputText.length() > 0)
          inputText.remove(inputText.length() - 1);
      }
      else if (key == "OK") {
        Serial.println("VALIDATION : " + inputText);
      }
      else {
        if (inputText.length() < 15) {
          inputText += key;
        }
      }
      
      drawInputBox();
    }
  }
  
  wasTouched = isTouched;
  delay(10);
}
