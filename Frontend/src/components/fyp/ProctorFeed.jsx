/**
 * ProctorFeed Component - Production Ready
 * 
 * Displays webcam feed with AI-generated overlay visualization
 * Captures frames at configurable FPS and sends to backend
 * 
 * Features:
 * - Auto camera start/stop
 * - Frame rate limiting (5 FPS)
 * - Overlay visualization sync
 * - Camera error handling
 * - Responsive video sizing
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

const ProctorFeed = ({
    isProctoring,
    onFrame,
    visualization,
    frameRate = 5,
    videoWidth = 640,
    videoHeight = 480
}) => {
    // ========================================================================
    // REFS
    // ========================================================================
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const lastFrameTimeRef = useRef(0);

    // ========================================================================
    // STATE
    // ========================================================================
    const [cameraError, setCameraError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [frameCount, setFrameCount] = useState(0);

    // ========================================================================
    // CAMERA MANAGEMENT
    // ========================================================================
    const startCamera = useCallback(async () => {
        try {
            console.log('📹 Starting camera...');
            setCameraError(null);
            setCameraReady(false);

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: videoWidth },
                    height: { ideal: videoHeight },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: false
            });

            streamRef.current = stream;

            // Attach to video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    console.log('✅ Camera ready');
                    setCameraReady(true);
                };
            }

        } catch (err) {
            console.error('❌ Error accessing webcam:', err);

            // User-friendly error messages
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraError('Camera access denied. Please allow camera permissions.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setCameraError('No camera found. Please connect a webcam.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setCameraError('Camera is already in use by another application.');
            } else {
                setCameraError(`Camera error: ${err.message}`);
            }
        }
    }, [videoWidth, videoHeight]);

    const stopCamera = useCallback(() => {
        console.log('📹 Stopping camera...');

        // Stop all video tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('⏹️  Stopped track:', track.label);
            });
            streamRef.current = null;
        }

        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraReady(false);
    }, []);

    // ========================================================================
    // FRAME CAPTURE & TRANSMISSION
    // ========================================================================
    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Validate video ready state
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        // Frame rate limiting (prevent sending too fast)
        const now = Date.now();
        const timeSinceLastFrame = now - lastFrameTimeRef.current;
        const minFrameInterval = 1000 / frameRate; // ms between frames

        if (timeSinceLastFrame < minFrameInterval) {
            return; // Skip this frame
        }

        lastFrameTimeRef.current = now;

        try {
            const ctx = canvas.getContext('2d');

            // Set canvas size (maintain aspect ratio)
            canvas.width = videoWidth;
            canvas.height = (video.videoHeight / video.videoWidth) * videoWidth;

            // Draw current video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to JPEG base64 (0.8 quality = good balance)
            const frameData = canvas.toDataURL('image/jpeg', 0.8);

            // Send to parent component
            if (onFrame) {
                const success = onFrame(frameData);
                if (success !== false) {
                    setFrameCount(prev => prev + 1);
                }
            }

        } catch (error) {
            console.error('❌ Error capturing frame:', error);
        }
    }, [onFrame, frameRate, videoWidth]);

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Start/stop camera based on proctoring state
    useEffect(() => {
        if (isProctoring) {
            startCamera();

            // Start frame capture interval
            const interval = 1000 / frameRate; // Convert FPS to ms
            intervalRef.current = setInterval(captureFrame, interval);
            console.log(`📸 Frame capture started at ${frameRate} FPS (${interval}ms interval)`);
        } else {
            stopCamera();

            // Clear frame capture interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log('📸 Frame capture stopped');
            }

            setFrameCount(0);
        }

        return () => {
            stopCamera();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isProctoring, captureFrame, frameRate, startCamera, stopCamera]);

    // Update overlay visualization
    useEffect(() => {
        if (visualization && overlayCanvasRef.current) {
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Match canvas size to image
                canvas.width = img.width;
                canvas.height = img.height;

                // Clear previous content
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw new overlay
                ctx.drawImage(img, 0, 0);
            };

            img.onerror = (error) => {
                console.error('❌ Error loading overlay image:', error);
            };

            // Set image source (base64 from backend)
            img.src = `data:image/jpeg;base64,${visualization}`;
        }
    }, [visualization]);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
            {/* Base video element (muted, dimmed) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-70"
            />

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay canvas (AI visualization) */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Camera inactive state */}
            {!isProctoring && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-gray-400 text-sm gap-3">
                    <CameraOff className="w-10 h-10" />
                    <span>Camera inactive</span>
                </div>
            )}

            {/* Camera error state */}
            {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 border-2 border-red-500/30 text-red-400 text-sm gap-3 p-4">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-center font-medium">{cameraError}</p>
                    <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-bold"
                    >
                        Retry Camera Access
                    </button>
                </div>
            )}

            {/* Live monitoring indicator */}
            {isProctoring && cameraReady && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span>Live Monitoring</span>
                </div>
            )}

            {/* Frame count indicator (debug) */}
            {isProctoring && cameraReady && process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[9px] font-mono text-gray-400">
                    Frames: {frameCount}
                </div>
            )}

            {/* Camera ready indicator */}
            {isProctoring && !cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-gray-400 text-sm gap-3">
                    <Camera className="w-10 h-10 animate-pulse" />
                    <span>Initializing camera...</span>
                </div>
            )}
        </div>
    );
};

export default ProctorFeed;