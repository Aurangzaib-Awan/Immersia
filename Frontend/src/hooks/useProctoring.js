import { useState, useRef, useEffect, useCallback } from 'react';

const useProctoring = (options = {}) => {
    const {
        url = 'ws://localhost:8000/ws/proctor',  // Now connects to main backend!
        onAlert = () => { },
        onResult = () => { },
        frameRate = 5,
    } = options;

    const [isProctoring, setIsProctoring] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [behaviorStatus, setBehaviorStatus] = useState('Not started');
    const [devicesDetected, setDevicesDetected] = useState([]);
    const [visualization, setVisualization] = useState('');
    const [stats, setStats] = useState({
        numFaces: 0,
        gazeH: 0,
        gazeV: 0,
        ear: 0,
        processingTime: 0,
        fps: 0
    });

    const wsRef = useRef(null);
    const intervalRef = useRef(null);

    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('Proctoring WebSocket connected');
            setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) {
                    console.error('Proctoring server error:', data.error);
                    return;
                }

                if (data.behavior_status) setBehaviorStatus(data.behavior_status);
                if (data.devices_detected) setDevicesDetected(data.devices_detected);
                if (data.viz) setVisualization(data.viz);
                if (data.details) {
                    setStats({
                        numFaces: data.details.num_faces || 0,
                        gazeH: data.details.gaze_horizontal || 0,
                        gazeV: data.details.gaze_vertical || 0,
                        ear: data.details.ear || 0,
                        processingTime: data.details.processing_time_ms || 0,
                        fps: data.details.fps || 0
                    });
                }

                if (data.alert && data.alert !== 'none') {
                    onAlert(data);
                }

                onResult(data);
            } catch (error) {
                console.error('Error parsing proctoring message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('Proctoring WebSocket error:', error);
            setConnectionStatus('error');
        };

        ws.onclose = () => {
            console.log('Proctoring WebSocket disconnected');
            setConnectionStatus('disconnected');
        };

        wsRef.current = ws;
    }, [url, onAlert, onResult]);

    const sendFrame = useCallback((frameData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                frame: frameData,
                timestamp: Date.now()
            }));
        }
    }, []);

    const startProctoring = useCallback(() => {
        setIsProctoring(true);
        connectWebSocket();
    }, [connectWebSocket]);

    const stopProctoring = useCallback(() => {
        setIsProctoring(false);
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setConnectionStatus('disconnected');
        setBehaviorStatus('Stopped');
        setVisualization('');
    }, []);

    useEffect(() => {
        return () => stopProctoring();
    }, [stopProctoring]);

    return {
        isProctoring,
        connectionStatus,
        behaviorStatus,
        devicesDetected,
        visualization,
        stats,
        startProctoring,
        stopProctoring,
        sendFrame
    };
};

export default useProctoring;
