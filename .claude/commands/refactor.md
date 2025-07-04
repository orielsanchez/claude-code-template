---
allowed-tools: all
description: Systematic code refactoring and improvement workflows with safety nets
---
# Systematic Refactoring & Code Improvement

**Usage:**
- `/refactor <target>` - Full systematic refactoring workflow
- `/refactor extract <function_name>` - Extract methods/functions systematically
- `/refactor simplify <component>` - Reduce complexity while preserving behavior
- `/refactor optimize <performance_target>` - Performance-driven refactoring
- `/refactor modernize <legacy_code>` - Update to current patterns and practices

**Examples:**
- `/refactor <target>` - Full systematic refactoring workflow
- `/refactor extract <function_name>` - Extract methods/functions systematically
- `/refactor simplify <component>` - Reduce complexity while preserving behavior
- `/refactor optimize <performance_target>` - Performance-driven refactoring
- `/refactor modernize <legacy_code>` - Update to current patterns and practices

**YOU MUST SAY:** "Let me systematically analyze this code before making changes."

For complex code, say: "Let me think deeply about this code using systematic investigation."


Improve, Simplify, Optimize, Validate. We refactor with purpose, maintain behavior, and enhance quality. Every refactoring must be driven by clear objectives and protected by comprehensive tests.

## Refactoring Types & Patterns

### **Extract Method/Function**
**When:** Methods doing multiple things or containing repeated code
**Goal:** Single responsibility, reusability, readability

### **Extract Class/Module**
**When:** Classes with multiple responsibilities or related functionality scattered
**Goal:** Better organization, single responsibility principle

### **Simplify Complex Logic**
**When:** Nested conditionals, complex boolean logic, or hard-to-follow control flow
**Goal:** Readability, maintainability, testability

### **Performance Optimization**
**When:** Profiling identifies bottlenecks or inefficient algorithms
**Goal:** Improved performance while maintaining behavior

### **Modernization**
**When:** Code uses outdated patterns or doesn't follow current best practices
**Goal:** Use modern language features, improve type safety, follow conventions

## Senior-Level Refactoring Principles

### **Red-Green-Refactor Cycle**
1. Red: Write failing test for new functionality
2. Green: Implement minimal code to pass
3. Refactor: Improve design while keeping tests green

### **Refactoring Catalog**
**Structural Refactoring:**
- Extract Method, Extract Class, Move Method
- Inline Method, Inline Class, Move Field

**Simplification Refactoring:**
- Replace Conditional with Polymorphism
- Replace Magic Numbers with Named Constants
- Simplify Conditional Expressions

**Optimization Refactoring:**
- Replace Algorithm, Optimize Data Structures
- Cache Expensive Operations, Eliminate Redundancy

### **Architecture Improvement Patterns**
- **Dependency Injection**: Reduce coupling, improve testability
- **Strategy Pattern**: Replace complex conditionals with polymorphism
- **Factory Pattern**: Centralize object creation logic
- **Observer Pattern**: Decouple event handling

## Antipatterns to Avoid

**Big Bang Refactoring**: Changing everything at once
- **Solution**: Incremental refactoring with test validation at each step

**Refactoring Without Tests**: Changing code without safety net
- **Solution**: Always establish comprehensive test coverage first

**Changing Behavior During Refactoring**: Adding features while refactoring
- **Solution**: Strict separation - refactor OR add features, never both

**Premature Optimization**: Optimizing without evidence of need
- **Solution**: Profile first, optimize only proven bottlenecks

**Refactoring for Refactoring's Sake**: Changing code without clear benefit
- **Solution**: Always have specific improvement objectives

The `/refactor` command transforms reactive maintenance into proactive code improvement that builds both codebase quality and refactoring skills.

## The Systematic Process

## Phase 1: SAFETY NET

**Goal:** Establish comprehensive test coverage before any refactoring begins

1. **Create Refactoring Branch: Isolate improvement work**
2. **Baseline Testing: Ensure existing tests provide adequate coverage**
3. **Behavior Documentation: Record current behavior explicitly**

**Learning Objective**: Never refactor without a safety net - tests are your insurance policy

## Phase 2: ANALYZE

**Goal:** Understand what needs improvement and why

1. **Identify Refactoring Objectives: State clear goals**
2. **Code Smell Analysis: Systematically identify issues**
3. **USE SYSTEMATIC ANALYSIS for complex refactoring**
4. **Impact Assessment: Understand refactoring scope**

**Learning Objective**: Develop systematic thinking about code quality and improvement opportunities

## Phase 3: TRANSFORM

**Goal:** Make improvements in small, verifiable steps

1. **One Refactoring at a Time: Never combine multiple refactoring types**
2. **Common Refactoring Patterns: Extract Method, Extract Class, Simplify Conditionals**
3. **Preserve Behavior: Refactoring never changes external behavior**
4. **Language-Specific Best Practices: Use appropriate patterns for your language**

**Learning Objective**: Experience how small, incremental changes accumulate into significant improvements

## Phase 4: VALIDATE

**Goal:** Verify improvements achieved objectives without introducing regressions

1. **Comprehensive Testing: Ensure all behavior preserved**
2. **Quality Metrics: Measure improvement**
3. **Code Review: Validate improvement quality**
4. **Performance Validation: For optimization refactoring**

**Learning Objective**: Develop objective assessment skills for code quality improvements

## Integration with Other Commands

- **`/refactor` → `/tdd`**: Integration workflow
- **`/refactor` → `/check`**: Integration workflow
- **`/refactor` → `/ship`**: Integration workflow

**TDD-First Quality Pipeline:**
- **`/refactor` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/refactor` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/refactor` → `/ship`**: Create final commit with proper documentation
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