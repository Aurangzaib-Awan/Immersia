@echo off
echo Fixing Protobuf installation...
C:\Users\asiif\AppData\Local\Python\pythoncore-3.10-64\python.exe -m pip install protobuf==3.20.3
C:\Users\asiif\AppData\Local\Python\pythoncore-3.10-64\python.exe -c "import google.protobuf; print(f'Protobuf installed: {google.protobuf.__version__}')"
echo Done!

