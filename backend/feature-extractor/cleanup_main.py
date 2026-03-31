# Clean up the main block - remove lines 567-576 and replace with correct code
with open('feature-extraction.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep everything up to line 566
clean_lines = lines[:566]

# Add the complete console output
clean_lines.extend([
    "        print(f\"Face Color (RGB):     {features['face_color']}\")\n",
    "        print(f\"Hair Color (RGB):     {features['hair_color']}\")\n",
    "        print(f\"Eye Color:            {features['eye_color']}\")\n",
    "        print(f\"Eyes Open:            {features['eyes_open']}\")\n",
    "        print(f\"Smiling:              {features['smiling']}\")\n",
    "        print(f\"Emotion:              {features['emotion']}\")\n",
    "        print(f\"Facial Hair:          {features['facial_hair']}\")\n",
    "        print(f\"Hair Length:          {features['hair_length']}\")\n",
    "        \n",
    "        print(\"\\n\" + \"=\"*60)\n",
    "        print(\" \" * 15 + \"HEAD POSE\")\n",
    "        print(\"=\"*60)\n",
    "        pose = features['head_pose']\n",
    "        print(f\"Yaw (left-right):     {pose['yaw']}°\")\n",
    "        print(f\"Pitch (up-down):      {pose['pitch']}°\")\n",
    "        print(f\"Roll (tilt):          {pose['roll']}°\")\n",
    "        \n",
    "        print(\"\\n\" + \"=\"*60)\n",
    "        print(\" \" * 15 + \"BODY MEASUREMENTS\")\n",
    "        print(\"=\"*60)\n",
    "        measurements = features['body_measurements']\n",
    "        if measurements['shoulder_width']:\n",
    "            print(f\"Body Shape:           {features['body_shape']}\")\n",
    "            print(f\"Shoulder Width:       {measurements['shoulder_width']} px\")\n",
    "            print(f\"Bust:                 {measurements['bust']} px\")\n",
    "            print(f\"Waist:                {measurements['waist']} px\")\n",
    "            print(f\"Hips:                 {measurements['hips']} px\")\n",
    "            print(f\"Height (relative):    {measurements['height']} px\")\n",
    "            \n",
    "            if measurements['bust'] and measurements['waist'] and measurements['hips']:\n",
    "                bust_waist_ratio = measurements['bust'] / measurements['waist']\n",
    "                waist_hip_ratio = measurements['waist'] / measurements['hips']\n",
    "                print(f\"\\nBust-to-Waist Ratio:  {bust_waist_ratio:.2f}\")\n",
    "                print(f\"Waist-to-Hip Ratio:   {waist_hip_ratio:.2f}\")\n",
    "        else:\n",
    "            print(\"Body measurements not available (pose not detected)\")\n",
    "        \n",
    "        print(\"=\"*60)\n",
    "        print(\"\\nNote: Measurements are in pixels.\")\n",
    "        print(\"For real-world units, use a reference object of known size.\")\n",
    "        print(\"=\"*60)\n",
    "        \n",
    "        # Save to JSON file\n",
    "        json_path = save_to_json(features, image_path)\n",
    "        print(f\"\\n✅ Features saved to JSON: {json_path}\")\n",
])

# Write back the clean file
with open('feature-extraction.py', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print("File cleaned successfully!")
