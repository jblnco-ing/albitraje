---
name: brainstorming
description: "Úsese ANTES de cualquier trabajo creativo, creación de features, componentes o modificación de comportamiento. Explora la intención del usuario, requisitos y diseño antes de la implementación."
---

# Lluvia de Ideas y Diseño

## Cuándo usar esta skill

- Cuando el usuario pide una nueva funcionalidad pero no hay un plan claro.
- Antes de escribir código para una nueva feature.
- Para clarificar requisitos ambiguos.

## Flujo de trabajo

1.  **Entender la Idea**:
    - Analizar el estado actual del proyecto (archivos, docs).
    - Hacer preguntas _una por una_ para refinar la idea.
    - Preferir preguntas de opción múltiple.
    - Enfocarse en propósito, restricciones y criterios de éxito.

2.  **Explorar Enfoques**:
    - Proponer 2-3 enfoques diferentes con sus compromisos (trade-offs).
    - Presentar opciones conversacionalmente con tu recomendación y razonamiento.

3.  **Presentar el Diseño**:
    - Una vez entendida la construcción, presentar el diseño.
    - Dividir en secciones de 200-300 palabras.
    - Preguntar después de cada sección si se ve bien.
    - Cubrir: arquitectura, componentes, flujo de datos, manejo de errores, testing.

## Instrucciones y Principios

- **Una pregunta a la vez**: No abrumes con múltiples preguntas.
- **Opción múltiple preferida**: Más fácil de responder que preguntas abiertas.
- **YAGNI implacable**: Eliminar funcionalidades innecesarias.
- **Validación incremental**: Presentar el diseño por partes y validar cada una.

## Salida Esperada

Una vez validado el diseño:

1.  Escribir el diseño validado en `docs/plans/YYYY-MM-DD-<tema>-design.md`.
2.  Preguntar: "¿Listo para configurar la implementación?".
3.  Si sí, sugerir usar la skill `planificacion`.
