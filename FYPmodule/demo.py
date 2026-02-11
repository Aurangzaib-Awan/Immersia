"""
Demo Script - Example Usage of AI Proctoring System
Shows how to integrate the proctoring system into your application
"""

import asyncio
import cv2
import json
import time
from main import process_frame, FrameBuffer

async def demo_single_frame():
    """
    Demo: Process a single frame
    """
    print("="*60)
    print("Demo 1: Single Frame Processing")
    print("="*60)
    
    # Create a sample frame (or load from file)
    # For demo, we'll use a camera capture
    cap = cv2.VideoCapture(0)  # Use webcam
    
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("Error: Could not read frame")
        return
    
    # Process the frame
    print("\nProcessing frame...")
    result = await process_frame(frame, client_id="demo_client")
    
    # Display results
    print("\nResults:")
    print(f"  Alert: {result['alert']}")
    print(f"  Confidence: {result['conf']:.2f}")
    print(f"  Behavior Status: {result.get('behavior_status', 'N/A')}")
    if result.get('devices_detected'):
        print(f"  Devices Detected: {', '.join(result['devices_detected'])}")
    print(f"  Details:")
    print(f"    - Faces detected: {result['details']['num_faces']}")
    print(f"    - Gaze (H/V): {result['details']['gaze_horizontal']:.1f}° / {result['details']['gaze_vertical']:.1f}°")
    print(f"    - Eye Aspect Ratio: {result['details']['ear']:.3f}")
    print(f"    - Processing time: {result['details']['processing_time_ms']:.1f}ms")
    print(f"    - FPS: {result['details'].get('fps', 0):.1f}")
    
    # Save visualization
    if result['viz']:
        import base64
        viz_data = base64.b64decode(result['viz'])
        with open('demo_output.jpg', 'wb') as f:
            f.write(viz_data)
        print("\n  Visualization saved to: demo_output.jpg")


async def demo_video_stream():
    """
    Demo: Process video stream from webcam
    """
    print("\n" + "="*60)
    print("Demo 2: Live Video Stream Processing")
    print("="*60)
    print("\nPress 'q' to quit")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
    
    # Set resolution (lower for better performance)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    frame_count = 0
    client_id = "demo_stream"
    alert_count = 0
    start_time = time.time()
    
    print("\nProcessing live stream...")
    print("Performance optimizations enabled:")
    print("  - Frame resolution: 320x240")
    print("  - Adaptive frame skipping: Every 3rd frame")
    print("  - Temporal smoothing: 3 consecutive violations required")
    print("  - YOLO device detection: Every 5th frame")
    print("  - Device detection: Phones, laptops, secondary screens")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame (adaptive skipping handled internally)
            result = await process_frame(frame, client_id)
            
            # Track alerts
            if result['alert'] != 'none':
                alert_count += 1
            
            # Display metrics on frame
            alert_text = result['alert'] if result['alert'] != 'none' else 'OK'
            color = (0, 0, 255) if result['alert'] != 'none' else (0, 255, 0)
            
            # Status and confidence
            cv2.putText(frame, f"Status: {alert_text}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.putText(frame, f"Conf: {result['conf']:.2f}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            # Performance metrics
            fps = result['details'].get('fps', 0)
            avg_fps = result['details'].get('avg_fps', 0)
            proc_time = result['details'].get('processing_time_ms', 0)
            skipped = result['details'].get('skipped', False)
            
            cv2.putText(frame, f"FPS: {fps:.1f} (avg: {avg_fps:.1f})", (10, 90),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(frame, f"Process: {proc_time:.1f}ms", (10, 120),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            if skipped:
                cv2.putText(frame, "[SKIPPED]", (10, 150),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 1)
            
            # Additional details
            behavior = result.get('behavior_status', 'Unknown')
            cv2.putText(frame, f"Behavior: {behavior[:30]}", (10, 180),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Show devices if detected
            devices = result.get('devices_detected', [])
            if devices:
                cv2.putText(frame, f"Devices: {', '.join(devices)}", (10, 210),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Display frame
            cv2.imshow('AI Proctoring Demo', frame)
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            frame_count += 1
    
    finally:
        cap.release()
        cv2.destroyAllWindows()
        elapsed = time.time() - start_time
        print(f"\n{'='*60}")
        print("Session Summary:")
        print(f"  Total frames: {frame_count}")
        print(f"  Duration: {elapsed:.1f}s")
        print(f"  Average FPS: {frame_count/elapsed:.1f}")
        print(f"  Alert count: {alert_count}")
        print(f"  Alert rate: {(alert_count/frame_count*100):.1f}%")
        print(f"{'='*60}")


async def demo_batch_processing():
    """
    Demo: Batch process images from a folder
    """
    print("\n" + "="*60)
    print("Demo 3: Batch Image Processing")
    print("="*60)
    
    import os
    from pathlib import Path
    
    # Check if test images exist
    test_dir = Path('test_images')
    if not test_dir.exists():
        print("\nCreating test_images directory...")
        test_dir.mkdir(exist_ok=True)
        print("Please add test images to the 'test_images' directory and run again.")
        return
    
    # Get all image files
    image_files = list(test_dir.glob('*.jpg')) + list(test_dir.glob('*.png'))
    
    if not image_files:
        print("\nNo images found in test_images directory.")
        return
    
    print(f"\nFound {len(image_files)} images to process")
    
    results = []
    
    for img_path in image_files:
        print(f"\nProcessing: {img_path.name}")
        
        # Read image
        frame = cv2.imread(str(img_path))
        if frame is None:
            print(f"  Error: Could not read image")
            continue
        
        # Process
        result = await process_frame(frame, client_id=f"batch_{img_path.stem}")
        
        # Store result
        results.append({
            'filename': img_path.name,
            'alert': result['alert'],
            'confidence': result['conf'],
            'details': result['details']
        })
        
        print(f"  Alert: {result['alert']}")
        print(f"  Confidence: {result['conf']:.2f}")
    
    # Save batch results
    output_file = 'batch_results.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nBatch results saved to: {output_file}")


async def demo_custom_integration():
    """
    Demo: Custom integration example
    Shows how to integrate proctoring into your exam system
    """
    print("\n" + "="*60)
    print("Demo 4: Custom Integration Example")
    print("="*60)
    
    # Simulated exam session
    class ExamSession:
        def __init__(self, student_id, exam_id):
            self.student_id = student_id
            self.exam_id = exam_id
            self.violations = []
            self.frame_count = 0
            self.is_paused = False
        
        async def monitor_frame(self, frame):
            """Process a frame and check for violations"""
            result = await process_frame(frame, client_id=f"exam_{self.exam_id}_{self.student_id}")
            
            self.frame_count += 1
            
            # Check for violations
            if result['alert'] != 'none':
                violation = {
                    'frame': self.frame_count,
                    'alert': result['alert'],
                    'confidence': result['conf'],
                    'timestamp': result['timestamp']
                }
                self.violations.append(violation)
                
                # Auto-pause for critical violations
                critical_alerts = [
                    'multiple_faces', 
                    'no_face_detected',
                    'device_detected_phone',
                    'device_detected_laptop',
                    'device_detected_secondary_screen'
                ]
                if any(alert in result['alert'] for alert in critical_alerts):
                    self.is_paused = True
                    print(f"\n⚠ EXAM PAUSED - Critical violation detected!")
                    print(f"  Reason: {result['alert']}")
            
            return result
        
        def get_report(self):
            """Generate exam monitoring report"""
            return {
                'student_id': self.student_id,
                'exam_id': self.exam_id,
                'total_frames': self.frame_count,
                'total_violations': len(self.violations),
                'violations': self.violations,
                'final_status': 'FLAGGED' if len(self.violations) > 5 else 'CLEAR'
            }
    
    # Simulate exam monitoring
    print("\nSimulating exam session...")
    session = ExamSession(student_id="S12345", exam_id="EXAM_001")
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
    
    print("Monitoring exam for 10 seconds...")
    print("Press 'q' to stop early\n")
    
    import time
    start_time = time.time()
    
    while time.time() - start_time < 10:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Monitor frame
        result = await session.monitor_frame(frame)
        
        # Display status
        status = "PAUSED" if session.is_paused else "ACTIVE"
        color = (0, 0, 255) if session.is_paused else (0, 255, 0)
        
        cv2.putText(frame, f"Exam Status: {status}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        cv2.putText(frame, f"Violations: {len(session.violations)}", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"FPS: {result['details'].get('fps', 0):.1f}", (10, 90),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        
        cv2.imshow('Exam Monitoring', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    # Generate report
    report = session.get_report()
    
    print("\n" + "="*60)
    print("Exam Monitoring Report")
    print("="*60)
    print(f"Student ID: {report['student_id']}")
    print(f"Exam ID: {report['exam_id']}")
    print(f"Total Frames: {report['total_frames']}")
    print(f"Total Violations: {report['total_violations']}")
    print(f"Final Status: {report['final_status']}")
    
    if report['violations']:
        print("\nViolations Details:")
        for i, v in enumerate(report['violations'][:5], 1):
            print(f"  {i}. Frame {v['frame']}: {v['alert']} (conf: {v['confidence']:.2f})")
        if len(report['violations']) > 5:
            print(f"  ... and {len(report['violations']) - 5} more")
    
    # Save report
    with open('exam_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    print("\nDetailed report saved to: exam_report.json")


async def main():
    """
    Main demo menu
    """
    print("\n" + "="*60)
    print("   AI Proctoring System - Interactive Demo")
    print("="*60)
    print("\nChoose a demo to run:")
    print("  1. Single Frame Processing")
    print("  2. Live Video Stream")
    print("  3. Batch Image Processing")
    print("  4. Custom Integration Example")
    print("  5. Run All Demos")
    print("  0. Exit")
    
    choice = input("\nEnter choice (0-5): ").strip()
    
    if choice == '1':
        await demo_single_frame()
    elif choice == '2':
        await demo_video_stream()
    elif choice == '3':
        await demo_batch_processing()
    elif choice == '4':
        await demo_custom_integration()
    elif choice == '5':
        await demo_single_frame()
        await demo_batch_processing()
        await demo_video_stream()
        await demo_custom_integration()
    elif choice == '0':
        print("\nExiting...")
        return
    else:
        print("\nInvalid choice!")
        return
    
    print("\n" + "="*60)
    print("Demo Complete!")
    print("="*60)


if __name__ == '__main__':
    asyncio.run(main())
