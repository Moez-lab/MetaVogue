# -*- coding: utf-8 -*-
import cv2
import mediapipe as mp
import numpy as np
import json
import sys
from datetime import datetime
from human_readable import get_feature_summary

# Initialize mediapipe solutions
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Depth estimation imports
try:
    from transformers import pipeline
    import torch
    DEPTH_AVAILABLE = True
except ImportError:
    DEPTH_AVAILABLE = False
    print("Warning: Depth estimation not available. Install transformers and torch for better accuracy.")

# Initialize depth model (lazy loading)
depth_model = None

def get_depth_model():
    """Lazy load depth estimation model"""
    global depth_model
    if not DEPTH_AVAILABLE:
        return None
    if depth_model is None:
        print("Loading depth estimation model...")
        try:
            depth_model = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")
        except Exception as e:
            print(f"Could not load depth model: {e}")
            return None
    return depth_model


def get_median_color(image, mask=None):
    """Get median color instead of mode to avoid black pixel bias"""
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    if mask is not None:
        img_rgb = cv2.bitwise_and(img_rgb, img_rgb, mask=mask)
    
    pixels = img_rgb.reshape(-1, 3)
    non_black_pixels = pixels[np.any(pixels > 30, axis=1)]
    
    if len(non_black_pixels) == 0:
        return tuple(np.median(pixels, axis=0).astype(int))
    
    median_color = np.median(non_black_pixels, axis=0).astype(int)
    return tuple(median_color)

def classify_hair_color(bgr_color):
    """Classify hair color from BGR tuple into readable category"""
    if bgr_color is None:
        return "Unknown"
    
    # Convert BGR to RGB
    b, g, r = bgr_color
    
    # Calculate brightness and saturation
    brightness = (r + g + b) / 3
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    saturation = (max_val - min_val) / max_val if max_val > 0 else 0
    
    # Very dark hair (Black/Dark Brown)
    # Also check if it's very dark with blue tint (common in black hair photos)
    if brightness < 45 or (brightness < 60 and b > r and b > g):
        return "Black"
    elif brightness < 75:
        return "Dark Brown"
    
    # Check for red/auburn hair (red channel significantly higher)
    # But only if brightness is high enough - dark hair with slight red tint is still dark brown
    if r > g + 20 and r > b + 20 and saturation > 0.25 and brightness > 90:
        if brightness > 130:
            return "Light Auburn"
        elif brightness > 100:
            return "Auburn"
        else:
            return "Dark Red"
    
    # Check for blonde hair (high brightness, low saturation, balanced RGB)
    if brightness > 150 and saturation < 0.25:
        return "Blonde"
    elif brightness > 130 and saturation < 0.2:
        return "Light Blonde"
    elif brightness > 110 and saturation < 0.3:
        return "Dirty Blonde"
    
    # Brown variations
    if brightness >= 70 and brightness < 110:
        if saturation < 0.15:
            return "Medium Brown"
        else:
            return "Brown"
    elif brightness >= 110 and brightness < 150:
        return "Light Brown"
    
    # Gray/White/Silver hair (low saturation, high brightness)
    if saturation < 0.12 and brightness > 120:
        if brightness > 200:
            return "White/Platinum"
        else:
            return "Gray/Silver"
    
    # Default fallback based on brightness
    if brightness < 90:
        return "Dark Brown"
    else:
        return "Brown"




def save_to_json(features, image_path):
    """Save extracted features to JSON file"""
    def convert_to_serializable(obj):
        if isinstance(obj, (np.integer, np.int32, np.int64)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: convert_to_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, (tuple, list)):
            return [convert_to_serializable(item) for item in obj]
        elif isinstance(obj, (bool, np.bool_)):
            return bool(obj)
        else:
            return obj
    
    json_features = convert_to_serializable(features)
    
    output = {
        "image_path": image_path,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "features": json_features
    }
    
    json_path = image_path.replace('.jpg', '_features.json').replace('.png', '_features.json')
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    return json_path

def convert_to_cm(measurements_px, reference_height_cm):
    """Convert pixel measurements to centimeters"""
    if not measurements_px.get('height') or not reference_height_cm:
        return None
    
    ratio = reference_height_cm / measurements_px['height']
    
    # VALIDATION: Detect unrealistic conversion ratios
    # For typical human photos, ratio should be between 0.5 and 1.5
    if ratio < 0.5 or ratio > 1.5:
        print(f"Warning: Conversion ratio {ratio:.2f} seems unrealistic (Image likely cropped/upper body)")
        print("Using shoulder-based height estimation as fallback")
        print(f"Shoulder width: {measurements_px['shoulder_width']:.1f}px")
        
        # Estimate full height from shoulder width (typical ratio ~1:3.5)
        estimated_height_px = measurements_px['shoulder_width'] * 3.5
        ratio = reference_height_cm / estimated_height_px
        print(f"Estimated height: {estimated_height_px:.1f}px, New ratio: {ratio:.4f}")
    
    result = {
        'shoulder_width_cm': round(measurements_px['shoulder_width'] * ratio, 1) if measurements_px.get('shoulder_width') else None,
        'bust_cm': round(measurements_px['bust'] * ratio, 1) if measurements_px.get('bust') else None,
        'waist_cm': round(measurements_px['waist'] * ratio, 1) if measurements_px.get('waist') else None,
        'hips_cm': round(measurements_px['hips'] * ratio, 1) if measurements_px.get('hips') else None,
        'height_cm': reference_height_cm,
        'conversion_ratio': round(ratio, 4)
    }
    
    # PROPORTIONAL VALIDATION: Check if bust seems realistic vs shoulders
    if result['bust_cm'] and result['shoulder_width_cm']:
        bust_shoulder_ratio = result['bust_cm'] / result['shoulder_width_cm']
        
        if bust_shoulder_ratio > 1.8:
            print(f"Warning: Bust ({result['bust_cm']}cm) too large for shoulders ({result['shoulder_width_cm']}cm)")
            print(f"   Using proportional estimate: 1.2x shoulders")
            result['bust_cm'] = round(result['shoulder_width_cm'] * 1.2, 1)
        elif bust_shoulder_ratio < 0.95:
            print(f"Warning: Bust ({result['bust_cm']}cm) too small. Using 1.05x shoulders")
            result['bust_cm'] = round(result['shoulder_width_cm'] * 1.05, 1)
    
    return result

def calculate_distance(point1, point2, image_width, image_height):
    """Calculate Euclidean distance between two landmarks in pixels"""
    x1, y1 = point1.x * image_width, point1.y * image_height
    x2, y2 = point2.x * image_width, point2.y * image_height
    return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def extract_eye_color(image, face_landmarks, image_width, image_height):
    """Extract eye color from iris region"""
    try:
        left_iris = [468, 469, 470, 471, 472]
        lm = face_landmarks.landmark
        
        left_points = [(int(lm[i].x * image_width), int(lm[i].y * image_height)) for i in left_iris]
        if all(0 <= p[0] < image_width and 0 <= p[1] < image_height for p in left_points):
            eye_region = np.array([[p[0], p[1]] for p in left_points], np.int32)
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [eye_region], 255)
            eye_color = get_median_color(image, mask)
            
            r, g, b = eye_color
            if b > r and b > g:
                return "Blue"
            elif g > r and g > b:
                return "Green"
            elif r > 100 and g > 80:
                return "Brown"
            elif r < 60 and g < 60 and b < 60:
                return "Dark Brown/Black"
            else:
                return "Hazel/Mixed"
    except:
        pass
    return "Unknown"

def analyze_emotion(eyes_open, smiling, mouth_ratio, eye_ratio):
    """Analyze emotion based on facial features"""
    if smiling and eyes_open:
        return "Happy"
    elif not eyes_open:
        return "Closed Eyes/Tired"
    elif mouth_ratio < 2.0 and not smiling:
        return "Neutral/Serious"
    elif smiling:
        return "Slight Smile"
    else:
        return "Neutral"

def calculate_head_pose(face_landmarks, image_width, image_height):
    """Calculate head pose angles (yaw, pitch, roll)"""
    try:
        lm = face_landmarks.landmark
        
        nose_tip = lm[1]
        chin = lm[152]
        left_eye = lm[33]
        right_eye = lm[263]
        
        eye_distance = abs(right_eye.x - left_eye.x)
        nose_to_left = abs(nose_tip.x - left_eye.x)
        nose_to_right = abs(nose_tip.x - right_eye.x)
        
        if eye_distance > 0:
            yaw_ratio = (nose_to_right - nose_to_left) / eye_distance
            yaw = yaw_ratio * 45
        else:
            yaw = 0
        
        face_height = abs(chin.y - nose_tip.y)
        nose_position = (nose_tip.y - left_eye.y) / face_height if face_height > 0 else 0
        pitch = (nose_position - 0.5) * 90
        
        eye_slope = (right_eye.y - left_eye.y) / (right_eye.x - left_eye.x) if (right_eye.x - left_eye.x) != 0 else 0
        roll = np.degrees(np.arctan(eye_slope))
        
        return {
            "yaw": round(yaw, 1),
            "pitch": round(pitch, 1),
            "roll": round(roll, 1)
        }
    except:
        return {"yaw": 0, "pitch": 0, "roll": 0}

def classify_body_shape(measurements):
    """Classify body shape based on measurements"""
    if not all([measurements['bust'], measurements['waist'], measurements['hips']]):
        return "Unknown"
    
    bust = measurements['bust']
    waist = measurements['waist']
    hips = measurements['hips']
    bust_hip_diff = abs(bust - hips)
    
    if bust_hip_diff < 10 and waist < bust * 0.75:
        return "Hourglass"
    elif hips > bust and hips - bust > 10:
        return "Pear/Triangle"
    elif bust > hips and bust - hips > 10:
        return "Inverted Triangle"
    elif bust_hip_diff < 10 and waist > bust * 0.75:
        return "Rectangle"
    elif waist > bust and waist > hips:
        return "Apple/Oval"
    else:
        return "Balanced"

def detect_gender(body_measurements, hair_length, face_bbox):
    """Detect gender based on body measurements and features"""
    score = 0  # Positive = Male, Negative = Female
    
    # Body measurements analysis
    if body_measurements.get('shoulder_width') and body_measurements.get('hips'):
        shoulder_hip_ratio = body_measurements['shoulder_width'] / body_measurements['hips']
        
        # Males typically have broader shoulders relative to hips
        if shoulder_hip_ratio > 1.1:
            score += 2  # Strong male indicator
        elif shoulder_hip_ratio < 0.95:
            score -= 2  # Strong female indicator
        elif shoulder_hip_ratio > 1.05:
            score += 1  # Mild male indicator
        else:
            score -= 1  # Mild female indicator
    
    # Bust/chest analysis
    if body_measurements.get('bust') and body_measurements.get('shoulder_width'):
        bust_shoulder_ratio = body_measurements['bust'] / body_measurements['shoulder_width']
        
        # Females typically have larger bust relative to shoulders
        if bust_shoulder_ratio > 1.15:
            score -= 2  # Female indicator
        elif bust_shoulder_ratio < 1.05:
            score += 1  # Male indicator
    
    # Hair length (general trend, not definitive)
    if hair_length:
        if "Long" in hair_length:
            score -= 1  # Slight female indicator
        elif "Very Short" in hair_length or "Bald" in hair_length:
            score += 1  # Slight male indicator
    
    # Face shape (width to height ratio)
    if face_bbox:
        x1, y1, x2, y2 = face_bbox
        face_width = x2 - x1
        face_height = y2 - y1
        
        if face_height > 0:
            face_ratio = face_width / face_height
            # Males tend to have wider faces
            if face_ratio > 0.85:
                score += 1
            elif face_ratio < 0.75:
                score -= 1
    
    # Final classification
    if score > 0:
        return "Male"
    elif score < 0:
        return "Female"
    else:
        return "Unknown"

def detect_facial_hair(image, face_bbox, face_color):
    """Detect presence of facial hair (beard/mustache)"""
    try:
        x1, y1, x2, y2 = face_bbox
        face_height = y2 - y1
        
        lower_face_y1 = int(y1 + face_height * 0.6)
        lower_face = image[lower_face_y1:y2, x1:x2]
        
        if lower_face.size == 0:
            return "No"
        
        lower_face_color =  get_median_color(lower_face)
        face_avg = sum(face_color) / 3
        lower_avg = sum(lower_face_color) / 3
        
        if face_avg - lower_avg > 30:
            return "Yes (Detected)"
        else:
            return "No/Minimal"
    except:
        return "Unknown"

def estimate_hair_length(hair_region_height, face_height):
    """Estimate hair length based on hair region size"""
    if hair_region_height is None or face_height == 0:
        return "Unknown"
    
    ratio = hair_region_height / face_height
    
    if ratio < 0.3:
        return "Very Short/Bald"
    elif ratio < 0.5:
        return "Short"
    elif ratio < 0.8:
        return "Medium"
    else:
        return "Long"

def detect_hair_type(hair_region):
    """Detect hair type: straight, wavy, curly, kinky"""
    if hair_region is None or hair_region.size == 0:
        return "Unknown"
    
    try:
        # Convert to grayscale for texture analysis
        if len(hair_region.shape) == 3:
            gray_hair = cv2.cvtColor(hair_region, cv2.COLOR_BGR2GRAY)
        else:
            gray_hair = hair_region
        
        # Apply edge detection to  find hair texture patterns
        edges = cv2.Canny(gray_hair, 50, 150)
        
        # Calculate variance and edge density
        edge_density = np.sum(edges > 0) / edges.size
        texture_variance = np.var(gray_hair)
        
        # Very conservative classification - better to under-classify than mis-classify
        # Most hair will be classified as straight or wavy
        # Only obvious curly/kinky patterns will be detected as such
        
        if texture_variance < 1200:
            return "Straight"
        elif texture_variance < 2000 or edge_density < 0.30:
            return "Wavy"
        elif edge_density >= 0.50 and texture_variance >= 2500:
            return "Kinky"
        elif texture_variance >= 2000:
            return "Curly"
        else:
            return "Straight"  # Default to straight if unclear
    except:
        return "Unknown"

def extract_body_measurements(image, rgb_image, vis_image, visualize=True):
    """Extract body measurements using MediaPipe Pose"""
    h, w, _ = image.shape
    measurements = {
        "shoulder_width": None,
        "bust": None,
        "waist": None,
        "hips": None,
        "height": None
    }
    
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        min_detection_confidence=0.3
    ) as pose:
        pose_results = pose.process(rgb_image)
        
        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks.landmark
            
            if visualize:
                mp_drawing.draw_landmarks(
                    vis_image,
                    pose_results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
                )
            
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            shoulder_width = calculate_distance(left_shoulder, right_shoulder, w, h)
            measurements["shoulder_width"] = round(shoulder_width, 2)
            
            # Get hip landmarks first - we'll need them for all measurements
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            
            # Initialize fallback contour measurements
            chest_measurements = []
            
            # DEPTH-ENHANCED Mutiplier
            # Use contour width as base, add depth projection
            bust_width = 0
            
            # 1. Get solid contour width first
            contour_width = 0
            if chest_measurements:
                contour_width = max(chest_measurements)
            else:
                contour_width = shoulder_width * 1.15
                
            # 2. Get depth intensity for projection
            projection_factor = 1.10 # Default
            
            depth_pipe = get_depth_model()
            if depth_pipe is not None and DEPTH_AVAILABLE:
                try:
                    # Convert image for depth model
                    from PIL import Image
                    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    pil_img = Image.fromarray(img_rgb)
                    
                    # Generate depth map
                    depth_output = depth_pipe(pil_img)
                    depth_array = np.array(depth_output["depth"])
                    
                    # Normalize locally in chest region for better contrast
                    # Get intensity stats in chest area
                    chest_y_start = int(left_shoulder.y * h)
                    chest_y_end = int(left_hip.y * h)
                    chest_region = depth_array[chest_y_start:chest_y_end, :]
                    
                    if chest_region.size > 0:
                        d_min, d_max = chest_region.min(), chest_region.max()
                        if d_max > d_min:
                            # Search for max depth peak in bust area
                            center_x = int((left_shoulder.x + right_shoulder.x) / 2 * w)
                            roi_w = int(shoulder_width)
                            
                            # Scan center column
                            center_depths = chest_region[:, max(0, center_x-roi_w):min(w, center_x+roi_w)]
                            max_depth_val = center_depths.max()
                            
                            # Normalize this peak [0, 1] relative to body
                            normalized_peak = (max_depth_val - d_min) / (d_max - d_min)
                            
                            print(f"Depth peak intensity: {normalized_peak:.2f}")
                            
                            # Map 0.5-1.0 intensity to 1.15-1.40 projection
                            if normalized_peak > 0.8:
                                projection_factor = 1.35
                            elif normalized_peak > 0.6:
                                projection_factor = 1.25
                            elif normalized_peak > 0.4:
                                projection_factor = 1.18
                            else:
                                projection_factor = 1.12
                except Exception as e:
                    print(f"Depth analysis failed: {e}")
            
            bust_width = contour_width * projection_factor
            measurements["bust"] = round(bust_width, 2)
            
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            waist_width = calculate_distance(left_hip, right_hip, w, h) * 0.85
            measurements["waist"] = round(waist_width, 2)
            
            hip_width = calculate_distance(left_hip, right_hip, w, h)
            measurements["hips"] = round(hip_width, 2)
            
            nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
            left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
            right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
            avg_ankle_y = (left_ankle.y + right_ankle.y) / 2
            height = abs(nose.y - avg_ankle_y) * h
            measurements["height"] = round(height, 2)
            
            if visualize:
                cv2.line(vis_image, 
                        (int(left_shoulder.x * w), int(left_shoulder.y * h)),
                        (int(right_shoulder.x * w), int(right_shoulder.y * h)),
                        (255, 255, 0), 2)
                cv2.putText(vis_image, f"Shoulder: {shoulder_width:.1f}px",
                           (int(left_shoulder.x * w) - 50, int(left_shoulder.y * h) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
                
                cv2.line(vis_image,
                        (int(left_hip.x * w), int(left_hip.y * h)),
                        (int(right_hip.x * w), int(right_hip.y * h)),
                        (255, 0, 255), 2)
                cv2.putText(vis_image, f"Hips: {hip_width:.1f}px",
                           (int(left_hip.x * w) - 50, int(left_hip.y * h) + 20),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 2)
        else:
            print("Pose landmarks not detected.")
    
    return measurements

def extract_features(image_path, visualize=True):
    image = cv2.imread(image_path)
    if image is None:
        print("Image not found.")
        return None
    
    vis_image = image.copy()
    h, w, _ = image.shape

    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_detection.process(rgb_image)
        
        if not results.detections:
            print("No face detected.")
            return None
        
        face = results.detections[0]
        bboxC = face.location_data.relative_bounding_box
        
        x1 = max(0, int(bboxC.xmin * w))
        y1 = max(0, int(bboxC.ymin * h))
        x2 = min(w, x1 + int(bboxC.width * w))
        y2 = min(h, y1 + int(bboxC.height * h))

        if visualize:
            cv2.rectangle(vis_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(vis_image, "Face", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        face_h = y2 - y1
        face_w = x2 - x1
        
        # IMPROVED FACE COLOR DETECTION - Sample from cheeks and forehead
        # Avoid center (nose/mouth shadows) and use skin-rich areas
        
        # Left cheek region
        left_cheek_x1 = x1 + int(face_w * 0.15)
        left_cheek_x2 = x1 + int(face_w * 0.4)
        cheek_y1 = y1 + int(face_h * 0.4)
        cheek_y2 = y1 + int(face_h * 0.7)
        left_cheek = image[cheek_y1:cheek_y2, left_cheek_x1:left_cheek_x2]
        
        # Right cheek region
        right_cheek_x1 = x1 + int(face_w * 0.6)
        right_cheek_x2 = x1 + int(face_w * 0.85)
        right_cheek = image[cheek_y1:cheek_y2, right_cheek_x1:right_cheek_x2]
        
        # Forehead region
        forehead_x1 = x1 + int(face_w * 0.25)
        forehead_x2 = x1 + int(face_w * 0.75)
        forehead_y1 = y1 + int(face_h * 0.15)
        forehead_y2 = y1 + int(face_h * 0.35)
        forehead = image[forehead_y1:forehead_y2, forehead_x1:forehead_x2]
        
        # Combine all regions and get median color
        face_regions = [r for r in [left_cheek, right_cheek, forehead] if r.size > 0]
        if face_regions:
            all_face_pixels = np.vstack([region.reshape(-1, 3) for region in face_regions])
            
            # FILTER OUT SHADOWS - Only use well-lit pixels
            # Convert to HSV to check brightness
            pixels_hsv = cv2.cvtColor(np.uint8([all_face_pixels]), cv2.COLOR_BGR2HSV)[0]
            brightness = pixels_hsv[:, 2]
            
            # Only keep pixels in upper 60% of brightness range
            brightness_threshold = np.percentile(brightness, 40)  # Remove darkest 40%
            well_lit_mask = brightness >= brightness_threshold
            
            if np.sum(well_lit_mask) > 50:
                filtered_face_pixels = all_face_pixels[well_lit_mask]
                face_color = tuple(map(int, np.median(filtered_face_pixels, axis=0)))
                print(f"Face detection: Using {len(filtered_face_pixels)} well-lit pixels (filtered {np.sum(~well_lit_mask)} shadow pixels)")
            else:
                # Not enough well-lit pixels, use all
                face_color = tuple(map(int, np.median(all_face_pixels, axis=0)))
                print(f"Face detection: Using all {len(all_face_pixels)} pixels (insufficient well-lit pixels)")
            
            # Visualize face sampling regions
            if visualize:
                cv2.rectangle(vis_image, (left_cheek_x1, cheek_y1), (left_cheek_x2, cheek_y2), (0, 255, 255), 1)
                cv2.rectangle(vis_image, (right_cheek_x1, cheek_y1), (right_cheek_x2, cheek_y2), (0, 255, 255), 1)
                cv2.rectangle(vis_image, (forehead_x1, forehead_y1), (forehead_x2, forehead_y2), (0, 255, 255), 1)
                cv2.putText(vis_image, "Face Sampling", (forehead_x1, forehead_y1-5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
        else:
            # Fallback to center region
            margin_h = int(face_h * 0.2)
            margin_w = int(face_w * 0.2)
            face_center = image[y1+margin_h:y2-margin_h, x1+margin_w:x2-margin_w]
            face_color = get_median_color(face_center) if face_center.size > 0 else (0, 0, 0)
        
        print(f"Face color (BGR): {face_color}, Brightness: {np.mean(face_color):.1f}")


        # ENHANCED HAIR COLOR DETECTION - Multi-region sampling with spatial weighting
        # Sample from top, left side, and right side of face
        
        # Region 1: Top (above forehead) - MOST RELIABLE
        hair_height = int(face_h * 0.5)
        hair_y1 = max(0, y1 - hair_height)
        hair_y2 = y1
        hair_top = image[hair_y1:hair_y2, x1:x2]
        
        # Region 2: Left side - SUPPLEMENTARY
        side_width = int(face_w * 0.3)  # Reduced to minimize background
        hair_left = image[y1:int(y1 + face_h * 0.4), max(0, x1-side_width):x1]
        
        # Region 3: Right side - SUPPLEMENTARY
        hair_right = image[y1:int(y1 + face_h * 0.4), x2:min(w, x2+side_width)]
        
        if visualize:
            # Visualize all hair sampling regions
            if hair_top.size > 0:
                cv2.rectangle(vis_image, (x1, hair_y1), (x2, hair_y2), (255, 0, 0), 2)
                cv2.putText(vis_image, "Hair-Top", (x1, hair_y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            if hair_left.size > 0:
                cv2.rectangle(vis_image, (max(0, x1-side_width), y1), (x1, int(y1 + face_h * 0.4)), (255, 100, 0), 2)
            if hair_right.size > 0:
                cv2.rectangle(vis_image, (x2, y1), (min(w, x2+side_width), int(y1 + face_h * 0.4)), (255, 100, 0), 2)
        
        # Extract hair color with improved filtering
        hair_color = None
        
        if hair_top.size > 0:
            # STRATEGY: Prioritize top region, use sides only for validation
            
            # Convert to different color spaces for robust filtering
            top_pixels = hair_top.reshape(-1, 3)
            
            # 1. EDGE-BASED FILTERING - Remove smooth background regions
            gray_top = cv2.cvtColor(hair_top, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray_top, 30, 100)
            edge_mask = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
            edge_pixels_idx = edge_mask.reshape(-1) > 0
            
            # 2. HSV FILTERING - Remove skin-like colors
            face_hsv = cv2.cvtColor(np.uint8([[face_color]]), cv2.COLOR_BGR2HSV)[0][0]
            top_hsv = cv2.cvtColor(np.uint8([top_pixels]), cv2.COLOR_BGR2HSV)[0]
            
            hue_diff = np.abs(top_hsv[:, 0].astype(int) - int(face_hsv[0]))
            hue_diff = np.minimum(hue_diff, 180 - hue_diff)
            sat_diff = np.abs(top_hsv[:, 1].astype(int) - int(face_hsv[1]))
            
            # More lenient for dark hair (low saturation is OK)
            not_skin = (hue_diff > 12) | (sat_diff > 25) | (top_hsv[:, 2] < 60)
            
            # 3. BRIGHTNESS FILTERING - Keep reasonable range
            brightness = top_hsv[:, 2]
            valid_brightness = (brightness > 20) & (brightness < 240)
            
            # 4. BACKGROUND COLOR FILTERING - Remove common background colors
            # Detect blue/gray backgrounds (common issue)
            b, g, r = top_pixels[:, 0], top_pixels[:, 1], top_pixels[:, 2]
            is_blue_gray = (b > r + 15) & (b > g + 10) & (brightness > 80)  # Blue-ish backgrounds
            is_pure_gray = (np.abs(r - g) < 15) & (np.abs(g - b) < 15) & (brightness > 100)  # Gray backgrounds
            not_background = ~(is_blue_gray | is_pure_gray)
            
            # COMBINE FILTERS with priority on edge detection
            # For dark hair: prioritize edge pixels (texture) over color variation
            valid_mask = not_skin & valid_brightness & not_background
            
            # Get pixels that pass filters
            filtered_pixels = top_pixels[valid_mask]
            
            # If we have edge information, further prioritize edge pixels
            edge_filtered = top_pixels[valid_mask & edge_pixels_idx]
            
            # Decision logic: use edge pixels if we have enough, otherwise use all filtered
            if len(edge_filtered) > 100:
                final_pixels = edge_filtered
                print(f"Hair detection: Using {len(final_pixels)} edge-based pixels from top region")
            elif len(filtered_pixels) > 100:
                final_pixels = filtered_pixels
                print(f"Hair detection: Using {len(final_pixels)} filtered pixels from top region")
            else:
                # Fallback: use all top pixels with minimal filtering
                minimal_filter = (brightness > 20) & (brightness < 240)
                final_pixels = top_pixels[minimal_filter]
                print(f"Hair detection: Using {len(final_pixels)} minimally filtered pixels (fallback)")
            
            if len(final_pixels) > 50:
                # Use K-Means clustering to find dominant hair color
                from sklearn.cluster import KMeans
                try:
                    n_clusters = min(3, max(2, len(final_pixels) // 50))
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                    kmeans.fit(final_pixels)
                    
                    # Get cluster centers and their sizes
                    labels = kmeans.labels_
                    unique, counts = np.unique(labels, return_counts=True)
                    
                    # Find the darkest cluster among the top 2 largest
                    # (hair is usually darker than background)
                    top_2_clusters = unique[np.argsort(counts)[-2:]]
                    cluster_centers = kmeans.cluster_centers_[top_2_clusters]
                    cluster_brightness = np.mean(cluster_centers, axis=1)
                    
                    # Choose darker cluster
                    darkest_idx = top_2_clusters[np.argmin(cluster_brightness)]
                    hair_color = tuple(map(int, kmeans.cluster_centers_[darkest_idx]))
                    
                    print(f"Hair color (BGR): {hair_color}, Brightness: {np.mean(hair_color):.1f}")
                except Exception as e:
                    print(f"K-Means failed: {e}, using median")
                    hair_color = tuple(map(int, np.median(final_pixels, axis=0)))
            else:
                # Very minimal pixels, use median of top region
                hair_color = tuple(map(int, np.median(top_pixels, axis=0)))
                print(f"Hair detection: Insufficient pixels, using median of all top pixels")
        else:
            hair_color = None
            print("Hair detection: No top region available")
        
        # Store hair region for hair type detection (use top region)
        hair_region = hair_top if hair_top.size > 0 else None

        eyes_open = None
        smiling = None
        
        with mp_face_mesh.FaceMesh(
            static_image_mode=True, 
            max_num_faces=1, 
            refine_landmarks=True,
            min_detection_confidence=0.3,
            min_tracking_confidence=0.3
        ) as face_mesh:
            mesh_results = face_mesh.process(rgb_image)
            
            if mesh_results.multi_face_landmarks:
                landmarks = mesh_results.multi_face_landmarks[0]
                
                if visualize:
                    mp_drawing.draw_landmarks(
                        image=vis_image,
                        landmark_list=landmarks,
                        connections=mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
                    )
                    mp_drawing.draw_landmarks(
                        image=vis_image,
                        landmark_list=landmarks,
                        connections=mp_face_mesh.FACEMESH_CONTOURS,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style()
                    )
                
                lm = landmarks.landmark

                def calculate_ear(eye_points):
                    v1 = np.sqrt((lm[eye_points[1]].x - lm[eye_points[5]].x)**2 + 
                                (lm[eye_points[1]].y - lm[eye_points[5]].y)**2)
                    v2 = np.sqrt((lm[eye_points[2]].x - lm[eye_points[4]].x)**2 + 
                                (lm[eye_points[2]].y - lm[eye_points[4]].y)**2)
                    h = np.sqrt((lm[eye_points[0]].x - lm[eye_points[3]].x)**2 + 
                               (lm[eye_points[0]].y - lm[eye_points[3]].y)**2)
                    
                    ear = (v1 + v2) / (2.0 * h)
                    return ear

                left_eye = [33, 160, 158, 133, 153, 144]
                right_eye = [362, 385, 387, 263, 373, 380]
                
                left_ear = calculate_ear(left_eye)
                right_ear = calculate_ear(right_eye)
                avg_ear = (left_ear + right_ear) / 2.0
                
                eyes_open = avg_ear > 0.18  # Lowered threshold to reduce false "closed" detections

                mouth_left = 61
                mouth_right = 291
                mouth_top = 13
                mouth_bottom = 14
                
                mouth_width = np.sqrt((lm[mouth_left].x - lm[mouth_right].x)**2 + 
                                     (lm[mouth_left].y - lm[mouth_right].y)**2)
                mouth_height = np.sqrt((lm[mouth_top].x - lm[mouth_bottom].x)**2 + 
                                      (lm[mouth_top].y - lm[mouth_bottom].y)**2)
                
                mouth_ratio = mouth_width / mouth_height if mouth_height > 0 else 0
                
                smiling = mouth_ratio > 3.2  # Increased threshold to reduce false positives
                
                eye_color = extract_eye_color(image, landmarks, w, h)
                emotion = analyze_emotion(eyes_open, smiling, mouth_ratio, avg_ear)
                head_pose = calculate_head_pose(landmarks, w, h)
            else:
                eyes_open = None
                smiling = None
                mouth_ratio = 0
                avg_ear = 0
                eye_color = "Unknown"
                emotion = "Unknown"
                head_pose = {"yaw": 0, "pitch": 0, "roll": 0}
        
        if eyes_open is None:
            eyes_open = None
            smiling = None
            mouth_ratio = 0
            avg_ear = 0
            eye_color = "Unknown"
            emotion = "Unknown"
            head_pose = {"yaw": 0, "pitch": 0, "roll": 0}
        
        hair_region_height = hair_y2 - hair_y1 if 'hair_y1' in locals() and 'hair_y2' in locals() else None
        hair_length = estimate_hair_length(hair_region_height, y2 - y1)
        hair_type = detect_hair_type(hair_region) if 'hair_region' in locals() and hair_region.size > 0 else "Unknown"

        body_measurements = extract_body_measurements(image, rgb_image, vis_image, visualize)
        
        body_shape = classify_body_shape(body_measurements)
        
        # Detect gender first
        gender = detect_gender(body_measurements, hair_length, (x1, y1, x2, y2))
        
        # Only check facial hair for males
        if gender == "Male":
            facial_hair = detect_facial_hair(image, (x1, y1, x2, y2), face_color)
        else:
            facial_hair = "N/A"  # Not applicable for females

        if visualize:
            # Create expanded canvas with info panel on the right
            panel_width = 400
            expanded_w = w + panel_width
            expanded_image = np.ones((h, expanded_w, 3), dtype=np.uint8) * 40  # Dark gray background
            expanded_image[:, :w] = vis_image  # Place original image on left
            
            # Info panel styling
            panel_x = w + 20
            text_y = 30
            line_height = 25
            
            # Title
            cv2.putText(expanded_image, "EXTRACTED FEATURES", (panel_x, text_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            text_y += line_height + 10
            
            # Face color swatch - moved to panel
            swatch_size = 40
            cv2.rectangle(expanded_image, (panel_x, text_y), (panel_x + swatch_size, text_y + swatch_size),
                         (int(face_color[0]), int(face_color[1]), int(face_color[2])), -1)
            cv2.putText(expanded_image, "Face Color", (panel_x + swatch_size + 10, text_y + 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            text_y += swatch_size + 15
            
            # Hair color swatch
            if hair_color:
                cv2.rectangle(expanded_image, (panel_x, text_y), (panel_x + swatch_size, text_y + swatch_size),
                             (int(hair_color[0]), int(hair_color[1]), int(hair_color[2])),  -1)
                cv2.putText(expanded_image, "Hair Color", (panel_x + swatch_size + 10, text_y + 25),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
                text_y += swatch_size + 20
            
            # Feature status - clean list
            cv2.putText(expanded_image, f"Eyes: {'Open' if eyes_open else 'Closed' if eyes_open == False else 'Unknown'}",
                       (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
            text_y += line_height
            
            cv2.putText(expanded_image, f"Smiling: {'Yes' if smiling else 'No' if smiling == False else 'Unknown'}",
                       (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
            text_y += line_height + 10
            
            # Body measurements - structured
            if body_measurements["shoulder_width"]:
                cv2.putText(expanded_image, "MEASUREMENTS:", (panel_x, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 200, 0), 1)
                text_y += line_height
                
                cv2.putText(expanded_image, f"Shoulder: {body_measurements['shoulder_width']:.1f}px",
                           (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 200, 0), 1)
                text_y += line_height
                
                cv2.putText(expanded_image, f"Bust: {body_measurements['bust']:.1f}px",
                           (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 200, 0), 1)
                text_y += line_height
                
                cv2.putText(expanded_image, f"Waist: {body_measurements['waist']:.1f}px",
                           (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 200, 0), 1)
                text_y += line_height
                
                cv2.putText(expanded_image, f"Hips: {body_measurements['hips']:.1f}px",
                           (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 200, 0), 1)
                text_y += line_height
                
                cv2.putText(expanded_image, f"Height: {body_measurements['height']:.1f}px",
                           (panel_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 200, 0), 1)
            
            output_path = image_path.replace('.jpg', '_annotated.jpg').replace('.png', '_annotated.png')
            cv2.imwrite(output_path, expanded_image)
            print(f"Visualization saved to: {output_path}")

        features = {
            "face_color": face_color,
            "hair_color": hair_color,
            "hair_color_name": classify_hair_color(hair_color),  # Add classified name
            "eyes_open": eyes_open,
            "smiling": smiling,
            "eye_color": eye_color,
            "emotion": emotion,
            "head_pose": head_pose,
            "facial_hair": facial_hair,
            "hair_length": hair_length,
            "hair_type": hair_type,
            "body_measurements": body_measurements,
            "body_shape": body_shape,
            "gender": gender
        }
        
        # Generate human-readable summary
        features["human_readable"] = get_feature_summary(features)
        
        return features

if __name__ == "__main__":
    # Default path
    image_path = r"C:\Users\ahads\OneDrive\Desktop\feature-extractor\person.jpg"
    reference_height_cm = 170.0 # Default fallback

    # Check for command line arguments
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        print(f"Processing image: {image_path}")
        
    if len(sys.argv) > 2:
        try:
            reference_height_cm = float(sys.argv[2])
            print(f"Using provided height: {reference_height_cm} cm")
        except ValueError:
            print("Invalid height argument, using default")

    # Only prompt if run interactively/no args (optional, for safety)
    elif len(sys.argv) == 1: 
        print("\nFor accurate measurements in cm (for Meshy AI):")
        print("Enter actual height in cm (or press Enter to skip): ", end="")
        try:
            height_input = input().strip()
            if height_input:
                reference_height_cm = float(height_input)
        except:
            pass
    
    features = extract_features(image_path, visualize=True)
    if features:
        # Add cm measurements if height provided
        if reference_height_cm and features['body_measurements']['height']:
            measurements_cm = convert_to_cm(features['body_measurements'], reference_height_cm)
            features['body_measurements_cm'] = measurements_cm
            # Remove pixel measurements from JSON output
            del features['body_measurements']
        
        print("\n" + "="*60)
        print(" " * 15 + "FACIAL FEATURES")
        print("="*60)
        print(f"Face Color (RGB):     {features['face_color']}")
        print(f"Hair Color (RGB):     {features['hair_color']}")
        print(f"Eye Color:            {features['eye_color']}")
        print(f"Eyes Open:            {features['eyes_open']}")
        print(f"Smiling:              {features['smiling']}")
        print(f"Emotion:              {features['emotion']}")
        print(f"Facial Hair:          {features['facial_hair']}")
        print(f"Hair Length:          {features['hair_length']}")
        
        print("\n" + "="*60)
        print(" " * 15 + "HEAD POSE")
        print("="*60)
        pose = features['head_pose']
        print(f"Yaw (left-right):     {pose['yaw']}°")
        print(f"Pitch (up-down):      {pose['pitch']}°")
        print(f"Roll (tilt):          {pose['roll']}°")
        
        print("\n" + "="*60)
        print(" " * 15 + "BODY MEASUREMENTS")
        print("="*60)
        
        # Check if we have cm or pixel measurements
        measurements = features.get('body_measurements_cm') or features.get('body_measurements')
        
        if measurements:
            print(f"Body Shape:           {features['body_shape']}")
            
            # Display based on available measurement type
            if 'body_measurements_cm' in features:
                cm = features['body_measurements_cm']
                print(f"\nMeasurements (for Meshy AI):")
                print(f"  Shoulder Width:     {cm['shoulder_width_cm']} cm")
                print(f"  Bust:               {cm['bust_cm']} cm")
                print(f"  Waist:              {cm['waist_cm']} cm")
                print(f"  Hips:               {cm['hips_cm']} cm")
                print(f"  Height:             {cm['height_cm']} cm")
            else:
                px = features['body_measurements']
                print(f"\nPixel Measurements:")
                print(f"  Shoulder Width:     {px['shoulder_width']} px")
                print(f"  Bust:               {px['bust']} px")
                print(f"  Waist:              {px['waist']} px")
                print(f"  Hips:               {px['hips']} px")
                print(f"  Height:             {px['height']} px")
            
            # Calculate ratios from whichever measurement type we have
            if 'body_measurements_cm' in features:
                cm = features['body_measurements_cm']
                if cm['bust_cm'] and cm['waist_cm'] and cm['hips_cm']:
                    bust_waist_ratio = cm['bust_cm'] / cm['waist_cm']
                    waist_hip_ratio = cm['waist_cm'] / cm['hips_cm']
                    print(f"\nBody Ratios:")
                    print(f"  Bust-to-Waist:      {bust_waist_ratio:.2f}")
                    print(f"  Waist-to-Hip:       {waist_hip_ratio:.2f}")
            elif 'body_measurements' in features:
                px = features['body_measurements']
                if px['bust'] and px['waist'] and px['hips']:
                    bust_waist_ratio = px['bust'] / px['waist']
                    waist_hip_ratio = px['waist'] / px['hips']
                    print(f"\nBody Ratios:")
                    print(f"  Bust-to-Waist:      {bust_waist_ratio:.2f}")
                    print(f"  Waist-to-Hip:       {waist_hip_ratio:.2f}")
        else:
            print("Body measurements not available (pose not detected)")
        
        print("="*60)
        
        json_path = save_to_json(features, image_path)
        print(f"\nFeatures saved to JSON: {json_path}")
