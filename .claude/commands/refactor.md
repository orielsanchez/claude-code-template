---
allowed-tools: all
description: Systematic code refactoring and improvement workflows with safety nets
---

# Systematic Refactoring & Code Improvement

Improve, Simplify, Optimize, Validate. We refactor with purpose, maintain behavior, and enhance quality. Every refactoring must be driven by clear objectives and protected by comprehensive tests.

**Usage:** 
- `/refactor <target>` - Full systematic refactoring workflow
- `/refactor extract <function_name>` - Extract methods/functions systematically
- `/refactor simplify <component>` - Reduce complexity while preserving behavior
- `/refactor optimize <performance_target>` - Performance-driven refactoring
- `/refactor modernize <legacy_code>` - Update to current patterns and practices

**Examples:** 
- `/refactor "user authentication module for better testability"`
- `/refactor extract "payment processing logic from controller"`
- `/refactor simplify "order calculation with too many conditionals"`
- `/refactor optimize "database query performance in user service"`
- `/refactor modernize "legacy error handling to use Result types"`

## The Systematic Refactoring Process

**YOU MUST SAY:** "Let me analyze the current code and create a refactoring plan before making changes."

For complex refactoring, say: "Let me think deeply about this refactoring to ensure we improve without breaking behavior."

### **Phase 0: SAFETY NET** (MANDATORY)

**CRITICAL:** Establish comprehensive test coverage before any refactoring begins.

1. **Create Refactoring Branch**: Isolate improvement work
   - Branch name: `refactor/improve-user-auth-testability`
   - Command: `git checkout -b refactor/improve-user-auth-testability`

2. **Baseline Testing**: Ensure existing tests provide adequate coverage
   - Run `/tdd coverage` to assess current test coverage
   - Add missing tests for code being refactored
   - Verify all tests pass before proceeding

3. **Behavior Documentation**: Record current behavior explicitly
   - Document expected inputs/outputs
   - Capture performance baselines if relevant
   - Note any quirks or edge cases that must be preserved

**Learning Objective**: Never refactor without a safety net - tests are your insurance policy

### **Phase 1: ANALYZE & PLAN** (Code Smell Detection)

**Goal:** Understand what needs improvement and why.

1. **Identify Refactoring Objectives**: State clear goals
   - **Readability**: Make code easier to understand
   - **Maintainability**: Reduce coupling, improve cohesion
   - **Performance**: Optimize hot paths or resource usage
   - **Testability**: Make code easier to test in isolation
   - **Modernization**: Update to current best practices

2. **Code Smell Analysis**: Systematically identify issues
   - **Large Methods/Classes**: Functions doing too much
   - **Duplicate Code**: Repeated logic that should be extracted
   - **Long Parameter Lists**: Functions with too many arguments
   - **Feature Envy**: Classes using other classes' data heavily
   - **Primitive Obsession**: Using basic types instead of domain objects
   - **Complex Conditionals**: Nested if/else that obscure intent

3. **USE SYSTEMATIC ANALYSIS** for complex refactoring:
   ```
   "I'll use systematic analysis to examine this code:
   - Complexity analysis for overly complex functions
   - Dependency analysis for coupling issues  
   - Performance analysis for optimization opportunities"
   ```

4. **Impact Assessment**: Understand refactoring scope
   - Which components will be affected?
   - What are the risks and benefits?
   - How will this improve the codebase long-term?

**Learning Objective**: Develop systematic thinking about code quality and improvement opportunities

**Integration**: Use analysis tools and systematic investigation for complex refactoring decisions

### **Phase 2: INCREMENTAL TRANSFORMATION** (Test-Protected Changes)

**Goal:** Make improvements in small, verifiable steps.

1. **One Refactoring at a Time**: Never combine multiple refactoring types
   - Extract Method → Test → Extract Class → Test → etc.
   - Each step should improve one specific aspect
   - Run tests after each transformation

2. **Common Refactoring Patterns**:

   **Extract Method:**
   ```
   1. Identify cohesive code block
   2. Ensure block has clear inputs/outputs  
   3. Extract to well-named method
   4. Run tests to verify behavior unchanged
   ```

   **Extract Class:**
   ```
   1. Identify related data and methods
   2. Create new class with single responsibility
   3. Move related members to new class
   4. Update clients to use new interface
   5. Run tests to verify behavior unchanged
   ```

   **Simplify Conditionals:**
   ```
   1. Identify complex conditional logic
   2. Extract conditions to well-named methods
   3. Use early returns to reduce nesting
   4. Consider polymorphism for complex switches
   5. Run tests to verify behavior unchanged
   ```

3. **Preserve Behavior**: Refactoring never changes external behavior
   - Public APIs remain identical
   - Performance characteristics maintained (unless optimizing)
   - Error handling behavior unchanged
   - All existing tests continue to pass

4. **Language-Specific Best Practices**:
   - **Rust**: Use type system to enforce invariants, prefer composition over inheritance
   - **JavaScript/TypeScript**: Leverage modern ES features, improve type safety
   - **Python**: Use dataclasses, type hints, and functional patterns
   - **Go**: Simplify interfaces, use embedding over inheritance

**Learning Objective**: Experience how small, incremental changes accumulate into significant improvements

**Quality Requirements**: Follow all CLAUDE.md standards during refactoring

### **Phase 3: VALIDATION & OPTIMIZATION** (Quality Confirmation)

**Goal:** Verify improvements achieved objectives without introducing regressions.

1. **Comprehensive Testing**: Ensure all behavior preserved
   - Run full test suite - all tests must pass
   - Performance testing if optimization was the goal
   - Integration testing for multi-component refactoring
   - Manual testing of critical user paths

2. **Quality Metrics**: Measure improvement
   - Code complexity metrics (cyclomatic complexity)
   - Test coverage - should improve or maintain
   - Code duplication analysis
   - Dependency coupling analysis

3. **Code Review**: Validate improvement quality
   - Is the code more readable and maintainable?
   - Are the abstractions appropriate?
   - Does the design better reflect the domain?
   - Are there opportunities for further improvement?

4. **Performance Validation**: For optimization refactoring
   - Benchmark before/after performance
   - Verify optimization objectives met
   - Ensure no unexpected performance regressions
   - Document performance characteristics

**Learning Objective**: Develop objective assessment skills for code quality improvements

**Integration**: Use `/check` command for comprehensive quality validation

### **Phase 4: DOCUMENT & REFLECT** (Knowledge Preservation)

**Goal:** Capture learning and establish patterns for future refactoring.

1. **Document Changes**: Record what was improved and why
   - **Refactoring Summary**: What was changed and the motivation
   - **Pattern Documentation**: Reusable patterns discovered
   - **Lessons Learned**: What worked well, what didn't
   - **Future Opportunities**: Additional improvements identified

2. **Architecture Documentation**: Update design documentation
   - Class/module diagrams if structure changed significantly
   - API documentation for interface changes
   - Performance characteristics for optimizations
   - Dependency relationships for structural changes

3. **Team Knowledge**: Share insights
   - Add successful patterns to team knowledge base
   - Document refactoring techniques that worked well
   - Identify code smells to watch for in future
   - Update coding standards if new patterns emerged

4. **Mastery Progression**: Track skill development
   - What refactoring techniques were practiced?
   - Which code quality concepts were reinforced?
   - What new patterns or techniques were learned?
   - Areas for continued refactoring skill development

**Learning Objective**: Build systematic approach to continuous code improvement

**Integration**: Use `/ship` to create final commit with comprehensive refactoring documentation

## Refactoring Types & Patterns

### **Extract Method/Function**
**When:** Methods doing multiple things or containing repeated code
**Goal:** Single responsibility, reusability, readability
```
/refactor extract "user validation logic from registration method"
```

### **Extract Class/Module**
**When:** Classes with multiple responsibilities or related functionality scattered
**Goal:** Better organization, single responsibility principle
```
/refactor extract "payment processing logic into dedicated service"
```

### **Simplify Complex Logic**
**When:** Nested conditionals, complex boolean logic, or hard-to-follow control flow
**Goal:** Readability, maintainability, testability
```
/refactor simplify "order discount calculation with multiple conditions"
```

### **Performance Optimization**
**When:** Profiling identifies bottlenecks or inefficient algorithms
**Goal:** Improved performance while maintaining behavior
```
/refactor optimize "database query performance in user dashboard"
```

### **Modernization**
**When:** Code uses outdated patterns or doesn't follow current best practices
**Goal:** Use modern language features, improve type safety, follow conventions
```
/refactor modernize "error handling to use proper Result types"
```

## Integration with Other Commands

- **`/refactor` → `/tdd coverage`**: Assess test coverage before refactoring
- **`/refactor` → `/check`**: Validate refactoring meets quality standards
- **`/refactor` → `/ship`**: Document and commit improvements
- **`/refactor` → Systematic Tools**: Use analysis tools for complex refactoring decisions

## Senior-Level Refactoring Principles

### **Red-Green-Refactor Cycle**
```
1. Red: Write failing test for new functionality
2. Green: Implement minimal code to pass
3. Refactor: Improve design while keeping tests green
```

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

**Working on Main Branch**: Making experimental changes on main
- **Solution**: Always create dedicated refactoring branch

## Learning Integration

### **Before Starting**:
- State your refactoring hypothesis clearly
- Identify what you want to learn about code design
- Set specific improvement objectives

### **During Refactoring**:
- Explain WHY each change improves the code
- Connect refactoring patterns to software design principles
- Document insights about code organization and architecture

### **After Completion**:
- Review what the refactoring taught you about the domain
- Identify patterns that can be applied elsewhere
- Update personal knowledge base with refactoring techniques

**Remember**: Refactoring is about continuous improvement. The goal isn't perfect code - it's code that's systematically better than before while maintaining all existing behavior.

The `/refactor` command transforms reactive maintenance into proactive code improvement that builds both codebase quality and refactoring skills.