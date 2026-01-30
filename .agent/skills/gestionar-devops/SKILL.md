---
name: gestionar-devops
description: Herramienta integral DevOps para CI/CD, automatización de infraestructura, dockerización y plataformas cloud. Incluye configuración de pipelines, gestión de despliegues y mejores prácticas de seguridad.
---

# Gestionar DevOps

Kit de herramientas completo para DevOps nivel senior con herramientas modernas y mejores prácticas, enfocado en Docker, CI/CD y automatización (especialmente útil para Freqtrade/Python).

## Quick Start

### Main Capabilities

Esta skill proporciona capacidades principales a través de scripts automatizados:

```bash
# Script 1: Pipeline Generator (Genera flujos de GitHub Actions)
python .agent/skills/gestionar-devops/scripts/pipeline_generator.py [options]

# Script 2: Deployment Manager (Gestión de Docker/Update)
python .agent/skills/gestionar-devops/scripts/deployment_manager.py [options]
```

## Core Capabilities

### 1. Pipeline Generator

Herramienta automatizada para crear workflows de CI/CD robustos.

**Features:**

- Scaffolding automático de `.github/workflows`.
- Integración de linters (Black, Flake8).
- Configuración de tests automáticos.
- Builds de Docker.

**Usage:**

```bash
python .agent/skills/gestionar-devops/scripts/pipeline_generator.py --type freqtrade
```

### 2. Deployment Manager

Herramienta de gestión de despliegues y ciclo de vida de contenedores.

**Features:**

- Rolling updates seguros.
- Verificación de salud (Healthchecks).
- Gestión de logs y limpieza.

**Usage:**

```bash
python .agent/skills/gestionar-devops/scripts/deployment_manager.py --deploy
```

## Reference Documentation

### CI/CD Pipeline Guide

Guía completa disponible en `references/cicd_pipeline_guide.md`:

- Patrones de GitHub Actions.
- Estrategias de testing automatizado.
- Cacheo de dependencias (pip, docker layers).
- Secret management.

### Deployment Strategies

Guía técnica en `references/deployment_strategies.md`:

- Docker Compose Best Practices.
- Seguridad en VPS (SSH hardening, UFW).
- Monitoreo de recursos.
- Estrategias de Rollback.

## Tech Stack

**Languages:** Python, Bash
**Containerization:** Docker, Docker Compose
**CI/CD:** GitHub Actions
**Infrastructure:** Linux VPS (Ubuntu/Debian), Cloud (AWS/GCP - opcional)

## Development Workflow

### 1. Setup and Configuration

```bash
# Verificar instalación de Docker
docker --version
docker-compose --version
```

### 2. Generate CI/CD

```bash
# Generar pipeline básico
python .agent/skills/gestionar-devops/scripts/pipeline_generator.py
```

### 3. Implement Best Practices

Sigue los patrones documentados en:

- `references/cicd_pipeline_guide.md`
- `references/deployment_strategies.md`

## Best Practices Summary

### Infrastructure

- **Immutable Infrastructure**: Prefiere reconstruir contenedores a modificarlos en vivo.
- **Infrastructure as Code**: Todo (incluyendo config de docker) debe estar en git.

### Security

- Nunca comitees `.env` o secretos.
- Usa imágenes de Docker oficiales y específicas (no `latest`).
- Ejecuta contenedores con el menor privilegio posible.

### Observability

- Centraliza logs cuando sea posible.
- Configura alertas para caídas de contenedores.

## Resources

- Pattern Reference: `references/cicd_pipeline_guide.md`
- Technical Guide: `references/deployment_strategies.md`
- Scripts: `scripts/` directory
