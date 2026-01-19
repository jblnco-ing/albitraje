import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SignalMonitor = () => {
    const [signals, setSignals] = useState([]);
    const [status, setStatus] = useState('DESCONECTADO');
    const bottomRef = useRef(null);

    useEffect(() => {
        // Conectar al Ingestor (que expone el puerto 3000)
        // Nota: En Docker localhost del navegador apunta al host
        const socket = io('http://localhost:3000');

        socket.on('connect', () => setStatus('EN LÍNEA 🟢'));
        socket.on('disconnect', () => setStatus('DESCONECTADO 🔴'));

        socket.on('arbitrage_signal', (signal) => {
            // Añadir nueva señal al inicio
            setSignals(prev => [signal, ...prev].slice(0, 50)); // Mantener ultimas 50
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 font-mono text-sm">
            <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-2">
                <h2 className="text-xl text-green-400 font-bold tracking-widest uppercase">
                    Módulo de Intercepción <span className="animate-pulse">_v1.0</span>
                </h2>
                <div className="text-xs text-gray-400">
                    ESTADO: <span className={status.includes('EN') ? 'text-green-400' : 'text-red-500'}>{status}</span>
                </div>
            </div>

            {/* LIVE FEED */}
            <div className="space-y-2">
                {signals.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 italic">
                        Esperando anomalías de mercado...
                    </div>
                ) : (
                    signals.map((sig, idx) => (
                        <div 
                            key={sig.timestamp + idx}
                            className={`
                                relative overflow-hidden group
                                p-4 border border-green-900/50 bg-slate-900/50 rounded 
                                hover:border-green-500/50 transition-all duration-300
                                ${idx === 0 ? 'animate-in fade-in slide-in-from-top-4 duration-300 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : ''}
                            `}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500/20 group-hover:bg-green-500 transition-colors"></div>
                            
                            <div className="flex justify-between items-center">
                                {/* IZQUIERDA: Ruta */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500">{new Date(sig.timestamp * 1000).toLocaleTimeString()}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-400 font-bold">{sig.buy_exchange.toUpperCase()}</span>
                                        <span className="text-gray-600">➜</span>
                                        <span className="text-green-400 font-bold">{sig.sell_exchange.toUpperCase()}</span>
                                    </div>
                                </div>

                                {/* CENTRO: Precios */}
                                <div className="hidden md:block text-xs text-gray-400">
                                    COMPRA: <span className="text-white">${sig.buy_price}</span> | 
                                    VENTA: <span className="text-white">${sig.sell_price}</span>
                                </div>

                                {/* DERECHA: Ganancia */}
                                <div className="text-right">
                                    <div className="text-2xl font-black text-green-400 tabular-nums tracking-tighter">
                                        {sig.spread_percentage > 0 ? '+' : ''}{sig.spread_percentage}%
                                    </div>
                                    <div className="text-[10px] text-green-900 uppercase tracking-widest">Spread Neto</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default SignalMonitor;
