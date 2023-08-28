#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "HT_SSD1306Wire.h"

#define ID 1

// Network confiuration
const char* ssid = "CHANGE_ME";
const char* password = "CHANGE_ME";
const char* mqtt_server = "192.168.86.33";

// pinout
const uint8_t SOUND_PIN = 35;
const uint8_t VBAT_PIN = 1;
const uint8_t ADC_CTL_PIN = 37;

// Interface objects
WiFiClient espClient;
PubSubClient client(espClient);
SSD1306Wire oled(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED);

// Gloal state
unsigned long lastStatus = 0;
unsigned long lastRoar = 0;
float vBat = 0.0;

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

/**
 * Generate JSON status report
 * @param voltage battery voltage
 */ 
String batteryReportJSON(const float& voltage){
  return String("{\"id\":"+String(ID)+",\"voltage\":"+String(voltage).c_str()+"}");
}

/**
 * Setup WiFi connection and log to display
 * @param ssid network ssid
 * @param psk network password
 */
void setupWiFi(const char* ssid, const char* psk) {
  delay(10);
  oled.drawString(0, 0, "WiFi Connecting...");
  oled.drawString(0, 10, "Node ID: " + String(ID));
  oled.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, psk);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

/**
 * Callback for MQTT messages
 * @param topic published topic
 * @param payload binary message payload
 * @param length payload length 
 */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload, length);

  if (doc.containsKey("id")){
    uint8_t cmdId = doc["id"];
    Serial.println("Got cmd with ID=" + String(cmdId));

    if (cmdId == ID || cmdId ==0xFF){
      lastRoar = millis();
      digitalWrite(SOUND_PIN, HIGH);
      delay(10);
      digitalWrite(SOUND_PIN, LOW);
    }
  }
}

/**
 * Reconnect MQTT client and log status to display
 */
void reconnectMqtt() {
  while (!client.connected()) {
    vBat = readBattVoltage(20);
    oled.clear();
    oled.drawString(0, 0, "MQTT Conncecting...");
    oled.drawString(0, 10, "IP: " + WiFi.localIP().toString());
    oled.drawString(0, 20, "Node ID: " + String(ID));
    oled.drawString(0, 30, "Vbat: " + String(vBat) + "(V)");
    oled.display();
    if (client.connect(String("DinoNode_" + ID).c_str())) {
      // success, subscribe to command topic
      client.subscribe("cmd");
    } else {
      // retry in 5 sec
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // init pins
  pinMode(SOUND_PIN, OUTPUT);
  pinMode(VBAT_PIN, INPUT);
  pinMode(ADC_CTL_PIN, OUTPUT);
  adcAttachPin(VBAT_PIN);
  analogReadResolution(10);
  
  // init oled
  oled.init();
  oled.clear();
  oled.display();

  // init WiFi/MQTT
  setupWiFi(ssid, password);
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttCallback);
}

void loop() {

  // Ensure connection
  if (!client.connected()) {
    reconnectMqtt();
  }
  client.loop();

  // TODO: remove
  unsigned long now = millis();
  if (now - lastRoar > 100) {
    lastRoar = now;
    digitalWrite(SOUND_PIN, LOW);
  }

  // Send Status
  vBat = readBattVoltage(20);
  if(now - lastStatus > 5000 && client.connected()){
    String payload("["+String(ID)+"]");
    client.publish("nodes/heartbeat", payload.c_str());
    client.publish("nodes/battery", batteryReportJSON(vBat).c_str());
    lastStatus = now;
  }

  // Update display
  oled.clear();
  oled.drawString(0, 0, "MQTT Connected");
  oled.drawString(0, 10, "IP: " + WiFi.localIP().toString());
  oled.drawString(0, 20, "Node ID: " + String(ID));
  oled.drawString(0, 30, "Vbat: " + String(vBat) + "(V)");
  oled.display();
}
