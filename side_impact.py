import cv2
import numpy as np
import json
import os 

# --- File Paths ---
image_path = './imgsss/side.png'
json_path = './side.json'

# Function to draw a translucent, true color gradient circle
def draw_gradient_damage(image, center_x, center_y, max_radius, start_color_bgr):
    """Draws a solid circle with a radial gradient fade, blending it onto the image."""
    
    # Create an overlay layer for blending
    overlay = image.copy()
    
    # --- KEY CHANGE: Increased steps for smoother gradient ---
    NUM_STEPS = 50 
    
    # Start color (B, G, R) - End color will be black (0, 0, 0)
    start_b, start_g, start_r = start_color_bgr
    
    radius_step = max_radius / NUM_STEPS
    
    # Loop from the outside inward (best for visual smoothness)
    for i in range(NUM_STEPS, 0, -1):
        radius = int(i * radius_step)
        
        # Calculate fade factor (t) from 0.0 (outermost) to 1.0 (innermost/center)
        # We want the color to be full (1.0) at the center (i=50) and zero (0.0) at the edge (i=0)
        t = i / NUM_STEPS 
        
        # Calculate the interpolated color (linear interpolation from Black to Start Color)
        # BGR components fade from 0 up to the full color value.
        current_b = int(start_b * t)
        current_g = int(start_g * t)
        current_r = int(start_r * t)
        current_color = (current_b, current_g, current_r)
        
        # Draw a filled circle onto the overlay
        cv2.circle(overlay, (center_x, center_y), radius, current_color, -1)

    # Blend the fully drawn gradient circle overlay with the original image
    final_alpha = 0.8 # Overall opacity of the damage visual
    cv2.addWeighted(overlay, final_alpha, image, 1 - final_alpha, 0, image)


try:
    # --- 1. Load Data ---
    original_image = cv2.imread(image_path)
    if original_image is None:
        print(f"Error: Could not load image at {image_path}. Check the path.")
        raise FileNotFoundError(f"Image not found at {image_path}")

    # Load JSON file
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    components = data.get("car_side_damage_assessment", {}).get("sections_of_interest", [])

    # --- 2. Sharpening & Preprocessing ---
    sharpening_kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    sharpened_image = cv2.filter2D(original_image, -1, sharpening_kernel)
    gray_image = cv2.cvtColor(sharpened_image, cv2.COLOR_BGR2GRAY)
    _, binary_image = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary_image, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    # --- 3. Define Colors and Sizing ---
    result_image = original_image.copy() 
    
    # Fixed sizes for the visual marker
    MIN_RING_RADIUS = 24
    DAMAGE_SCALING_FACTOR = 100.0 

    # Global Marker Color is RED (BGR)
    GLOBAL_MARKER_COLOR = (0, 0, 255) 

    # --- 4. Calculate Section Boundaries (Minimal) ---
    if not contours:
        print("No car outline found. Cannot proceed.")
        raise Exception("NoContour") 
        
    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)

    section_width = w // 3
    middle_width = section_width
    
    # --- 5. Draw Damage Visuals (Gradient Circles) ---
    for item in components:
        component_name = item.get("component", "")
        
        # --- FILTERING STEP ---
        if "_right_" in component_name:
            continue  # Skip all components designated as "right"
            
        percentage_damage = item.get('percentage_damage', 0.0)
        
        if 'bbox' not in item or not isinstance(item['bbox'], list) or len(item['bbox']) != 4:
            continue

        comp_x, comp_y, comp_w, comp_h = item['bbox']
        
        # Draw Gradient Circle
        if percentage_damage > 0:
            circle_center_x = comp_x + comp_w // 2
            circle_center_y = comp_y + comp_h // 2
            
            # Max_dim for proportional scaling
            max_dim = min(comp_w, comp_h)
            
            # Calculate scaled radius
            scaled_component_damage = max_dim * (percentage_damage / DAMAGE_SCALING_FACTOR)
            scaled_radius = int(MIN_RING_RADIUS + scaled_component_damage)

            # Call the custom function to draw the radial gradient
            draw_gradient_damage(
                result_image, 
                circle_center_x, 
                circle_center_y, 
                scaled_radius, 
                GLOBAL_MARKER_COLOR
            )
            
    # --- 6. Display Results ---
    cv2.imshow('Damage Rings - True Radial Color Gradient', result_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

except FileNotFoundError as e:
    print(f"\nACTION REQUIRED: File not found. Ensure the image and JSON are accessible. Error: {e}")
except KeyError:
    print("\nACTION REQUIRED: Your JSON is missing the 'bbox' key for some components. Please ensure all components have 'bbox': [x, y, w, h].")
except Exception as e:
    if str(e) != "NoContour":
        print(f"An unexpected error occurred: {e}")
        