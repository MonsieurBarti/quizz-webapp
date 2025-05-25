#!/bin/bash

# Script to duplicate a module and rename its core files/directories.

SOURCE_MODULE_SLUG=$1
TARGET_MODULE_SLUG=$2

if [ -z "$SOURCE_MODULE_SLUG" ] || [ -z "$TARGET_MODULE_SLUG" ]; then
  echo "Usage: $0 <source-module-slug> <target-module-slug>"
  echo "Example: $0 quizz-creator quizz-taker"
  exit 1
fi

BASE_DIR="src/server/modules"
SOURCE_DIR="$BASE_DIR/$SOURCE_MODULE_SLUG"
TARGET_DIR="$BASE_DIR/$TARGET_MODULE_SLUG"

echo "Source module slug: $SOURCE_MODULE_SLUG"
echo "Target module slug: $TARGET_MODULE_SLUG"
echo "Attempting to create module '$TARGET_MODULE_SLUG' from '$SOURCE_MODULE_SLUG'..."
echo "Source directory: $SOURCE_DIR"
echo "Target directory: $TARGET_DIR"

# 1. Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' does not exist."
  exit 1
fi

# 2. Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' already exists. Please remove it or choose a different name."
  exit 1
fi

# 3. Create the main target directory
echo "Creating target directory '$TARGET_DIR'..."
mkdir -p "$TARGET_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create target directory '$TARGET_DIR'."
  exit 1
fi
echo "Target directory '$TARGET_DIR' created."

# Helper function to rename slug in files/dirs within a given path
rename_slug_in_path() {
  local path_to_scan="$1"
  local source_slug="$2"
  local target_slug="$3"
  echo "  Renaming items in '$path_to_scan' from '$source_slug' to '$target_slug'..."
  find "$path_to_scan" -depth -print0 | while IFS= read -r -d $'\0' ITEM_PATH; do
    ITEM_NAME=$(basename "$ITEM_PATH")
    if [[ "$ITEM_NAME" == *"$source_slug"* ]]; then
      NEW_ITEM_NAME=$(echo "$ITEM_NAME" | sed "s/$source_slug/$target_slug/g")
      ITEM_DIR=$(dirname "$ITEM_PATH")
      NEW_ITEM_PATH="$ITEM_DIR/$NEW_ITEM_NAME"
      if [ "$ITEM_PATH" != "$NEW_ITEM_PATH" ]; then
        echo "    Renaming '$ITEM_PATH' to '$NEW_ITEM_PATH'..."
        mv "$ITEM_PATH" "$NEW_ITEM_PATH"
        if [ $? -ne 0 ]; then
          echo "    Warning: Failed to rename '$ITEM_PATH' to '$NEW_ITEM_PATH'."
        fi
      fi
    fi
  done
}

# 4. Initial pass: Replicate structure from '$SOURCE_DIR' into '$TARGET_DIR' with EMPTY files and slug-substituted names
echo "Step 4: Creating initial empty structure for '$TARGET_MODULE_SLUG' based on '$SOURCE_MODULE_SLUG'..."
(cd "$SOURCE_DIR" && find . -print0) | while IFS= read -r -d $'\0' ITEM_RELATIVE_TO_SOURCE; do
  ITEM_RELATIVE_TO_SOURCE="${ITEM_RELATIVE_TO_SOURCE#./}"
  if [ -z "$ITEM_RELATIVE_TO_SOURCE" ]; then continue; fi
  SOURCE_ITEM_FULL_PATH="$SOURCE_DIR/$ITEM_RELATIVE_TO_SOURCE"
  TARGET_ITEM_RELATIVE_PATH=$(echo "$ITEM_RELATIVE_TO_SOURCE" | sed "s/$SOURCE_MODULE_SLUG/$TARGET_MODULE_SLUG/g")
  TARGET_ITEM_FULL_PATH="$TARGET_DIR/$TARGET_ITEM_RELATIVE_PATH"
  if [ -d "$SOURCE_ITEM_FULL_PATH" ]; then
    echo "  Creating directory: $TARGET_ITEM_FULL_PATH"
    mkdir -p "$TARGET_ITEM_FULL_PATH"
  elif [ -f "$SOURCE_ITEM_FULL_PATH" ]; then
    TARGET_ITEM_PARENT_DIR=$(dirname "$TARGET_ITEM_FULL_PATH")
    if [ ! -d "$TARGET_ITEM_PARENT_DIR" ]; then mkdir -p "$TARGET_ITEM_PARENT_DIR"; fi
    echo "  Creating empty file: $TARGET_ITEM_FULL_PATH"
    touch "$TARGET_ITEM_FULL_PATH"
  fi
done
echo "Step 4 completed."

# 5. Handle 'domain' directory: Copy content and rename slugs within
TARGET_DOMAIN_DIR="$TARGET_DIR/domain"
SOURCE_DOMAIN_DIR="$SOURCE_DIR/domain"
echo "Step 5: Processing 'domain' directory..."
if [ -d "$SOURCE_DOMAIN_DIR" ]; then
  echo "  Source 'domain' directory found. Copying content..."
  rm -rf "$TARGET_DOMAIN_DIR" # Remove empty structure created in step 4
  cp -R "$SOURCE_DOMAIN_DIR" "$TARGET_DOMAIN_DIR"
  if [ $? -eq 0 ]; then
    rename_slug_in_path "$TARGET_DOMAIN_DIR" "$SOURCE_MODULE_SLUG" "$TARGET_MODULE_SLUG"
    echo "  'domain' directory content copied and slugs renamed."
  else
    echo "  Warning: Failed to copy '$SOURCE_DOMAIN_DIR' to '$TARGET_DOMAIN_DIR'. 'domain' directory may be incomplete or missing."
  fi
else
  echo "  Info: Source module does not have a 'domain' directory. The empty one (if created by Step 4) will remain or be absent if source didn't have it."
fi
echo "Step 5 completed."

# 6. Handle 'infrastructure' directory: Copy content and rename slugs within
TARGET_INFRA_DIR="$TARGET_DIR/infrastructure"
SOURCE_INFRA_DIR="$SOURCE_DIR/infrastructure"
echo "Step 6: Processing 'infrastructure' directory..."
if [ -d "$SOURCE_INFRA_DIR" ]; then
  echo "  Source 'infrastructure' directory found. Copying content..."
  rm -rf "$TARGET_INFRA_DIR" # Remove empty structure created in step 4
  cp -R "$SOURCE_INFRA_DIR" "$TARGET_INFRA_DIR"
  if [ $? -eq 0 ]; then
    rename_slug_in_path "$TARGET_INFRA_DIR" "$SOURCE_MODULE_SLUG" "$TARGET_MODULE_SLUG"
    echo "  'infrastructure' directory content copied and slugs renamed."
  else
    echo "  Warning: Failed to copy '$SOURCE_INFRA_DIR' to '$TARGET_INFRA_DIR'. 'infrastructure' directory may be incomplete or missing."
  fi
else
  echo "  Info: Source module does not have an 'infrastructure' directory. The empty one (if created by Step 4) will remain or be absent if source didn't have it."
fi
echo "Step 6 completed."

# 7. Handle 'application' directory: Create specific empty subdirs
TARGET_APP_DIR="$TARGET_DIR/application"
SOURCE_APP_DIR="$SOURCE_DIR/application"
echo "Step 7: Processing 'application' directory..."
# Regardless of source, ensure target application dir has only commands/ and queries/
if [ -d "$TARGET_APP_DIR" ] || [ -d "$SOURCE_APP_DIR" ]; then # If target app dir was created or source app dir exists
    echo "  Re-creating '$TARGET_APP_DIR' with only 'commands' and 'queries' subdirectories..."
    rm -rf "$TARGET_APP_DIR"
    mkdir -p "$TARGET_APP_DIR/commands"
    mkdir -p "$TARGET_APP_DIR/queries"
    echo "  '$TARGET_APP_DIR/commands' and '$TARGET_APP_DIR/queries' created."
else
    echo "  Info: Source module does not have an 'application' directory, and target 'application' directory was not created. Skipping specific structure for 'application'."
fi
echo "Step 7 completed."


echo "Module '$TARGET_MODULE_SLUG' creation process finished in '$TARGET_DIR'."
echo ""
echo "Summary of creation for '$TARGET_MODULE_SLUG':"
echo "- 'domain/' and 'infrastructure/' directories: Content copied from '$SOURCE_MODULE_SLUG'. File/directory names containing '$SOURCE_MODULE_SLUG' were updated to '$TARGET_MODULE_SLUG'. Review content for necessary internal changes."
echo "- 'application/' directory: Contains only empty 'commands/' and 'queries/' subdirectories."
echo "- Other files and directories (e.g., in 'presentation/', root module files like .tokens.ts, .container.ts): Structure replicated from '$SOURCE_MODULE_SLUG', but all files are EMPTY. Their names have been updated if they contained '$SOURCE_MODULE_SLUG'."
echo ""
echo "ACTION REQUIRED: Manually populate all empty files and review/update the content of files copied into 'domain/' and 'infrastructure/' to ensure they are correct for the '$TARGET_MODULE_SLUG' module."
