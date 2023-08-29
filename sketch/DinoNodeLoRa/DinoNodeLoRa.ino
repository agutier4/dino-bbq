#include "LoRaWan_APP.h"
#include "Arduino.h"
#include "HT_SSD1306Wire.h"

#define ID 1

#define LORA_BANDWIDTH              0
#define LORA_SPREADING_FACTOR       7
#define LORA_CODINGRATE             1
#define LORA_PREAMBLE_LENGTH        8
#define LORA_SYMBOL_TIMEOUT         0
#define LORA_FIX_LENGTH_PAYLOAD_ON  false
#define LORA_IQ_INVERSION_ON        false

// pinout
const uint8_t SOUND_PIN = 35;
const uint8_t VBAT_PIN = 1;
const uint8_t ADC_CTL_PIN = 37;

// global state
float vBat = 0.0;

SSD1306Wire oled(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED);

// LoRa
static RadioEvents_t RadioEvents;
bool lora_idle = true;



void setup(){
  Serial.begin(115200);
  Mcu.begin();

  // init pins
  pinMode(SOUND_PIN, OUTPUT);
  pinMode(VBAT_PIN, INPUT);
  pinMode(ADC_CTL_PIN, OUTPUT);
  adcAttachPin(VBAT_PIN);
  analogReadResolution(10);
  
  // init LoRa
  RadioEvents.RxDone = OnRxDone;
  Radio.Init(&RadioEvents);
  Radio.SetChannel(915E6);
  Radio.SetRxConfig(MODEM_LORA, LORA_BANDWIDTH, LORA_SPREADING_FACTOR,
                    LORA_CODINGRATE, 0, LORA_PREAMBLE_LENGTH,
                    LORA_SYMBOL_TIMEOUT, LORA_FIX_LENGTH_PAYLOAD_ON,
                    0, true, 0, 0, LORA_IQ_INVERSION_ON, true );

  // init oled
  oled.init();
  oled.clear();
  oled.display();
}

void loop(){
  vBat = readBattVoltage(20);
  
  // LoRa Receive
  if(lora_idle){
    lora_idle = false;
    Serial.println("into RX mode");
    Radio.Rx(0);
  }
  Radio.IrqProcess( );

  // Update display
  oled.clear();
  oled.drawString(0, 10, "Node ID: " + String(ID));
  oled.drawString(0, 20, "Vbat: " + String(vBat) + "(V)");
  oled.display();
}

void OnRxDone( uint8_t *payload, uint16_t size, int16_t rssi, int8_t snr ){
  Serial.println("Got Packet");
  lora_idle = true;
}

/**
 * Take an average voltage reading
 * @param numSamples number to samples to take and average
 */ 
float readBattVoltage(const uint8_t& numSamples) {
  const uint8_t BATTERY_SAMPLES = 20;

  digitalWrite(ADC_CTL_PIN, LOW);
  uint32_t raw = 0;
  for (int i = 0; i < numSamples; i++) {
    raw += analogRead(VBAT_PIN);
  }
  raw = raw / numSamples;

  digitalWrite(ADC_CTL_PIN, HIGH);
  return 5.11 * (3.3 / 1024.0) * raw;
}