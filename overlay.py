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

        # --- 2. Preprocessing ---
        gray_image = cv2.cvtColor(sharpened_image, cv2.COLOR_BGR2GRAY)
        
        # --- 3. Thresholding ---
        # Assuming dark outlines on a light background
        _, binary_image = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY_INV)
        
        # --- 4. Find ALL Contours (The Key Change) ---
        # cv2.RETR_LIST retrieves ALL contours (both external and internal)
        contours, _ = cv2.findContours(binary_image, 
                                        cv2.RETR_LIST,  # CHANGE from cv2.RETR_EXTERNAL
                                        cv2.CHAIN_APPROX_SIMPLE)

        RED = (0, 0, 255) 
        result_image = original_image.copy()

        if contours:
            # --- 5. Draw ALL Contours ---
            # -1 tells the function to draw all detected contours
            result_image = cv2.drawContours(result_image, contours, -1, RED, 2)
            print(f"Successfully detected and drew {len(contours)} boundaries.")
        else:
            print("No closed contours found.")

        # --- 6. Display Results ---
        cv2.imshow('Original Image', original_image)
        cv2.imshow('Sharpened Image', sharpened_image)
        cv2.imshow('All Boundaries Detected', result_image)
        
        cv2.waitKey(0)
        cv2.destroyAllWindows()

except Exception as e:
    print(f"An error occurred: {e}")