#!/bin/bash

# Define log paths relative to where the script is run (project root)
LOG_DIR=".agent/logs"
LOG_FILE="$LOG_DIR/git-commit-helper.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Run git diff
# Capturing output to variable to check if empty and to log
OUTPUT=$(git diff --staged "$@")
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "Error executing git diff"
    exit $EXIT_CODE
fi

if [ -z "$OUTPUT" ]; then
    echo "No staged changes found to analyze."
else
    # Print output for the agent/user to see
    echo "$OUTPUT"

    # Log the activity (simulating the hook)
    TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S')
    # Calculate approximate size in chars/bytes
    SIZE=${#OUTPUT}
    
    # Append to log file
    echo "[$TIMESTAMP] Git Commit Helper: Analyzed git diff (Size: $SIZE chars)" >> "$LOG_FILE"
fi
