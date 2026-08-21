#pragma once

#define MQTT_USE_TLS 0

constexpr char WIFI_SSID[] = "YOUR_WIFI_SSID";
constexpr char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";

constexpr char DEVICE_HARDWARE_UID[] = "ABC123";
constexpr char MQTT_CLIENT_ID[] = "device-ABC123";
constexpr char MQTT_USERNAME[] = "device-ABC123";
constexpr char MQTT_PASSWORD[] = "GENERATE_A_UNIQUE_STRONG_PASSWORD";
constexpr char MQTT_HOST[] = "broker.example.local";
constexpr uint16_t MQTT_PORT = 1883;

// Public Root CA only. Required when MQTT_USE_TLS is 1.
constexpr char MQTT_ROOT_CA[] = R"EOF(
-----BEGIN CERTIFICATE-----
PASTE_PUBLIC_ROOT_CA_HERE
-----END CERTIFICATE-----
)EOF";
