#!/usr/bin/env python3
from PIL import Image
import os

# Define the source image path
source_image = "/var/folders/sr/cynfhfqs2m37whvg4d5bw6_m0000gn/T/TemporaryItems/NSIRD_screencaptureui_zg7n4a/Screenshot 2025-07-30 at 1.45.03 AM.png"
output_dir = "/Users/weifu/Desktop/PersonalWeb/assets/icons"

# Open the image
img = Image.open(source_image)

# Define the icon positions and names based on the screenshot
# Format: (name, chinese_name, x, y)
icons = [
    # First row
    ("ai-meditation", "AI冥想", 57, 76),
    ("dailymatters", "Dailymatters", 570, 76),
    ("smart-light-master", "智能补光师", 1083, 76),
    
    # Second row
    ("ai-calories", "AI卡路里", 57, 193),
    ("ai-helper", "AI约会助手", 570, 193),
    ("ai-platform", "AI平台", 1083, 193),
    
    # Third row
    ("ai-tomato-clock", "AI番茄闹钟", 57, 311),
    ("ai-vocabulary", "AI背单词", 570, 311),
    ("weatherspro", "WeathersPro", 1083, 311),
    
    # Fourth row
    ("accounting2", "记账2", 57, 429),
    ("weirabits", "WeiRabits", 570, 429),
    ("ai-calendar", "AI日历", 1083, 429),
]

# Icon size (approximate)
icon_size = 75

# Extract and save each icon
for name, chinese_name, x, y in icons:
    # Crop the icon (adjust coordinates as needed)
    left = x - icon_size // 2
    top = y - icon_size // 2
    right = left + icon_size
    bottom = top + icon_size
    
    icon = img.crop((left, top, right, bottom))
    
    # Save the icon
    output_path = os.path.join(output_dir, f"{name}.png")
    icon.save(output_path)
    print(f"Saved {chinese_name} to {output_path}")

print("All icons extracted successfully!")