#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os
import colorsys

# Create high-quality placeholder icons based on the App Store screenshot
output_dir = "/Users/weifu/Desktop/PersonalWeb/assets/icons"

# Icon data with colors observed from screenshot
icons_to_create = [
    {
        "filename": "ai-meditation.png",
        "name": "AI冥想",
        "bg_color": "#4A5568",  # Dark blue-gray
        "icon_type": "meditation",
        "text_color": "#FFFFFF"
    },
    {
        "filename": "dailymatters.png", 
        "name": "31",
        "bg_color": "#5B7FFF",  # Blue
        "icon_type": "calendar",
        "text_color": "#FFFFFF"
    }
]

def create_rounded_rectangle(size, radius, color):
    """Create a rounded rectangle image"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle
    draw.rounded_rectangle(
        [(0, 0), (size[0]-1, size[1]-1)],
        radius=radius,
        fill=color
    )
    
    return img

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_icon(icon_data):
    """Create a single icon based on specifications"""
    size = (180, 180)  # High resolution for retina displays
    corner_radius = 40
    
    # Create base icon with rounded corners
    bg_color = hex_to_rgb(icon_data["bg_color"])
    icon = create_rounded_rectangle(size, corner_radius, bg_color)
    draw = ImageDraw.Draw(icon)
    
    # Add content based on icon type
    if icon_data["icon_type"] == "meditation":
        # Draw meditation figure (simplified)
        center_x = size[0] // 2
        center_y = size[1] // 2
        
        # Draw sitting figure outline
        draw.ellipse(
            [center_x - 25, center_y - 35, center_x + 25, center_y - 5],
            outline=icon_data["text_color"],
            width=3
        )
        
        # Draw body
        draw.arc(
            [center_x - 35, center_y - 10, center_x + 35, center_y + 40],
            start=200,
            end=340,
            fill=icon_data["text_color"],
            width=3
        )
        
    elif icon_data["icon_type"] == "calendar":
        # Draw calendar with "31"
        try:
            # Try to use system font
            font_size = 72
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        text = icon_data["name"]
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (size[0] - text_width) // 2
        y = (size[1] - text_height) // 2 - 10
        
        draw.text((x, y), text, fill=icon_data["text_color"], font=font)
    
    # Save the icon
    output_path = os.path.join(output_dir, icon_data["filename"])
    icon.save(output_path, "PNG", quality=95)
    print(f"Created {icon_data['filename']}")
    return output_path

# Create the icons
print("Creating high-quality placeholder icons...")
for icon_data in icons_to_create:
    create_icon(icon_data)

print("\nIcons created successfully!")
print("\nNote: These are high-quality placeholders. For the actual App Store icons:")
print("1. Take a screenshot of the App Store page")
print("2. Save it as 'app_store_screenshot.png' in the project directory")
print("3. Run 'python3 extract_app_icons.py' to extract the real icons")