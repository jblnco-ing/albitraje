# Estrategias de Recuperación de Errores

No basta con capturar el error; el sistema debe intentar recuperarse o fallar de manera segura. Este documento detalla estrategias para restaurar la estabilidad del sistema tras un fallo.

## 1. Patrón de Reintento (Retry)

Útil para errores transitorios (red, timeouts, bloqueos temporales de DB).

### Claves de Implementación

- **Backoff Exponencial**: No reintentes inmediatamente. Espera `base * (factor ^ intento)`. Ej: 1s, 2s, 4s, 8s.
- **Jitter (Aleatoriedad)**: Añade un pequeño tiempo aleatorio para evitar que todos los clientes reintenten exactamente al mismo tiempo y colapsen el servidor de nuevo (problema de "thundering herd").
- **Límites**: Siempre define un `max_retries`. Nunca reintentes infinitamente.
- **Idempotencia**: Asegúrate de que reintentar la operación es seguro. Reintentar un pago sin un ID de idempotencia puede resultar en cobros dobles.

## 2. Circuit Breaker (Cortocircuito)

Protege al sistema de fallos en cascada cuando un servicio dependiente está caído.

### Estados

1.  **Cerrado (Closed)**: Todo funciona bien. Las peticiones pasan. Si hay fallos, se cuentan. Si superan un umbral, pasa a _Abierto_.
2.  **Abierto (Open)**: El servicio se considera caído. Las peticiones fallan _inmediatamente_ sin intentar conectar (fail fast). Tras un tiempo de espera (timeout), pasa a _Semi-Abierto_.
3.  **Semi-Abierto (Half-Open)**: Se permite pasar una cantidad limitada de peticiones de prueba. Si tienen éxito, el circuito se _Cierra_. Si fallan, vuelve a _Abierto_.

### Cuándo usarlo

- Llamadas a microservicios externos.
- Conexiones a bases de datos secundarias o caches.

## 3. Fallback (Respaldo)

Proporcionar una alternativa funcional, aunque degradada, cuando la operación principal falla.

### Ejemplos

- **Cache vs Live**: Si la petición a la API de precios falla, devuelve el último precio guardado en caché aunque tenga 5 minutos de antigüedad.
- **Valor por defecto**: Si falla la obtención de preferencias de usuario, carga una configuración predeterminada segura.
- **Cola de Mensajes**: Si el servicio de envío de emails está caído, guarda el mensaje en una cola (Kafka/RabbitMQ) para procesarlo cuando el servicio vuelva.

## 4. Transacciones Compensatorias (Saga Pattern)

En sistemas distribuidos donde no hay transacciones ACID globales, si un paso de un proceso falla, se deben ejecutar acciones para deshacer los pasos anteriores.

- _Paso 1_: Cobrar tarjeta -> Éxito.
- _Paso 2_: Reservar stock -> Fallo.
- _Acción_: Ejecutar transacción compensatoria "Reembolsar tarjeta".

## 5. Fail Fast & Crash Only

Para errores irrecuperables (estado corrupto, configuración inválida al inicio), lo mejor suele ser detener el proceso inmediatamente.

- Permite a los orquestadores (Kubernetes, Systemd) reiniciar el proceso desde un estado limpio.
- Evita que un proceso "zombi" siga atendiendo peticiones con datos corruptos.

## Matriz de Decisión

| Tipo de Error          | Estrategia Recomendada                     |
| :--------------------- | :----------------------------------------- |
| **Transitorio de Red** | Retry con Jitter + Backoff                 |
| **Servicio Caído**     | Circuit Breaker + Fallback                 |
| **Sobrecarga**         | Queue/Job System (procesamiento asíncrono) |
| **Bug de Lógica**      | Log + Fail Fast (no reintentar)            |
| **Datos Inválidos**    | Rechazar petición (Cliente debe corregir)  |
