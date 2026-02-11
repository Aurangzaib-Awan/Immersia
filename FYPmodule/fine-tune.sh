#!/bin/bash

# Fine-tuning Script for YOLOv8 Pose Model
# Trains on ETH-XGaze (gaze detection) and PeopleArt (real vs static human detection)

echo "============================================"
echo "YOLOv8 Fine-tuning for Exam Proctoring"
echo "============================================"

# Create directory structure
echo "Creating directory structure..."
mkdir -p datasets/eth-xgaze/{images,labels}/{train,val}
mkdir -p datasets/people-art/{images,labels}/{train,val}
mkdir -p models/checkpoints
mkdir -p models/results

# Install required packages
echo "Installing dependencies..."
pip install ultralytics==8.1.20 --break-system-packages
pip install roboflow --break-system-packages
pip install kaggle --break-system-packages

# ============================================
# Dataset 1: ETH-XGaze for Gaze Detection
# ============================================
echo ""
echo "Preparing ETH-XGaze dataset..."
echo "Please download ETH-XGaze dataset from: http://www.idiap.ch/dataset/ethxgaze"
echo "Place images in datasets/eth-xgaze/images/"

# Script to convert ETH-XGaze to YOLO pose format
cat > prepare_eth_xgaze.py << 'EOF'
import os
import json
import numpy as np
from pathlib import Path
import cv2

def convert_gaze_to_pose(gaze_vector, image_size=(224, 224)):
    """
    Convert gaze vector to pseudo-keypoints for YOLO pose format
    Creates 5 keypoints: nose, left_eye, right_eye, gaze_left, gaze_right
    """
    # Assume face center is at image center
    img_h, img_w = image_size
    center_x, center_y = img_w // 2, img_h // 2
    
    # Face landmarks (normalized)
    nose = [center_x / img_w, center_y / img_h, 1.0]
    left_eye = [(center_x - 30) / img_w, (center_y - 20) / img_h, 1.0]
    right_eye = [(center_x + 30) / img_w, (center_y - 20) / img_h, 1.0]
    
    # Gaze points (project gaze vector)
    gaze_pitch, gaze_yaw = gaze_vector[0], gaze_vector[1]
    
    # Project gaze 50 pixels from eyes
    gaze_offset_x = np.sin(gaze_yaw) * 50
    gaze_offset_y = -np.sin(gaze_pitch) * 50
    
    gaze_left = [
        (center_x - 30 + gaze_offset_x) / img_w,
        (center_y - 20 + gaze_offset_y) / img_h,
        1.0
    ]
    
    gaze_right = [
        (center_x + 30 + gaze_offset_x) / img_w,
        (center_y - 20 + gaze_offset_y) / img_h,
        1.0
    ]
    
    # Flatten to YOLO format: [x, y, visibility] * 5
    keypoints = nose + left_eye + right_eye + gaze_left + gaze_right
    
    return keypoints

def process_eth_xgaze():
    """Process ETH-XGaze dataset"""
    base_path = Path('datasets/eth-xgaze')
    
    # Read annotation file (assuming JSON format)
    # Format: {image_id: {gaze: [pitch, yaw], bbox: [x, y, w, h]}}
    
    print("Processing ETH-XGaze dataset...")
    print("Note: Place annotation.json in datasets/eth-xgaze/")
    
    if not (base_path / 'annotation.json').exists():
        print("Creating sample annotations for demonstration...")
        # Create sample data
        sample_annotations = {}
        for i in range(100):
            sample_annotations[f'sample_{i}.jpg'] = {
                'gaze': [np.random.uniform(-0.5, 0.5), np.random.uniform(-0.5, 0.5)],
                'bbox': [0.3, 0.2, 0.4, 0.6]  # Normalized bbox
            }
        
        with open(base_path / 'annotation.json', 'w') as f:
            json.dump(sample_annotations, f)
    
    with open(base_path / 'annotation.json', 'r') as f:
        annotations = json.load(f)
    
    # Split train/val (80/20)
    from sklearn.model_selection import train_test_split
    image_ids = list(annotations.keys())
    train_ids, val_ids = train_test_split(image_ids, test_size=0.2, random_state=42)
    
    for split, ids in [('train', train_ids), ('val', val_ids)]:
        label_dir = base_path / 'labels' / split
        label_dir.mkdir(parents=True, exist_ok=True)
        
        for img_id in ids:
            ann = annotations[img_id]
            gaze = ann['gaze']
            bbox = ann['bbox']  # [x_center, y_center, width, height] normalized
            
            # Convert to YOLO pose format
            keypoints = convert_gaze_to_pose(gaze)
            
            # YOLO format: class x_center y_center width height kpt1_x kpt1_y kpt1_v ...
            label_line = f"0 {bbox[0]} {bbox[1]} {bbox[2]} {bbox[3]} " + \
                        " ".join([str(k) for k in keypoints])
            
            label_file = label_dir / f"{Path(img_id).stem}.txt"
            with open(label_file, 'w') as f:
                f.write(label_line + '\n')
    
    print(f"ETH-XGaze processed: {len(train_ids)} train, {len(val_ids)} val")

if __name__ == '__main__':
    process_eth_xgaze()
EOF

python prepare_eth_xgaze.py

# ============================================
# Dataset 2: PeopleArt for Static Detection
# ============================================
echo ""
echo "Preparing PeopleArt dataset..."

cat > prepare_people_art.py << 'EOF'
import os
from pathlib import Path
import shutil
import random

def process_people_art():
    """
    Process PeopleArt dataset for real vs static human detection
    Dataset from: https://www.ecva.net/papers/eccv_2020/papers_ECCV/papers/123570256.pdf
    """
    base_path = Path('datasets/people-art')
    
    print("Processing PeopleArt dataset...")
    print("Download from: https://github.com/facebookresearch/PeopleInPaintings")
    
    # Create synthetic examples for demonstration
    print("Creating sample data structure...")
    
    for split in ['train', 'val']:
        for category in ['real', 'static']:
            img_dir = base_path / 'images' / split / category
            img_dir.mkdir(parents=True, exist_ok=True)
    
    # Instructions for real dataset
    instructions = """
    # PeopleArt Dataset Preparation Instructions
    
    1. Download PeopleArt dataset from:
       https://github.com/facebookresearch/PeopleInPaintings
    
    2. Organize as follows:
       datasets/people-art/
         images/
           train/
             real/       # Real human photos
             static/     # Paintings/artwork with humans
           val/
             real/
             static/
    
    3. For YOLO training, we'll treat this as a classification task:
       - Class 0: Real humans
       - Class 1: Static/paintings
    
    4. Run pose detection on all images to create labels
    """
    
    with open(base_path / 'README.txt', 'w') as f:
        f.write(instructions)
    
    print("PeopleArt structure created. See datasets/people-art/README.txt")

if __name__ == '__main__':
    process_people_art()
EOF

python prepare_people_art.py

# ============================================
# Create YAML Configuration Files
# ============================================
echo ""
echo "Creating YAML configuration files..."

# ETH-XGaze YAML
cat > datasets/eth-xgaze/data.yaml << EOF
# ETH-XGaze Dataset Configuration for YOLO Pose

path: $(pwd)/datasets/eth-xgaze
train: images/train
val: images/val

# Number of keypoints
kpt_shape: [5, 3]  # 5 keypoints with (x, y, visibility)

# Keypoint names
names: 
  0: person

# Keypoint labels
keypoint_names:
  - nose
  - left_eye
  - right_eye
  - gaze_left
  - gaze_right

# Keypoint connections for visualization
skeleton:
  - [0, 1]  # nose to left_eye
  - [0, 2]  # nose to right_eye
  - [1, 3]  # left_eye to gaze_left
  - [2, 4]  # right_eye to gaze_right

# Augmentation parameters
augment: True
hsv_h: 0.015
hsv_s: 0.7
hsv_v: 0.4
degrees: 10.0
translate: 0.1
scale: 0.5
flipud: 0.0
fliplr: 0.5
mosaic: 1.0
EOF

# Combined training YAML
cat > datasets/combined_proctoring.yaml << EOF
# Combined Proctoring Dataset Configuration

path: $(pwd)/datasets
train: 
  - eth-xgaze/images/train
val:
  - eth-xgaze/images/val

# Number of keypoints (standard COCO pose: 17 keypoints)
kpt_shape: [17, 3]

# Class names
nc: 1
names:
  0: person

# Training hyperparameters optimized for proctoring
epochs: 100
batch: 16
imgsz: 640
patience: 20
save_period: 10

# Augmentation
augment: True
degrees: 15.0
translate: 0.2
scale: 0.8
flipud: 0.0
fliplr: 0.5
mosaic: 1.0
mixup: 0.1

# Advanced augmentation
copy_paste: 0.1
auto_augment: autoaugment

# Optimizer
optimizer: AdamW
lr0: 0.001
lrf: 0.01
momentum: 0.937
weight_decay: 0.0005

# Loss weights
box: 7.5
cls: 0.5
dfl: 1.5
pose: 12.0
kobj: 1.0
EOF

# ============================================
# Training Script
# ============================================
echo ""
echo "Creating training script..."

cat > train_yolo.py << 'EOF'
from ultralytics import YOLO
import torch

def train_proctoring_model():
    """Train YOLOv8 pose model for exam proctoring"""
    
    print("=" * 60)
    print("Training YOLOv8 Pose Model for Exam Proctoring")
    print("=" * 60)
    
    # Check CUDA availability
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\nUsing device: {device}")
    
    # Load pretrained YOLOv8n-pose model
    model = YOLO('yolov8n-pose.pt')
    
    # Training arguments
    training_args = {
        'data': 'datasets/combined_proctoring.yaml',
        'epochs': 100,
        'imgsz': 640,
        'batch': 16,
        'device': device,
        'project': 'models/results',
        'name': 'proctoring_pose',
        'exist_ok': True,
        'pretrained': True,
        'optimizer': 'AdamW',
        'lr0': 0.001,
        'lrf': 0.01,
        'momentum': 0.937,
        'weight_decay': 0.0005,
        'warmup_epochs': 3.0,
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'box': 7.5,
        'cls': 0.5,
        'dfl': 1.5,
        'pose': 12.0,
        'kobj': 1.0,
        'label_smoothing': 0.0,
        'nbs': 64,
        'hsv_h': 0.015,
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 15.0,
        'translate': 0.2,
        'scale': 0.8,
        'shear': 0.0,
        'perspective': 0.0,
        'flipud': 0.0,
        'fliplr': 0.5,
        'mosaic': 1.0,
        'mixup': 0.1,
        'copy_paste': 0.1,
        'auto_augment': 'autoaugment',
        'val': True,
        'save': True,
        'save_period': 10,
        'cache': False,
        'workers': 8,
        'verbose': True,
    }
    
    # Train the model
    print("\nStarting training...")
    results = model.train(**training_args)
    
    # Validate
    print("\nValidating model...")
    metrics = model.val()
    
    # Export to ONNX for faster inference (optional)
    print("\nExporting to ONNX...")
    try:
        model.export(format='onnx', opset=12, simplify=True)
        print("ONNX export successful!")
    except Exception as e:
        print(f"ONNX export failed: {e}")
    
    # Save final model
    model.save('models/yolov8n-pose-finetuned.pt')
    print("\nModel saved to: models/yolov8n-pose-finetuned.pt")
    
    print("\nTraining Summary:")
    print(f"  - Final mAP50: {metrics.box.map50:.4f}")
    print(f"  - Final mAP50-95: {metrics.box.map:.4f}")
    print(f"  - Pose mAP50: {metrics.pose.map50:.4f}")
    print(f"  - Pose mAP50-95: {metrics.pose.map:.4f}")
    
    return model

if __name__ == '__main__':
    train_proctoring_model()
EOF

# ============================================
# Fine-tuning on Specific Cheating Scenarios
# ============================================
echo ""
echo "Creating scenario-specific fine-tuning script..."

cat > finetune_scenarios.py << 'EOF'
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path

def create_synthetic_cheating_data():
    """
    Create synthetic data for specific cheating scenarios:
    1. Multiple faces
    2. Static images/paintings
    3. Phone usage
    4. Looking away
    """
    
    print("Creating synthetic cheating scenario dataset...")
    
    scenarios_dir = Path('datasets/cheating_scenarios')
    scenarios_dir.mkdir(exist_ok=True)
    
    for scenario in ['multi_face', 'static_image', 'phone_use', 'looking_away']:
        (scenarios_dir / scenario / 'images' / 'train').mkdir(parents=True, exist_ok=True)
        (scenarios_dir / scenario / 'images' / 'val').mkdir(parents=True, exist_ok=True)
        (scenarios_dir / scenario / 'labels' / 'train').mkdir(parents=True, exist_ok=True)
        (scenarios_dir / scenario / 'labels' / 'val').mkdir(parents=True, exist_ok=True)
    
    print("""
    Synthetic Scenario Dataset Structure Created!
    
    Please populate with real examples:
    
    1. Multi-face: Images with 2+ people in frame
    2. Static image: Photos/paintings of people
    3. Phone use: People holding phones near face
    4. Looking away: People not looking at camera
    
    Each scenario should have:
    - ~500 training images
    - ~100 validation images
    - Corresponding YOLO pose labels
    """)

def finetune_on_scenarios():
    """Fine-tune on specific cheating scenarios"""
    
    # Load base model
    model = YOLO('yolov8n-pose-finetuned.pt')
    
    # Fine-tune on each scenario with lower learning rate
    scenarios = ['multi_face', 'static_image', 'phone_use', 'looking_away']
    
    for scenario in scenarios:
        print(f"\nFine-tuning on {scenario} scenario...")
        
        results = model.train(
            data=f'datasets/cheating_scenarios/{scenario}/data.yaml',
            epochs=50,
            imgsz=640,
            batch=8,
            lr0=0.0001,  # Lower learning rate for fine-tuning
            resume=True,
            project='models/results',
            name=f'proctoring_{scenario}'
        )
    
    model.save('models/yolov8n-pose-proctoring-final.pt')
    print("\nFinal model saved!")

if __name__ == '__main__':
    create_synthetic_cheating_data()
    # Uncomment when data is ready:
    # finetune_on_scenarios()
EOF

# ============================================
# Run Training (if data is available)
# ============================================
echo ""
echo "============================================"
echo "Fine-tuning Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Download and prepare datasets (see instructions above)"
echo "2. Run: python train_yolo.py"
echo "3. (Optional) Run: python finetune_scenarios.py"
echo ""
echo "The fine-tuned model will be saved to:"
echo "  models/yolov8n-pose-finetuned.pt"
echo ""
echo "Copy this model to your project root for deployment."
echo ""

# Make scripts executable
chmod +x prepare_eth_xgaze.py
chmod +x prepare_people_art.py
chmod +x train_yolo.py
chmod +x finetune_scenarios.py

echo "Setup complete! Scripts are ready to run."
