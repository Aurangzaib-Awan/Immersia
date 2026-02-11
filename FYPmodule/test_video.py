"""
Test Video Processing Script
Tests the proctoring system on video files and validates accuracy
"""

import cv2
import numpy as np
import asyncio
import json
import time
from pathlib import Path
from collections import defaultdict
import sys

# Import the processing function from main.py
sys.path.append('.')
from main import process_frame, FrameBuffer

class ProctoringTester:
    def __init__(self):
        self.results = defaultdict(list)
        self.ground_truth = {}
        self.frame_count = 0
        
    def load_ground_truth(self, json_path: str):
        """Load ground truth annotations for test video"""
        with open(json_path, 'r') as f:
            self.ground_truth = json.load(f)
        print(f"Loaded ground truth for {len(self.ground_truth)} frames")
    
    def create_test_scenarios(self):
        """Create test video scenarios if none exist"""
        scenarios = {
            'normal': {
                'description': 'Student looking at screen, no violations',
                'expected_alert': 'none',
                'frames': 30
            },
            'gaze_off': {
                'description': 'Student looking away from screen',
                'expected_alert': 'gaze_off_screen',
                'frames': 30
            },
            'multi_face': {
                'description': 'Multiple people in frame',
                'expected_alert': 'multiple_faces',
                'frames': 30
            },
            'no_face': {
                'description': 'No face visible',
                'expected_alert': 'no_face_detected',
                'frames': 30
            },
            'static_object': {
                'description': 'Photo/painting of person',
                'expected_alert': 'static_human_object',
                'frames': 60  # Needs more frames to detect
            },
            'phone_use': {
                'description': 'Hand near face (phone use)',
                'expected_alert': 'hand_near_face',
                'frames': 30
            },
            'looking_down': {
                'description': 'Looking down at notes',
                'expected_alert': 'looking_down',
                'frames': 30
            }
        }
        
        # Save ground truth
        ground_truth = {}
        frame_idx = 0
        
        for scenario_name, scenario in scenarios.items():
            for i in range(scenario['frames']):
                ground_truth[frame_idx] = {
                    'scenario': scenario_name,
                    'expected_alert': scenario['expected_alert'],
                    'description': scenario['description']
                }
                frame_idx += 1
        
        output_path = Path('test_data/ground_truth.json')
        output_path.parent.mkdir(exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(ground_truth, f, indent=2)
        
        print(f"Created ground truth file: {output_path}")
        print(f"Total test frames: {frame_idx}")
        
        return ground_truth
    
    async def process_video(self, video_path: str, client_id: str = "test_client"):
        """Process video file frame by frame"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Error: Could not open video {video_path}")
            return
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"\nProcessing video: {video_path}")
        print(f"  FPS: {fps:.2f}")
        print(f"  Total frames: {total_frames}")
        print(f"  Duration: {total_frames/fps:.2f}s")
        print()
        
        frame_idx = 0
        processing_times = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            start_time = time.time()
            
            # Process frame
            result = await process_frame(frame, client_id)
            
            processing_time = (time.time() - start_time) * 1000
            processing_times.append(processing_time)
            
            # Store result
            self.results[frame_idx] = {
                'alert': result['alert'],
                'confidence': result['conf'],
                'details': result['details'],
                'processing_time': processing_time
            }
            
            # Print progress
            if frame_idx % 30 == 0:
                avg_time = np.mean(processing_times[-30:])
                print(f"Frame {frame_idx}/{total_frames} | "
                      f"Alert: {result['alert'][:30]:30s} | "
                      f"Conf: {result['conf']:.2f} | "
                      f"Time: {processing_time:.1f}ms (avg: {avg_time:.1f}ms)")
            
            frame_idx += 1
        
        cap.release()
        self.frame_count = frame_idx
        
        # Statistics
        print("\n" + "="*70)
        print("Processing Statistics:")
        print("="*70)
        print(f"Total frames processed: {frame_idx}")
        print(f"Average processing time: {np.mean(processing_times):.2f}ms")
        print(f"Min processing time: {np.min(processing_times):.2f}ms")
        print(f"Max processing time: {np.max(processing_times):.2f}ms")
        print(f"Std processing time: {np.std(processing_times):.2f}ms")
        print(f"Latency requirement (<200ms): {'✓ PASS' if np.mean(processing_times) < 200 else '✗ FAIL'}")
        
    def calculate_metrics(self):
        """Calculate detection accuracy metrics"""
        if not self.ground_truth:
            print("\nWarning: No ground truth available. Creating synthetic ground truth...")
            self.ground_truth = self.create_test_scenarios()
        
        # Metrics
        true_positives = 0
        false_positives = 0
        true_negatives = 0
        false_negatives = 0
        
        correct_classifications = 0
        total_frames = min(len(self.results), len(self.ground_truth))
        
        detailed_results = defaultdict(lambda: {'tp': 0, 'fp': 0, 'tn': 0, 'fn': 0})
        
        for frame_idx in range(total_frames):
            if frame_idx not in self.ground_truth:
                continue
            
            gt = self.ground_truth[frame_idx]
            result = self.results.get(frame_idx, {})
            
            expected = gt['expected_alert']
            detected = result.get('alert', 'none')
            
            # Check if detection matches
            if expected == 'none':
                if detected == 'none':
                    true_negatives += 1
                    correct_classifications += 1
                    detailed_results[gt['scenario']]['tn'] += 1
                else:
                    false_positives += 1
                    detailed_results[gt['scenario']]['fp'] += 1
            else:
                # Check if expected alert is in detected alerts
                detected_alerts = detected.split(' AND ')
                
                if expected in detected_alerts or expected == detected:
                    true_positives += 1
                    correct_classifications += 1
                    detailed_results[gt['scenario']]['tp'] += 1
                else:
                    if detected == 'none':
                        false_negatives += 1
                        detailed_results[gt['scenario']]['fn'] += 1
                    else:
                        # Wrong alert type
                        false_positives += 1
                        detailed_results[gt['scenario']]['fp'] += 1
        
        # Calculate metrics
        accuracy = correct_classifications / total_frames if total_frames > 0 else 0
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        specificity = true_negatives / (true_negatives + false_positives) if (true_negatives + false_positives) > 0 else 0
        
        # Print results
        print("\n" + "="*70)
        print("Detection Accuracy Metrics:")
        print("="*70)
        print(f"Total frames tested: {total_frames}")
        print(f"Correct classifications: {correct_classifications}")
        print(f"\nConfusion Matrix:")
        print(f"  True Positives:  {true_positives:4d}")
        print(f"  True Negatives:  {true_negatives:4d}")
        print(f"  False Positives: {false_positives:4d}")
        print(f"  False Negatives: {false_negatives:4d}")
        print(f"\nMetrics:")
        print(f"  Accuracy:    {accuracy*100:6.2f}%")
        print(f"  Precision:   {precision*100:6.2f}%")
        print(f"  Recall:      {recall*100:6.2f}%")
        print(f"  F1-Score:    {f1_score*100:6.2f}%")
        print(f"  Specificity: {specificity*100:6.2f}%")
        print(f"\nAccuracy requirement (>95%): {'✓ PASS' if accuracy > 0.95 else '✗ FAIL'}")
        
        # Per-scenario results
        print("\n" + "="*70)
        print("Per-Scenario Performance:")
        print("="*70)
        print(f"{'Scenario':<20} {'TP':>4} {'TN':>4} {'FP':>4} {'FN':>4} {'Accuracy':>10}")
        print("-"*70)
        
        for scenario, metrics in detailed_results.items():
            tp, tn, fp, fn = metrics['tp'], metrics['tn'], metrics['fp'], metrics['fn']
            total = tp + tn + fp + fn
            acc = (tp + tn) / total if total > 0 else 0
            print(f"{scenario:<20} {tp:4d} {tn:4d} {fp:4d} {fn:4d} {acc*100:9.2f}%")
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'specificity': specificity,
            'confusion_matrix': {
                'tp': true_positives,
                'tn': true_negatives,
                'fp': false_positives,
                'fn': false_negatives
            }
        }
    
    def save_results(self, output_path: str):
        """Save test results to JSON file"""
        results_data = {
            'test_summary': {
                'total_frames': self.frame_count,
                'frames_with_alerts': sum(1 for r in self.results.values() if r['alert'] != 'none')
            },
            'frame_results': self.results,
            'ground_truth': self.ground_truth
        }
        
        with open(output_path, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        print(f"\nResults saved to: {output_path}")

    def generate_report(self, output_path: str):
        """Generate HTML report with visualizations"""
        
        html = """
<!DOCTYPE html>
<html>
<head>
    <title>Proctoring System Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px 25px; background: #f0f0f0; border-radius: 5px; }
        .metric-label { font-size: 12px; color: #666; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .pass { color: #10b981; }
        .fail { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        tr:hover { background: #f5f5f5; }
        .alert-badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 11px; }
        .alert-critical { background: #fee2e2; color: #991b1b; }
        .alert-high { background: #fed7aa; color: #9a3412; }
        .alert-none { background: #d1fae5; color: #065f46; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Proctoring System Test Report</h1>
        <p><strong>Test Date:</strong> {date}</p>
        
        <h2>Summary Metrics</h2>
        <div>
            <div class="metric">
                <div class="metric-label">Accuracy</div>
                <div class="metric-value {accuracy_class}">{accuracy}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Precision</div>
                <div class="metric-value">{precision}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Recall</div>
                <div class="metric-value">{recall}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">F1-Score</div>
                <div class="metric-value">{f1_score}%</div>
            </div>
            <div class="metric">
                <div class="metric-label">Avg Latency</div>
                <div class="metric-value {latency_class}">{avg_latency}ms</div>
            </div>
        </div>
        
        <h2>Sample Detections</h2>
        <table>
            <tr>
                <th>Frame</th>
                <th>Scenario</th>
                <th>Expected</th>
                <th>Detected</th>
                <th>Confidence</th>
                <th>Status</th>
            </tr>
            {detection_rows}
        </table>
        
        <h2>Performance Analysis</h2>
        <p>Total frames processed: <strong>{total_frames}</strong></p>
        <p>Frames with violations: <strong>{violation_frames}</strong></p>
        <p>Average processing time: <strong>{avg_latency}ms</strong></p>
        <p>Latency requirement: <strong class="{latency_class}">{latency_status}</strong></p>
        <p>Accuracy requirement: <strong class="{accuracy_class}">{accuracy_status}</strong></p>
    </div>
</body>
</html>
"""
        
        # Calculate metrics
        metrics = self.calculate_metrics()
        
        # Generate detection rows
        detection_rows = ""
        sample_size = min(50, len(self.results))
        
        for frame_idx in range(sample_size):
            if frame_idx not in self.ground_truth:
                continue
            
            gt = self.ground_truth[frame_idx]
            result = self.results.get(frame_idx, {})
            
            expected = gt['expected_alert']
            detected = result.get('alert', 'none')
            confidence = result.get('confidence', 0)
            
            match = expected in detected.split(' AND ') or expected == detected
            status = '✓' if match else '✗'
            status_class = 'pass' if match else 'fail'
            
            detection_rows += f"""
            <tr>
                <td>{frame_idx}</td>
                <td>{gt['scenario']}</td>
                <td><span class="alert-badge alert-high">{expected}</span></td>
                <td><span class="alert-badge alert-{'none' if detected == 'none' else 'critical'}">{detected}</span></td>
                <td>{confidence:.2f}</td>
                <td class="{status_class}">{status}</td>
            </tr>
            """
        
        # Calculate average latency
        avg_latency = np.mean([r['processing_time'] for r in self.results.values()])
        
        # Fill template
        html = html.format(
            date=time.strftime("%Y-%m-%d %H:%M:%S"),
            accuracy=f"{metrics['accuracy']*100:.2f}",
            accuracy_class="pass" if metrics['accuracy'] > 0.95 else "fail",
            precision=f"{metrics['precision']*100:.2f}",
            recall=f"{metrics['recall']*100:.2f}",
            f1_score=f"{metrics['f1_score']*100:.2f}",
            avg_latency=f"{avg_latency:.1f}",
            latency_class="pass" if avg_latency < 200 else "fail",
            detection_rows=detection_rows,
            total_frames=self.frame_count,
            violation_frames=sum(1 for r in self.results.values() if r['alert'] != 'none'),
            latency_status="PASS (<200ms)" if avg_latency < 200 else "FAIL (≥200ms)",
            accuracy_status="PASS (>95%)" if metrics['accuracy'] > 0.95 else "FAIL (≤95%)"
        )
        
        with open(output_path, 'w') as f:
            f.write(html)
        
        print(f"\nHTML report generated: {output_path}")


async def main():
    """Main test function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test proctoring system on video')
    parser.add_argument('--video', type=str, help='Path to test video file')
    parser.add_argument('--ground-truth', type=str, help='Path to ground truth JSON file')
    parser.add_argument('--output', type=str, default='test_results.json', help='Output results file')
    parser.add_argument('--report', type=str, default='test_report.html', help='Output HTML report')
    
    args = parser.parse_args()
    
    tester = ProctoringTester()
    
    # Load ground truth if provided
    if args.ground_truth:
        tester.load_ground_truth(args.ground_truth)
    
    # Process video
    if args.video:
        if not Path(args.video).exists():
            print(f"Error: Video file not found: {args.video}")
            return
        
        await tester.process_video(args.video)
    else:
        print("Error: Please provide a video file using --video argument")
        print("\nExample usage:")
        print("  python test_video.py --video test_exam.mp4")
        print("  python test_video.py --video test_exam.mp4 --ground-truth ground_truth.json")
        return
    
    # Calculate metrics
    metrics = tester.calculate_metrics()
    
    # Save results
    tester.save_results(args.output)
    
    # Generate report
    tester.generate_report(args.report)
    
    print("\n" + "="*70)
    print("Testing Complete!")
    print("="*70)
    print(f"\nResults saved to:")
    print(f"  - JSON: {args.output}")
    print(f"  - HTML: {args.report}")
    print(f"\nOpen {args.report} in a browser to view the detailed report.")


if __name__ == '__main__':
    asyncio.run(main())
