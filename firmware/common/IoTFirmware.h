#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <espMqttClient.h>
#include <time.h>

#if defined(ESP32)
#include <WiFi.h>
#include <esp_system.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <user_interface.h>
#if MQTT_USE_TLS
#include <WiFiClientSecureBearSSL.h>
#endif
#else
#error "This firmware supports only ESP32 and ESP8266."
#endif

namespace iot {

constexpr uint32_t HEARTBEAT_INTERVAL_MS = 30000UL;
constexpr uint32_t PUBLISH_RETRY_MS = 5000UL;
constexpr uint32_t INITIAL_BACKOFF_MS = 1000UL;
constexpr uint32_t MAX_BACKOFF_MS = 30000UL;
constexpr time_t MIN_VALID_EPOCH = 1704067200;  // 2024-01-01T00:00:00Z
constexpr size_t TOPIC_CAPACITY = 160;
constexpr size_t JSON_CAPACITY = 512;

#if MQTT_USE_TLS
espMqttClientSecure mqttClient;
#if defined(ESP8266)
BearSSL::X509List mqttTrustAnchor(MQTT_ROOT_CA);
#endif
#else
espMqttClient mqttClient;
#endif

char heartbeatTopic[TOPIC_CAPACITY];
char telemetryTopic[TOPIC_CAPACITY];
char statusTopic[TOPIC_CAPACITY];
char bootId[37];

uint64_t sequence = 0;
uint32_t wifiBackoffMs = INITIAL_BACKOFF_MS;
uint32_t mqttBackoffMs = INITIAL_BACKOFF_MS;
uint32_t lastWifiAttemptAt = 0;
uint32_t lastMqttAttemptAt = 0;
uint32_t lastHeartbeatAttemptAt = 0;
wl_status_t previousWifiStatus = WL_IDLE_STATUS;
bool wifiAttempted = false;
bool mqttAttempted = false;
bool ntpRequested = false;
bool ntpSynchronized = false;
bool heartbeatPublished = false;

inline bool elapsed(uint32_t now, uint32_t since, uint32_t interval) {
  return static_cast<uint32_t>(now - since) >= interval;
}

inline uint32_t nextBackoff(uint32_t current) {
  return current >= (MAX_BACKOFF_MS / 2) ? MAX_BACKOFF_MS : current * 2;
}

inline uint32_t secureRandom32() {
#if defined(ESP32)
  return esp_random();
#else
  return os_random();
#endif
}

inline void generateBootId() {
  uint8_t bytes[16];
  for (size_t offset = 0; offset < sizeof(bytes); offset += 4) {
    const uint32_t randomValue = secureRandom32();
    memcpy(bytes + offset, &randomValue, sizeof(randomValue));
  }
  bytes[6] = static_cast<uint8_t>((bytes[6] & 0x0F) | 0x40);
  bytes[8] = static_cast<uint8_t>((bytes[8] & 0x3F) | 0x80);
  snprintf(
      bootId, sizeof(bootId),
      "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
      bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6],
      bytes[7], bytes[8], bytes[9], bytes[10], bytes[11], bytes[12],
      bytes[13], bytes[14], bytes[15]);
}

inline void buildTopics() {
  snprintf(heartbeatTopic, sizeof(heartbeatTopic),
           "incubadora/devices/%s/heartbeat", DEVICE_HARDWARE_UID);
  snprintf(telemetryTopic, sizeof(telemetryTopic),
           "incubadora/devices/%s/telemetry", DEVICE_HARDWARE_UID);
  snprintf(statusTopic, sizeof(statusTopic),
           "incubadora/devices/%s/status", DEVICE_HARDWARE_UID);
}

inline bool hasValidTime() { return time(nullptr) >= MIN_VALID_EPOCH; }

inline bool formatUtcNow(char* output, size_t outputSize) {
  const time_t now = time(nullptr);
  if (now < MIN_VALID_EPOCH) return false;
  struct tm utc;
  gmtime_r(&now, &utc);
  return strftime(output, outputSize, "%Y-%m-%dT%H:%M:%S.000Z", &utc) > 0;
}

inline void requestNtp() {
  if (ntpRequested) return;
  configTime(0, 0, "pool.ntp.org", "time.cloudflare.com", "time.google.com");
  ntpRequested = true;
  Serial.println("NTP synchronization requested; waiting for valid UTC time");
}

inline void updateNtpState() {
  if (!ntpSynchronized && hasValidTime()) {
    ntpSynchronized = true;
    Serial.println("NTP synchronized");
  }
}

inline bool publishHeartbeat() {
  char sentAt[25];
  if (!formatUtcNow(sentAt, sizeof(sentAt))) return false;

  JsonDocument document;
  document["schemaVersion"] = 1;
  document["deviceHardwareUid"] = DEVICE_HARDWARE_UID;
  document["bootId"] = bootId;
  document["sequence"] = sequence + 1;
  document["sentAt"] = sentAt;

  char payload[JSON_CAPACITY];
  const size_t length = serializeJson(document, payload, sizeof(payload));
  if (length == 0 || length >= sizeof(payload)) {
    Serial.println("Heartbeat serialization failed");
    return false;
  }

  const uint16_t result = mqttClient.publish(heartbeatTopic, 0, false, payload);
  if (result == 0) {
    Serial.println("Heartbeat publish could not be queued");
    return false;
  }

  ++sequence;
  Serial.print("Heartbeat published; sequence=");
  Serial.println(static_cast<unsigned long>(sequence));
  return true;
}

// Reserved for the next stage. This function is intentionally never called yet.
inline bool publishTelemetry(const char* sensorCode,
                             const char* measurementCode, double value,
                             const char* measuredAt) {
  if (!mqttClient.connected() || !ntpSynchronized) return false;

  JsonDocument document;
  document["schemaVersion"] = 1;
  document["deviceHardwareUid"] = DEVICE_HARDWARE_UID;
  document["bootId"] = bootId;
  document["sensorCode"] = sensorCode;
  document["measurementCode"] = measurementCode;
  document["value"] = value;
  document["measuredAt"] = measuredAt;
  document["sequence"] = sequence + 1;

  char payload[JSON_CAPACITY];
  const size_t length = serializeJson(document, payload, sizeof(payload));
  if (length == 0 || length >= sizeof(payload)) return false;

  // espMqttClient returns a real MQTT packet ID for QoS 1, or zero on failure.
  const uint16_t packetId = mqttClient.publish(telemetryTopic, 1, false, payload);
  if (packetId == 0) return false;
  ++sequence;
  return true;
}

inline void onMqttConnect(bool sessionPresent) {
  (void)sessionPresent;
  mqttBackoffMs = INITIAL_BACKOFF_MS;
  mqttAttempted = false;
  heartbeatPublished = false;
  Serial.println("MQTT connected");
  const uint16_t packetId = mqttClient.publish(statusTopic, 1, true, "online");
  if (packetId == 0) Serial.println("MQTT online status publish failed");
}

inline void onMqttDisconnect(espMqttClientTypes::DisconnectReason reason) {
  (void)reason;
  Serial.println("MQTT disconnected");
}

inline void configureMqtt() {
  mqttClient.setServer(MQTT_HOST, MQTT_PORT)
      .setClientId(MQTT_CLIENT_ID)
      .setCredentials(MQTT_USERNAME, MQTT_PASSWORD)
      .setCleanSession(true)
      .setKeepAlive(20)
      .setWill(statusTopic, 1, true, "offline")
      .onConnect(onMqttConnect)
      .onDisconnect(onMqttDisconnect);
#if MQTT_USE_TLS
#if defined(ESP32)
  mqttClient.setCACert(MQTT_ROOT_CA);
#else
  mqttClient.setTrustAnchors(&mqttTrustAnchor);
#endif
#endif
}

inline void maintainWifi(uint32_t now) {
  const wl_status_t currentStatus = WiFi.status();
  if (currentStatus != previousWifiStatus) {
    if (currentStatus == WL_CONNECTED) {
      Serial.println("WiFi connected");
      wifiBackoffMs = INITIAL_BACKOFF_MS;
      wifiAttempted = false;
      ntpRequested = false;
      requestNtp();
    } else if (previousWifiStatus == WL_CONNECTED) {
      Serial.println("WiFi disconnected");
      ntpRequested = false;
      if (!mqttClient.disconnected()) mqttClient.disconnect(true);
    }
    previousWifiStatus = currentStatus;
  }

  if (currentStatus == WL_CONNECTED) return;
  if (wifiAttempted && !elapsed(now, lastWifiAttemptAt, wifiBackoffMs)) return;

  Serial.println("WiFi connection attempt");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWifiAttemptAt = now;
  wifiAttempted = true;
  wifiBackoffMs = nextBackoff(wifiBackoffMs);
}

inline void maintainMqtt(uint32_t now) {
  if (WiFi.status() != WL_CONNECTED || mqttClient.connected()) return;
  if (!mqttClient.disconnected()) return;
  if (mqttAttempted && !elapsed(now, lastMqttAttemptAt, mqttBackoffMs)) return;

  Serial.println("MQTT connection attempt");
  const bool started = mqttClient.connect();
  lastMqttAttemptAt = now;
  mqttAttempted = true;
  mqttBackoffMs = nextBackoff(mqttBackoffMs);
  if (!started) Serial.println("MQTT connection attempt could not start");
}

inline void maintainHeartbeat(uint32_t now) {
  if (!mqttClient.connected()) return;
  if (!ntpSynchronized) {
    if (elapsed(now, lastHeartbeatAttemptAt, PUBLISH_RETRY_MS)) {
      Serial.println("Heartbeat waiting for NTP synchronization");
      lastHeartbeatAttemptAt = now;
    }
    return;
  }

  const uint32_t interval = heartbeatPublished ? HEARTBEAT_INTERVAL_MS
                                                : PUBLISH_RETRY_MS;
  if (heartbeatPublished && !elapsed(now, lastHeartbeatAttemptAt, interval)) return;
  if (!heartbeatPublished && lastHeartbeatAttemptAt != 0 &&
      !elapsed(now, lastHeartbeatAttemptAt, interval)) return;

  lastHeartbeatAttemptAt = now;
  if (publishHeartbeat()) heartbeatPublished = true;
}

inline void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("Incubadora Neonatal IoT firmware starting");
  WiFi.mode(WIFI_STA);
  buildTopics();
  generateBootId();
  configureMqtt();
  maintainWifi(millis());
}

inline void loop() {
  const uint32_t now = millis();
  maintainWifi(now);
  if (WiFi.status() == WL_CONNECTED) {
    requestNtp();
    updateNtpState();
    maintainMqtt(now);
    maintainHeartbeat(now);
  }
#if defined(ESP8266)
  mqttClient.loop();
#endif
  yield();
}

}  // namespace iot
