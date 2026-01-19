import { Push } from 'zeromq';
import {pro} from 'ccxt';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import http from 'http';

// --- Configuración ---
const ZMQ_PORT = process.env.ZMQ_PORT || 5555;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const DASHBOARD_PORT = 3000;

// Mapeo de Símbolos
const SYMBOL = 'BTC/USDT';

async function startExchangeStream(exchangeId, zmqSocket) {
    console.log(`🔌 Iniciando stream para ${exchangeId}...`);
    
    // Instanciamos el exchange dinámicamente
    // En ESM ccxt.pro sigue siendo accesible desde el default export
    const exchangeClass = pro[exchangeId];
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
            const arrivalTime = Date.now(); // T1: Registro de entrada

            const payload = {
                exchange: exchangeId,
                symbol: 'BTC/USDT',
                bid: parseFloat(ticker.bid),
                ask: parseFloat(ticker.ask),
                timestamp: arrivalTime
            };

            console.log(`📥 [${exchangeId}] Bid: ${payload.bid} | Ask: ${payload.ask}`);
            await zmqSocket.send(JSON.stringify(payload));

        } catch (e) {
            console.error(`❌ Error en ${exchangeId}:`, e.message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function run() {
    console.log('🚀 Iniciando Ingestor (ESM Version)...');

    // 1. Configurar ZeroMQ
    const socket = new Push();
    await socket.bind(`tcp://*:${ZMQ_PORT}`);
    console.log(`📡 ZeroMQ PUSH listo en puerto ${ZMQ_PORT}`);

    // 2. Configurar Dashboard (Socket.io)
    const server = http.createServer();
    const io = new Server(server, { cors: { origin: "*" } });
    server.listen(DASHBOARD_PORT, () => console.log(`📊 Dashboard en puerto ${DASHBOARD_PORT}`));

    // 3. Loopback Redis -> UI
    const subscriber = createClient({ url: `redis://${REDIS_HOST}:6379` });
    subscriber.on('error', err => console.log('Redis error', err));
    await subscriber.connect();
    
    await subscriber.subscribe('ARB_SIGNALS', (msg) => {
        const signal = JSON.parse(msg);
        console.log(`🤑 ARBITRAJE: ${signal.spread_percentage}% [${signal.buy_exchange} -> ${signal.sell_exchange}]`);
        io.emit('arbitrage_signal', signal);
    });

    // 4. Lanzar Streams
    Promise.all([
        startExchangeStream('binance', socket),
        startExchangeStream('coinbase', socket)
    ]).catch(err => {
        console.error("🔥 Error fatal en streams:", err);
    });
}

run().catch(console.error);
