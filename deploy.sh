#!/bin/bash

# Define paths
ANDROID_ASSETS_DIR="/Users/holin/AndroidStudioProjects/HanziFlow/app/src/main/assets/www"

echo "Cleaning up old assets in Android project..."
# Only delete index.html and assets/* as requested, to avoid deleting large static data unless necessary
rm -f "$ANDROID_ASSETS_DIR/index.html"
rm -rf "$ANDROID_ASSETS_DIR/assets/"*

echo "Copying new build files..."
# Copy everything from dist to www to ensure all resources (including data/fonts) are up to date
cp -R dist/* "$ANDROID_ASSETS_DIR/"

echo "Done! Android assets updated at $ANDROID_ASSETS_DIR"
ls -F "$ANDROID_ASSETS_DIR"
