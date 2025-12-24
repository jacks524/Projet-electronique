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

// === Objects ===
Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
XPT2046_Touchscreen touch(TOUCH_CS, TOUCH_IRQ);

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("==== TEST ILI9341 + XPT2046 ====");

  // Start TFT
  tft.begin();
  tft.setRotation(1);      // Horizontal, ajuste si nécessaire
  tft.fillScreen(ILI9341_BLACK);

  // Start Touchscreen
  if (!touch.begin()) {
    Serial.println("ERREUR: Touch XPT2046 NON DETECTE !");
  } else {
    Serial.println("Touch XPT2046 OK.");
  }

  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(20, 20);
  tft.println("TEST ILI9341 + TOUCH OK");

  tft.fillRect(40, 80, 240, 120, ILI9341_BLUE);
  tft.setCursor(60, 130);
  tft.setTextColor(ILI9341_YELLOW);
  tft.print("Touchez l'ecran");
}

void loop() {
  if (touch.touched()) {
    TS_Point p = touch.getPoint();

    // Sur XPT2046, il faut réaligner l'axe
    int x = map(p.y, 200, 3900, 0, tft.width());  
    int y = map(p.x, 200, 3900, 0, tft.height());

    Serial.print("Touche detectee ! X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.println(y);

    // Dessine un petit point où l'on touche
    tft.fillCircle(x, y, 3, ILI9341_RED);

    delay(50);
  }
}
