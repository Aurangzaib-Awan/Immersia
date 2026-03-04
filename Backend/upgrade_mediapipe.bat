@echo off
echo Upgrading Mediapipe to latest version...
C:\Users\asiif\AppData\Local\Python\pythoncore-3.10-64\python.exe -m pip install --upgrade mediapipe
C:\Users\asiif\AppData\Local\Python\pythoncore-3.10-64\python.exe -c "import mediapipe; print(f'Mediapipe version: {mediapipe.__version__}')"
echo Done!
