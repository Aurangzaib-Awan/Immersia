/**
 * ProctorFeed Component - Fixed
 *
 * Key fixes:
 * - video.load() forces hardware release on stop
 * - killAllStreams() wipes any lingering streams before starting
 * - useEffect cleanup uses a separate isMounted ref so it always fires
 * - Frame capture interval starts AFTER camera is confirmed ready
 * - No double-start / double-stop race conditions
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
    const videoRef         = useRef(null);
    const canvasRef        = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef        = useRef(null);
    const intervalRef      = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const isMounted        = useRef(false); // tracks whether effect is active

    // ========================================================================
    // STATE
    // ========================================================================
    const [cameraError, setCameraError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [frameCount,  setFrameCount ] = useState(0);

    // ========================================================================
    // KILL ALL STREAMS — wipe hardware before requesting new stream
    // ========================================================================
    const killAllStreams = useCallback(async () => {
        // 1. Kill whatever is on the video element
        if (videoRef.current) {
            const video = videoRef.current;
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(t => {
                    t.stop();
                    console.log('🔴 Killed track on video element:', t.label);
                });
            }
            video.pause();
            video.srcObject = null;
            video.src       = '';
            video.load();   // ← KEY: forces browser to release hardware
        }

        // 2. Kill streamRef if it's a different object
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => {
                t.stop();
                console.log('🔴 Killed track on streamRef:', t.label);
            });
            streamRef.current = null;
        }

        // 3. Wait for OS to fully release the camera hardware
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log('✅ All streams killed — hardware released');
    }, []);

    // ========================================================================
    // FRAME CAPTURE
    // ========================================================================
    const captureFrame = useCallback(() => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        const now              = Date.now();
        const minFrameInterval = 1000 / frameRate;
        if (now - lastFrameTimeRef.current < minFrameInterval) return;
        lastFrameTimeRef.current = now;

        try {
            const ctx = canvas.getContext('2d');
            canvas.width  = videoWidth;
            canvas.height = Math.round((video.videoHeight / video.videoWidth) * videoWidth);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frameData = canvas.toDataURL('image/jpeg', 0.8);
            if (onFrame) {
                const success = onFrame(frameData);
                if (success !== false) setFrameCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('❌ Error capturing frame:', error);
        }
    }, [onFrame, frameRate, videoWidth]);

    // ========================================================================
    // START CAMERA
    // ========================================================================
    const startCamera = useCallback(async () => {
        console.log('📹 Starting camera...');
        setCameraError(null);
        setCameraReady(false);

        // Always nuke everything first
        await killAllStreams();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width:      { ideal: videoWidth  },
                    height:     { ideal: videoHeight },
                    facingMode: 'user',
                    frameRate:  { ideal: 30 }
                },
                audio: false
            });

            // If component unmounted while we were awaiting, release immediately
            if (!isMounted.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (!isMounted.current) return;
                    videoRef.current.play().catch(() => {});
                    setCameraReady(true);
                    console.log('✅ Camera ready');

                    // Start frame capture ONLY after camera is confirmed ready
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    const ms = 1000 / frameRate;
                    intervalRef.current = setInterval(captureFrame, ms);
                    console.log(`📸 Frame capture started at ${frameRate} FPS (${ms}ms)`);
                };
            }

        } catch (err) {
            console.error('❌ Camera error:', err.name, err.message);

            if (!isMounted.current) return;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraError('Camera access denied. Please allow camera permissions.');

            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setCameraError('No camera found. Please connect a webcam.');

            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setCameraError('Camera hardware is busy. Retrying in 2 seconds...');
                // Retry once with a longer delay
                setTimeout(async () => {
                    if (!isMounted.current) return;
                    try {
                        await killAllStreams();
                        const retryStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        if (!isMounted.current) {
                            retryStream.getTracks().forEach(t => t.stop());
                            return;
                        }
                        streamRef.current = retryStream;
                        if (videoRef.current) {
                            videoRef.current.srcObject = retryStream;
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current.play().catch(() => {});
                                setCameraReady(true);
                                setCameraError(null);

                                if (intervalRef.current) clearInterval(intervalRef.current);
                                const ms = 1000 / frameRate;
                                intervalRef.current = setInterval(captureFrame, ms);
                                console.log('✅ Camera ready after retry');
                            };
                        }
                    } catch (retryErr) {
                        if (!isMounted.current) return;
                        setCameraError('Camera is in use by another app. Please close it and try again.');
                        console.error('❌ Retry also failed:', retryErr.message);
                    }
                }, 2000);

            } else {
                setCameraError(`Camera error: ${err.message}`);
            }
        }
    }, [killAllStreams, captureFrame, frameRate, videoWidth, videoHeight]);

    // ========================================================================
    // STOP CAMERA
    // ========================================================================
    const stopCamera = useCallback(async () => {
        console.log('📹 Stopping camera...');

        // Stop frame capture first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('📸 Frame capture stopped');
        }

        // Full hardware release
        await killAllStreams();

        setCameraReady(false);
        setFrameCount(0);
        console.log('📹 Camera fully stopped');
    }, [killAllStreams]);

    // ========================================================================
    // EFFECT — react to isProctoring changes
    // ========================================================================
    useEffect(() => {
        if (isProctoring) {
            isMounted.current = true;
            startCamera();
        } else {
            isMounted.current = false;
            stopCamera();
        }

        // Cleanup on unmount or before next effect run
        return () => {
            isMounted.current = false;

            // Synchronously clear the interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            // Async hardware release (fire and forget — component may be gone)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.srcObject = null;
                videoRef.current.src       = '';
                videoRef.current.load();
            }
        };
    }, [isProctoring]); // eslint-disable-line react-hooks/exhaustive-deps

    // ========================================================================
    // EFFECT — overlay visualization
    // ========================================================================
    useEffect(() => {
        if (!visualization || !overlayCanvasRef.current) return;

        const canvas = overlayCanvasRef.current;
        const ctx    = canvas.getContext('2d');
        const img    = new Image();

        img.onload = () => {
            canvas.width  = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };

        img.onerror = err => console.error('❌ Overlay image load error:', err);
        img.src = `data:image/jpeg;base64,${visualization}`;
    }, [visualization]);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="relative w-full aspect-video bg-[rgb(248,250,252)] rounded-lg overflow-hidden border border-[rgb(226,232,240)]">

            {/* Base video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-70"
            />

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay canvas — AI visualization */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Camera inactive */}
            {!isProctoring && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgb(248,250,252)]/80 text-[rgb(148,163,184)] text-sm gap-3">
                    <CameraOff className="w-10 h-10" />
                    <span>Camera inactive</span>
                </div>
            )}

            {/* Camera error */}
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

            {/* Live monitoring badge */}
            {isProctoring && cameraReady && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span>Live Monitoring</span>
                </div>
            )}

            {/* Frame counter — dev only */}
            {isProctoring && cameraReady && process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[9px] font-mono text-[rgb(148,163,184)]">
                    Frames: {frameCount}
                </div>
            )}

            {/* Initializing indicator */}
            {isProctoring && !cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgb(248,250,252)]/90 text-[rgb(148,163,184)] text-sm gap-3">
                    <Camera className="w-10 h-10 animate-pulse" />
                    <span>Initializing camera...</span>
                </div>
            )}
        </div>
    );
};

export default ProctorFeed;