# Restore the working version from clean backup
# Find the last working copy or rebuild from scratch

# First, let's check if there's a backup
import os
import shutil

# Since we don't have a backup,let's fix the syntax error manually
with open('feature-extraction.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the problematic line 315 and fix it
output_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Fix line 315 - complete the cv2.putText call
    if i == 314:  # Line 315 (0-indexed = 314)
        # Add the missing parameters to complete the function call
        output_lines.append('                cv2.putText(vis_image, f"Hips: {hip_width:.1f}px",\n')
        output_lines.append('                           (int(left_hip.x * w) - 50, int(left_hip.y * h) + 20),\n')
        output_lines.append('                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 2)\n')
        i += 1  # Skip the broken line
        continue
    
    # Skip lines 316-319 which are duplicates from corruption
    if i >= 315 and i <= 318:
        i += 1
        continue
    
    output_lines.append(line)
    i += 1

# Also need to close the else block properly
# Find where "else:" appears without proper closure
fixed_lines = []
for i, line in enumerate(output_lines):
    fixed_lines.append(line)
    # After the cv2.putText fix, we need to add the else closure
    if 'FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 2)' in line and i < len(output_lines) - 1:
        next_line = output_lines[i+1] if i+1 < len(output_lines) else ""
        if "else:" in next_line:
            fixed_lines.append("        else:\n")
            fixed_lines.append("            print(\"Pose landmarks not detected.\")\n")
            fixed_lines.append("    \n")
            fixed_lines.append("    return measurements\n")
            fixed_lines.append("\n")
            # Skip ahead to find extract_features
            while i < len(output_lines) and 'def extract_features' not in output_lines[i]:
                i += 1
            break

# Write the fixed version
with open('feature-extraction.py', 'w', encoding='utf-8') as f:
    f.writelines(output_lines[:320])  # Write up to before the corruption
    # Then append the rest properly
    
print("Attempting fix...")
