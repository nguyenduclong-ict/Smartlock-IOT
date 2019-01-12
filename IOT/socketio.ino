#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>

#include <SocketIoClient.h>

#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;
SocketIoClient webSocket;
StaticJsonBuffer<200> jsonBuffer;

const int key = 2;
int keyState = 0;
boolean allowOpen = false;
boolean warning;
const String mac = WiFi.macAddress();

int checkKey(int in)
{
  return digitalRead(in);
}

void sendStatus(String data, size_t length)
{
  JsonObject &info = jsonBuffer.createObject();
  if (checkKey(key) == LOW)
  {
    info["status"] = "lock";
  }
  else
  {
    info["status"] = "no-lock";
  }
  info["allowOpen"] = allowOpen;
  info["mac"] = mac;
  String status;
  info.printTo(status);
  webSocket.emit("device:send-status", status.c_str());
  jsonBuffer.clear();
}

void sendInfo(String data, size_t length) {
  JsonObject &info = jsonBuffer.createObject();
  info["mac"] = WiFi.macAddress();
  String status;
  info.printTo(status);
  webSocket.emit("device:send-info", status.c_str());
  jsonBuffer.clear();
}

void allowOpenChange(String data, size_t length) {
  USE_SERIAL.println("allowOpen" + data);
  if (data.compareTo("true") == 0 ) {
    allowOpen = true;
    warning = false;
  } else {
    allowOpen = false;
  }
}


void addUser(String data, size_t length) {
  webSocket.emit("device:add-user", data.c_str());
}


void setup()
{

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(key, INPUT);
  pinMode(13, OUTPUT);
  USE_SERIAL.begin(115200);

  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--)
  {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  WiFiMulti.addAP("KimLoaiHaNoi", "1234567899");

  while (WiFiMulti.run() != WL_CONNECTED)
  {
    delay(100);
  }

  webSocket.on("get-info", sendInfo);
  webSocket.on("device:get-status", sendStatus);
  webSocket.on("allow-Open", allowOpenChange);
  webSocket.on("add-user", addUser);
  webSocket.begin("35.221.233.130", 2306);
}



void loop()
{
  webSocket.loop();
  int stat = checkKey(key);
  if (stat == 1 & allowOpen == false) {
    warning = true;
  }
  if (warning) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  if (stat != keyState)
  {
    sendStatus("", 0);
  }
  keyState = stat;
}
