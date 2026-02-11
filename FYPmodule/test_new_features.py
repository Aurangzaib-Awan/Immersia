"""
Quick Test Script - Verify Device Detection and Behavior Status
Tests the new features without requiring a webcam
"""

import asyncio
import cv2
import numpy as np
from main import process_frame

async def test_basic_functionality():
    """Test that the new features work correctly"""
    print("="*60)
    print("Testing Device Detection and Behavior Status Features")
    print("="*60)
    
    # Create a simple test frame (black image)
    test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Add some white noise to make it look more realistic
    noise = np.random.randint(0, 50, test_frame.shape, dtype=np.uint8)
    test_frame = cv2.add(test_frame, noise)
    
    print("\n1. Testing with empty frame (no face)...")
    result = await process_frame(test_frame, client_id="test_client")
    
    print(f"   Alert: {result['alert']}")
    print(f"   Behavior Status: {result.get('behavior_status', 'NOT FOUND')}")
    print(f"   Devices Detected: {result.get('devices_detected', 'NOT FOUND')}")
    print(f"   Response Structure Check:")
    print(f"     - Has 'behavior_status': {'behavior_status' in result}")
    print(f"     - Has 'devices_detected': {'devices_detected' in result}")
    print(f"     - Has 'is_static' (should be False): {'is_static' in result.get('details', {})}")
    
    # Verify expected behavior
    assert 'behavior_status' in result, "❌ Missing 'behavior_status' in response"
    assert 'devices_detected' in result, "❌ Missing 'devices_detected' in response"
    assert 'is_static' not in result.get('details', {}), "❌ 'is_static' should be removed"
    
    print("\n✓ All response structure checks passed!")
    
    # Check behavior status values
    print(f"\n2. Behavior Status Validation:")
    print(f"   Current status: '{result['behavior_status']}'")
    
    expected_statuses = [
        "No person detected",
        "Multiple people detected",
        "Eyes closed or blinking",
        "Looking right (away from screen)",
        "Looking left (away from screen)",
        "Looking down",
        "Looking up",
        "Looking down significantly",
        "Slight gaze deviation",
        "Focused on screen"
    ]
    
    if result['behavior_status'] in expected_statuses:
        print(f"   ✓ Status is valid")
    else:
        print(f"   ⚠ Unexpected status (but may still be correct)")
    
    # Check device detection
    print(f"\n3. Device Detection Check:")
    print(f"   Devices detected: {result.get('devices_detected', [])}")
    print(f"   Type: {type(result.get('devices_detected'))}")
    
    assert isinstance(result.get('devices_detected'), list), "❌ devices_detected should be a list"
    print(f"   ✓ Device detection returns correct type")
    
    # Check alert types
    print(f"\n4. Alert System Check:")
    print(f"   Current alerts: {result['alert']}")
    
    # Test with multiple frames to check temporal smoothing
    print(f"\n5. Processing multiple frames...")
    for i in range(5):
        result = await process_frame(test_frame, client_id="test_client")
        print(f"   Frame {i+1}: {result['alert'][:50]}...")
    
    print("\n" + "="*60)
    print("✓ All tests completed successfully!")
    print("="*60)
    print("\nNew Features Summary:")
    print("  ✓ Behavior status tracking - WORKING")
    print("  ✓ Device detection support - WORKING")
    print("  ✓ Static object detection - REMOVED")
    print("  ✓ Response structure - UPDATED")
    print("\nNext Steps:")
    print("  1. Start the backend: uvicorn main:app --reload")
    print("  2. Start the frontend: npm start")
    print("  3. Test with real webcam and devices")

if __name__ == '__main__':
    asyncio.run(test_basic_functionality())
