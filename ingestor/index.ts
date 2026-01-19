import { Push } from "zeromq";
import { pro } from "ccxt";
import { createClient } from "redis";
import { Server } from "socket.io";
import http from "http";

// --- Interfaces ---
interface ArbitrageTicker {
  exchange: string;
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

interface ArbitrageSignal {
  buy_exchange: string;
  buy_price: number;
  sell_exchange: string;
  sell_price: number;
  spread_percentage: number;
  internal_latency_ms: number;
  timestamp: number;
}

// --- Configuración ---
const ZMQ_PORT = process.env.ZMQ_PORT || 5555;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const DASHBOARD_PORT = 3000;

const SYMBOL = "BTC/USDT";

// --- Cola de Mensajes para ZeroMQ ---
// Evita el error "Socket is busy writing" al serializar los envíos
const zmqQueue: string[] = [];
let isProcessingQueue = false;

async function processZmqQueue(zmqSocket: Push) {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (zmqQueue.length > 0) {
    const msg = zmqQueue.shift();
    if (msg) {
      try {
        await zmqSocket.send(msg);
      } catch (err: any) {
        console.error("⚠️ Error enviando a ZeroMQ:", err.message);
        // Si falla, lo devolvemos al principio de la cola para no perderlo
        zmqQueue.unshift(msg);
        await new Promise((resolve) => setTimeout(resolve, 10)); // Breve pausa
      }
    }
  }
  isProcessingQueue = false;
}

async function startExchangeStream(exchangeId: string, zmqSocket: Push) {
  console.log(`🔌 Iniciando stream para ${exchangeId}...`);

  const exchangeClass = (pro as any)[exchangeId];
  if (!exchangeClass) {
    throw new Error(`Exchange ${exchangeId} no encontrado en CCXT Pro`);
  }

  const exchange = new exchangeClass({
    enableRateLimit: true,
    newUpdates: true,
  });

  while (true) {
    try {
      const ticker = await exchange.watchTicker(SYMBOL);
      const arrivalTime = Date.now();

      const payload: ArbitrageTicker = {
        exchange: exchangeId,
        symbol: SYMBOL,
        bid: parseFloat(ticker.bid),
        ask: parseFloat(ticker.ask),
        timestamp: arrivalTime,
      };

      // En lugar de enviar directo, encolamos
      zmqQueue.push(JSON.stringify(payload));
      processZmqQueue(zmqSocket); // Disparamos el procesador de cola (no bloqueante aquí)
    } catch (e: any) {
      console.error(`❌ Error en conexión con ${exchangeId}:`, e.message);

      // Intentamos cerrar la conexión limpiamente antes de reintentar
      try {
        await exchange.close();
      } catch (closeError) {
        // Ignorar error al cerrar
      }

      console.log(
        `🔄 Reintentando conexión con ${exchangeId} en 5 segundos...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function run() {
  console.log("🚀 Iniciando Ingestor (TypeScript Edition)...");

  // 1. ZeroMQ
  const socket = new Push();
  await socket.bind(`tcp://*:${ZMQ_PORT}`);
  console.log(`📡 ZeroMQ PUSH listo en puerto ${ZMQ_PORT}`);

  // 2. Dashboard (Socket.io)
  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  server.listen(DASHBOARD_PORT, () =>
    console.log(`📊 Dashboard Socket.io en puerto ${DASHBOARD_PORT}`),
  );

  // 3. Loopback Redis -> UI
  const subscriber = createClient({ url: `redis://${REDIS_HOST}:6379` });
  subscriber.on("error", (err) => console.log("Redis error", err));
  await subscriber.connect();

  await subscriber.subscribe("ARB_SIGNALS", (msg: string) => {
    const signal: ArbitrageSignal = JSON.parse(msg);
    io.emit("arbitrage_signal", signal);
  });

  // 4. Lanzar Streams
  Promise.all([
    startExchangeStream("binance", socket),
    startExchangeStream("coinbase", socket),
  ]).catch((err) => {
    console.error("🔥 Error fatal en streams:", err);
  });
}

run().catch(console.error);
