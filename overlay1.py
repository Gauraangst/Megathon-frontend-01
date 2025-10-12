import cv2
import numpy as np

image_path = './imgsss/side.png'

try:
    original_image = cv2.imread(image_path)

    if original_image is None:
        print(f"Error: Could not load image at {image_path}. Check the path.")
    else:
        # --- 1. Sharpening ---
        sharpening_kernel = np.array([[-1, -1, -1],
                                      [-1,  9, -1],
                                      [-1, -1, -1]])
        sharpened_image = cv2.filter2D(original_image, -1, sharpening_kernel)

        # --- 2. Preprocessing for contour detection (still needed for car_bbox) ---
        gray_image = cv2.cvtColor(sharpened_image, cv2.COLOR_BGR2GRAY)
        _, binary_image = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY_INV)
        
        # --- 3. Find ALL Contours (still needed to define car_bbox) ---
        contours, _ = cv2.findContours(binary_image, 
                                        cv2.RETR_LIST, 
                                        cv2.CHAIN_APPROX_SIMPLE)

        # --- 4. Prepare base image for shading ---
        result_image_with_shading = original_image.copy() 
        overlay = result_image_with_shading.copy()
        alpha = 0.3 # Translucency factor
        
        # Define Colors (BGR)
        RED = (0, 0, 255)
        DARK_GREEN = (0, 100, 0)
        PURPLE = (128, 0, 128) # BGR: Blue=128, Green=0, Red=128
        LIGHT_BLUE = (255, 165, 0) # This will be the larger blue section

        # --- 5. Find the bounding box of the main car outline ---
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)

            # --- 6. Define the 3 main sections (Front, Middle, Rear) ---
            section_width = w // 3
            
            # Front (Red)
            front_x = x
            
            # Middle section starting coordinates and full width
            middle_x = x + section_width
            middle_width = section_width

            # Rear section starting coordinates and full width
            rear_x = x + 2 * section_width
            rear_width = w - (2 * section_width) # Covers remaining pixels

            # --- 7. Recalculate widths for the 4 desired rectangles ---
            
            # Larger Green (65% of original middle section)
            width_65_percent_green = int(middle_width * 0.65)
            
            # Width of the old smaller green (35% of original middle)
            width_35_percent_green = middle_width - width_65_percent_green 
            
            # Width of the old smaller blue (30% of original rear)
            width_30_percent_blue = int(rear_width * 0.30)
            
            # Width of the old larger blue (70% of original rear)
            width_70_percent_blue = rear_width - width_30_percent_blue

            # --- Calculate the NEW Purple Section ---
            # It starts where the 65% green ends (middle_x + width_65_percent_green)
            # Its total width is the sum of the 35% green and 30% blue
            purple_x = middle_x + width_65_percent_green
            purple_width = width_35_percent_green + width_30_percent_blue
            
            # --- Calculate the NEW Larger Blue Section ---
            # It starts where the purple section ends (purple_x + purple_width)
            # Its width is the original 70% of the rear section
            final_blue_x = purple_x + purple_width
            final_blue_width = width_70_percent_blue # This is effectively the old 70% blue

            # --- 8. Shade the 4 new sections translucently ---
            
            # Rect 1: Front (Red)
            cv2.rectangle(overlay, (front_x, y), 
                                   (front_x + section_width, y + h), 
                                   RED, -1)
            
            # Rect 2: Larger Green (65% of original middle)
            cv2.rectangle(overlay, (middle_x, y), 
                                   (middle_x + width_65_percent_green, y + h), 
                                   DARK_GREEN, -1)

            # Rect 3: New Combined Purple (35% green + 30% blue)
            cv2.rectangle(overlay, (purple_x, y), 
                                   (purple_x + purple_width, y + h), 
                                   PURPLE, -1)
            
            # Rect 4: Larger Blue (70% of original rear)
            cv2.rectangle(overlay, (final_blue_x, y), 
                                   (final_blue_x + final_blue_width, y + h), 
                                   LIGHT_BLUE, -1)

            # Blend the overlay with the original image
            result_image_with_shading = cv2.addWeighted(overlay, alpha, result_image_with_shading, 1 - alpha, 0)
            
        else:
            print("No contours found for defining car sections.")
        
        # --- 9. Display Results ---
        cv2.imshow('Original Image', original_image)
        cv2.imshow('Car Sections with 4 Rects (Purple Merge)', result_image_with_shading)
        
        cv2.waitKey(0)
        cv2.destroyAllWindows()

except Exception as e:
    print(f"An error occurred: {e}")