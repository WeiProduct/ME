#!/usr/bin/env python3
from PIL import Image
import os

# Create output directory for icons
output_dir = "/Users/weifu/Desktop/PersonalWeb/extracted_icons"
os.makedirs(output_dir, exist_ok=True)

# Based on the screenshot layout, define icon positions
# The icons are arranged in 4 rows x 3 columns
# Format: (name, chinese_name, row, col)
icons_data = [
    # Row 1
    ("ai-meditation", "AI冥想", 0, 0),
    ("dailymatters", "Dailymatters", 0, 1),
    ("smart-light-master", "智能补光师", 0, 2),
    
    # Row 2
    ("ai-calories", "AI卡路里", 1, 0),
    ("ai-helper", "AI约会助手", 1, 1),
    ("ai-platform", "AI平台", 1, 2),
    
    # Row 3
    ("ai-tomato-clock", "AI番茄闹钟", 2, 0),
    ("ai-vocabulary", "AI背单词", 2, 1),
    ("weatherspro", "WeathersPro", 2, 2),
    
    # Row 4
    ("accounting2", "记账2", 3, 0),
    ("weirabits", "WeiRabits", 3, 1),
    ("ai-calendar", "AI日历", 3, 2),
]

# Icon dimensions and spacing (approximate values based on screenshot)
icon_size = 96  # Size of each icon
start_x = 32    # X position of first icon
start_y = 60    # Y position of first icon
h_spacing = 513 # Horizontal spacing between icons
v_spacing = 117 # Vertical spacing between rows

print(f"Creating output directory: {output_dir}")
print("\nTo extract icons, please:")
print("1. Save the App Store screenshot as 'app_store_screenshot.png' in the project directory")
print("2. Run this script again with: python3 extract_app_icons.py")
print("\nIcon positions have been calculated for:")
for name, chinese_name, row, col in icons_data:
    x = start_x + col * h_spacing
    y = start_y + row * v_spacing
    print(f"  - {chinese_name} ({name}) at position ({x}, {y})")

# Check if screenshot exists
screenshot_path = "/Users/weifu/Desktop/PersonalWeb/app_store_screenshot.png"
if os.path.exists(screenshot_path):
    print(f"\nFound screenshot at: {screenshot_path}")
    print("Extracting icons...")
    
    # Open the screenshot
    img = Image.open(screenshot_path)
    
    # Extract each icon
    for name, chinese_name, row, col in icons_data:
        # Calculate position
        x = start_x + col * h_spacing
        y = start_y + row * v_spacing
        
        # Crop the icon
        left = x
        top = y
        right = x + icon_size
        bottom = y + icon_size
        
        icon = img.crop((left, top, right, bottom))
        
        # Save the icon
        output_path = os.path.join(output_dir, f"{name}.png")
        icon.save(output_path)
        print(f"Saved {chinese_name} to {output_path}")
    
    print("\nAll icons extracted successfully!")
    print(f"Icons saved in: {output_dir}")
else:
    print(f"\nScreenshot not found at: {screenshot_path}")
    print("Please save the App Store screenshot as 'app_store_screenshot.png' in the project directory")