#!/bin/bash

# Whisp Patches Application Script
# Applies patches listed in patches.list file in order

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WH_CHROMIUM_DIR="$(dirname "$SCRIPTS_DIR")"
WH_ROOT="$(dirname "$WH_CHROMIUM_DIR")"
PATCHES_LIST_FILE="$WH_CHROMIUM_DIR/config/patches.list"
CHROMIUM_SOURCE_DIR="$WH_ROOT/../chromium/src"

# Check if patches.list exists
if [ ! -f "$PATCHES_LIST_FILE" ]; then
    echo -e "${RED}❌ Error: patches.list not found at $PATCHES_LIST_FILE${NC}"
    exit 1
fi

# Check if chromium src directory exists
if [ ! -d "$CHROMIUM_SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: Chromium source directory not found at $CHROMIUM_SOURCE_DIR${NC}"
    exit 1
fi

echo "========================================="
echo "Whisp Patches Application"
echo "========================================="
echo ""
echo "Patches list: $PATCHES_LIST_FILE"
echo "Chromium src: $CHROMIUM_SOURCE_DIR"
echo ""

# Change to chromium src directory
cd "$CHROMIUM_SOURCE_DIR"

# Counters
TOTAL=0
APPLIED=0
SKIPPED=0
FAILED=0

# Read patches.list line by line
while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
        continue
    fi

    TOTAL=$((TOTAL + 1))

    # Construct full patch path
    PATCH_PATH="$WH_CHROMIUM_DIR/$line"

    # Check if patch file exists
    if [ ! -f "$PATCH_PATH" ]; then
        echo -e "${RED}❌ [$TOTAL] Patch not found: $line${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi

    # Get patch filename for display
    PATCH_NAME=$(basename "$line")

    echo -e "${BLUE}[$TOTAL] Applying: $PATCH_NAME${NC}"

    # Try to apply the patch
    if git apply --check "$PATCH_PATH" 2>/dev/null; then
        git apply "$PATCH_PATH"
        echo -e "${GREEN}    ✅ Applied successfully${NC}"
        APPLIED=$((APPLIED + 1))
    else
        # Check if already applied
        if git apply --reverse --check "$PATCH_PATH" 2>/dev/null; then
            echo -e "${YELLOW}    ⏭️  Already applied, skipping${NC}"
            SKIPPED=$((SKIPPED + 1))
        else
            echo -e "${RED}    ❌ Failed to apply${NC}"
            echo -e "${YELLOW}    Running git apply with verbose output:${NC}"
            git apply "$PATCH_PATH" 2>&1 | head -20
            FAILED=$((FAILED + 1))

            # Ask user if they want to continue
            read -p "Continue with remaining patches? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${RED}Aborted by user${NC}"
                exit 1
            fi
        fi
    fi

    echo ""

done < "$PATCHES_LIST_FILE"

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo -e "Total patches: $TOTAL"
echo -e "${GREEN}Applied: $APPLIED${NC}"
echo -e "${YELLOW}Skipped (already applied): $SKIPPED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All patches applied successfully!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some patches failed to apply${NC}"
    exit 1
fi
