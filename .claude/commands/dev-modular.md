---
allowed-tools: all
description: TDD-first development workflow - the primary way to build features with AI assistance
---
# TDD-First Development Workflow

**Usage:**
- `/dev <feature_description>` - Full TDD workflow for new features (RECOMMENDED)
- `/dev` - Smart continuation based on current context
- `/dev plan <feature>` - Explicit planning phase with TDD approach
- `/dev test` - Test management and TDD cycle control
- `/dev implement` - Implementation phase (only after tests exist)
- `/dev refactor` - Refactoring phase with test safety net

**Examples:**
- `/dev <feature_description>` - Full TDD workflow for new features (RECOMMENDED)
- `/dev` - Smart continuation based on current context
- `/dev plan <feature>` - Explicit planning phase with TDD approach
- `/dev test` - Test management and TDD cycle control
- `/dev implement` - Implementation phase (only after tests exist)
- `/dev refactor` - Refactoring phase with test safety net

**YOU MUST SAY:** "Let me systematically approach this task before proceeding."

For complex task, say: "Let me think deeply about this task using systematic investigation."


## The Systematic Process

## Phase 1: RED

**Goal:** Write failing tests that define the exact behavior

1. **Define the Interface: What API/behavior do we want?**
2. **Write Specific Tests: Cover happy path, edge cases, error conditions**
3. **Document Assumptions: Clear inputs, outputs, constraints**
4. **Verify Tests Fail: Confirm we're testing the right behavior**

**Learning Objective**: Force precise thinking about requirements before any implementation

## Phase 2: GREEN

**Goal:** Minimal implementation to make tests pass

1. **Provide Test Context: AI uses failing tests as specification**
2. **Minimal Implementation: Only code needed to pass tests**
3. **Avoid Over-Engineering: No features not covered by tests**
4. **Validate Success: All tests must pass**

**Learning Objective**: See how tests guide implementation decisions

## Phase 3: REFACTOR

**Goal:** Improve code quality while maintaining test coverage

1. **Identify Improvements: Code smells, architecture issues**
2. **Refactor with Confidence: Tests ensure behavior preservation**
3. **Extract Patterns: Move toward better design**
4. **Continuous Validation: Tests run after each change**

**Learning Objective**: Experience fearless refactoring with test protection

## Integration with Other Commands

- **`/dev` → `/check`**: Integration workflow
- **`/dev` → `/debug`**: Integration workflow
- **`/dev` → `/ship`**: Integration workflow

**TDD-First Quality Pipeline:**
- **`/dev` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/dev` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/dev` → `/ship`**: Create final commit with proper documentation
**Quality Requirements**:
- Follow all forbidden patterns from CLAUDE.md
- Use proper error handling for your language (Result types, exceptions)
- No unwrap(), expect(), panic!() in production code
- Delete old code when replacing functionality

**Universal Quality Standards:**
- **Delete** old code when replacing it
- **Meaningful names**: `user_id` not `id`, `process_payment` not `do_stuff`
- **Early returns** to reduce nesting depth
- **Proper error handling** for your language (exceptions, Result types, etc.)
- **Comprehensive tests** for complex logic
- **Consistent code style** following project/language conventions
## Learning Integration

### **Before Starting**:
- State your hypothesis about the problem/approach
- Identify which concepts you want to understand deeply
- Set learning objectives: "I want to understand X pattern"

### **During Implementation**:
- Explain the "why" behind each architectural decision
- Connect new patterns to existing knowledge
- Document mental models and intuition being built

### **After Completion**:
- Summarize key insights gained
- Update personal knowledge base with new patterns
- Identify areas for deeper independent study