"""
AI Proctoring Route - WebSocket endpoint for real-time proctoring
Integrates MediaPipe FaceMesh, YOL Ov8, and OpenCV for multi-modal cheat detection
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
import base64
import json
from collections import deque
from typing import Dict, List, Tuple, Optional
import mediapipe as mp
import math
import time

router = APIRouter()

# Initialize models
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
mp_pose = mp.solutions.pose

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=2,  # Reduced for performance
    refine_landmarks=True,
    min_detection_confidence=0.6,  # Slightly higher for fewer false detections
    min_tracking_confidence=0.6
)

face_detection = mp_face_detection.FaceDetection(
    model_selection=0,  # Use short-range model (faster)
    min_detection_confidence=0.6
)

pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=0,  # Lightest model for performance
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

# YOLO model for object detection (electronic devices)
yolo_model = None
try:
    import torch
    from ultralytics import YOLO
    from ultralytics.nn.tasks import DetectionModel
    
    # Fix for PyTorch 2.6+: Add ultralytics classes to safe globals (must be class, not string)
    torch.serialization.add_safe_globals([DetectionModel])
    
    # Use standard YOLOv8n for object detection (not pose)
    yolo_model = YOLO('yolov8n.pt')  # Will auto-download if not present
    print("✅ YOLO object detection model loaded successfully")
except Exception as e:
    print(f"⚠️ YOLO not loaded - device detection disabled: {e}")
    yolo_model = None

# Temporal buffers for tracking
class FrameBuffer:
    def __init__(self, maxlen=30):
        self.frames = deque(maxlen=maxlen)
        self.keypoints = deque(maxlen=maxlen)
        self.gaze_angles = deque(maxlen=maxlen)
        self.ear_values = deque(maxlen=maxlen)
        self.alert_history = deque(maxlen=10)  # Track recent alerts
        self.frame_count = 0
        self.fps_history = deque(maxlen=30)
        self.last_process_time = time.time()
        
    def add(self, frame, keypoints=None, gaze=None, ear=None):
        self.frames.append(frame)
        if keypoints is not None:
            self.keypoints.append(keypoints)
        if gaze is not None:
            self.gaze_angles.append(gaze)
        if ear is not None:
            self.ear_values.append(ear)
        self.frame_count += 1
    
    def add_alert(self, alert_type: str):
        """Track alert for temporal smoothing"""
        self.alert_history.append(alert_type)
    
    def should_trigger_alert(self, alert_type: str, required_count: int = 3) -> bool:
        """Check if alert should trigger based on recent history"""
        if len(self.alert_history) < required_count:
            return False
        recent = list(self.alert_history)[-required_count:]
        return recent.count(alert_type) >= required_count
    
    def update_fps(self):
        """Calculate and store FPS"""
        current_time = time.time()
        fps = 1.0 / (current_time - self.last_process_time + 1e-6)
        self.fps_history.append(fps)
        self.last_process_time = current_time
        return fps
    
    def get_avg_fps(self) -> float:
        """Get average FPS over recent frames"""
        if not self.fps_history:
            return 0.0
        return sum(self.fps_history) / len(self.fps_history)

# Store buffers per client
client_buffers: Dict[str, FrameBuffer] = {}

# Landmark indices for MediaPipe FaceMesh
LEFT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]
LEFT_IRIS = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]
NOSE_TIP = 1
CHIN = 152


def calculate_ear(eye_landmarks: np.ndarray) -> float:
    """
    Calculate Eye Aspect Ratio (EAR) for blink detection
    EAR = (vertical_dist1 + vertical_dist2) / (2 * horizontal_dist)
    """
    # Vertical distances
    v1 = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
    v2 = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
    
    # Horizontal distance
    h = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
    
    if h < 1e-6:
        return 0.0
    
    ear = (v1 + v2) / (2.0 * h)
    return ear


def detect_gaze_direction(face_landmarks, img_w: int, img_h: int) -> Tuple[float, float]:
    """
    Detect gaze direction using iris and eye center positions
    Returns: (horizontal_angle, vertical_angle) in degrees
    """
    # Get left eye center and iris center
    left_eye_points = np.array([[face_landmarks.landmark[idx].x * img_w,
                                  face_landmarks.landmark[idx].y * img_h] 
                                 for idx in LEFT_EYE_LANDMARKS])
    left_iris_points = np.array([[face_landmarks.landmark[idx].x * img_w,
                                   face_landmarks.landmark[idx].y * img_h] 
                                  for idx in LEFT_IRIS])
    
    left_eye_center = np.mean(left_eye_points, axis=0)
    left_iris_center = np.mean(left_iris_points, axis=0)
    
    # Get right eye center and iris center
    right_eye_points = np.array([[face_landmarks.landmark[idx].x * img_w,
                                   face_landmarks.landmark[idx].y * img_h] 
                                  for idx in RIGHT_EYE_LANDMARKS])
    right_iris_points = np.array([[face_landmarks.landmark[idx].x * img_w,
                                    face_landmarks.landmark[idx].y * img_h] 
                                   for idx in RIGHT_IRIS])
    
    right_eye_center = np.mean(right_eye_points, axis=0)
    right_iris_center = np.mean(right_iris_points, axis=0)
    
    # Calculate gaze vectors
    left_gaze = left_iris_center - left_eye_center
    right_gaze = right_iris_center - right_eye_center
    
    # Average gaze vector
    avg_gaze = (left_gaze + right_gaze) / 2
    
    # Calculate angles
    horizontal_angle = math.degrees(math.atan2(avg_gaze[0], 100))  # Normalize depth
    vertical_angle = math.degrees(math.atan2(avg_gaze[1], 100))
    
    return horizontal_angle, vertical_angle


def calculate_head_pose(face_landmarks, img_w: int, img_h: int) -> Tuple[float, float, float]:
    """
    Calculate head pose (pitch, yaw, roll) using face landmarks
    """
    # 3D model points
    model_points = np.array([
        (0.0, 0.0, 0.0),           # Nose tip
        (0.0, -330.0, -65.0),      # Chin
        (-225.0, 170.0, -135.0),   # Left eye left corner
        (225.0, 170.0, -135.0),    # Right eye right corner
        (-150.0, -150.0, -125.0),  # Left mouth corner
        (150.0, -150.0, -125.0)    # Right mouth corner
    ])
    
    # 2D image points
    image_points = np.array([
        (face_landmarks.landmark[NOSE_TIP].x * img_w, face_landmarks.landmark[NOSE_TIP].y * img_h),
        (face_landmarks.landmark[CHIN].x * img_w, face_landmarks.landmark[CHIN].y * img_h),
        (face_landmarks.landmark[33].x * img_w, face_landmarks.landmark[33].y * img_h),
        (face_landmarks.landmark[263].x * img_w, face_landmarks.landmark[263].y * img_h),
        (face_landmarks.landmark[61].x * img_w, face_landmarks.landmark[61].y * img_h),
        (face_landmarks.landmark[291].x * img_w, face_landmarks.landmark[291].y * img_h)
    ], dtype="double")
    
    # Camera internals
    focal_length = img_w
    center = (img_w / 2, img_h / 2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype="double")
    
    dist_coeffs = np.zeros((4, 1))
    
    # Solve PnP
    success, rotation_vector, translation_vector = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
    )
    
    # Convert rotation vector to Euler angles
    rotation_mat, _ = cv2.Rodrigues(rotation_vector)
    pose_mat = cv2.hconcat((rotation_mat, translation_vector))
    _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(pose_mat)
    
    pitch, yaw, roll = euler_angles.flatten()[:3]
    
    return pitch, yaw, roll


def detect_electronic_devices(frame: np.ndarray, yolo_model) -> Tuple[List[str], float]:
    """
    Detect electronic devices using YOLO object detection
    COCO class IDs: cell phone (67), laptop (63), tv (62), keyboard (66), mouse (64)
    Returns: (list of detected devices, max confidence)
    """
    if yolo_model is None:
        return [], 0.0
    
    detected_devices = []
    max_conf = 0.0
    
    try:
        # Run YOLO inference
        results = yolo_model(frame, verbose=False, conf=0.3)  # Ultra-strict: 30% confidence
        
        # COCO dataset class IDs for devices
        device_classes = {
            67: 'cell phone',
            63: 'laptop',
            62: 'tv',  # Can detect secondary monitors/screens
            66: 'keyboard',  # External keyboard (suspicious)
            64: 'mouse'  # External mouse (less suspicious but noteworthy)
        }
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                if class_id in device_classes:
                    device_name = device_classes[class_id]
                    detected_devices.append(device_name)
                    max_conf = max(max_conf, confidence)
        
    except Exception as e:
        print(f"Error in device detection: {e}")
        return [], 0.0
    
    return detected_devices, max_conf


def get_human_behavior_status(gaze_h: float, gaze_v: float, pose_landmarks, 
                               num_faces: int, ear: float) -> str:
    """
    Determine current human behavior status based on all metrics
    Returns: Human-readable status string describing current behavior
    """
    # Priority 1: Check face count
    if num_faces == 0:
        return "No person detected"
    elif num_faces > 1:
        return "Multiple people detected"
    
    # Priority 2: Check if eyes are closed
    if ear < 0.15:  # Very low EAR indicates closed eyes
        return "Eyes closed or blinking"
    
    # Priority 3: Check gaze direction
    if abs(gaze_h) > 35 or abs(gaze_v) > 35:
        # Determine specific direction
        if abs(gaze_h) > abs(gaze_v):
            if gaze_h > 35:
                return "Looking right (away from screen)"
            else:
                return "Looking left (away from screen)"
        else:
            if gaze_v > 35:
                return "Looking down"
            else:
                return "Looking up"
    
    # Priority 4: Check pose if available
    if pose_landmarks:
        landmarks = pose_landmarks.landmark
        nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
        
        # Check if looking down based on pose
        if nose.visibility > 0.5:
            shoulders_center_y = (
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y +
                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y
            ) / 2
            
            if nose.y > shoulders_center_y + 0.20:
                return "Looking down significantly"
    
    # Priority 5: Slight gaze deviation (still acceptable)
    if abs(gaze_h) > 20 or abs(gaze_v) > 20:
        return "Slight gaze deviation"
    
    # Default: Everything looks good
    return "Focused on screen"





def detect_suspicious_activity(buffer: FrameBuffer, pose_landmarks) -> Tuple[bool, str, float]:
    """
    Detect suspicious activity using pose analysis:
    1. Excessive head movement
    2. Body movement patterns
    3. Hand positions
    """
    alerts = []
    max_confidence = 0.0
    
    if pose_landmarks is None:
        return False, "", 0.0
    
    # Extract key pose points
    landmarks = pose_landmarks.landmark
    
    # Check head movement (disabled - too many false positives)
    # Students naturally move their head while thinking and reading
    # if len(buffer.keypoints) >= 10:
    #     head_positions = []
    #     for kpts in list(buffer.keypoints)[-10:]:
    #         if kpts is not None and len(kpts) > 0:
    #             head_positions.append(kpts[0][:2] if len(kpts[0]) >= 2 else None)
    #     
    #     head_positions = [p for p in head_positions if p is not None]
    #     if len(head_positions) >= 5:
    #         head_std = np.std(head_positions, axis=0).mean()
    #         if head_std > 25.0:  # Very high threshold - only extreme movement
    #             alerts.append("excessive_head_movement")
    #             max_confidence = max(max_confidence, 0.60)
    
    # Check hand positions near face (potential phone use)
    nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
    left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
    right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]
    
    nose_pos = np.array([nose.x, nose.y])
    left_wrist_pos = np.array([left_wrist.x, left_wrist.y])
    right_wrist_pos = np.array([right_wrist.x, right_wrist.y])
    
    # Check if hands are near face (very tight threshold - only actual phone use)
    left_dist = np.linalg.norm(nose_pos - left_wrist_pos)
    right_dist = np.linalg.norm(nose_pos - right_wrist_pos)
    
    # Only trigger if hand is very close (actual phone to ear position)
    if left_dist < 0.08 or right_dist < 0.08:
        alerts.append("hand_near_face")
        max_confidence = max(max_confidence, 0.60)
    
    # Check for looking down (potential phone/notes) - very relaxed threshold
    if nose.visibility > 0.5:
        shoulders_center_y = (
            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y +
            landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y
        ) / 2
        
        # Only trigger if head is significantly below shoulders (extreme looking down)
        if nose.y > shoulders_center_y + 0.20:
            alerts.append("looking_down")
            max_confidence = max(max_confidence, 0.55)
    
    if alerts:
        return True, " AND ".join(alerts), max_confidence
    
    return False, "", 0.0


def create_heatmap_overlay(frame: np.ndarray, alerts: List[str]) -> np.ndarray:
    """
    Create visualization heatmap with alerts
    """
    overlay = frame.copy()
    h, w = frame.shape[:2]
    
    # Create semi-transparent overlay
    if alerts:
        color = (0, 0, 255)  # Red for alerts
        cv2.rectangle(overlay, (0, 0), (w, 60), color, -1)
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, overlay)
        
        # Add alert text
        alert_text = " | ".join(alerts)
        cv2.putText(overlay, f"ALERT: {alert_text}", (10, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    else:
        color = (0, 255, 0)  # Green for OK
        cv2.rectangle(overlay, (0, 0), (w, 40), color, -1)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, overlay)
        cv2.putText(overlay, "Status: OK", (10, 25),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    return overlay


async def process_frame(frame: np.ndarray, client_id: str, force_process: bool = False) -> Dict:
    """
    Main processing pipeline for each frame
    Optimized for performance with adaptive frame skipping
    Enhanced with device detection and dynamic behavior status
    """
    start_time = time.time()
    
    # Initialize buffer if needed
    if client_id not in client_buffers:
        client_buffers[client_id] = FrameBuffer(maxlen=30)
    
    buffer = client_buffers[client_id]
    
    # Adaptive frame skipping: process every 3rd frame unless alerts detected
    skip_frame = buffer.frame_count % 3 != 0 and not force_process
    if skip_frame and len(buffer.alert_history) == 0:
        # Return cached result for skipped frames
        buffer.frame_count += 1
        return {
            "alert": "none",
            "conf": 1.0,
            "viz": "",
            "behavior_status": "Focused on screen",
            "devices_detected": [],
            "details": {
                "num_faces": 1,
                "gaze_horizontal": 0.0,
                "gaze_vertical": 0.0,
                "ear": 0.3,
                "processing_time_ms": 0.0,
                "fps": buffer.get_avg_fps(),
                "skipped": True
            },
            "timestamp": time.time()
        }
    
    # Downscale frame for faster processing (320x240 is 4x faster than 640x480)
    img_h, img_w = frame.shape[:2]
    scale_factor = 320 / img_w
    new_w, new_h = 320, int(img_h * scale_factor)
    small_frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    
    rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    proc_h, proc_w = small_frame.shape[:2]
    
    alerts = []
    confidences = []
    devices_detected = []
    
    # 1. Face Detection - Check for multiple faces
    face_det_results = face_detection.process(rgb_frame)
    num_faces = 0
    if face_det_results.detections:
        num_faces = len(face_det_results.detections)
        if num_faces > 1:
            alerts.append("multiple_faces")
            confidences.append(0.95)
    
    # 2. Face Mesh - Gaze and EAR analysis
    face_mesh_results = face_mesh.process(rgb_frame)
    gaze_h, gaze_v = 0.0, 0.0
    avg_ear = 0.3
    
    if face_mesh_results.multi_face_landmarks:
        for face_landmarks in face_mesh_results.multi_face_landmarks:
            # Calculate gaze (using scaled dimensions)
            gaze_h, gaze_v = detect_gaze_direction(face_landmarks, proc_w, proc_h)
            
            # Ultra-Strict: Immediate gaze violation on slight deviation
            if abs(gaze_h) > 15 or abs(gaze_v) > 15:
                # IMMEDIATE alert - no temporal buffering
                alerts.append("gaze_off_screen")
                confidences.append(0.85)
            
            # Calculate EAR for both eyes (using scaled dimensions)
            left_eye_points = np.array([[face_landmarks.landmark[idx].x * proc_w,
                                         face_landmarks.landmark[idx].y * proc_h] 
                                        for idx in LEFT_EYE_LANDMARKS])
            right_eye_points = np.array([[face_landmarks.landmark[idx].x * proc_w,
                                          face_landmarks.landmark[idx].y * proc_h] 
                                         for idx in RIGHT_EYE_LANDMARKS])
            
            left_ear = calculate_ear(left_eye_points)
            right_ear = calculate_ear(right_eye_points)
            avg_ear = (left_ear + right_ear) / 2.0
    
    # 3. MediaPipe Pose for activity analysis
    pose_results = pose.process(rgb_frame)
    if pose_results.pose_landmarks:
        is_suspicious, activity_type, activity_conf = detect_suspicious_activity(
            buffer, pose_results.pose_landmarks
        )
        if is_suspicious:
            buffer.add_alert(activity_type)
            # Trigger anomaly immediately for strict mode
            alerts.append(activity_type)
            confidences.append(activity_conf)
    
    # 4. Electronic Device Detection (EVERY FRAME for maximum detection)
    if yolo_model is not None:
        detected_devs, dev_conf = detect_electronic_devices(small_frame, yolo_model)
        if detected_devs:
            devices_detected = detected_devs
            # Add specific alerts for critical devices
            if 'cell phone' in detected_devs:
                alerts.append("device_detected_phone")
                confidences.append(dev_conf)
            if 'laptop' in detected_devs:
                alerts.append("device_detected_laptop")
                confidences.append(dev_conf)
            if 'tv' in detected_devs:
                alerts.append("device_detected_secondary_screen")
                confidences.append(dev_conf)
    
    # 5. Update buffer
    buffer.add(small_frame, None, gaze_h, avg_ear)
    
    # 6. No face detected for extended period
    if num_faces == 0:
        buffer.add_alert("no_face_detected")
        # Immediate alert for no face (critical)
        alerts.append("no_face_detected")
        confidences.append(0.90)
    
    # 7. Get dynamic behavior status
    behavior_status = get_human_behavior_status(
        gaze_h, gaze_v, 
        pose_results.pose_landmarks if pose_results else None,
        num_faces, avg_ear
    )
    
    # Create visualization on original frame for better quality
    viz_frame = create_heatmap_overlay(frame, alerts)
    
    # Encode to base64
    _, buffer_img = cv2.imencode('.jpg', viz_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    viz_base64 = base64.b64encode(buffer_img).decode('utf-8')
    
    # Calculate processing time and FPS
    processing_time = (time.time() - start_time) * 1000  # ms
    current_fps = buffer.update_fps()
    
    # Prepare response
    alert_string = " AND ".join(alerts) if alerts else "none"
    max_conf = max(confidences) if confidences else 1.0
    
    response = {
        "alert": alert_string,
        "conf": round(max_conf, 2),
        "viz": viz_base64,
        "behavior_status": behavior_status,
        "devices_detected": list(set(devices_detected)),  # Remove duplicates
        "details": {
            "num_faces": num_faces,
            "gaze_horizontal": round(gaze_h, 2),
            "gaze_vertical": round(gaze_v, 2),
            "ear": round(avg_ear, 3),
            "processing_time_ms": round(processing_time, 2),
            "fps": round(current_fps, 1),
            "avg_fps": round(buffer.get_avg_fps(), 1),
            "skipped": False
        },
        "timestamp": time.time()
    }
    
    return response


@router.websocket("/ws/proctor")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time proctoring
    Receives base64 encoded frames and returns analysis results
    """
    await websocket.accept()
    client_id = id(websocket)
    
    try:
        while True:
            # Receive data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Decode base64 frame
            frame_data = message.get("frame", "")
            if not frame_data:
                continue
            
            # Remove data URL prefix if present
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]
            
            # Decode base64 to image
            img_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                await websocket.send_json({"error": "Invalid frame data"})
                continue
            
            # Process frame
            result = await process_frame(frame, str(client_id))
            
            # Send result
            await websocket.send_json(result)
            
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
        if str(client_id) in client_buffers:
            del client_buffers[str(client_id)]
    except Exception as e:
        print(f"Error processing frame: {e}")
        await websocket.send_json({"error": str(e)})

