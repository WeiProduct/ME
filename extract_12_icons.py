#!/usr/bin/env python3
from PIL import Image
import os

# Input and output paths
input_image = "/Users/weifu/Desktop/12icon.png"
output_dir = "/Users/weifu/Desktop/PersonalWeb/assets/icons"

# Make sure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Open the image
img = Image.open(input_image)
print(f"Image size: {img.size}")

# Define icon positions and names
# Based on the screenshot, icons are arranged in 4 rows x 3 columns
icons_data = [
    # Row 1 (y ~= 60)
    ("ai-meditation.png", "AI冥想", 64, 60),
    ("dailymatters.png", "Dailymatters", 574, 60),
    ("smart-light-master.png", "智能补光师", 1084, 60),
    
    # Row 2 (y ~= 177)
    ("ai-calories.png", "AI卡路里", 64, 177),
    ("ai-helper.png", "AI约会助手", 574, 177),
    ("ai-platform.png", "AI平台", 1084, 177),
    
    # Row 3 (y ~= 294)
    ("ai-tomato-clock.png", "AI番茄闹钟", 64, 294),
    ("ai-vocabulary.png", "AI背单词", 574, 294),
    ("weatherspro.png", "WeathersPro", 1084, 294),
    
    # Row 4 (y ~= 411)
    ("piggyfinance.png", "记账2", 64, 411),
    ("weirabits.png", "WeiRabits", 574, 411),
    ("ai-calendar.png", "AI日历", 1084, 411),
]

# Icon size (approximate)
icon_size = 96

# Extract each icon
for filename, name_cn, center_x, center_y in icons_data:
    # Calculate crop box
    left = center_x - icon_size // 2
    top = center_y - icon_size // 2
    right = left + icon_size
    bottom = top + icon_size
    
    # Ensure coordinates are within image bounds
    left = max(0, left)
    top = max(0, top)
    right = min(img.width, right)
    bottom = min(img.height, bottom)
    
    # Crop the icon
    icon = img.crop((left, top, right, bottom))
    
    # Save the icon
    output_path = os.path.join(output_dir, filename)
    icon.save(output_path, "PNG", quality=95)
    print(f"Extracted {name_cn} -> {filename} (size: {icon.size})")

print(f"\nAll 12 icons extracted successfully!")
print(f"Icons saved to: {output_dir}")