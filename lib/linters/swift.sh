#!/usr/bin/env bash
# swift.sh - Swift-specific linting module
#
# Provides standardized interface for Swift code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# Swift linting function with standardized interface
lint_swift() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if Swift linting is enabled
    if ! check_language_enabled "swift"; then
        return 0
    fi
    
    # Check if this is a Swift project
    if ! detect_language_files "swift"; then
        log_debug "No Swift files detected, skipping Swift linting"
        return 0
    fi
    
    log_info "Running Swift quality checks"
    start_time=$(time_start)
    
    # Find Swift files
    local swift_files
    swift_files=$(find "$target_dir" -name "*.swift" -type f 2>/dev/null)
    
    if [[ -z "$swift_files" ]]; then
        log_debug "No Swift files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Swift Package Manager project checks
    if [[ -f "Package.swift" ]]; then
        log_debug "Detected Swift Package Manager project"
        
        # Package resolution check
        log_debug "Checking Swift package resolution"
        if ! swift package resolve &>/dev/null; then
            log_error "Swift package resolution failed (run: swift package resolve)"
            has_errors=1
        else
            log_success "Swift package resolution successful"
        fi
        
        # Package manifest validation
        log_debug "Validating Package.swift manifest"
        if ! swift package dump-package &>/dev/null; then
            log_error "Package.swift manifest is invalid (run: swift package dump-package)"
            has_errors=1
        else
            log_success "Package.swift manifest is valid"
        fi
        
        # Swift build check (debug)
        log_debug "Running Swift build check (debug mode)"
        if ! swift build &>/dev/null; then
            log_error "Swift debug build failed (run: swift build)"
            has_errors=1
        else
            log_success "Swift debug build successful"
        fi
        
        # Swift test compilation check
        log_debug "Checking Swift test compilation"
        if ! swift build --build-tests &>/dev/null; then
            log_error "Swift test compilation failed (run: swift build --build-tests)"
            has_errors=1
        else
            log_success "Swift test compilation successful"
        fi
        
        # Swift test execution
        log_debug "Running Swift tests"
        if ! swift test &>/dev/null; then
            log_error "Swift tests failed (run: swift test)"
            has_errors=1
        else
            log_success "Swift tests passed"
        fi
        
        # Swift release build check
        log_debug "Running Swift release build check"
        if ! swift build -c release &>/dev/null; then
            log_error "Swift release build failed (run: swift build -c release)"
            has_errors=1
        else
            log_success "Swift release build successful"
        fi
        
    else
        log_debug "No Package.swift found, checking for Xcode project"
        
        # Check for Xcode project files
        if ls *.xcodeproj *.xcworkspace &>/dev/null; then
            log_debug "Detected Xcode project"
            
            # For Xcode projects, we'll do basic Swift syntax checking
            log_debug "Running basic Swift syntax validation for Xcode project"
            local syntax_errors=0
            
            while IFS= read -r swift_file; do
                if ! swiftc -parse "$swift_file" &>/dev/null; then
                    log_error "Swift syntax error in: $swift_file"
                    syntax_errors=1
                fi
            done <<< "$swift_files"
            
            if [[ $syntax_errors -eq 0 ]]; then
                log_success "Swift syntax validation passed"
            else
                has_errors=1
            fi
        else
            log_debug "No Swift Package Manager or Xcode project detected, running basic checks"
        fi
    fi
    
    # SwiftLint checks (if available)
    if check_tool_available "swiftlint"; then
        log_debug "Running SwiftLint checks"
        
        # Check for SwiftLint config
        local swiftlint_config=""
        if [[ -f ".swiftlint.yml" ]]; then
            swiftlint_config="--config .swiftlint.yml"
            log_debug "Using SwiftLint config: .swiftlint.yml"
        fi
        
        # Run SwiftLint in strict mode
        if ! swiftlint lint --strict $swiftlint_config &>/dev/null; then
            log_error "SwiftLint found violations (run: swiftlint lint --strict)"
            has_errors=1
        else
            log_success "SwiftLint checks passed (strict mode)"
        fi
        
        # SwiftLint autocorrect check (dry run)
        log_debug "Checking SwiftLint autocorrect suggestions"
        if swiftlint lint --fix --dry-run $swiftlint_config &>/dev/null | grep -q "would have been corrected"; then
            log_error "SwiftLint has autocorrectable violations (run: swiftlint lint --fix)"
            has_errors=1
        else
            log_success "No SwiftLint autocorrectable violations"
        fi
        
    else
        log_debug "SwiftLint not available, skipping linting checks"
        log_debug "Install SwiftLint: brew install swiftlint"
    fi
    
    # SwiftFormat checks (if available)
    if check_tool_available "swiftformat"; then
        log_debug "Running SwiftFormat checks"
        
        # Check for SwiftFormat config
        local swiftformat_config=""
        if [[ -f ".swiftformat" ]]; then
            swiftformat_config="--config .swiftformat"
            log_debug "Using SwiftFormat config: .swiftformat"
        fi
        
        # Run SwiftFormat lint check
        if ! swiftformat --lint . $swiftformat_config &>/dev/null; then
            log_error "SwiftFormat found formatting issues (run: swiftformat .)"
            has_errors=1
        else
            log_success "SwiftFormat checks passed"
        fi
        
    else
        log_debug "SwiftFormat not available, skipping formatting checks"
        log_debug "Install SwiftFormat: brew install swiftformat"
    fi
    
    # Swift compiler warnings check (if Swift Package Manager project)
    if [[ -f "Package.swift" ]] && check_tool_available "swift"; then
        log_debug "Checking for Swift compiler warnings"
        
        # Build with warnings treated as errors
        if ! swift build -Xswiftc -warnings-as-errors &>/dev/null; then
            log_error "Swift compiler warnings found (treat warnings as errors)"
            has_errors=1
        else
            log_success "No Swift compiler warnings"
        fi
    fi
    
    # Swift documentation check (if available)
    if check_tool_available "swift-doc" || check_tool_available "sourcedocs"; then
        log_debug "Running Swift documentation checks"
        
        # Check for basic documentation coverage
        local undocumented_count
        undocumented_count=$(grep -r "public\|open" --include="*.swift" "$target_dir" | grep -v "///" | wc -l || echo "0")
        
        if [[ $undocumented_count -gt 0 ]]; then
            log_error "Found $undocumented_count potentially undocumented public APIs"
            has_errors=1
        else
            log_success "Swift documentation coverage looks good"
        fi
    else
        log_debug "Swift documentation tools not available, skipping documentation checks"
        log_debug "Install swift-doc: brew install swift-doc"
    fi
    
    # Security audit check (basic Swift-specific patterns)
    log_debug "Running basic Swift security audit"
    local security_issues=0
    
    # Check for common security anti-patterns
    if grep -r "NSLog\|print(" --include="*.swift" "$target_dir" &>/dev/null; then
        log_error "Found logging statements that might leak sensitive information"
        security_issues=1
    fi
    
    if grep -r "force_try\|!" --include="*.swift" "$target_dir" | grep -v "// swiftlint:disable" &>/dev/null; then
        log_error "Found force unwrapping or force try statements (potential crash points)"
        security_issues=1
    fi
    
    if [[ $security_issues -eq 0 ]]; then
        log_success "Basic Swift security audit passed"
    else
        has_errors=1
    fi
    
    # Swift concurrency check (Swift 6+ specific)
    if check_tool_available "swift" && swift --version | grep -q "6\." &>/dev/null; then
        log_debug "Running Swift 6 concurrency safety checks"
        
        # Check for concurrency warnings in strict mode
        if [[ -f "Package.swift" ]]; then
            if ! swift build -Xswiftc -strict-concurrency=complete &>/dev/null; then
                log_error "Swift 6 concurrency safety violations found"
                has_errors=1
            else
                log_success "Swift 6 concurrency safety checks passed"
            fi
        fi
    fi
    
    # Performance hints check
    log_debug "Running Swift performance hints check"
    local performance_issues=0
    
    # Check for common performance anti-patterns
    if grep -r "String.*+.*String" --include="*.swift" "$target_dir" &>/dev/null; then
        log_error "Found string concatenation in loops (consider StringBuilder or interpolation)"
        performance_issues=1
    fi
    
    if [[ $performance_issues -eq 0 ]]; then
        log_success "Swift performance hints check passed"
    else
        has_errors=1
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}

# Helper function to check if Swift tools are available
check_swift_tool() {
    local tool="$1"
    if command -v "$tool" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Helper function to detect Swift language files
detect_swift_language_files() {
    local target_dir="${1:-.}"
    
    # Check for Swift source files
    if find "$target_dir" -name "*.swift" -type f | head -1 | grep -q .; then
        return 0
    fi
    
    # Check for Package.swift
    if [[ -f "$target_dir/Package.swift" ]]; then
        return 0
    fi
    
    # Check for Xcode project files
    if ls "$target_dir"/*.xcodeproj "$target_dir"/*.xcworkspace &>/dev/null; then
        return 0
    fi
    
    return 1
}