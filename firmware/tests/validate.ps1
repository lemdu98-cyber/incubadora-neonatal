$ErrorActionPreference = 'Stop'

$firmwareRoot = Split-Path -Parent $PSScriptRoot
$commonFile = Join-Path $firmwareRoot 'common/IoTFirmware.h'
$gitIgnoreFile = Join-Path (Split-Path -Parent $firmwareRoot) '.gitignore'
$source = Get-Content -Raw -LiteralPath $commonFile
$gitIgnore = Get-Content -Raw -LiteralPath $gitIgnoreFile

$required = @(
  'incubadora/devices/%s/heartbeat',
  'incubadora/devices/%s/telemetry',
  'incubadora/devices/%s/status',
  'mqttClient.publish(heartbeatTopic, 0, false, payload)',
  'mqttClient.publish(telemetryTopic, 1, false, payload)',
  'setWill(statusTopic, 1, true, "offline")',
  'configTime(0, 0,',
  'HEARTBEAT_INTERVAL_MS = 30000UL'
)

foreach ($value in $required) {
  if (-not $source.Contains($value)) {
    throw "Firmware contract missing: $value"
  }
}

$forbidden = @(
  '#include <DHT',
  'MAX30100',
  'MAX30205',
  'setInsecure(',
  'delay(30000)',
  'MQTT_PASSWORD);',
  'patientId',
  'patientName',
  'medicalRecordNumber',
  'guardian',
  'admissionId'
)

foreach ($value in $forbidden) {
  if ($source.Contains($value)) {
    throw "Forbidden firmware content found: $value"
  }
}

if (-not $gitIgnore.Contains('firmware/**/secrets.h')) {
  throw 'firmware secrets.h is not ignored'
}

$realSecrets = Get-ChildItem -LiteralPath $firmwareRoot -Recurse -Filter 'secrets.h'
if ($realSecrets.Count -gt 0) {
  throw 'A real secrets.h exists in the firmware tree'
}

$telemetryCalls = ([regex]::Matches($source, 'publishTelemetry\s*\(')).Count
if ($telemetryCalls -ne 1) {
  throw 'publishTelemetry must only have its declaration and must not be called'
}

Write-Output 'Firmware static contract validation passed.'
