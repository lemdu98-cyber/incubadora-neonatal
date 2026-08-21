#if !defined(ESP8266)
#error "Select an ESP8266 board in Arduino IDE."
#endif

#include "secrets.h"
#include "../common/IoTFirmware.h"

void setup() { iot::setup(); }

void loop() { iot::loop(); }
