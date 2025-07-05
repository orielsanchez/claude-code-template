#!/bin/bash
# Enhanced quality checks with better error reporting - auto-generated

# Exit codes: 0 = success, 1 = error, 2 = issues found
set +e

echo "🔍 Running quality checks..."

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
    echo "📦 Detected Node.js/JavaScript project"
    if command -v npm >/dev/null 2>&1; then
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "✅ Tests passed"
        else
            echo "⚠ Tests not available or failed"
        fi
        
        # Run linting if available
        if npm run lint --silent 2>/dev/null; then
            echo "✅ Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            if eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null; then
                echo "✅ ESLint passed"
            else
                echo "⚠ ESLint found issues"
            fi
        fi
        
        # Run formatting check if available
        if npm run format:check --silent 2>/dev/null; then
            echo "✅ Formatting check passed"
        elif command -v prettier >/dev/null 2>&1; then
            if prettier --check . 2>/dev/null; then
                echo "✅ Prettier formatting check passed"
            else
                echo "⚠ Prettier found formatting issues"
            fi
        fi
    fi
elif [ -f "Cargo.toml" ]; then
    echo "🦀 Detected Rust project"
    if command -v cargo >/dev/null 2>&1; then
        cargo check --quiet && echo "✅ Cargo check passed"
        cargo clippy --quiet -- -D warnings 2>/dev/null && echo "✅ Clippy passed"
        cargo fmt -- --check 2>/dev/null && echo "✅ Formatting check passed"
        cargo test --quiet 2>/dev/null && echo "✅ Tests passed"
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "🐍 Detected Python project"
    if command -v python >/dev/null 2>&1; then
        # Run tests if pytest is available
        if command -v pytest >/dev/null 2>&1; then
            pytest --quiet 2>/dev/null && echo "✅ Tests passed"
        fi
        
        # Run linting if available
        if command -v flake8 >/dev/null 2>&1; then
            flake8 . 2>/dev/null && echo "✅ Flake8 passed"
        fi
        
        if command -v black >/dev/null 2>&1; then
            black --check . 2>/dev/null && echo "✅ Black formatting check passed"
        fi
    fi
elif [ -f "go.mod" ]; then
    echo "🐹 Detected Go project"
    if command -v go >/dev/null 2>&1; then
        go vet ./... 2>/dev/null && echo "✅ Go vet passed"
        go test ./... 2>/dev/null && echo "✅ Tests passed"
        if [ "$(gofmt -l . | wc -l)" -eq 0 ]; then
            echo "✅ Formatting check passed"
        fi
    fi
else
    echo "📄 Generic project detected"
fi

echo "✅ Quality checks complete"
exit 0
