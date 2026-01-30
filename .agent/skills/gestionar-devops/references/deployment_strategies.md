# Deployment Strategies

## Docker Compose Best Practices para Producción

### 1. Estructura de Archivos

Mantén una separación clara entre configuración de código y configuración de entorno.

```
/
├── docker-compose.yml       # Definición de servicios
├── docker-compose.prod.yml  # Overrides para producción (restart policies, puertos)
├── .env                     # Secretos y variables (NO EN GIT)
└── user_data/              # Datos persistentes
```

### 2. Gestión de Logs

Evita que Docker llene tu disco duro. Configura rotación de logs en `docker-compose.yml` o globalmente.

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Healthchecks

Asegura que tu contenedor se reinicie si la aplicación se congela.

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 1m30s
  timeout: 10s
  retries: 3
```

## Seguridad en VPS

### SSH Hardening

1.  Desactiva login con root (`PermitRootLogin no`).
2.  Desactiva autenticación por contraseña (`PasswordAuthentication no`).
3.  Usa claves SSH Ed25519.

### Firewall (UFW)

Solo abre lo estrictamente necesario.

```bash
ufw allow ssh
# Si usas FreqUI
ufw allow 8080/tcp
ufw enable
```

## Estrategia de Actualización (Zero Downtime / Minimal Downtime)

Para bots de trading:

1.  **Stop Safe**: Asegúrate de que el bot no esté en medio de una operación crítica (o acepta que gestionará el estado al reiniciar).
2.  **Pull**: Descarga la nueva imagen `docker-compose pull`.
3.  **Up**: Recrea el contenedor `docker-compose up -d --force-recreate --build`.
4.  **Prune**: Limpia imágenes viejas `docker image prune -f`.
