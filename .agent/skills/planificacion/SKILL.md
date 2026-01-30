---
name: planificacion
description: "Genera un plan de implementación detallado paso a paso. Úsese cuando ya se tienen requisitos claros o un diseño aprobado."
---

# Planificación de Implementación

## Cuándo usar esta skill

- Cuando se tiene una especificación o diseño claro (output de `brainstorming`).
- Antes de comenzar a escribir código para una tarea de varios pasos.
- Para documentar cómo se abordará una solución técnica compleja.

## Flujo de trabajo

1.  **Contexto**: Se asume que el ejecutor (tú o un subagente) tiene poco contexto. Sé explícito.
2.  **Granularidad**: Divide el trabajo en "Bocados" (Tareas de 2-5 minutos).
    - Escribir el test que falla.
    - Ejecutarlo para confirmar fallo.
    - Implementar código mínimo.
    - Verificar que pase.
    - Commit.
3.  **Documentación**: Guarda el plan en `docs/plans/YYYY-MM-DD-<nombre-feature>.md`.

## Estructura del Plan (Plantilla)

Cada plan DEBE comenzar con este encabezado y seguir la estructura:

````markdown
# Plan de Implementación: [Nombre del Feature]

**Objetivo:** [Una frase describiendo qué se construye]
**Arquitectura:** [2-3 frases sobre el enfoque]
**Tech Stack:** [Tecnologías clave]

---

### Tarea N: [Nombre del Componente/Paso]

**Archivos:**

- Crear: `ruta/exacta/archivo.ts`
- Modificar: `ruta/exacta/existente.ts`
- Test: `ruta/exacta/test.ts`

**Paso 1: Escribir test que falla**

```python
// Código del test
```
````

**Paso 2: Verificar fallo**
Comando: `npm test ...`
Esperado: FAIL

**Paso 3: Implementación mínima**

```python
// Código de implementación
```

**Paso 4: Verificar éxito**
Comando: `npm test ...`
Esperado: PASS

**Paso 5: Commit**

```bash
git add ...
git commit -m "feat: descripción"
```

```

## Principios Clave
- **Rutas exactas**: Siempre usa rutas relativas completas desde la raíz.
- **Código completo**: No pongas "agregar validación", pon el código exacto.
- **Comandos exactos**: Incluye comandos de terminal completos.
- **TDD / YAGNI / DRY**: Mantén esos principios en cada paso.

## Entrega
Una vez guardado el plan:
- Preguntar al usuario: "¿Procedemos con la ejecución paso a paso?"
```
