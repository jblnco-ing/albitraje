# Plan de Implementación: The Arbitrage Sniper

## Objetivo

Sistema de arbitraje de alta frecuencia simulado usando Node.js, Python (uvloop), ZeroMQ y Redis.

## Fases de Desarrollo

### Fase 1: Infraestructura y Configuración (Docker)

- [ ] Crear estructura de directorios (`ingestor`, `engine`, `web`).
- [ ] Configurar `docker-compose.yml`.
  - Servicio `ingestor`: Node.js Alpine.
  - Servicio `engine`: Python Slim (con compiladores para uvloop).
  - Servicio `redis`: Alpine.
- [ ] Configurar redes para comunicación ZeroMQ directa.

### Fase 2: Ingestor (Node.js)

- [ ] Inicializar proyecto (`package.json` con `zeromq`, `ws`).
- [ ] Implementar conexión WebSocket a **Binance** (BTC/USDT).
- [ ] Implementar conexión WebSocket a **Kraken** (XBT/USDT).
- [ ] Normalización de datos: Unificar formato `{ exchange: 'binance', symbol: 'BTC/USDT', bid: 90000, ask: 90001, timestamp: ... }`.
- [ ] Configurar ZeroMQ PUSH socket.
- [ ] Enviar datos normalizados al motor.

### Fase 3: Quant Engine (Python)

- [ ] Inicializar entorno (`pyproject.toml` vía `uv`: `pyzmq`, `uvloop`, `redis`, `orjson` para parsing rápido).
- [ ] Implementar `asyncio` loop con política `uvloop`.
- [ ] Configurar ZeroMQ PULL socket.
- [ ] Crear estructura de datos en memoria (Diccionario simple para BBO: Best Bid/Offer).
- [ ] Lógica de Arbitraje:
  - Calcular Spread: `((Bid_Ex1 - Ask_Ex2) / Ask_Ex2) * 100`.
  - Verificar umbral (> 0.5%).
- [ ] Disparar alerta simulada.
- [ ] Publicar evento en Redis (Pub/Sub) para el dashboard.

### Fase 4: Dashboard y Validación

- [ ] Ingestor escucha Redis Pub/Sub y emite por Socket.io (Opcional/Bono).
- [ ] Validación de latencia (logs de timestamp de entrada vs ejecución).
