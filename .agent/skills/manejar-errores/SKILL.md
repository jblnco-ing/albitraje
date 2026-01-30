---
name: manejar-errores
description: Guía y patrones para implementar estrategias robustas de manejo de errores, depuración y resiliencia en aplicaciones (Python, TS, Rust, Go).
---

# Patrones de Manejo de Errores

Construye aplicaciones resilientes con estrategias robustas de manejo de errores que gestionen los fallos con elegancia y proporcionen excelentes experiencias de depuración.

## Cuándo Usar Esta Skill

- Implementar manejo de errores en nuevas funcionalidades
- Diseñar APIs resilientes a errores
- Depurar problemas en producción
- Mejorar la fiabilidad de la aplicación
- Crear mejores mensajes de error para usuarios y desarrolladores
- Implementar patrones de reintento (retry) y cortocircuito (circuit breaker)
- Manejar errores asíncronos/concurrentes
- Construir sistemas distribuidos tolerantes a fallos

## Conceptos Centrales

### 1. Filosofías de Manejo de Errores

**Excepciones vs Tipos Result (Result Types):**

- **Excepciones:** El tradicional `try-catch`, interrumpe el flujo de control.
- **Tipos Result:** Éxito/Fallo explícito, enfoque funcional.
- **Códigos de Error:** Estilo C, requiere mucha disciplina.
- **Tipos Option/Maybe:** Para valores que pueden ser nulos.

**Cuándo Usar Cada Uno:**

- **Excepciones:** Errores inesperados, condiciones excepcionales.
- **Tipos Result:** Errores esperados, fallos de validación.
- **Panics/Crashes:** Errores irrecuperables, bugs de programación.

### 2. Categorías de Errores

**Errores Recuperables:**

- Timeouts de red
- Archivos faltantes (si no son vitales)
- Entrada de usuario inválida
- Límites de tasa de API (Rate limits)

**Errores Irrecuperables:**

- Memoria agotada (Out of memory)
- Desbordamiento de pila (Stack overflow)
- Bugs de programación (punteros nulos, lógica rota)

---

## Patrones Específicos por Lenguaje

### Manejo de Errores en Python

**Jerarquía de Excepciones Personalizada:**

```python
class ApplicationError(Exception):
    """Excepción base para todos los errores de la aplicación."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    """Se lanza cuando falla la validación."""
    pass

class NotFoundError(ApplicationError):
    """Se lanza cuando no se encuentra el recurso."""
    pass

class ExternalServiceError(ApplicationError):
    """Se lanza cuando falla un servicio externo."""
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service

# Uso
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(
            f"Usuario no encontrado",
            code="USER_NOT_FOUND",
            details={"user_id": user_id}
        )
    return user
```

**Context Managers para Limpieza:**

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Asegura que la transacción se confirme (commit) o se revierta (rollback)."""
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()

# Uso
with database_transaction(db.session) as session:
    user = User(name="Alice")
    session.add(user)
    # Commit o rollback automático
```

**Reintento con Backoff Exponencial:**

```python
import time
from functools import wraps
from typing import TypeVar, Callable

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Decorador de reintento con backoff exponencial."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        sleep_time = backoff_factor ** attempt
                        time.sleep(sleep_time)
                        continue
                    raise
            raise last_exception
        return wrapper
    return decorator

# Uso
@retry(max_attempts=3, exceptions=(NetworkError,))
def fetch_data(url: str) -> dict:
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return response.json()
```

### Manejo de Errores en TypeScript/JavaScript

**Clases de Error Personalizadas:**

```typescript
// Clases de error personalizadas
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} no encontrado`, "NOT_FOUND", 404, { resource, id });
  }
}

// Uso
function getUser(id: string): User {
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw new NotFoundError("Usuario", id);
  }
  return user;
}
```

**Patrón Result Type (Tipo Resultado):**

```typescript
// Tipo Result para manejo explícito de errores
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Funciones auxiliares
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Uso
function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    const value = JSON.parse(json) as T;
    return Ok(value);
  } catch (error) {
    return Err(error as SyntaxError);
  }
}

// Consumiendo el Result
const result = parseJSON<User>(userJson);
if (result.ok) {
  console.log(result.value.name);
} else {
  console.error("Fallo al analizar:", result.error.message);
}
```

**Manejo de Errores Asíncronos:**

```typescript
// Async/await con manejo adecuado
async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    return orders;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return []; // Retornar array vacío si no se encuentra
    }
    if (error instanceof NetworkError) {
      // Lógica de reintento
      return retryFetchOrders(userId);
    }
    // Re-lanzar errores inesperados
    throw error;
  }
}
```

### Manejo de Errores en Rust

**Tipos Result y Option:**

```rust
use std::fs::File;
use std::io::{self, Read};

// Tipo Result para operaciones que pueden fallar
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // El operador ? propaga errores
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Tipos de error personalizados
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
    NotFound(String),
    Validation(String),
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::Io(error)
    }
}

// Combinando Option y Result
fn get_user_age(id: &str) -> Result<u32, AppError> {
    find_user(id)
        .ok_or_else(|| AppError::NotFound(id.to_string()))
        .map(|user| user.age)
}
```

### Manejo de Errores en Go

**Retornos de Error Explícitos:**

```go
// Manejo básico
func getUser(id string) (*User, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, fmt.Errorf("fallo al consultar usuario: %w", err)
    }
    if user == nil {
        return nil, errors.New("usuario no encontrado")
    }
    return user, nil
}

// Errores centinela (Sentinel errors) para comparación
var (
    ErrNotFound     = errors.New("no encontrado")
    ErrUnauthorized = errors.New("no autorizado")
)

// Verificación de errores
user, err := getUser("123")
if err != nil {
    if errors.Is(err, ErrNotFound) {
        // Manejar no encontrado
    } else {
        // Manejar otros errores
    }
}
```

## Patrones Universales

### Patrón 1: Circuit Breaker (Cortocircuito)

Evita fallos en cascada en sistemas distribuidos. Si un servicio falla repetidamente, deja de llamarlo temporalmente.

**Python**

```python
class CircuitState(Enum):
    CLOSED = "closed"       # Operación normal
    OPEN = "open"          # Fallando, rechazar peticiones
    HALF_OPEN = "half_open"  # Probando si se recuperó
```

(La lógica es universal: cuenta fallos -> abre circuito -> espera timeout -> prueba de nuevo).

### Patrón 2: Error Aggregation (Agregación de Errores)

Recolecta múltiples errores en lugar de fallar en el primero (muy útil en formularios).

**TypeScript**

```typescript
// Ejemplo conceptual
if (errors.hasErrors()) {
  // Lanza un solo error que contiene la lista de todos los fallos
  errors.throw();
}
```

### Patrón 3: Graceful Degradation (Degradación Elegante)

Provee funcionalidad de respaldo (fallback) cuando ocurren errores.

**Python**

```python
def get_user_profile(user_id: str) -> UserProfile:
    return with_fallback(
        primary=lambda: fetch_from_cache(user_id), # Intenta caché primero
        fallback=lambda: fetch_from_database(user_id) # Si falla, ve a la DB
    )
```

## Mejores Prácticas (Best Practices)

1. **Fail Fast (Falla Rápido):** Valida las entradas al principio.
2. **Preserva el Contexto:** Incluye stack traces, metadatos y timestamps.
3. **Mensajes Significativos:** Explica qué pasó y cómo arreglarlo.
4. **Loguea Apropiadamente:** Error real = log; fallo esperado = no llenes los logs de basura.
5. **Limpia Recursos:** Usa try-finally o context managers para cerrar archivos/conexiones.
6. **No "Tragues" Errores:** Nunca uses un catch vacío. Loguéalo o relánzalo.

## Errores Comunes (Pitfalls)

- **Catching Too Broadly:** `except Exception` esconde bugs reales.
- **Empty Catch Blocks:** Silenciar errores hace imposible la depuración.
- **Logging and Re-throwing:** Crea entradas de log duplicadas (ruido).
- **Not Cleaning Up:** Olvidar cerrar archivos o conexiones a DB.
- **Códigos de Error:** Evita retornar -1 o `false`; usa Excepciones o tipos Result.

## Recursos

- `references/exception-hierarchy-design.md`: Diseño de jerarquías.
- `references/error-recovery-strategies.md`: Estrategias de recuperación.
- `assets/error-message-guide.md`: Guía para escribir mensajes de error útiles.
