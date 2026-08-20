# Seguridad MQTT

`hardwareUid` identifica; no autentica. Cada ESP recibe username, contraseña y ClientId propios administrados en EMQX. NestJS usa una credencial de servicio distinta. No se almacenan contraseñas MQTT en Device ni en PostgreSQL.

Formato recomendado de ClientId:

```text
device-{hardwareUid}
incubadora-backend-{environment}
```

Para el Device `ABC123`, la autorización EMQX debe permitir únicamente:

```text
PUB incubadora/devices/ABC123/telemetry
PUB incubadora/devices/ABC123/heartbeat
```

Debe denegar otros PUB y cualquier SUB. El backend sólo recibe SUB sobre los dos patrones con `+` y no necesita PUB. La asociación credencial→Device se materializa en la ACL específica creada durante el provisionamiento manual: crear Device en la aplicación, crear credencial única en EMQX, aplicar ACL a su hardware UID y grabarla en el ESP.

La defensa contra suplantación combina credenciales por Device, ACL, topic, comparación topic/payload y lookup de Device. Cambiar el JSON no permite publicar como otro Device si EMQX está configurado correctamente.

Desarrollo local controlado puede usar `mqtt://`; producción o tráfico por Internet exige `mqtts://` con validación TLS. Nunca usar `rejectUnauthorized: false`. El navegador no se conecta a EMQX. Los logs omiten passwords y payloads completos; mensajes inválidos no se persisten ni detienen el consumidor.
