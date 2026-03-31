# Fix script to add JSON export
with open('feature-extraction.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the last print statement and add JSON export after it
output_lines = []
for line in lines[:607]:  # Up to before the broken parts
    output_lines.append(line)

# Add the JSON export code
output_lines.append("\n")
output_lines.append("        # Save to JSON file\n")
output_lines.append("        json_path = save_to_json(features, image_path)\n")
output_lines.append('        print(f"\\n✅ Features saved to JSON: {json_path}")\n')

# Write back
with open('feature-extraction.py', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Fixed!")
