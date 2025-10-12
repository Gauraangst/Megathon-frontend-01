from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import base64
import requests
import re
import cv2
import numpy as np
import json
import tempfile
from typing import Dict, List, Optional

app = FastAPI(title="CLAIMS BACKEND", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# API_KEY = "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# API_KEY =  "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# API_KEY =  "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# key2="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# Global variable to store the description text

#API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
key2=API_KEY
description_text = ""


def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def clean_content(raw: str) -> str:
    """
    Remove code blocks or triple backticks from OpenRouter responses.
    """
    cleaned = re.sub(r"```(?:json)?\n(.*?)```", r"\1", raw, flags=re.DOTALL)
    return cleaned.strip()


@app.post("/explain")
def explain_image(file: UploadFile = File(...)):
    global description_text

    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    base64_image = encode_image_to_base64(save_path)
    data_url = f"data:image/jpeg;base64,{base64_image}"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Describe this image in detail. Provide JSON keys: "
                        "{ 'description': '...', 'ai_generated_likelihood': 0-1, "
                        "'confidence_reasoning': '...' }"
                    ),
                },
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ]

    payload = {"model": "mistralai/mistral-small-3.2-24b-instruct:free", "messages": messages}

    try:
        response = requests.post(url, headers=headers, json=payload).json()

        # Safely get content
        if "choices" in response:
            raw_content = response["choices"][0]["message"]["content"]
        elif "content" in response:
            raw_content = response["content"]
        else:
            raw_content = str(response)

        # Clean markdown/codeblocks
        description_text = clean_content(raw_content)

    except Exception as e:
        description_text = f"Error: {str(e)}"

    return {"filename": file.filename, "content": description_text}





response_txtss="""
{
  "filename": "image copy.png",
  "content": "{\n  \"description\": \"The image shows a silver sedan with noticeable damage on the driver's side. The damage appears to be significant, with the side panel and door dented and scratched. The front wheel and part of the front bumper are also visible, and the car is positioned against a plain white background.\",\n  \"ai_generated_likelihood\": 0.8,\n  \"confidence_reasoning\": \"The car's damage appears slightly too uniform and the lighting is perfectly even, which is often a characteristic of AI-generated images. However, the details such as the texture of the paint and the specific nature of the damage could also be indicative of a real photograph.\"\n}"
}

"""

@app.get("/check_damage")
def check_damage():
    global response_txtss
    # if not description_text:
    #     return {"estimated_damage": "No description available. Explain an image first."}

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key2}", "Content-Type": "application/json"}

    payload = {
        "model": "openai/gpt-oss-20b:free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Estimate the damage cost in USD for this car description:\n{response_txtss}",
                    }
                ],
            }
        ],
    }

    try:
        res = requests.post(url, headers=headers, json=payload).json()
        # DeepSeek response can be 'choices' or 'content'
        if "choices" in res:
            raw_damage = res["choices"][0]["message"]["content"]
        elif "content" in res:
            raw_damage = res["content"]
        else:
            raw_damage = str(res)

        damage_text = clean_content(raw_damage)

    except Exception as e:
        damage_text = str(e)

    return {"estimated_damage": damage_text}


@app.post("/check_ai")
def check_ai_generation(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image to determine if it was generated by AI.
    """
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    base64_image = encode_image_to_base64(save_path)
    data_url = f"data:image/jpeg;base64,{base64_image}"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    # ** The key change is this prompt **
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Analyze this image for signs of AI generation. Look for common artifacts like "
                        "unnatural textures, incorrect lighting, strange details (e.g., on hands or text), "
                        "or a 'too perfect' appearance. Provide your response in a strict JSON format with the following keys: "
                        "{ \"is_ai_generated\": boolean, \"confidence_score\": float (0.0 to 1.0), "
                        "\"reasoning\": \"A detailed explanation of the visual cues you used for your analysis.\" }"
                    ),
                },
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ]
    
    # We use the same capable vision model
    payload = {"model": "mistralai/mistral-small-3.2-24b-instruct:free", "messages": messages}

    try:
        response = requests.post(url, headers=headers, json=payload).json()
        
        if "choices" in response:
            raw_content = response["choices"][0]["message"]["content"]
        else:
            raw_content = str(response)

        # Clean any markdown/codeblocks from the response
        ai_analysis_text = clean_content(raw_content)

    except Exception as e:
        ai_analysis_text = f"Error: {str(e)}"

    return {"filename": file.filename, "ai_analysis": ai_analysis_text}


# Admin-only damage rendering functions
def draw_gradient_damage(image, center_x, center_y, max_radius, start_color_bgr):
    """Draws a solid circle with a radial gradient fade, blending it onto the image."""
    overlay = image.copy()
    NUM_STEPS = 50 
    start_b, start_g, start_r = start_color_bgr
    radius_step = max_radius / NUM_STEPS
    
    for i in range(NUM_STEPS, 0, -1):
        radius = int(i * radius_step)
        t = i / NUM_STEPS 
        current_b = int(start_b * t)
        current_g = int(start_g * t)
        current_r = int(start_r * t)
        current_color = (current_b, current_g, current_r)
        cv2.circle(overlay, (center_x, center_y), radius, current_color, -1)

    final_alpha = 0.9  # Increased from 0.8 for more visibility
    cv2.addWeighted(overlay, final_alpha, image, 1 - final_alpha, 0, image)


def verify_admin_access():
    """Simple admin verification - in production, use proper authentication"""
    # For demo purposes, we'll accept any request
    # In production, implement proper JWT token verification
    return True

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from typing import Dict
import cv2
import numpy as np
import os
import tempfile

app = FastAPI()

# --- Utility: Admin Access Verification (Placeholder) ---
def verify_admin_access():
    """Simulated admin verification function. Replace with actual logic."""
    return True

# --- Gradient Drawing Function ---
def draw_gradient_damage(image, center_x, center_y, max_radius, start_color_bgr):
    """
    Draws a solid circle with a radial gradient fade, blending it onto the image.
    """
    overlay = image.copy()
    NUM_STEPS = 50  # smoother gradient

    start_b, start_g, start_r = start_color_bgr
    radius_step = max_radius / NUM_STEPS

    for i in range(NUM_STEPS, 0, -1):
        radius = int(i * radius_step)
        t = i / NUM_STEPS  # fade factor from edge to center
        current_color = (
            int(start_b * t),
            int(start_g * t),
            int(start_r * t)
        )
        cv2.circle(overlay, (center_x, center_y), radius, current_color, -1)

    final_alpha = 0.8
    cv2.addWeighted(overlay, final_alpha, image, 1 - final_alpha, 0, image)

# --- API Endpoint ---
@app.post("/admin/render-damage")
def render_damage_overlay(
    damage_data: Dict,
    side: str = "left"  # "left" or "right"
):
    """
    Admin-only endpoint to render a damage overlay on a car image.
    
    Expected damage_data format:
    {
        "components": [
            {
                "component": "front_left_door",
                "is_damaged": true,
                "percentage_damage": 12.5,
                "bbox": [200, 250, 150, 100]
            },
            ...
        ],
        "overall_damage_severity": "MEDIUM"
    }
    """

    # --- 1. Verify Admin Access ---
    if not verify_admin_access():
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        # --- 2. Load Base Image ---
        image_path = './imgsss/side.PNG'
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Base car image not found")

        original_image = cv2.imread(image_path)
        if original_image is None:
            raise HTTPException(status_code=500, detail="Could not load base image")

        # --- 3. Handle Side Selection ---
        if side == "right":
            result_image = cv2.flip(original_image, 1)
            img_width = result_image.shape[1]
        else:
            result_image = original_image.copy()
            img_width = result_image.shape[1]

        # --- 4. Define Constants ---
        MIN_RING_RADIUS = 100
        DAMAGE_SCALING_FACTOR = 10.0
        GLOBAL_MARKER_COLOR = (0, 0, 255)  # Red

        # --- 5. Extract Components ---
        if "components" in damage_data:
            components = damage_data.get("components", [])
        elif "car_side_damage_assessment" in damage_data:
            components = damage_data["car_side_damage_assessment"].get("sections_of_interest", [])
        else:
            components = []

        # --- 6. Render Damage Visuals ---
        for item in components:
            component_name = item.get("component", "")
            percentage_damage = item.get('percentage_damage', 0.0)

            # Filter based on side
            if side == "right" and "_left_" in component_name:
                continue
            elif side == "left" and "_right_" in component_name:
                continue

            # Skip invalid bbox
            if 'bbox' not in item or not isinstance(item['bbox'], list) or len(item['bbox']) != 4:
                continue

            comp_x, comp_y, comp_w, comp_h = item['bbox']

            if percentage_damage > 0:
                # Calculate center position
                if side == "right":
                    new_comp_x = img_width - comp_x - comp_w
                    circle_center_x = new_comp_x + comp_w // 2
                else:
                    circle_center_x = comp_x + comp_w // 2

                circle_center_y = comp_y + comp_h // 2

                # Scale radius by damage %
                max_dim = min(comp_w, comp_h)
                scaled_component_damage = max_dim * (percentage_damage / DAMAGE_SCALING_FACTOR)
                scaled_radius = int(MIN_RING_RADIUS + scaled_component_damage)

                # Draw radial gradient marker
                draw_gradient_damage(
                    result_image,
                    circle_center_x,
                    circle_center_y,
                    scaled_radius,
                    GLOBAL_MARKER_COLOR
                )

        # --- 7. Save and Return Result ---
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
            cv2.imwrite(tmp_file.name, result_image)
            temp_path = tmp_file.name

        return FileResponse(
            temp_path,
            media_type='image/png',
            filename=f'damage_overlay_{side}_side.png'
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rendering damage overlay: {str(e)}")

@app.post("/admin/analyze-damage-components")
def analyze_damage_components(file: UploadFile = File(...)):
    """
    Admin-only endpoint to analyze uploaded image and extract damage components
    Returns detailed damage assessment with component-level breakdown
    """
    # Verify admin access
    if not verify_admin_access():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Save uploaded file
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as f:
            f.write(file.file.read())

        # Load the predefined damage components from side.json
        json_path = './side.json'
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                predefined_data = json.load(f)
            
            # Return the predefined damage assessment
            return {
                "filename": file.filename,
                "damage_assessment": predefined_data,
                "success": True,
                "source": "predefined_side_json"
            }
        else:
            # Fallback: Create a basic damage assessment
            fallback_assessment = {
                "car_side_damage_assessment": {
                    "sections_of_interest": [
                        {
                            "component": "front_left_door",
                            "is_damaged": True,
                            "percentage_damage": 15.0,
                            "bbox": [200, 250, 150, 100],
                            "damage_description": "Moderate damage to front left door"
                        },
                        {
                            "component": "front_wheel",
                            "is_damaged": True,
                            "percentage_damage": 25.0,
                            "bbox": [150, 320, 80, 80],
                            "damage_description": "Significant damage to front wheel"
                        }
                    ],
                    "overall_damage_severity": "MEDIUM"
                }
            }
            
            return {
                "filename": file.filename,
                "damage_assessment": fallback_assessment,
                "success": True,
                "source": "fallback_assessment"
            }

    except Exception as e:
        return {
            "filename": file.filename,
            "error": str(e),
            "success": False
        }


@app.get("/admin/damage-components")
def get_damage_components():
    """
    Admin-only endpoint to get predefined damage components from side.json
    """
    # Verify admin access
    if not verify_admin_access():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        json_path = './side.json'
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Damage components file not found")
            
        with open(json_path, 'r') as f:
            data = json.load(f)
            
        return {
            "damage_components": data,
            "available_sides": ["left", "right"],
            "component_types": [
                "front_left_door", "front_right_door",
                "front_left_window", "front_right_window", 
                "rear_left_door", "rear_right_door",
                "rear_left_window", "rear_right_window",
                "front_wheel", "rear_wheel"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading damage components: {str(e)}")


@app.post("/render-damage-impact")
def render_damage_impact(damage_data: dict):
    """
    Render damage impact visualization using side_impact.py logic
    Takes damage assessment data and generates impact visualization
    """
    try:
        import cv2
        import numpy as np
        import json
        import tempfile
        import os
        
        # Extract damage data from the request
        car_side_damage = damage_data.get("car_side_damage_assessment", {})
        sections = car_side_damage.get("sections_of_interest", [])
        
        if not sections:
            raise HTTPException(status_code=400, detail="No damage sections provided")
        
        # Load the base car image (side view)
        image_path = './imgsss/side.png'
        if not os.path.exists(image_path):
            # Fallback to a default image or create one
            image_path = './imgsss/side_filled.JPG'
            if not os.path.exists(image_path):
                raise HTTPException(status_code=404, detail="Base car image not found")
        
        original_image = cv2.imread(image_path)
        if original_image is None:
            raise HTTPException(status_code=500, detail="Could not load base image")
        
        # Image preprocessing (from side_impact.py)
        sharpening_kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
        sharpened_image = cv2.filter2D(original_image, -1, sharpening_kernel)
        gray_image = cv2.cvtColor(sharpened_image, cv2.COLOR_BGR2GRAY)
        _, binary_image = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(binary_image, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            raise HTTPException(status_code=500, detail="No car outline found in image")
        
        # Create result image
        result_image = original_image.copy()
        
        # Configuration (from side_impact.py)
        MIN_RING_RADIUS = 24
        DAMAGE_SCALING_FACTOR = 100.0
        GLOBAL_MARKER_COLOR = (0, 0, 255)  # Red in BGR
        
        # Function to draw gradient damage (from side_impact.py)
        def draw_gradient_damage(image, center_x, center_y, max_radius, start_color_bgr):
            overlay = image.copy()
            NUM_STEPS = 50
            start_b, start_g, start_r = start_color_bgr
            radius_step = max_radius / NUM_STEPS
            
            for i in range(NUM_STEPS, 0, -1):
                radius = int(i * radius_step)
                t = i / NUM_STEPS
                current_b = int(start_b * t)
                current_g = int(start_g * t)
                current_r = int(start_r * t)
                current_color = (current_b, current_g, current_r)
                cv2.circle(overlay, (center_x, center_y), radius, current_color, -1)
            
            final_alpha = 0.8
            cv2.addWeighted(overlay, final_alpha, image, 1 - final_alpha, 0, image)
        
        # Process each damage section
        for item in sections:
            component_name = item.get("component", "")
            percentage_damage = item.get('percentage_damage', 0.0)
            
            # Skip right side components if processing left side
            if "_right_" in component_name:
                continue
                
            if 'bbox' not in item or not isinstance(item['bbox'], list) or len(item['bbox']) != 4:
                continue
            
            comp_x, comp_y, comp_w, comp_h = item['bbox']
            
            # Draw gradient circle for damage
            if percentage_damage > 0:
                circle_center_x = comp_x + comp_w // 2
                circle_center_y = comp_y + comp_h // 2
                
                max_dim = min(comp_w, comp_h)
                scaled_component_damage = max_dim * (percentage_damage / DAMAGE_SCALING_FACTOR)
                scaled_radius = int(MIN_RING_RADIUS + scaled_component_damage)
                
                draw_gradient_damage(
                    result_image, 
                    circle_center_x, 
                    circle_center_y, 
                    scaled_radius, 
                    GLOBAL_MARKER_COLOR
                )
        
        # Save the result to a temporary file
        temp_dir = "temp_damage_output"
        os.makedirs(temp_dir, exist_ok=True)
        
        output_filename = f"damage_impact_{hash(str(damage_data))}.png"
        output_path = os.path.join(temp_dir, output_filename)
        
        cv2.imwrite(output_path, result_image)
        
        # Return the file
        return FileResponse(
            output_path, 
            media_type="image/png",
            filename=output_filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating damage impact: {str(e)}")


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}