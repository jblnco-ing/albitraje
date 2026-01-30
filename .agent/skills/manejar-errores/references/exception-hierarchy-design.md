# Diseño de Jerarquía de Excepciones

Una jerarquía de excepciones bien diseñada es fundamental para un manejo de errores limpio y mantenible. Permite capturar categorías amplias de errores mientras se conserva la capacidad de manejar casos específicos de manera única.

## Principios de Diseño

1.  **Excepción Base Común**: Todas las excepciones personalizadas deben heredar de una clase base propia del proyecto (ej. `AppError` o `DomainError`), no directamente de la clase error base del lenguaje (como `Exception` en Python o `Error` en JS) si es posible evitarlo para lógica de dominio. Esto permite capturar "todos los errores de MI aplicación" sin capturar errores inesperados del sistema (como `SystemExit` o `MemoryError`).

2.  **Agrupación Semántica**: Agrupa los errores por su naturaleza semántica, no por el módulo técnico donde ocurren.
    - _Incorrecto_: `DatabaseConnectionError`, `DatabaseQueryError`, `DatabaseTimeoutError`.
    - _Correcto_: `InfrastructureError` (padre de los anteriores), `DomainError` (reglas de negocio), `ValidationError` (entradas).

3.  **Granularidad**: Define nuevas excepciones solo cuando quien las "atrapa" (el caller) necesite tomar una acción diferente. Si tres errores distintos resultan en el mismo log y el mismo mensaje al usuario, probablemente deberían ser la misma clase de excepción (quizás con diferentes mensajes o códigos internos).

## Estructura Recomendada

Una jerarquía típica de tres niveles:

### Nivel 1: La Base

La raíz de todos los problemas conocidos de la aplicación.

- Debe contener metadatos comunes: Timestamp, ID de correlación (trace ID), contexto de usuario.

### Nivel 2: Categorías Funcionales

- **`ValidationError`**: El cliente envió datos malformados. (HTTP 400). Recuperable por el usuario.
- **`AuthorizationError`**: El usuario sabe quién es, pero no tiene permiso. (HTTP 403). Recuperable por configuración.
- **`NotFoundError`**: Recurso no existente. (HTTP 404).
- **`BusinessRuleError`**: Operación válida técnicamente, pero viola una regla de negocio (ej. "No hay suficiente saldo").
- **`InfrastructureError`**: Falló la base de datos, el disco está lleno, API externa caída. (HTTP 500/503). Generalmente transitorio o fatal.

### Nivel 3: Errores Específicos (Solo si es necesario)

- `InsufficientFundsError` (Hereda de `BusinessRuleError`).
- `UserNotFoundError` (Hereda de `NotFoundError`).

## Ejemplo en Python

```python
class AppError(Exception):
    """Base para errores lógicos de la aplicación."""
    def __init__(self, message, original_exception=None):
        super().__init__(message)
        self.original_exception = original_exception

class RecoverableError(AppError):
    """Errores donde el usuario puede intentar de nuevo o corregir su entrada."""
    pass

class FatalError(AppError):
    """Errores del sistema interna que requieren intervención de admin."""
    pass

# --- Ramas Funcionales ---

class DomainError(RecoverableError):
    """Violación de reglas de negocio."""
    pass

class InfrastructureError(FatalError):
    """Fallo en servicios externos o hardware."""
    pass
```

## Ejemplo en JavaScript/TypeScript

```typescript
class AppError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean; // True = error esperado, False = bug

  constructor(message: string, code: string, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", true);
  }
}

class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, "DB_ERROR", false); // Generalmente no es culpa del usuario
  }
}
```

## Anti-patrones a Evitar

- **Excepciones Genéricas con Strings Mágicos**: `throw new Exception("User not found")`. Es difícil de testear y de atrapar específicamente.
- **Jerarquías Profundas**: Más de 3 o 4 niveles de herencia suelen añadir complejidad innecesaria.
- **Usar Excepciones para Control de Flujo**: No uses excepciones para indicar que una búsqueda no arrojó resultados (retorna `null` o lista vacía). Usa excepciones para cuando _algo salió mal_.
