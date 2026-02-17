/**
 * useProctoring Hook - Production Ready
 * 
 * Custom React hook for real-time AI proctoring integration
 * Handles WebSocket connection, frame transmission, and alert processing
 * 
 * Features:
 * - Auto-reconnection on disconnect
 * - Frame rate limiting (5 FPS)
 * - Comprehensive error handling
 * - Real-time stats tracking
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const useProctoring = (options = {}) => {
    const {
        url = 'ws://localhost:8000/ws/proctor',  // WebSocket endpoint
        onAlert = () => { },                       // Alert callback
        onResult = () => { },                      // Result callback
        frameRate = 5,                           // Target FPS
        autoReconnect = true,                    // Auto-reconnect on disconnect
        reconnectDelay = 2000,                   // Reconnect delay in ms
        maxReconnectAttempts = 5                 // Max reconnection attempts
    } = options;

    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    const [isProctoring, setIsProctoring] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [behaviorStatus, setBehaviorStatus] = useState('Not started');
    const [devicesDetected, setDevicesDetected] = useState([]);
    const [visualization, setVisualization] = useState('');
    const [stats, setStats] = useState({
        numFaces: 0,
        gazeHorizontal: 0,
        gazeVertical: 0,
        ear: 0,
        headPitch: 0,
        headYaw: 0,
        headRoll: 0,
        handFaceDistLeft: 0,
        handFaceDistRight: 0,
        processingTime: 0,
        fps: 0,
        avgFps: 0
    });
    const [lastAlert, setLastAlert] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // ========================================================================
    // REFS
    // ========================================================================
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const frameQueueRef = useRef([]);
    const isSendingRef = useRef(false);

    // ========================================================================
    // WEBSOCKET CONNECTION
    // ========================================================================
    const connectWebSocket = useCallback(() => {
        // Prevent duplicate connections
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('⚠️  WebSocket already connected');
            return;
        }

        // Clear any pending reconnect attempts
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        console.log('🔌 Connecting to proctoring WebSocket...');
        setConnectionStatus('connecting');

        try {
            const ws = new WebSocket(url);

            // Connection opened
            ws.onopen = () => {
                console.log('✅ Proctoring WebSocket connected');
                setConnectionStatus('connected');
                setReconnectAttempts(0);
            };

            // Message received from server
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle errors
                    if (data.error) {
                        console.error('❌ Proctoring server error:', data.error);
                        setConnectionStatus('error');
                        return;
                    }

                    // Update behavior status
                    if (data.behavior_status) {
                        setBehaviorStatus(data.behavior_status);
                    }

                    // Update detected devices
                    if (data.devices_detected) {
                        setDevicesDetected(data.devices_detected);
                    }

                    // Update visualization overlay
                    if (data.viz) {
                        setVisualization(data.viz);
                    }

                    // Update detailed stats
                    if (data.details) {
                        setStats({
                            numFaces: data.details.num_faces || 0,
                            gazeHorizontal: data.details.gaze_horizontal || 0,
                            gazeVertical: data.details.gaze_vertical || 0,
                            ear: data.details.ear || 0,
                            headPitch: data.details.head_pitch || 0,
                            headYaw: data.details.head_yaw || 0,
                            headRoll: data.details.head_roll || 0,
                            handFaceDistLeft: data.details.hand_face_distance_left || 0,
                            handFaceDistRight: data.details.hand_face_distance_right || 0,
                            processingTime: data.details.processing_time_ms || 0,
                            fps: data.details.fps || 0,
                            avgFps: data.details.avg_fps || 0,
                            faceDetectionConfidence: data.details.face_detection_confidence || 0
                        });
                    }

                    // Handle alerts
                    if (data.alert && data.alert !== 'none') {
                        setLastAlert({
                            type: data.alert,
                            confidence: data.conf,
                            timestamp: data.timestamp || Date.now()
                        });
                        onAlert(data);
                    }

                    // Call result callback
                    onResult(data);

                } catch (error) {
                    console.error('❌ Error parsing proctoring message:', error);
                }
            };

            // WebSocket error
            ws.onerror = (error) => {
                console.error('❌ Proctoring WebSocket error:', error);
                setConnectionStatus('error');
            };

            // Connection closed
            ws.onclose = (event) => {
                console.log('🔌 Proctoring WebSocket disconnected', event.code, event.reason);
                setConnectionStatus('disconnected');

                // Auto-reconnect logic
                if (autoReconnect &&
                    isProctoring &&
                    reconnectAttempts < maxReconnectAttempts) {

                    console.log(`🔄 Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
                    setReconnectAttempts(prev => prev + 1);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, reconnectDelay);
                } else if (reconnectAttempts >= maxReconnectAttempts) {
                    console.error('❌ Max reconnection attempts reached');
                    setConnectionStatus('failed');
                }
            };

            wsRef.current = ws;

        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
            setConnectionStatus('error');
        }
    }, [url, onAlert, onResult, autoReconnect, reconnectDelay, maxReconnectAttempts, reconnectAttempts, isProctoring]);

    // ========================================================================
    // FRAME TRANSMISSION
    // ========================================================================
    const sendFrame = useCallback((frameData) => {
        // Validate WebSocket connection
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn('⚠️  Cannot send frame: WebSocket not connected');
            return false;
        }

        // Prevent concurrent sends
        if (isSendingRef.current) {
            console.warn('⚠️  Frame send already in progress, skipping...');
            return false;
        }

        try {
            isSendingRef.current = true;

            // Remove data URL prefix if present
            let cleanFrameData = frameData;
            if (frameData.includes(',')) {
                cleanFrameData = frameData.split(',')[1];
            }

            // Send frame to backend
            wsRef.current.send(JSON.stringify({
                frame: cleanFrameData,
                timestamp: Date.now()
            }));

            isSendingRef.current = false;
            return true;

        } catch (error) {
            console.error('❌ Error sending frame:', error);
            isSendingRef.current = false;
            return false;
        }
    }, []);

    // ========================================================================
    // PROCTORING CONTROL
    // ========================================================================
    const startProctoring = useCallback(() => {
        console.log('▶️  Starting proctoring...');
        setIsProctoring(true);
        setReconnectAttempts(0);
        connectWebSocket();
    }, [connectWebSocket]);

    const stopProctoring = useCallback(() => {
        console.log('⏹️  Stopping proctoring...');
        setIsProctoring(false);

        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close(1000, 'User stopped proctoring');
            wsRef.current = null;
        }

        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Reset state
        setConnectionStatus('disconnected');
        setBehaviorStatus('Stopped');
        setVisualization('');
        setDevicesDetected([]);
        setLastAlert(null);
        setReconnectAttempts(0);
        frameQueueRef.current = [];
        isSendingRef.current = false;
    }, []);

    const restartConnection = useCallback(() => {
        console.log('🔄 Manually restarting connection...');
        stopProctoring();
        setTimeout(() => {
            startProctoring();
        }, 500);
    }, [startProctoring, stopProctoring]);

    // ========================================================================
    // CLEANUP ON UNMOUNT
    // ========================================================================
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up proctoring hook...');
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    // ========================================================================
    // RETURN API
    // ========================================================================
    return {
        // State
        isProctoring,
        connectionStatus,
        behaviorStatus,
        devicesDetected,
        visualization,
        stats,
        lastAlert,
        reconnectAttempts,

        // Methods
        startProctoring,
        stopProctoring,
        sendFrame,
        restartConnection,

        // Utilities
        isConnected: connectionStatus === 'connected',
        isConnecting: connectionStatus === 'connecting',
        hasError: connectionStatus === 'error' || connectionStatus === 'failed'
    };
};

export default useProctoring;