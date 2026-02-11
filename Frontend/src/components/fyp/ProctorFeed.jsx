import React, { useRef, useEffect, useCallback } from 'react';

const ProctorFeed = ({ isProctoring, onFrame, visualization }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 640; // High enough for detail, low enough for speed
        canvas.height = (video.videoHeight / video.videoWidth) * 640;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frameData = canvas.toDataURL('image/jpeg', 0.8);
        onFrame(frameData);
    }, [onFrame]);

    useEffect(() => {
        if (isProctoring) {
            startCamera();
            intervalRef.current = setInterval(captureFrame, 200); // 5 FPS
        } else {
            stopCamera();
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            stopCamera();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isProctoring, captureFrame]);

    useEffect(() => {
        if (visualization && overlayCanvasRef.current) {
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = `data:image/jpeg;base64,${visualization}`;
        }
    }, [visualization]);

    return (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover grayscale opacity-40"
            />
            <canvas ref={canvasRef} className="hidden" />
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            />
            {!isProctoring && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-gray-400 text-sm">
                    <span>Camera inactive</span>
                </div>
            )}
            {isProctoring && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-red-500/80 rounded text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    Live Monitoring
                </div>
            )}
        </div>
    );
};

export default ProctorFeed;
