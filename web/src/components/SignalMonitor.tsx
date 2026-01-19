import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ArbitrageSignal {
  buy_exchange: string;
  buy_price: number;
  sell_exchange: string;
  sell_price: number;
  spread_percentage: number;
  internal_latency_ms: number;
  timestamp: number;
}

const SignalMonitor: React.FC = () => {
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000");

    socket.on("connect", () => {
      setStatus("SYSTEM ONLINE");
      // Sonido de inicio (opcional, necesita interacción usuario)
    });
    socket.on("disconnect", () => setStatus("OFFLINE"));

    socket.on("arbitrage_signal", (signal: ArbitrageSignal) => {
      setSignals((prev) => [signal, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getLatencyColor = (ms: number) => {
    if (ms < 1.5) return "text-cyan-400 border-cyan-500/50 shadow-cyan-500/20";
    if (ms < 3.0) return "text-blue-400 border-blue-500/50 shadow-blue-500/20";
    return "text-amber-400 border-amber-500/50 shadow-amber-500/20";
  };

  return (
    <div className="w-full font-mono text-sm relative">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-sm ${status.includes("ONLINE") ? "bg-cyan-500 animate-pulse" : "bg-red-500"}`}
          ></div>
          <span className="text-xs text-cyan-600/80 tracking-[0.2em] font-bold">
            {status}
          </span>
        </div>
        <div className="text-[10px] text-zinc-600 tracking-widest">
          P_ID: {Math.floor(Math.random() * 9999)} // MEM: OK
        </div>
      </div>

      {/* LIVE FEED GRID */}
      <div className="grid gap-4 relative">
        {/* Línea vertical decorativa */}
        <div className="absolute left-[-20px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent hidden md:block"></div>

        {signals.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 backdrop-blur-sm">
            <div className="animate-pulse text-cyan-500/50 text-4xl mb-4">
              ◉
            </div>
            <p className="text-zinc-500 tracking-[0.3em] text-xs">
              AWAITING MARKET DATA STREAMS...
            </p>
          </div>
        ) : (
          signals.map((sig, idx) => {
            const isNew = idx === 0;
            const latencyStyle = getLatencyColor(sig.internal_latency_ms);

            return (
              <div
                key={`${sig.timestamp}-${idx}`}
                className={`
                                    relative group overflow-hidden
                                    bg-[#0a0a0b]/80 backdrop-blur-md
                                    border hover:border-cyan-500/40 transition-all duration-300
                                    ${isNew ? "border-cyan-400/60 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] translate-y-0 scale-[1.01]" : "border-zinc-800/60 opacity-80 scale-100"}
                                    clip-path-card
                                `}
              >
                {/* Scanline overlay en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:animate-scan"></div>

                <div className="flex flex-col md:flex-row justify-between items-center p-5 gap-4">
                  {/* IZQUIERDA: Timestamp & Ruta */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-[10px] text-zinc-500 font-bold tracking-wider">
                      {
                        new Date(sig.timestamp * 1000)
                          .toLocaleTimeString()
                          .split(" ")[0]
                      }
                      <span className="text-[9px] text-zinc-700 ml-1">
                        .{Math.floor((sig.timestamp * 1000) % 1000)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded border border-zinc-800">
                      <span className="text-xs font-bold text-zinc-300 tracking-wider">
                        {sig.buy_exchange.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-cyan-600">➜</span>
                      <span className="text-xs font-bold text-zinc-300 tracking-wider">
                        {sig.sell_exchange.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* CENTRO: Spread Gigante */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`text-3xl md:text-4xl font-black tabular-nums tracking-tighter ${
                        sig.spread_percentage > 0.5
                          ? "text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.4)]"
                          : "text-cyan-400"
                      }`}
                    >
                      {sig.spread_percentage.toFixed(3)}%
                    </div>
                  </div>

                  {/* DERECHA: Métricas Técnicas */}
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    {/* Latency Meter */}
                    <div
                      className={`flex items-center gap-2 px-2 py-1 rounded border ${latencyStyle.replace("text-", "border-").split(" ")[1]} bg-black/40`}
                    >
                      <span className="text-[9px] uppercase text-zinc-500 font-bold">
                        LATENCY
                      </span>
                      <span
                        className={`text-xs font-bold ${latencyStyle.split(" ")[0]}`}
                      >
                        {sig.internal_latency_ms}ms
                      </span>
                    </div>

                    {/* Prices */}
                    <div className="text-[10px] text-zinc-500 font-mono mt-1 text-right">
                      <div className="flex justify-end gap-2">
                        <span>BUY:</span>{" "}
                        <span className="text-zinc-300">
                          ${sig.buy_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <span>SELL:</span>{" "}
                        <span className="text-zinc-300">
                          ${sig.sell_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decoración de esquina */}
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-2 h-2 border-t border-r border-cyan-500/50"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-1">
                  <div className="w-2 h-2 border-b border-l border-cyan-500/50"></div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-scan {
                    animation: scan 1.5s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
};

export default SignalMonitor;
