# Claude Code Commands Reference

Quick reference for all available Claude Code commands in this template.

## 🚀 Primary Development Commands

### `/dev <feature description>`
**Purpose:** Test-Driven Development workflow  
**Example:** `/dev "user authentication with JWT"`  
**What it does:**
- Writes failing tests first
- Implements minimal code to pass tests
- Refactors with test safety net
- Ensures quality throughout

### `/check`
**Purpose:** Run quality checks (linting, tests, formatting)  
**Example:** `/check`  
**What it does:**
- Runs project-appropriate linters
- Executes test suite
- Checks code formatting
- Reports issues with exit code 2

### `/ship <commit message>`
**Purpose:** Create professional commits  
**Example:** `/ship "add user authentication"`  
**What it does:**
- Stages changes
- Creates commit with message
- Updates CHANGELOG.md
- Ensures no Claude attribution

## 🔧 Code Improvement Commands

### `/debug <issue description>`
**Purpose:** Systematic debugging workflow  
**Example:** `/debug "login fails with 500 error"`  
**What it does:**
- Reproduces the issue
- Identifies root cause
- Implements fix with tests
- Verifies resolution

### `/refactor <component name>`
**Purpose:** Safe code improvement  
**Example:** `/refactor "user service"`  
**What it does:**
- Analyzes current implementation
- Ensures test coverage exists
- Refactors step-by-step
- Maintains functionality

## 📋 Planning & Documentation Commands

### `/plan <project description>`
**Purpose:** Generate development roadmap  
**Example:** `/plan "e-commerce checkout system"`  
**What it does:**
- Breaks down into milestones
- Creates task priorities
- Estimates timelines
- Identifies dependencies

### `/claude-md <instruction>`
**Purpose:** Update CLAUDE.md instructions  
**Example:** `/claude-md "add database migration rules"`  
**What it does:**
- Updates project-specific instructions
- Maintains development standards
- Preserves team knowledge

## 🛠️ Utility Commands

### `/help [command]`
**Purpose:** Get help and examples  
**Example:** `/help dev`  
**What it does:**
- Shows command documentation
- Provides usage examples
- Lists available options

### `/prompt <context>`
**Purpose:** Generate handoff prompt for other LLMs  
**Example:** `/prompt "current sprint progress"`  
**What it does:**
- Summarizes project state
- Creates context for handoff
- Includes relevant files
- Formats for LLM consumption

## 🎯 Quick Workflows

### Standard Development Flow
```
/dev "new feature"     # TDD implementation
/check                 # Verify quality
/ship "add feature"    # Commit changes
```

### Bug Fix Flow
```
/debug "error description"   # Find and fix
/check                      # Verify fix
/ship "fix: error"         # Commit fix
```

### Refactoring Flow
```
/check                     # Ensure tests pass
/refactor "component"      # Improve code
/check                     # Verify nothing broke
/ship "refactor: component" # Commit improvements
```

## 💡 Pro Tips

1. **Always start with `/dev`** for new features - TDD prevents bugs
2. **Run `/check` before `/ship`** - Ensure quality standards
3. **Use `/plan` for complex features** - Break down before building
4. **Update `/claude-md` regularly** - Capture team knowledge

## 🚫 Command Guidelines

- **NO emojis** in commits (enforced by hooks)
- **NO Claude attribution** in messages
- **Always delete old code** when replacing
- **Exit code 2** means issues found - fix before continuing

## 🔍 Troubleshooting

### Hook Failures
If `/check` keeps failing:
1. Run the specific linter manually
2. Fix all reported issues
3. Re-run `/check`

### Command Not Found
Ensure you're in a Claude Code session and the template is properly installed.

### Quality Check Issues
- **TypeScript:** Fix type errors with `tsc --noEmit`
- **ESLint:** Auto-fix with `eslint . --fix`
- **Prettier:** Format with `prettier --write .`
- **Python:** Format with `black .`
- **Rust:** Format with `cargo fmt`

---
For detailed command documentation, use `/help <command>` within Claude Code.