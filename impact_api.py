import cv2
import numpy as np
import json
import os 
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from io import BytesIO

# --- API SETUP ---
app = FastAPI()

# --- CONFIGURATION ---
IMAGE_PATH = './imgsss/side.png' # Ensure this file exists!
MIN_RING_RADIUS = 24
DAMAGE_SCALING_FACTOR = 100.0 
GLOBAL_MARKER_COLOR = (0, 0, 255) # RED (BGR)

# --- Pydantic Models for Data Validation (Input Schema) ---

class BoundingBox(BaseModel):
    """Schema for the bounding box coordinates [x, y, w, h]"""
    __root__: list[int] = Field(..., min_items=4, max_items=4, example=[150, 320, 80, 80])

class ComponentDamage(BaseModel):
    """Schema for a single damaged component."""
    component: str = Field(..., example="front_right_wheel")
    percentage_damage: float = Field(..., ge=0.0, le=100.0, example=80.0)
    bbox: list[int] = Field(..., min_items=4, max_items=4, example=[150, 320, 80, 80])
    # Other optional fields from the original JSON are ignored for simplicity here

class DamageAssessment(BaseModel):
    """Root schema for the incoming JSON payload."""
    sections_of_interest: list[ComponentDamage]

# ==========================================================
# --- IMAGE PROCESSING LOGIC ---
# ==========================================================

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

    final_alpha = 0.8 # Overall opacity of the damage visual
    cv2.addWeighted(overlay, final_alpha, image, 1 - final_alpha, 0, image)
    
def generate_damage_image(components_data: list[ComponentDamage]):
    """
    Core function to process the image and draw damage markers based on input data.
    """
    try:
        # Load the base image
        original_image = cv2.imread(IMAGE_PATH)
        if original_image is None:
            raise HTTPException(status_code=500, detail=f"Base image not found at {IMAGE_PATH}")

        # Flip the image horizontally (for right-side view)
        result_image = cv2.flip(original_image, 1)
        img_width = result_image.shape[1] 
        
        # Draw damage visuals
        for item in components_data:
            component_name = item.component
            
            # Skip all components designated as "left" to show only "right"
            if "_left_" in component_name:
                continue
                
            percentage_damage = item.percentage_damage
            
            if percentage_damage <= 0:
                continue
            
            comp_x, comp_y, comp_w, comp_h = item.bbox
            
            # --- COORDINATE TRANSFORMATION ---
            # Flip the x-coordinate of the component's bounding box
            new_comp_x = img_width - comp_x - comp_w
            
            # Calculate the center of the component in the FLIPPED image
            circle_center_x = new_comp_x + comp_w // 2
            circle_center_y = comp_y + comp_h // 2
            
            # Max_dim for proportional scaling
            max_dim = min(comp_w, comp_h)
            
            # Calculate scaled radius
            scaled_component_damage = max_dim * (percentage_damage / DAMAGE_SCALING_FACTOR)
            scaled_radius = int(MIN_RING_RADIUS + scaled_component_damage)

            # Draw the radial gradient
            draw_gradient_damage(
                result_image, 
                circle_center_x, 
                circle_center_y, 
                scaled_radius, 
                GLOBAL_MARKER_COLOR
            )
        
        return result_image

    except HTTPException:
        raise
    except Exception as e:
        # Log the error here if needed
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")


# ==========================================================
# --- API ROUTE ---
# ==========================================================

@app.post("/show_proto", tags=["Damage Visualization"])
async def show_proto(payload: DamageAssessment):
    """
    Accepts damaged points data and returns the rendered, flipped image with radial damage markers.
    """
    # The payload is automatically validated against the Pydantic schema (DamageAssessment)
    components_data = payload.sections_of_interest

    # Generate the image
    result_image = generate_damage_image(components_data)
    
    # Encode the OpenCV image (NumPy array) to a JPEG buffer
    is_success, buffer = cv2.imencode(".jpg", result_image)
    
    if not is_success:
        raise HTTPException(status_code=500, detail="Could not encode image to JPEG.")

    # Return the image as a response
    return Response(content=buffer.tobytes(), media_type="image/jpeg")