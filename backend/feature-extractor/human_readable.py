# -*- coding: utf-8 -*-
"""
Human-Readable Feature Descriptions
Converts technical feature extraction output into natural language
"""

def classify_skin_tone(bgr_color):
    """Classify skin tone from BGR color into detailed human-readable description"""
    if bgr_color is None:
        return "Unknown"
    
    b, g, r = bgr_color
    brightness = (r + g + b) / 3
    
    # Determine warmth (red/yellow undertones) vs coolness (blue undertones)
    warmth_score = r - b  # Positive = warm, Negative = cool
    
    # Detailed skin tone classification
    if brightness < 70:
        if warmth_score > 10:
            return "Deep ebony complexion with warm undertones"
        elif warmth_score < -10:
            return "Deep ebony complexion with cool undertones"
        else:
            return "Deep ebony complexion"
    elif brightness < 95:
        if warmth_score > 10:
            return "Rich mahogany skin tone with warm undertones"
        elif warmth_score < -10:
            return "Rich mahogany skin tone with cool undertones"
        else:
            return "Rich mahogany skin tone"
    elif brightness < 120:
        if warmth_score > 10:
            return "Warm brown complexion"
        elif warmth_score < -10:
            return "Cool brown complexion"
        else:
            return "Medium brown complexion"
    elif brightness < 145:
        if warmth_score > 10:
            return "Warm tan complexion"
        elif warmth_score < -10:
            return "Cool olive complexion"
        else:
            return "Medium tan complexion"
    elif brightness < 170:
        if warmth_score > 10:
            return "Warm beige skin tone"
        elif warmth_score < -10:
            return "Cool beige skin tone"
        else:
            return "Natural beige skin tone"
    elif brightness < 195:
        if warmth_score > 10:
            return "Light peachy complexion"
        elif warmth_score < -10:
            return "Light porcelain complexion"
        else:
            return "Light ivory complexion"
    else:
        if warmth_score > 10:
            return "Fair complexion with warm peachy tones"
        elif warmth_score < -10:
            return "Fair complexion with cool pink tones"
        else:
            return "Fair porcelain complexion"

def describe_complexion(bgr_color):
    """Describe complexion warmth/coolness"""
    if bgr_color is None:
        return ""
    
    b, g, r = bgr_color
    
    # Warm vs cool undertones
    if r > b + 10:
        warmth = "warm"
    elif b > r + 10:
        warmth = "cool"
    else:
        warmth = "neutral"
    
    return f"{warmth} undertones"

def describe_hair_color_with_rgb(bgr_color, color_name):
    """Describe hair color with actual RGB values"""
    if bgr_color is None:
        return color_name if color_name else "Unknown"
    
    b, g, r = bgr_color
    
    # Convert BGR to RGB for display
    rgb_str = f"RGB({r}, {g}, {b})"
    
    # If we have a color name, combine it with RGB
    if color_name and color_name != "Unknown":
        return f"{color_name.lower()} ({rgb_str})"
    else:
        return rgb_str

def describe_body_type(measurements_cm, body_shape):
    """Generate detailed human-readable body type description"""
    if not measurements_cm or not body_shape:
        return "Body composition analysis unavailable"
    
    descriptions = []
    
    # Enhanced body shape descriptions
    shape_descriptions = {
        "Hourglass": "classic hourglass figure with balanced curves",
        "Pear/Triangle": "feminine pear shape with graceful hip curves",
        "Inverted Triangle": "athletic V-shape with strong upper body",
        "Rectangle": "streamlined athletic build with straight lines",
        "Apple/Oval": "soft rounded silhouette",
        "Balanced": "harmoniously proportioned physique"
    }
    
    if body_shape in shape_descriptions:
        descriptions.append(shape_descriptions[body_shape])
    
    # Detailed shoulder analysis
    shoulder = measurements_cm.get('shoulder_width_cm', 0)
    if shoulder > 48:
        descriptions.append("notably broad shoulders")
    elif shoulder > 43:
        descriptions.append("well-developed shoulders")
    elif shoulder > 38:
        descriptions.append("moderate shoulder width")
    else:
        descriptions.append("delicate shoulder frame")
    
    # Waist analysis
    waist = measurements_cm.get('waist_cm', 0)
    bust = measurements_cm.get('bust_cm', 0)
    if waist > 0 and bust > 0:
        waist_ratio = waist / bust
        if waist_ratio < 0.65:
            descriptions.append("dramatically cinched waist")
        elif waist_ratio < 0.75:
            descriptions.append("well-defined waist")
    
    return ", ".join(descriptions).capitalize()

def describe_proportions(measurements_cm):
    """Describe body proportions in detailed natural language"""
    if not measurements_cm:
        return []
    
    descriptions = []
    
    bust = measurements_cm.get('bust_cm', 0)
    waist = measurements_cm.get('waist_cm', 0)
    hips = measurements_cm.get('hips_cm', 0)
    shoulder = measurements_cm.get('shoulder_width_cm', 0)
    
    # Detailed waist definition
    if bust > 0 and waist > 0:
        waist_ratio = waist / bust
        if waist_ratio < 0.65:
            descriptions.append("dramatically tapered waistline")
        elif waist_ratio < 0.72:
            descriptions.append("beautifully defined waist")
        elif waist_ratio < 0.80:
            descriptions.append("gently curved waist")
    
    # Hip-shoulder balance with more detail
    if hips > 0 and shoulder > 0:
        diff = abs(hips - shoulder)
        if diff < 3:
            descriptions.append("perfectly balanced proportions")
        elif diff < 6:
            descriptions.append("harmonious proportions")
        elif hips > shoulder + 6:
            descriptions.append("feminine hip-emphasized silhouette")
        elif shoulder > hips + 6:
            descriptions.append("athletic shoulder-dominant frame")
    
    # Overall silhouette
    if bust > 0 and hips > 0:
        if abs(bust - hips) < 5:
            descriptions.append("symmetrical curves")
    
    return descriptions

def describe_height(height_cm):
    """Describe height in context"""
    if not height_cm or height_cm == 0:
        return "Height not measured"
    
    if height_cm < 160:
        return f"{height_cm}cm (petite)"
    elif height_cm < 170:
        return f"{height_cm}cm (average)"
    elif height_cm < 180:
        return f"{height_cm}cm (above average)"
    else:
        return f"{height_cm}cm (tall)"

def describe_facial_features(features):
    """Generate detailed facial feature descriptions"""
    descriptions = []
    
    # Eye color with more detail
    eye_color = features.get('eye_color', '')
    if eye_color and eye_color != 'Unknown':
        eye_descriptions = {
            'Blue': 'striking blue eyes',
            'Green': 'captivating green eyes',
            'Brown': 'warm brown eyes',
            'Dark Brown/Black': 'deep dark eyes',
            'Hazel/Mixed': 'expressive hazel eyes'
        }
        descriptions.append(eye_descriptions.get(eye_color, f"{eye_color.lower()} eyes"))
    
    # Hair with detailed description - refined word order with RGB values
    hair_parts = []
    hair_length = features.get('hair_length', '')
    hair_color_name = features.get('hair_color_name', '')
    hair_color_bgr = features.get('hair_color')  # Get actual BGR values
    hair_type = features.get('hair_type', '')
    
    # Build detailed hair description with better flow
    # Order: Length + Color (with RGB) + Texture
    if hair_length and hair_length != 'Unknown':
        length_descriptions = {
            'Very Short/Bald': 'very short',
            'Short': 'short',
            'Medium': 'medium-length',
            'Long': 'long'
        }
        hair_parts.append(length_descriptions.get(hair_length, hair_length.lower()))
    
    # Use RGB values for hair color
    if hair_color_bgr:
        hair_color_desc = describe_hair_color_with_rgb(hair_color_bgr, hair_color_name)
        hair_parts.append(hair_color_desc)
    elif hair_color_name and hair_color_name != 'Unknown':
        hair_parts.append(hair_color_name.lower())
    
    if hair_type and hair_type != 'Unknown':
        type_descriptions = {
            'Straight': 'straight',
            'Wavy': 'wavy',
            'Curly': 'curly',
            'Kinky': 'kinky coiled'
        }
        hair_parts.append(type_descriptions.get(hair_type, hair_type.lower()))
    
    if hair_parts:
        # Add descriptive adjectives based on combination
        hair_desc = " ".join(hair_parts)
        
        # Add texture descriptors
        if 'straight' in hair_desc:
            hair_desc = hair_desc.replace('straight', 'sleek straight')
        elif 'wavy' in hair_desc:
            hair_desc = hair_desc.replace('wavy', 'softly wavy')
        elif 'curly' in hair_desc:
            hair_desc = hair_desc.replace('curly', 'beautifully curly')
        
        descriptions.append(hair_desc + " hair")
    
    # Facial hair (only for males) - refined description
    if features.get('gender') == 'Male' and features.get('facial_hair'):
        facial_hair = features['facial_hair']
        if 'Yes' in facial_hair or 'Detected' in facial_hair:
            descriptions.append("styled facial hair")
    
    return descriptions

def get_feature_summary(features):
    """Generate complete human-readable summary"""
    summary = {
        "appearance": [],
        "body_type": "",
        "measurements_context": [],
        "facial_features": []
    }
    
    # Detailed skin tone with RGB values
    if features.get('face_color'):
        face_color = features['face_color']
        b, g, r = face_color
        skin_tone = classify_skin_tone(face_color)
        rgb_str = f"RGB({r}, {g}, {b})"
        summary["appearance"].append(f"{skin_tone} ({rgb_str})")
    
    # Body type
    measurements_cm = features.get('body_measurements_cm')
    body_shape = features.get('body_shape')
    if measurements_cm and body_shape:
        summary["body_type"] = describe_body_type(measurements_cm, body_shape)
        summary["measurements_context"] = describe_proportions(measurements_cm)
    
    # Height
    if measurements_cm and measurements_cm.get('height_cm'):
        summary["measurements_context"].insert(0, describe_height(measurements_cm['height_cm']))
    
    # Facial features
    summary["facial_features"] = describe_facial_features(features)
    
    return summary
