#!/bin/bash
# Script to optimize large image assets in public/portfolio_assets/

assets_dir="public/portfolio_assets"

if [ ! -d "$assets_dir" ]; then
  echo "Assets directory $assets_dir not found."
  exit 1
fi

echo "=== Starting Asset Optimization ==="
initial_size=$(du -sh "$assets_dir" | cut -f1)
echo "Initial directory size: $initial_size"

# Delete any temporary test files first
rm -f "$assets_dir"/*_test.png

# Find and optimize PNG files
echo "Optimizing PNG files..."
find "$assets_dir" -type f -name "*.png" | while read -r file; do
  size_bytes=$(stat -c%s "$file")
  # If larger than 300KB, optimize
  if [ "$size_bytes" -gt 307200 ]; then
    echo "Compressing PNG: $(basename "$file") ($(numfmt --to=iec-binary "$size_bytes"))"
    # Create temp file to avoid in-place write corruption in case of crash
    temp_file="${file}.tmp.png"
    if convert "$file" -resize 1280x1280\> -colors 256 -strip "$temp_file" 2>/dev/null; then
      mv "$temp_file" "$file"
      new_size=$(stat -c%s "$file")
      echo "  -> Compressed to: $(numfmt --to=iec-binary "$new_size")"
    else
      echo "  x Failed to compress $file"
      rm -f "$temp_file"
    fi
  fi
done

# Find and optimize JPG/JPEG files
echo "Optimizing JPG/JPEG files..."
find "$assets_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPG" -o -name "*.JPEG" \) | while read -r file; do
  size_bytes=$(stat -c%s "$file")
  # If larger than 300KB, optimize
  if [ "$size_bytes" -gt 307200 ]; then
    echo "Compressing JPG: $(basename "$file") ($(numfmt --to=iec-binary "$size_bytes"))"
    temp_file="${file}.tmp.jpg"
    if convert "$file" -resize 1280x1280\> -quality 82 -strip "$temp_file" 2>/dev/null; then
      mv "$temp_file" "$file"
      new_size=$(stat -c%s "$file")
      echo "  -> Compressed to: $(numfmt --to=iec-binary "$new_size")"
    else
      echo "  x Failed to compress $file"
      rm -f "$temp_file"
    fi
  fi
done

# Find and optimize GIF files
echo "Optimizing GIF files..."
find "$assets_dir" -type f -name "*.gif" | while read -r file; do
  size_bytes=$(stat -c%s "$file")
  # If larger than 2MB, optimize
  if [ "$size_bytes" -gt 2097152 ]; then
    echo "Compressing GIF: $(basename "$file") ($(numfmt --to=iec-binary "$size_bytes"))"
    temp_file="${file}.tmp.gif"
    # For large GIFs, resize and optimize layers to save space
    if convert "$file" -coalesce -resize 640x640\> -layers Optimize "$temp_file" 2>/dev/null; then
      mv "$temp_file" "$file"
      new_size=$(stat -c%s "$file")
      echo "  -> Compressed to: $(numfmt --to=iec-binary "$new_size")"
    else
      echo "  x Failed to compress $file"
      rm -f "$temp_file"
    fi
  fi
done

final_size=$(du -sh "$assets_dir" | cut -f1)
echo "=== Optimization Completed! ==="
echo "Final directory size: $final_size (reduced from $initial_size)"
