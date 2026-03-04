import mediapipe
import google.protobuf as protobuf

print(f'Mediapipe version: {mediapipe.__version__}')
print(f'Protobuf version: {protobuf.__version__}')

# Try to import protobuf info
try:
    from google.protobuf import __version__
    print(f'Protobuf __version__: {__version__}')
except:
    pass
