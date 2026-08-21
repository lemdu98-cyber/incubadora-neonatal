#if !defined(ESP32)
#error "Select an ESP32 board in Arduino IDE."
#endif

#include "secrets.h"
#include "../common/IoTFirmware.h"

void setup() { iot::setup(); }

void loop() { iot::loop(); }
