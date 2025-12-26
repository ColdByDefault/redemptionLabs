#!/bin/bash

echo "========================================"
echo "  Redemption Plugin Rebuild Script"
echo "========================================"
echo ""

# Check if .rebuild-pending exists
if [ -f ".rebuild-pending" ]; then
    echo "Rebuild pending flag detected."
else
    echo "No rebuild pending. Running anyway..."
fi

echo ""
echo "Step 1: Building the application..."
echo "----------------------------------------"
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Build failed! Please check the errors above."
    exit 1
fi

echo ""
echo "Step 2: Cleaning up rebuild flag..."
echo "----------------------------------------"
rm -f .rebuild-pending

echo ""
echo "========================================"
echo "  Build completed successfully!"
echo "========================================"
echo ""
echo "Please restart your development server:"
echo "  npm run dev"
echo ""
echo "Or if running in production:"
echo "  npm run start"
echo ""
