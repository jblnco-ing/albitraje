# CI/CD Pipeline Guide

## Principios Fundamentales

1.  **Fail Fast**: El pipeline debe fallar lo antes posible si hay errores (linting, syntax) antes de intentar builds pesados.
2.  **Idempotencia**: Ejecutar el pipeline dos veces con el mismo código debe producir el mismo resultado.
3.  **Segregación de Ambientes**: Separa lógica de `develop` (testing) de `main` (producción).

## Estructura Recomendada (GitHub Actions)

### 1. Linting & Static Analysis

Siempre el primer paso. No gastes recursos de CPU compilando código sucio.

```yaml
- name: Lint
  run: flake8 .
```

### 2. Unit Testing

Ejecuta tests que no requieran infraestructura externa (base de datos real). Para Freqtrade, esto incluye backtests de muestra.

### 3. Docker Build

Construye la imagen solo si los tests pasan.

```yaml
- name: Build and Push
  uses: docker/build-push-action@v4
  with:
    push: true
    tags: user/app:latest
```

## Secret Management

- **NUNCA** hardcodees tokens o claves en `.yml`.
- Usa `Running Actions > Secrets` en GitHub.
- Inyéctalos como variables de entorno:

  ```yaml
  env:
    API_KEY: ${{ secrets.PROD_API_KEY }}
  ```

## Caching Strategy

Para acelerar builds en Python/Freqtrade:

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```
