#!/bin/bash

# AI Proctoring System - Quick Start Script
# This script sets up and runs the complete proctoring system

set -e  # Exit on error

echo "=================================================="
echo "   AI Exam Proctoring System - Quick Start"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
print_success "Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip."
    exit 1
fi
print_success "pip3 found"

# Check if Node.js is installed (optional for frontend)
if command -v node &> /dev/null; then
    print_success "Node.js found: $(node --version)"
    NODEJS_AVAILABLE=true
else
    print_info "Node.js not found. Frontend will not be set up."
    NODEJS_AVAILABLE=false
fi

echo ""
print_info "Installing Python dependencies..."

# Create virtual environment (optional but recommended)
if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true

# Install Python dependencies
pip install -r requirements.txt --break-system-packages 2>&1 | grep -v "WARNING" || \
pip install -r requirements.txt 2>&1 | grep -v "WARNING"

print_success "Python dependencies installed"

# Download base YOLOv8 model if not present
echo ""
print_info "Checking YOLOv8 model..."
python3 << EOF
try:
    from ultralytics import YOLO
    model = YOLO('yolov8n-pose.pt')
    print("YOLOv8 model ready")
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)
EOF

if [ $? -eq 0 ]; then
    print_success "YOLOv8 model ready"
else
    print_error "Failed to load YOLOv8 model"
    exit 1
fi

# Set up frontend (if Node.js is available)
if [ "$NODEJS_AVAILABLE" = true ]; then
    echo ""
    print_info "Setting up frontend..."
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        print_info "Installing Node.js dependencies..."
        npm install 2>&1 | tail -n 5
        print_success "Frontend dependencies installed"
    else
        print_info "Skipping frontend setup (package.json not found)"
    fi
fi

# Create necessary directories
echo ""
print_info "Creating directory structure..."
mkdir -p models/checkpoints models/results
mkdir -p datasets/eth-xgaze/{images,labels}/{train,val}
mkdir -p datasets/people-art/{images,labels}/{train,val}
mkdir -p test_data
print_success "Directories created"

echo ""
echo "=================================================="
echo "   Setup Complete!"
echo "=================================================="
echo ""
echo "To start the system:"
echo ""
echo "1. Start the backend:"
print_info "   python main.py"
echo ""

if [ "$NODEJS_AVAILABLE" = true ]; then
    echo "2. Start the frontend (in another terminal):"
    print_info "   npm start"
    echo ""
fi

echo "3. Open your browser and navigate to:"
if [ "$NODEJS_AVAILABLE" = true ]; then
    print_info "   http://localhost:3000"
else
    print_info "   http://localhost:8000"
fi

echo ""
echo "Optional - To test with a video file:"
print_info "   python test_video.py --video path/to/video.mp4"
echo ""

echo "Optional - To fine-tune the model:"
print_info "   chmod +x fine-tune.sh"
print_info "   ./fine-tune.sh"
echo ""

echo "For more information, see README.md"
echo ""

# Ask if user wants to start the backend now
read -p "Do you want to start the backend server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_success "Starting backend server..."
    echo ""
    python main.py
fi
