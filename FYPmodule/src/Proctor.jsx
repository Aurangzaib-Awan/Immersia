import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Proctor.css';

const Proctor = () => {
  const [isProctoring, setIsProctoring] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [behaviorStatus, setBehaviorStatus] = useState('Not started');
  const [devicesDetected, setDevicesDetected] = useState([]);
  const [stats, setStats] = useState({
    numFaces: 0,
    gazeH: 0,
    gazeV: 0,
    ear: 0,
    processingTime: 0
  });
  const [quizPaused, setQuizPaused] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const alertHistoryRef = useRef([]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/proctor');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          console.error('Server error:', data.error);
          return;
        }

        // Update behavior status
        if (data.behavior_status) {
          setBehaviorStatus(data.behavior_status);
        }

        // Update devices detected
        if (data.devices_detected) {
          setDevicesDetected(data.devices_detected);
        }

        // Update stats
        if (data.details) {
          setStats({
            numFaces: data.details.num_faces || 0,
            gazeH: data.details.gaze_horizontal || 0,
            gazeV: data.details.gaze_vertical || 0,
            ear: data.details.ear || 0,
            processingTime: data.details.processing_time_ms || 0
          });
        }

        // Handle alerts
        if (data.alert && data.alert !== 'none') {
          const alertTypes = data.alert.split(' AND ');
          const newAlert = {
            types: alertTypes,
            confidence: data.conf,
            timestamp: data.timestamp || Date.now() / 1000
          };

          // Add to alert history
          alertHistoryRef.current.push(newAlert);
          if (alertHistoryRef.current.length > 50) {
            alertHistoryRef.current.shift();
          }

          setAlerts(alertTypes);
          setAlertCount(prev => prev + 1);

          // Auto-pause quiz if critical alert
          const criticalAlerts = [
            'multiple_faces',
            'no_face_detected',
            'device_detected_phone',
            'device_detected_laptop',
            'device_detected_secondary_screen'
          ];
          if (alertTypes.some(a => criticalAlerts.includes(a))) {
            setQuizPaused(true);
          }
        } else {
          setAlerts([]);
        }

        // Display visualization
        if (data.viz) {
          displayVisualization(data.viz);
        }

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        if (isProctoring) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  }, [isProctoring]);

  // Display visualization on overlay canvas
  const displayVisualization = (base64Data) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };

    img.src = `data:image/jpeg;base64,${base64Data}`;
  };

  // Capture and send frame
  const captureAndSendFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;

        // Send to server
        wsRef.current.send(JSON.stringify({
          frame: base64data,
          timestamp: Date.now()
        }));
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
  }, []);

  // Start proctoring
  const startProctoring = async () => {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Connect WebSocket
      connectWebSocket();

      // Start sending frames (5 FPS for efficiency)
      intervalRef.current = setInterval(captureAndSendFrame, 200);

      setIsProctoring(true);
      setQuizPaused(false);
      setAlertCount(0);
      alertHistoryRef.current = [];

    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Could not access webcam. Please grant camera permissions.');
    }
  };

  // Stop proctoring
  const stopProctoring = () => {
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsProctoring(false);
    setConnectionStatus('disconnected');
    setAlerts([]);
  };

  // Resume quiz
  const resumeQuiz = () => {
    setQuizPaused(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProctoring();
    };
  }, []);

  // Alert severity mapping
  const getAlertSeverity = (alertType) => {
    const critical = [
      'multiple_faces',
      'no_face_detected',
      'device_detected_phone',
      'device_detected_laptop',
      'device_detected_secondary_screen'
    ];
    const high = ['gaze_off_screen', 'head_pose_suspicious'];
    const medium = ['excessive_head_movement', 'hand_near_face', 'looking_down'];

    if (critical.includes(alertType)) return 'critical';
    if (high.includes(alertType)) return 'high';
    if (medium.includes(alertType)) return 'medium';
    return 'low';
  };

  // Format alert text
  const formatAlertText = (alertType) => {
    const mapping = {
      'multiple_faces': 'Multiple Faces Detected',
      'no_face_detected': 'No Face Detected',
      'gaze_off_screen': 'Looking Away from Screen',
      'device_detected_phone': '📱 Mobile Phone Detected',
      'device_detected_laptop': '💻 Laptop/Computer Detected',
      'device_detected_secondary_screen': '🖥️ Secondary Screen Detected',
      'head_pose_suspicious': 'Suspicious Head Position',
      'excessive_head_movement': 'Excessive Movement',
      'hand_near_face': 'Hand Near Face',
      'looking_down': 'Looking Down'
    };
    return mapping[alertType] || alertType;
  };

  return (
    <div className="proctor-container">
      <div className="proctor-header">
        <h1>AI Exam Proctoring System</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus}`}></span>
          <span>{connectionStatus.toUpperCase()}</span>
        </div>
      </div>

      <div className="proctor-content">
        {/* Video Feed Section */}
        <div className="video-section">
          <div className="video-container">
            <video
              ref={videoRef}
              className="video-feed"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <canvas ref={overlayCanvasRef} className="overlay-canvas" />

            {!isProctoring && (
              <div className="video-placeholder">
                <p>Camera feed will appear here</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="controls">
            {!isProctoring ? (
              <button onClick={startProctoring} className="btn btn-start">
                Start Proctoring
              </button>
            ) : (
              <button onClick={stopProctoring} className="btn btn-stop">
                Stop Proctoring
              </button>
            )}
          </div>
        </div>

        {/* Stats and Alerts Section */}
        <div className="info-section">
          {/* Real-time Stats */}
          <div className="stats-panel">
            <h3>Real-time Statistics</h3>

            {/* Behavior Status - Prominent Display */}
            <div className="behavior-status-container">
              <label>Current Behavior:</label>
              <div className={`behavior-status ${behaviorStatus.includes('Focused') ? 'status-good' :
                  behaviorStatus.includes('No person') || behaviorStatus.includes('Multiple') ? 'status-critical' :
                    'status-warning'
                }`}>
                {behaviorStatus}
              </div>
            </div>

            {/* Device Detection Display */}
            {devicesDetected.length > 0 && (
              <div className="devices-detected-container">
                <label>⚠️ Devices Detected:</label>
                <div className="devices-list">
                  {devicesDetected.map((device, idx) => (
                    <span key={idx} className="device-badge">{device}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="stat-grid">
              <div className="stat-item">
                <label>Faces Detected:</label>
                <span className={stats.numFaces === 1 ? 'stat-ok' : 'stat-alert'}>
                  {stats.numFaces}
                </span>
              </div>
              <div className="stat-item">
                <label>Gaze (H/V):</label>
                <span>{stats.gazeH.toFixed(1)}° / {stats.gazeV.toFixed(1)}°</span>
              </div>
              <div className="stat-item">
                <label>Eye Aspect Ratio:</label>
                <span>{stats.ear.toFixed(3)}</span>
              </div>
              <div className="stat-item">
                <label>Processing Time:</label>
                <span className={stats.processingTime < 200 ? 'stat-ok' : 'stat-warning'}>
                  {stats.processingTime.toFixed(1)} ms
                </span>
              </div>
              <div className="stat-item">
                <label>Total Alerts:</label>
                <span className={alertCount > 5 ? 'stat-alert' : 'stat-ok'}>
                  {alertCount}
                </span>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="alerts-panel">
            <h3>Active Alerts</h3>
            {alerts.length === 0 ? (
              <div className="alert-item alert-ok">
                ✓ No violations detected
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`alert-item alert-${getAlertSeverity(alert)}`}
                  >
                    <span className="alert-icon">⚠</span>
                    <span className="alert-text">{formatAlertText(alert)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Alert History */}
          <div className="history-panel">
            <h3>Recent Alert History</h3>
            <div className="history-list">
              {alertHistoryRef.current.slice(-10).reverse().map((alert, index) => (
                <div key={index} className="history-item">
                  <span className="history-time">
                    {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                  </span>
                  <span className="history-alerts">
                    {alert.types.map(t => formatAlertText(t)).join(', ')}
                  </span>
                  <span className="history-conf">
                    {(alert.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              {alertHistoryRef.current.length === 0 && (
                <div className="history-empty">No alerts yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Pause Overlay */}
      {quizPaused && (
        <div className="pause-overlay">
          <div className="pause-modal">
            <h2>⚠ Quiz Paused</h2>
            <p>A critical violation has been detected. Please ensure:</p>
            <ul>
              <li>Only your face is visible in the camera</li>
              <li>You are looking at the screen</li>
              <li>No unauthorized materials are present</li>
              <li>Your environment is properly set up</li>
            </ul>
            <button onClick={resumeQuiz} className="btn btn-resume">
              Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isProctoring && (
        <div className="instructions">
          <h3>Proctoring Guidelines</h3>
          <ul>
            <li>Ensure your face is clearly visible throughout the exam</li>
            <li>Look at the screen at all times</li>
            <li>Only one person should be in the frame</li>
            <li>Remove any posters, photos, or artwork showing faces</li>
            <li>Keep your hands visible and away from your face</li>
            <li>Maintain good lighting conditions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Proctor;
