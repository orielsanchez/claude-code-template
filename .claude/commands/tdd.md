---
allowed-tools: all
description: Test-Driven Development workflow with AI assistance
---

# Test-Driven Development & Test Management

Complete TDD workflow and test management with AI assistance.

**Usage:** 
- `/tdd <feature>` - Full TDD workflow for new features
- `/tdd run [scope]` - Execute tests with analysis
- `/tdd coverage [scope]` - Analyze test coverage and gaps
- `/tdd review` - Review test quality and suggest improvements
- `/tdd design <existing_code>` - Design tests for existing code

**Examples:** 
- `/tdd user authentication with JWT tokens` - Full TDD cycle
- `/tdd run auth` - Run authentication tests
- `/tdd coverage user_service` - Check coverage
- `/tdd review` - Comprehensive test suite review

## The TDD-AI Process

### **Phase 1: RED** - Write Failing Tests
1. **Define the Interface**: What API do you want to use?
2. **Write Specific Tests**: Cover happy path, edge cases, and error conditions
3. **Document Assumptions**: What are the inputs, outputs, and constraints?
4. **Verify Tests Fail**: Confirm we're testing the right behavior

**Learning Objective**: Force precise thinking about requirements before implementation

### **Phase 2: GREEN** - AI Implementation
1. **Provide Test Context**: Share the failing tests with AI
2. **Request Minimal Implementation**: "Make these tests pass with the simplest code"
3. **Avoid Over-Engineering**: Resist adding features not covered by tests
4. **Validate Success**: All tests should now pass

**Learning Objective**: See how tests guide implementation decisions

### **Phase 3: REFACTOR** - Improve with Safety
1. **Identify Code Smells**: What can be improved?
2. **Refactor with AI**: "Improve this code while keeping tests passing"
3. **Extract Patterns**: Move toward better architecture
4. **Verify Behavior**: Tests ensure nothing broke

**Learning Objective**: Experience fearless refactoring with test protection

## TDD Workflow Integration

**Before Starting:**
- State your hypothesis about the feature behavior
- Identify what you want to learn about the domain
- Set quality criteria for the implementation

**During Each Phase:**
- Explain WHY you're writing each test
- Connect test structure to system architecture
- Document insights about interface design

**After Completion:**
- Review what the tests taught you about the problem
- Identify patterns that can be reused
- Update mastery progression

## Senior-Level TDD Skills

**Test Design Patterns:**
- **Arrange-Act-Assert**: Structure tests clearly
- **Table-Driven Tests**: Cover multiple scenarios efficiently
- **Test Doubles**: Mock external dependencies
- **Property-Based Testing**: Generate test cases automatically

**Architecture Insights:**
- Tests reveal coupling and cohesion issues
- Hard-to-test code indicates design problems
- Good tests enable modular architecture
- Test structure mirrors system boundaries

## Common TDD-AI Antipatterns

**Writing tests after implementation** - Tests become implementation-dependent
**Vague test descriptions** - AI can't understand requirements
**Testing implementation details** - Tests become brittle
**Skipping the RED phase** - Miss requirement clarification benefits
**Over-engineering in GREEN** - Add complexity not driven by tests

## Test Management Actions

### **`/tdd run [scope]`** - Test Execution & Analysis
- Execute tests with detailed failure analysis
- Performance timing and bottleneck identification
- Test isolation and dependency validation
- Clear reporting of what passed/failed and why

### **`/tdd coverage [scope]`** - Coverage Analysis
- Line, branch, and function coverage analysis
- Identify untested code paths and edge cases
- Integration coverage for component interactions
- Recommendations for improving coverage

### **`/tdd review`** - Test Quality Assessment
- Test structure and clarity evaluation
- Test independence and organization review
- Mock strategy and test data management
- Identify test smells and improvement opportunities

### **`/tdd design <existing_code>`** - Retrofit Testing
- Design comprehensive tests for legacy code
- Identify testable interfaces and boundaries
- Create test scaffolding for existing systems
- Plan incremental test coverage improvements

## Senior-Level Test Patterns

### **Table-Driven Tests:**
```rust
#[test]
fn test_email_validation() {
    let cases = vec![
        ("valid@email.com", true),
        ("invalid.email", false),
        ("@no-local.com", false),
    ];
    
    for (email, expected) in cases {
        assert_eq!(is_valid_email(email), expected, "Failed: {}", email);
    }
}
```

## Integration with Other Commands

- **`/tdd` → `/check`**: Validate both test and implementation quality
- **`/tdd` → `/claude-md add pattern`**: Codify successful test patterns

**Remember**: TDD with AI isn't about AI writing tests - it's about you designing clear specifications that AI can reliably implement.

The goal is building senior-level systematic thinking about software design through the discipline of test-first development.