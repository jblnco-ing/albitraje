# Guía de Mensajes de Error

Los mensajes de error son una interfaz de usuario crítica. Un mal mensaje genera frustración y tickets de soporte; un buen mensaje empodera al usuario para solucionar el problema.

## Anatomía de un Mensaje Perfecto

Un mensaje de error debe responder tres preguntas:

1.  **¿Qué pasó?** (El problema).
2.  **¿Por qué pasó?** (La causa, en lenguaje humano).
3.  **¿Qué puedo hacer ahora?** (La solución o siguiente paso).

### Ejemplo Malo vs Bueno

- ❌ `Error 500: TransactionFailedException`
- ❌ `Fallo al guardar.`
- ✅ `No pudimos procesar tu pago (Error del Banco). Por favor revisa que tengas fondos suficientes o intenta con otra tarjeta.`

## Reglas para Desarrolladores

### 1. Seguridad Primero: No filtres información sensible

Nunca expongas detalles de la infraestructura al usuario final.

- _Malo_: "SQL syntax error near 'WHERE id = 5' at line 1" (Revela estructura de DB, riesgo de inyección).
- _Bueno_: "Error interno del servidor. ID de referencia: #8329a" (El desarrollador busca el ID en los logs).

### 2. Diferencia las Audiencias

- **Logs (Backend)**: Máximo detalle técnico. Stack traces, valores de variables, queries SQL.
- **Respuesta API (Frontend)**: Código de error legible por máquina (`payment_declined `) y mensaje seguro.
- **UI (Usuario Final)**: Mensaje amigable, localizado y accionable.

### 3. Evita el "Culpabilizar" al Usuario

Usa voz pasiva o neutra cuando sea posible, o asume responsabilidad compartida.

- _Agresivo_: "Has introducido un email inválido".
- _Amigable_: "Este email no parece tener el formato correcto. ¿Falta una @?".

### 4. Códigos de Error Estándar

Define un catálogo de códigos de error para que el frontend pueda reaccionar programáticamente (mostrar un modal, redirigir, resaltar un campo).

| Código               | Significado                | Acción UI Sugerida                  |
| :------------------- | :------------------------- | :---------------------------------- |
| `AUTH_EXPIRED`       | El token JWT caducó        | Redirigir a Login                   |
| `INSUFFICIENT_FUNDS` | Saldo insuficiente         | Mostrar botón de recarga            |
| `RESOURCE_LOCKED`    | Otro usuario está editando | Deshabilitar inputs o mostrar aviso |

## Plantilla para Logs (Structured Logging)

Para el equipo de desarrollo, el log debe ser JSON para ser indexable.

```json
{
  "level": "ERROR",
  "timestamp": "2023-10-27T10:00:00Z",
  "message": "Fallo conexión a Stripe",
  "context": {
    "user_id": "u_12345",
    "transaction_id": "tx_9876",
    "attempt": 3
  },
  "error": {
    "type": "ConnectionTimeout",
    "stack": "..."
  }
}
```

## Resumen de Tono de Voz

- **Conciso**: Ve al grano.
- **Humasno**: Habla como una persona, no como un robot.
- **Constructivo**: Siempre sugiere una salida.
