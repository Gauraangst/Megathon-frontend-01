#!/usr/bin/env python3
"""
Test script for the damage impact visualization API endpoint
"""

import requests
import json
import os

def test_damage_impact_api():
    """Test the new damage impact API endpoint"""
    
    # Test data matching the side.json structure
    test_damage_data = {
        "car_side_damage_assessment": {
            "sections_of_interest": [
                {
                    "component": "front_left_door",
                    "is_damaged": True,
                    "percentage_damage": 12.5,
                    "bbox": [200, 250, 150, 100]
                },
                {
                    "component": "front_right_door", 
                    "is_damaged": True,
                    "percentage_damage": 5.0,
                    "bbox": [200, 240, 150, 100]
                },
                {
                    "component": "front_wheel",
                    "is_damaged": True,
                    "percentage_damage": 20.0,
                    "bbox": [150, 320, 80, 80]
                },
                {
                    "component": "rear_wheel",
                    "is_damaged": True,
                    "percentage_damage": 10.0,
                    "bbox": [450, 320, 80, 80]
                }
            ],
            "overall_damage_severity": "MEDIUM
        }
    }
    
    print("🧪 Testing Damage Impact API...")
    print(f"📊 Test data: {json.dumps(test_damage_data, indent=2)}")
    
    try:
        # Make request to the API
        response = requests.post(
            "http://localhost:8000/render-damage-impact",
            json=test_damage_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            # Save the response image
            output_path = "test_damage_impact_output.png"
            with open(output_path, "wb") as f:
                f.write(response.content)
            
            print(f"✅ Success! Damage impact visualization saved to: {output_path}")
            print(f"📏 Image size: {len(response.content)} bytes")
            
            # Check if file exists and has content
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"📁 File exists with size: {file_size} bytes")
            else:
                print("❌ Output file not found")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"📝 Error details: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running on http://localhost:8000")
        print("💡 Start the server with: uvicorn api:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_damage_impact_api()
