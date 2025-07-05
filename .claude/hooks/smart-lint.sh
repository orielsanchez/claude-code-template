#!/bin/bash
# Auto-generated hooks for javascript

eslint --ext .js,.jsx,.ts,.tsx src/ || exit 1
prettier --check src/ || exit 1