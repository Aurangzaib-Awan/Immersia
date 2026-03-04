@echo off
echo ========================================
echo Step 1: Uninstalling broken packages
echo ========================================
python -m pip uninstall mediapipe protobuf -y
echo.
echo ========================================
echo Step 2: Installing replacements
echo ========================================
python -m pip install transformers
python -m pip install "torch>=2.0" torchvision --index-url https://download.pytorch.org/whl/cpu
python -m pip install "opencv-python>=4.8.0"
python -m pip install "Pillow>=9.0.0"
python -m pip install "numpy>=1.24.0"
echo.
echo ========================================
echo Installation complete!
echo ========================================
python -c "import cv2; import numpy; import torch; print('✅ All packages installed successfully')"
