import React from 'react';
import { AlertTriangle, User, Eye, ShieldCheck, Monitor, ShieldX } from 'lucide-react';

const ProctorStats = ({ stats, behaviorStatus, chances, devicesDetected, connectionStatus, violationLogs = [], gazeViolationDuration = 0 }) => {
    const isCritical = behaviorStatus.toLowerCase().includes('multiple') ||
        behaviorStatus.toLowerCase().includes('person') ||
        devicesDetected.length > 0;

    const isGazeAlert = behaviorStatus.toLowerCase().includes('away') ||
        behaviorStatus.toLowerCase().includes('down');

    return (
        <div className="flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
            {/* Remaining Chances */}
            <div className="p-4 bg-surface-800 border border-gray-700 rounded-xl shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Integrity Score</h3>
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${i < chances
                                    ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                                    : 'bg-red-500/20 border-red-500 text-red-500'
                                    }`}
                            >
                                {i < chances ? <ShieldCheck className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${chances === 1 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {chances}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/ 3</span>
                    </div>
                </div>
            </div>

            {/* Strict Status Indicators */}
            <div className="grid grid-cols-1 gap-3">
                {/* Behavior Status */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${isCritical ? 'bg-red-500/10 border-red-500 animate-pulse' :
                    isGazeAlert ? 'bg-yellow-500/10 border-yellow-500/50' :
                        'bg-surface-800 border-gray-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-red-500' : isGazeAlert ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <h3 className="text-[10px] uppercase font-bold text-gray-400">Live Behavior Status</h3>
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-tight ${isCritical ? 'text-red-500' : isGazeAlert ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                        {behaviorStatus}
                    </div>
                </div>

                {/* Gadget Status */}
                {devicesDetected.length > 0 && (
                    <div className="p-4 bg-red-900/20 border border-red-500 rounded-xl animate-bounce">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-4 h-4 text-red-500" />
                            <h3 className="text-[10px] uppercase font-bold text-red-500 font-mono">CRITICAL: GADGET DETECTED</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {devicesDetected.map((d, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-800">
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black">Faces</span>
                    </div>
                    <div className={`text-base font-black ${stats.numFaces !== 1 ? 'text-red-500' : 'text-white'}`}>
                        {stats.numFaces}
                    </div>
                </div>
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black">Gaze H/V</span>
                    </div>
                    <div className={`text-xs font-black ${Math.abs(stats.gazeHorizontal) > 15 || Math.abs(stats.gazeVertical) > 15 ? 'text-yellow-500' : 'text-white'}`}>
                        {stats.gazeHorizontal > 0 ? '→' : stats.gazeHorizontal < 0 ? '←' : '•'}{Math.abs(stats.gazeHorizontal).toFixed(0)}° / {stats.gazeVertical > 0 ? '↓' : stats.gazeVertical < 0 ? '↑' : '•'}{Math.abs(stats.gazeVertical).toFixed(0)}°
                    </div>
                </div>
            </div>

            {/* Violation History - NEW */}
            <div className="flex-1 min-h-[200px] flex flex-col">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                    <span>Violation Logs</span>
                    <span className="text-red-500/50">{violationLogs.length} DEPLETED</span>
                </h3>
                <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {violationLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-700 opacity-50 border-2 border-dashed border-gray-800 rounded-xl">
                            <ShieldCheck className="w-8 h-8 mb-2" />
                            <p className="text-[10px] uppercase font-bold">No Violations Yet</p>
                        </div>
                    ) : (
                        violationLogs.map((log, i) => (
                            <div key={i} className="p-3 bg-gray-900/60 border-l-2 border-red-600 rounded-r-lg flex flex-col gap-1 animate-in slide-in-from-right-2 duration-200">
                                <div className="flex justify-between items-center text-[9px] font-mono text-gray-600">
                                    <span>{log.time}</span>
                                    <span className="text-red-500/80 font-bold uppercase tracking-tighter">INTEGRITY -1</span>
                                </div>
                                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">
                                    {log.type.replace(/_/g, ' ')}
                                </div>
                                {log.behavior && (
                                    <div className="text-[9px] text-gray-600 italic leading-none truncate">
                                        {log.behavior}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Connection Indicator */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'
                        }`} />
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                        AI ENGINE: {connectionStatus}
                    </span>
                </div>
                <span className="text-[9px] font-mono text-gray-700">{stats.fps} FPS</span>
            </div>
        </div>
    );
};

export default ProctorStats;
