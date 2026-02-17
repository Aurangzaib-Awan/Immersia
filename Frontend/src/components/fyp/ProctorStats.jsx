/**
 * ProctorStats Component - Production Ready
 * 
 * Real-time dashboard displaying proctoring statistics and alerts
 * 
 * Features:
 * - Integrity score visualization (3-strike system)
 * - Live behavior status with color coding
 * - Device detection alerts
 * - Detailed metrics grid
 * - Violation history log
 * - Connection status indicator
 * - FPS monitoring
 */

import React from 'react';
import {
    AlertTriangle,
    User,
    Eye,
    ShieldCheck,
    Monitor,
    ShieldX,
    Activity,
    Brain,
    Circle
} from 'lucide-react';

const ProctorStats = ({
    stats = {},
    behaviorStatus = 'Not started',
    chances = 3,
    devicesDetected = [],
    connectionStatus = 'disconnected',
    violationLogs = [],
    gazeViolationDuration = 0
}) => {
    // ========================================================================
    // STATUS CLASSIFICATION
    // ========================================================================

    // Critical alerts (immediate action)
    const isCritical =
        behaviorStatus.toLowerCase().includes('multiple') ||
        behaviorStatus.toLowerCase().includes('no person') ||
        devicesDetected.length > 0;

    // Warning alerts (attention needed)
    const isWarning =
        behaviorStatus.toLowerCase().includes('away') ||
        behaviorStatus.toLowerCase().includes('down') ||
        behaviorStatus.toLowerCase().includes('deviation');

    // Gaze-specific alert
    const isGazeAlert =
        behaviorStatus.toLowerCase().includes('away') ||
        behaviorStatus.toLowerCase().includes('looking');

    // ========================================================================
    // STATUS COLOR HELPERS
    // ========================================================================
    const getStatusColor = () => {
        if (isCritical) return 'red';
        if (isWarning) return 'yellow';
        return 'green';
    };

    const getChanceColor = (remainingChances) => {
        if (remainingChances === 3) return 'sky';
        if (remainingChances === 2) return 'yellow';
        return 'red';
    };

    const statusColor = getStatusColor();
    const chanceColor = getChanceColor(chances);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">

            {/* ================================================================ */}
            {/* INTEGRITY SCORE - 3 Strike System */}
            {/* ================================================================ */}
            <div className="p-4 bg-surface-800 border border-gray-700 rounded-xl shadow-lg">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Integrity Score
                </h3>
                <div className="flex items-center justify-between">
                    {/* Visual strike indicators */}
                    <div className="flex gap-1.5">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${i < chances
                                        ? `bg-${chanceColor}-500/20 border-${chanceColor}-500 text-${chanceColor}-400`
                                        : 'bg-red-500/20 border-red-500 text-red-500 opacity-40'
                                    }`}
                            >
                                {i < chances ? (
                                    <ShieldCheck className="w-5 h-5" />
                                ) : (
                                    <ShieldX className="w-5 h-5" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Numeric display */}
                    <div className="text-right">
                        <span className={`text-3xl font-black ${chances === 1 ? 'text-red-500 animate-pulse' :
                                chances === 2 ? 'text-yellow-500' :
                                    'text-white'
                            }`}>
                            {chances}
                        </span>
                        <span className="text-gray-600 text-sm font-bold ml-1">/ 3</span>
                    </div>
                </div>

                {/* Warning message when chances depleting */}
                {chances < 3 && (
                    <div className={`mt-3 pt-3 border-t border-gray-800 text-[10px] font-bold uppercase tracking-wider ${chances === 1 ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                        ⚠️ {chances === 1 ? 'Final warning' : `${3 - chances} violations detected`}
                    </div>
                )}
            </div>

            {/* ================================================================ */}
            {/* LIVE BEHAVIOR STATUS */}
            {/* ================================================================ */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${isCritical
                    ? 'bg-red-500/10 border-red-500 animate-pulse' :
                    isWarning
                        ? 'bg-yellow-500/10 border-yellow-500/50' :
                        'bg-surface-800 border-gray-700'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-red-500' :
                            isWarning ? 'text-yellow-500' :
                                'text-gray-500'
                        }`} />
                    <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.15em]">
                        Live Behavior Status
                    </h3>
                </div>
                <div className={`text-sm font-bold uppercase tracking-tight ${isCritical ? 'text-red-500' :
                        isWarning ? 'text-yellow-500' :
                            'text-green-500'
                    }`}>
                    {behaviorStatus}
                </div>

                {/* Gaze violation timer */}
                {isGazeAlert && gazeViolationDuration > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-yellow-500">
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span>Duration: {gazeViolationDuration.toFixed(1)}s</span>
                    </div>
                )}
            </div>

            {/* ================================================================ */}
            {/* DEVICE DETECTION ALERT */}
            {/* ================================================================ */}
            {devicesDetected.length > 0 && (
                <div className="p-4 bg-red-900/20 border-2 border-red-500 rounded-xl animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-red-500" />
                        <h3 className="text-[10px] uppercase font-black text-red-500 tracking-[0.15em]">
                            🚨 CRITICAL: DEVICE DETECTED
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {devicesDetected.map((device, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded uppercase shadow-md"
                            >
                                📱 {device}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* METRICS GRID */}
            {/* ================================================================ */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-800">
                {/* Face Count */}
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black tracking-wider">Faces</span>
                    </div>
                    <div className={`text-xl font-black ${stats.numFaces !== 1 ? 'text-red-500' : 'text-white'
                        }`}>
                        {stats.numFaces || 0}
                    </div>
                </div>

                {/* Gaze Direction */}
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black tracking-wider">Gaze H/V</span>
                    </div>
                    <div className={`text-xs font-black ${Math.abs(stats.gazeHorizontal || 0) > 15 || Math.abs(stats.gazeVertical || 0) > 15
                            ? 'text-yellow-500'
                            : 'text-white'
                        }`}>
                        {stats.gazeHorizontal > 0 ? '→' : stats.gazeHorizontal < 0 ? '←' : '•'}
                        {Math.abs(stats.gazeHorizontal || 0).toFixed(0)}° /
                        {stats.gazeVertical > 0 ? '↓' : stats.gazeVertical < 0 ? '↑' : '•'}
                        {Math.abs(stats.gazeVertical || 0).toFixed(0)}°
                    </div>
                </div>

                {/* Eye Aspect Ratio (Blink Detection) */}
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Circle className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black tracking-wider">Eye Open</span>
                    </div>
                    <div className={`text-xs font-black ${(stats.ear || 0) < 0.15 ? 'text-yellow-500' : 'text-white'
                        }`}>
                        {((stats.ear || 0) * 100).toFixed(0)}%
                    </div>
                </div>

                {/* Processing FPS */}
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Activity className="w-3 h-3" />
                        <span className="text-[9px] uppercase font-black tracking-wider">AI FPS</span>
                    </div>
                    <div className={`text-xs font-black ${(stats.fps || 0) < 3 ? 'text-yellow-500' : 'text-white'
                        }`}>
                        {(stats.fps || 0).toFixed(1)} FPS
                    </div>
                </div>
            </div>

            {/* ================================================================ */}
            {/* ADVANCED METRICS (Collapsible) */}
            {/* ================================================================ */}
            <details className="bg-gray-900/40 rounded-lg border border-gray-800">
                <summary className="p-3 cursor-pointer text-[10px] uppercase font-black text-gray-500 hover:text-gray-400 transition-colors tracking-[0.15em]">
                    <span>📊 Advanced Metrics</span>
                </summary>
                <div className="p-3 pt-0 space-y-2 text-[10px]">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Head Pitch:</span>
                        <span className="text-white font-mono">{(stats.headPitch || 0).toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Head Yaw:</span>
                        <span className="text-white font-mono">{(stats.headYaw || 0).toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Head Roll:</span>
                        <span className="text-white font-mono">{(stats.headRoll || 0).toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Hand-Face Dist (L):</span>
                        <span className="text-white font-mono">{(stats.handFaceDistLeft || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Hand-Face Dist (R):</span>
                        <span className="text-white font-mono">{(stats.handFaceDistRight || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="text-white font-mono">{(stats.processingTime || 0).toFixed(1)}ms</span>
                    </div>
                </div>
            </details>

            {/* ================================================================ */}
            {/* VIOLATION HISTORY LOG */}
            {/* ================================================================ */}
            <div className="flex-1 min-h-[200px] flex flex-col">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                    <span>📋 Violation Logs</span>
                    <span className={`${violationLogs.length > 0 ? 'text-red-500' : 'text-gray-700'
                        }`}>
                        {violationLogs.length} TOTAL
                    </span>
                </h3>

                <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                    {violationLogs.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-10 text-gray-700 opacity-50 border-2 border-dashed border-gray-800 rounded-xl">
                            <ShieldCheck className="w-8 h-8 mb-2" />
                            <p className="text-[10px] uppercase font-bold">No Violations Yet</p>
                            <p className="text-[8px] text-gray-800 mt-1">Keep up the good behavior!</p>
                        </div>
                    ) : (
                        // Violation entries
                        violationLogs.map((log, i) => (
                            <div
                                key={i}
                                className="p-3 bg-gray-900/60 border-l-4 border-red-600 rounded-r-lg flex flex-col gap-1 hover:bg-gray-900/80 transition-colors animate-in slide-in-from-right-2 duration-200"
                            >
                                {/* Timestamp and penalty */}
                                <div className="flex justify-between items-center text-[9px] font-mono text-gray-600">
                                    <span>🕒 {log.time}</span>
                                    <span className="text-red-500 font-bold uppercase tracking-tighter">
                                        INTEGRITY -1
                                    </span>
                                </div>

                                {/* Violation type */}
                                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">
                                    {log.type.replace(/_/g, ' ')}
                                </div>

                                {/* Behavior context (if available) */}
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

            {/* ================================================================ */}
            {/* CONNECTION STATUS & FPS */}
            {/* ================================================================ */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-800">
                {/* Connection indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${connectionStatus === 'connected'
                            ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                            : connectionStatus === 'connecting'
                                ? 'bg-yellow-500 animate-pulse'
                                : 'bg-red-500 animate-pulse'
                        }`} />
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-[0.15em]">
                        AI ENGINE: <span className={`${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'
                            }`}>{connectionStatus}</span>
                    </span>
                </div>

                {/* FPS counter */}
                <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-gray-700" />
                    <span className="text-[9px] font-mono text-gray-700">
                        {(stats.fps || 0).toFixed(1)} FPS
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProctorStats;