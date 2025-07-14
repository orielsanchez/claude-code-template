#!/bin/bash
# Enhanced quality checks with proper exit codes
# Exit codes: 0 = success, 1 = error, 2 = issues found

set +e  # Don't exit on command failure, we'll handle it

echo "🔍 Running quality checks..."

# Track if any issues were found
ISSUES_FOUND=0

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
    echo "📦 Detected Node.js/JavaScript project"
    if command -v npm >/dev/null 2>&1; then
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "✅ Tests passed"
        else
            if npm run test --dry-run 2>&1 | grep -q "Missing script"; then
                echo "ℹ️  No test script defined"
            else
                echo "❌ Tests failed"
                ISSUES_FOUND=1
            fi
        fi
        
        # Run linting if available
        if npm run lint --silent 2>/dev/null; then
            echo "✅ Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            if eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null; then
                echo "✅ ESLint passed"
            else
                echo "❌ ESLint found issues"
                ISSUES_FOUND=1
            fi
        fi
        
        # Run formatting check if available
        if npm run format:check --silent 2>/dev/null; then
            echo "✅ Formatting check passed"
        elif command -v prettier >/dev/null 2>&1; then
            if prettier --check . 2>/dev/null; then
                echo "✅ Prettier formatting check passed"
            else
                echo "❌ Prettier found formatting issues"
                echo "   Run 'prettier --write .' to fix"
                ISSUES_FOUND=1
            fi
        fi
    fi
elif [ -f "tsconfig.json" ]; then
    echo "📘 Detected TypeScript project"
    if command -v npm >/dev/null 2>&1; then
        # TypeScript type checking
        if command -v tsc >/dev/null 2>&1; then
            if tsc --noEmit 2>/dev/null; then
                echo "✅ TypeScript check passed"
            else
                echo "❌ TypeScript found type errors"
                ISSUES_FOUND=1
            fi
        fi
        
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "✅ Tests passed"
        else
            if npm run test --dry-run 2>&1 | grep -q "Missing script"; then
                echo "ℹ️  No test script defined"
            else
                echo "❌ Tests failed"
                ISSUES_FOUND=1
            fi
        fi
        
        # Run linting
        if npm run lint --silent 2>/dev/null; then
            echo "✅ Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            if eslint . --ext .ts,.tsx 2>/dev/null; then
                echo "✅ ESLint passed"
            else
                echo "❌ ESLint found issues"
                ISSUES_FOUND=1
            fi
        fi
    fi
elif [ -f "Cargo.toml" ]; then
    echo "🦀 Detected Rust project"
    if command -v cargo >/dev/null 2>&1; then
        if cargo check --quiet 2>/dev/null; then
            echo "✅ Cargo check passed"
        else
            echo "❌ Cargo check failed"
            ISSUES_FOUND=1
        fi
        
        if cargo clippy --quiet -- -D warnings 2>/dev/null; then
            echo "✅ Clippy passed"
        else
            echo "❌ Clippy found warnings"
            ISSUES_FOUND=1
        fi
        
        if cargo fmt -- --check 2>/dev/null; then
            echo "✅ Formatting check passed"
        else
            echo "❌ Formatting issues found"
            echo "   Run 'cargo fmt' to fix"
            ISSUES_FOUND=1
        fi
        
        if cargo test --quiet 2>/dev/null; then
            echo "✅ Tests passed"
        else
            echo "❌ Tests failed"
            ISSUES_FOUND=1
        fi
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "🐍 Detected Python project"
    if command -v python3 >/dev/null 2>&1; then
        # Run tests if pytest is available
        if command -v pytest >/dev/null 2>&1; then
            if pytest --quiet 2>/dev/null; then
                echo "✅ Tests passed"
            else
                echo "❌ Tests failed"
                ISSUES_FOUND=1
            fi
        fi
        
        # Run linting if available
        if command -v flake8 >/dev/null 2>&1; then
            if flake8 . 2>/dev/null; then
                echo "✅ Flake8 passed"
            else
                echo "❌ Flake8 found issues"
                ISSUES_FOUND=1
            fi
        fi
        
        if command -v black >/dev/null 2>&1; then
            if black --check . 2>/dev/null; then
                echo "✅ Black formatting check passed"
            else
                echo "❌ Black found formatting issues"
                echo "   Run 'black .' to fix"
                ISSUES_FOUND=1
            fi
        fi
    fi
elif [ -f "go.mod" ]; then
    echo "🐹 Detected Go project"
    if command -v go >/dev/null 2>&1; then
        if go vet ./... 2>/dev/null; then
            echo "✅ Go vet passed"
        else
            echo "❌ Go vet found issues"
            ISSUES_FOUND=1
        fi
        
        if go test ./... 2>/dev/null; then
            echo "✅ Tests passed"
        else
            echo "❌ Tests failed"
            ISSUES_FOUND=1
        fi
        
        if [ "$(gofmt -l . | wc -l)" -eq 0 ]; then
            echo "✅ Formatting check passed"
        else
            echo "❌ Formatting issues found"
            echo "   Run 'gofmt -w .' to fix"
            ISSUES_FOUND=1
        fi
    fi
else
    echo "📄 Generic project detected"
fi

# Summary and exit
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ All quality checks passed!"
    exit 0
else
    echo "❌ Quality checks found issues. Please fix them before proceeding."
    exit 2
fi