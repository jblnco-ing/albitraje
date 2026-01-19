import asyncio
import os
import zmq
import zmq.asyncio
import orjson  # Faster json parsing
import redis.asyncio as redis
from colorama import Fore, Style, init
import logging
import time

# Init colors
init()

# Setup Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Sniper")

# --- Configuración ---
ZMQ_SRC_HOST = os.getenv("ZMQ_SRC_HOST", "localhost")
ZMQ_SRC_PORT = os.getenv("ZMQ_SRC_PORT", "5555")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

# Umbral de beneficio mínimo (0.5%)
SPREAD_THRESHOLD = 0

# Estado del sistema (In-Memory Order Book)
# Almacenaremos solo el mejor Bid y Ask: {'binance': {'bid': 0, 'ask': 0}, 'kraken': ...}
ORDER_BOOK = {}


async def process_message(msg: bytes, rc: redis.Redis):
    """
    Procesa un mensaje del ingestor, actualiza el estado y busca arbitraje.
    """
    try:
        # 1. Parseo ultra-rapido
        data = orjson.loads(msg)
        exchange = data["exchange"]

        # 2. Actualizar Libro de Ordenes en memoria
        if exchange not in ORDER_BOOK:
            ORDER_BOOK[exchange] = {}

        ORDER_BOOK[exchange] = {"bid": data["bid"], "ask": data["ask"]}

        # 3. Verificar Oportunidades de Arbitraje
        # Necesitamos al menos 2 exchanges con datos
        exchanges = list(ORDER_BOOK.keys())
        if len(exchanges) < 2:
            return

        # Comparamos el exchange actual contra todos los demás
        current_bid = data["bid"]
        current_ask = data["ask"]

        for other_exchange in exchanges:
            if other_exchange == exchange:
                continue

            other_data = ORDER_BOOK[other_exchange]

            # CASO A: Comprar en OTRO, Vender en ACTUAL
            # Spread = (Bid_Actual - Ask_Otro) / Ask_Otro
            if "ask" in other_data and other_data["ask"] > 0:
                spread_a = ((current_bid - other_data["ask"]) / other_data["ask"]) * 100
                # logger.info(
                #     f"Spread {other_exchange.upper()} -> {exchange.upper()}: {spread_a:.4f}%"
                # )

                if spread_a > SPREAD_THRESHOLD:
                    await execute_arbitrage(
                        buy_ex=other_exchange,
                        buy_price=other_data["ask"],
                        sell_ex=exchange,
                        sell_price=current_bid,
                        spread=spread_a,
                        entry_timestamp=data["timestamp"],
                        redis_client=rc,
                    )

            # CASO B: Comprar en ACTUAL, Vender en OTRO
            # Spread = (Bid_Otro - Ask_Actual) / Ask_Actual
            if "bid" in other_data and other_data["bid"] > 0:
                spread_b = ((other_data["bid"] - current_ask) / current_ask) * 100
                # logger.info(
                #     f"Spread {exchange.upper()} -> {other_exchange.upper()}: {spread_b:.4f}%"
                # )

                if spread_b > SPREAD_THRESHOLD:
                    await execute_arbitrage(
                        buy_ex=exchange,
                        buy_price=current_ask,
                        sell_ex=other_exchange,
                        sell_price=other_data["bid"],
                        spread=spread_b,
                        entry_timestamp=data["timestamp"],
                        redis_client=rc,
                    )

    except Exception as e:
        print(f"Error processing: {e}")


async def execute_arbitrage(
    buy_ex, buy_price, sell_ex, sell_price, spread, entry_timestamp, redis_client
):
    finish_time = time.time() * 1000
    latency_ms = round(finish_time - entry_timestamp, 3)

    signal = {
        "type": "ARBITRAGE_FOUND",
        "buy_exchange": buy_ex,
        "buy_price": buy_price,
        "sell_exchange": sell_ex,
        "sell_price": sell_price,
        "spread_percentage": round(spread, 3),
        "internal_latency_ms": latency_ms,
        "timestamp": asyncio.get_running_loop().time(),
    }

    # Log visual de alta prioridad
    msg = (
        f"{Fore.GREEN}============ ARBITRAJE DETECTADO ============\n"
        f"LATENCIA INTERNA: {signal['internal_latency_ms']}ms\n"
        f"SPREAD: {signal['spread_percentage']}%\n"
        f"COMPRAR en {buy_ex} a {buy_price}\n"
        f"VENDER  en {sell_ex} a {sell_price}\n"
        f"============================================={Style.RESET_ALL}"
    )
    print(msg)

    # Publicar en Redis (Persistencia + Notificación UI)
    await redis_client.publish("ARB_SIGNALS", orjson.dumps(signal))


async def main():
    # 0. Configurar uvloop (Solo si es posible, Linux/Docker)
    try:
        import uvloop

        uvloop.install()
        print(f"{Fore.CYAN}🚀 uvloop activado para máxima velocidad{Style.RESET_ALL}")
    except ImportError:
        print(
            f"{Fore.YELLOW}⚠️ uvloop no encontrado (¿windows?). Usando selector por defecto.{Style.RESET_ALL}"
        )

    print(f"🔗 Conectando a ZeroMQ PULL en tcp://{ZMQ_SRC_HOST}:{ZMQ_SRC_PORT}")
    print(f"💾 Conectando a Redis en {REDIS_HOST}")

    # 1. Setup ZeroMQ
    ctx = zmq.asyncio.Context()
    sock = ctx.socket(zmq.PULL)
    sock.connect(f"tcp://{ZMQ_SRC_HOST}:{ZMQ_SRC_PORT}")

    # 2. Setup Redis
    rc = redis.Redis(host=REDIS_HOST, port=6379, db=0)

    # 3. Main Loop
    while True:
        msg = await sock.recv()
        # No usamos 'await' en process_message para no bloquear el siguiente receive?
        # En Python asyncio es single-thread, asi que 'await' cede control.
        # process_message es muy rapido (CPU bound + Redis async write).
        # Para max performance podriamos usar asyncio.create_task(process_message(...))
        # "Fire and forget" logica para no detener el consumo del socket.
        asyncio.create_task(process_message(msg, rc))


if __name__ == "__main__":
    asyncio.run(main())
