---
allowed-tools: all
description: TDD-first development workflow - the primary way to build features with AI assistance
---

# TDD-First Development Workflow

**THE PRIMARY COMMAND FOR ALL FEATURE DEVELOPMENT**

Complete TDD-first development workflow with AI assistance. This command embodies the template's core philosophy: test-driven development is not optional, it's the foundation of quality software.

**Usage:** 
- `/dev <feature_description>` - Full TDD workflow for new features (RECOMMENDED)
- `/dev` - Smart continuation based on current context
- `/dev plan <feature>` - Explicit planning phase with TDD approach
- `/dev test` - Test management and TDD cycle control
- `/dev implement` - Implementation phase (only after tests exist)
- `/dev refactor` - Refactoring phase with test safety net

**Examples:** 
- `/dev user authentication with JWT tokens` - Full TDD cycle from scratch
- `/dev` - Smart: "I see failing tests, let's implement to make them pass"
- `/dev test run` - Execute current test suite with analysis
- `/dev test coverage` - Analyze test coverage gaps
- `/dev refactor login service` - Improve code with test protection

## Core TDD-First Philosophy

**EVERY development task starts with tests.** This command is designed to make TDD the natural, default path. The AI will:

1. **Always default to test-first thinking**
2. **Guide you through proper TDD phases** 
3. **Explain WHY tests come first**
4. **Use tests to drive design decisions**
5. **Build your systematic thinking skills**

**This is not just a tool - it's a TDD coach that builds senior-level development skills.**

## The TDD-AI Development Cycle

### **Phase 1: RED** - Write Failing Tests (DEFAULT START)
**The AI will ALWAYS start here for new features:**

```
You: /dev user registration endpoint
AI: "Let's start with TDD. I'll write failing tests that define exactly how user registration should behave. This forces us to think through the requirements first..."
```

**What happens in RED phase:**
1. **Define the Interface**: What API/behavior do we want?
2. **Write Specific Tests**: Cover happy path, edge cases, error conditions
3. **Document Assumptions**: Clear inputs, outputs, constraints
4. **Verify Tests Fail**: Confirm we're testing the right behavior

**Learning Objective**: Force precise thinking about requirements before any implementation

### **Phase 2: GREEN** - Minimal Implementation
**AI implements just enough code to make tests pass:**

```
AI: "Now I'll implement the simplest code that makes these tests pass. No over-engineering, just enough to satisfy our test contracts..."
```

**What happens in GREEN phase:**
1. **Provide Test Context**: AI uses failing tests as specification
2. **Minimal Implementation**: Only code needed to pass tests
3. **Avoid Over-Engineering**: No features not covered by tests
4. **Validate Success**: All tests must pass

**Learning Objective**: See how tests guide implementation decisions

### **Phase 3: REFACTOR** - Improve with Safety
**Improve code quality while maintaining test coverage:**

```
AI: "Tests are green! Now let's refactor for better design. The tests protect us from breaking existing behavior..."
```

**What happens in REFACTOR phase:**
1. **Identify Improvements**: Code smells, architecture issues
2. **Refactor with Confidence**: Tests ensure behavior preservation  
3. **Extract Patterns**: Move toward better design
4. **Continuous Validation**: Tests run after each change

**Learning Objective**: Experience fearless refactoring with test protection

## Smart Context Detection

**The AI analyzes your workspace and automatically chooses the right TDD phase:**

### **No Tests Exist** → RED Phase
```
AI: "I don't see any tests for this feature. Let's start with TDD - writing failing tests that define the behavior we want."
```

### **Tests Failing** → GREEN Phase  
```
AI: "I see 3 failing tests in user_service.test.ts. Let's implement just enough code to make them pass."
```

### **Tests Passing** → REFACTOR Phase
```
AI: "All tests are green! Perfect time to refactor. What improvements shall we make while the tests protect us?"
```

### **No Clear Context** → Discovery Mode
```
AI: "What feature shall we build? I'll start by writing tests that define how it should work."
```

## Command Variants - All TDD-Focused

### **`/dev <feature_description>`** - Full TDD Workflow (RECOMMENDED)
**The primary way to start any new feature. AI automatically begins with test design.**

**AI Behavior:**
- Starts with requirements analysis through test design
- Writes comprehensive failing tests first
- Implements minimal code to pass tests
- Refactors for quality with test protection
- Explains TDD decisions throughout the process

**Example Flow:**
```
You: /dev payment processing with Stripe
AI: "Starting with TDD for payment processing. Let me write tests that define:
     - Successful payment flow
     - Invalid card handling  
     - Network failure scenarios
     - Webhook processing
     
     These tests will guide our implementation..."
```

### **`/dev`** - Smart Continuation
**Analyzes current workspace context and suggests the appropriate TDD phase.**

**AI Decision Matrix:**
- **Detects failing tests** → "Let's implement to make tests pass (GREEN phase)"
- **Detects passing tests** → "Perfect time to refactor with test safety (REFACTOR phase)"  
- **Detects no tests** → "Let's write tests first to define the behavior (RED phase)"
- **Detects incomplete feature** → "I see partial work, let's write tests for the missing pieces"

**Always announces its reasoning:**
```
AI: "I see you have failing tests in auth.test.ts. We're in the GREEN phase - let's implement just enough to make these tests pass. [Proceed] [Write more tests first] [Different approach]"
```

### **`/dev plan <feature>`** - TDD-Oriented Planning
**Creates detailed implementation plan with test-first approach.**

**Planning always includes:**
- Test strategy and test cases to write
- TDD phase breakdown (RED → GREEN → REFACTOR)
- Interface design driven by test requirements  
- Risk identification through test scenario analysis

```
You: /dev plan real-time chat system
AI: "Creating TDD plan for real-time chat:

     RED Phase - Tests to Write:
     - WebSocket connection tests
     - Message delivery tests  
     - User presence tests
     - Error handling tests
     
     GREEN Phase - Implementation:
     - Minimal WebSocket server
     - Basic message routing
     - Simple user tracking
     
     REFACTOR Phase - Improvements:
     - Performance optimization
     - Error recovery
     - Code organization
     
     This ensures we build exactly what the tests specify..."
```

### **`/dev test`** - Test Management Hub
**Comprehensive test operations while maintaining TDD mindset.**

**Subcommands:**
- `/dev test run [scope]` - Execute tests with detailed TDD cycle analysis
- `/dev test coverage [scope]` - Coverage analysis with TDD gap identification  
- `/dev test review` - Test quality assessment and TDD pattern review
- `/dev test add <scenario>` - Add specific test cases (RED phase)
- `/dev test debug` - Debug failing tests (GREEN phase support)

**TDD-Focused Features:**
- **RED Phase Support**: Help identify missing test scenarios
- **GREEN Phase Support**: Analyze failing tests to guide implementation
- **REFACTOR Phase Support**: Ensure test coverage before refactoring
- **Test Quality**: Review test clarity and TDD best practices

```
You: /dev test coverage auth
AI: "Coverage analysis for auth module:
     
     Lines covered: 87% (good)
     Branches covered: 73% (needs improvement)
     
     Missing test scenarios (RED phase opportunities):
     - Password reset with expired token
     - Concurrent login attempts
     - JWT refresh edge cases
     
     Shall we write tests for these scenarios first?"
```

### **`/dev implement`** - Implementation Phase (GREEN)
**Explicit implementation mode - only used when tests already exist.**

**AI Behavior:**
- **Requires existing failing tests** - will not proceed without them
- Implements minimal code to satisfy test contracts
- Explains how tests guide implementation decisions
- Avoids over-engineering beyond test requirements

```
You: /dev implement user profile updates
AI: "I see failing tests in profile.test.ts defining the update behavior. 
     Let me implement just enough code to make these tests pass:
     
     Tests specify:
     - Validation of required fields
     - Sanitization of input data  
     - Database update with optimistic locking
     - Return updated profile data
     
     Implementing minimal solution..."
```

**Safety Checks:**
- Refuses to implement without tests: "I don't see tests for this feature. Let's start with `/dev test add` to define the behavior first."
- Warns about over-engineering: "Tests don't require this complexity. Shall we keep it simple or add tests for this behavior?"

### **`/dev refactor`** - Refactoring Phase (BLUE)
**Improve code quality with test safety net.**

**AI Behavior:**
- **Requires passing tests** before any refactoring
- Identifies improvement opportunities through code analysis
- Runs tests after each refactoring step  
- Explains how tests enable fearless refactoring

```
You: /dev refactor payment service
AI: "All payment tests are green - perfect for refactoring!
     
     Improvement opportunities:
     - Extract payment provider interface
     - Simplify error handling logic
     - Remove code duplication
     
     I'll make these changes incrementally, running tests after each step to ensure we don't break anything..."
```

## Integration with Other Commands

### **TDD-First Quality Pipeline:**
- **`/dev` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/dev` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging
- **`/dev` → `/refactor`**: When code works but needs improvement (with test safety)

### **TDD Learning Integration:**
- **`/dev` → `/claude-md add pattern`**: Codify successful TDD patterns you discover
- **After each `/dev` session**: Document what the tests taught you about the problem domain

## TDD Best Practices Enforced

### **Test Design Patterns:**
- **Arrange-Act-Assert**: Clear test structure
- **Table-Driven Tests**: Multiple scenarios efficiently  
- **Test Doubles**: Mock external dependencies properly
- **Property-Based Testing**: Generate edge cases automatically

### **Architecture Through Tests:**
- Tests reveal coupling and cohesion issues
- Hard-to-test code indicates design problems
- Good tests enable modular architecture
- Test structure mirrors system boundaries

### **Senior-Level TDD Skills Built:**
- **Requirements Clarity**: Tests force precise thinking
- **Interface Design**: Tests define the API you want
- **Regression Protection**: Changes can't break existing behavior  
- **Living Documentation**: Tests serve as executable specifications

## Common Anti-Patterns Prevented

**The AI actively prevents these TDD violations:**

- **Implementation before tests** → "Let's write tests first to define the behavior"
- **Vague test descriptions** → "This test isn't clear enough. Let me rewrite it with specific assertions"  
- **Testing implementation details** → "This test is too coupled to implementation. Let's test behavior instead"
- **Skipping RED phase** → "All tests are passing. Let's write a failing test for the new behavior first"
- **Over-engineering in GREEN** → "Tests don't require this complexity. Let's keep it simple"

## Context Management

### **Hybrid State System:**
**File-based analysis (primary) + session context (enhancement)**

**Always works from file system state:**
- Analyzes existing tests, implementation, and results
- Can recover from any state without external dependencies
- Git-friendly (no required state files to manage)

**Enhanced with session context:**
- `.claude/context.json` (gitignored) tracks recent TDD phase and focus
- Provides smooth, intelligent suggestions based on recent work
- Automatically updated after each successful `/dev` operation

**Example context file:**
```json
{
  "last_command": "dev test run",
  "current_tdd_phase": "green",
  "active_feature": "user_authentication", 
  "failing_tests": ["auth.test.ts:42", "auth.test.ts:67"],
  "last_test_run": {
    "timestamp": "2023-10-27T10:00:00Z",
    "status": "2 passing, 2 failing",
    "focus_area": "JWT token validation"
  }
}
```

### **Always Announces Intent:**
**AI never assumes - always states its plan and offers alternatives**

```
AI: "I see failing tests for user authentication. My plan is to implement the JWT validation logic to make them pass (GREEN phase). 

     [Proceed with implementation] 
     [Write more tests first] 
     [Review test failures]
     [Different approach]"
```

## Command Evolution Path

**This unified `/dev` command replaces:**
- `/tdd` - Pure TDD learning (now the default `/dev` behavior)
- `/next` - Implementation workflow (now `/dev implement` with mandatory tests)

**Maintains all functionality while:**
- Eliminating choice paralysis between commands
- Making TDD the natural default path
- Providing explicit control when needed
- Building systematic TDD thinking skills

## Success Metrics

**You're using TDD effectively when:**
- Every feature starts with failing tests
- Implementation is guided by test requirements
- Refactoring feels safe because of test coverage
- You can explain WHY each test exists
- Tests serve as documentation for future developers

**The `/dev` command is successful when:**
- Developers naturally think "test first" 
- TDD becomes the obvious way to work
- Quality issues are caught early through tests
- Code changes feel safe and controlled
- You build better software faster

---

**Remember**: This isn't just about writing tests - it's about building systematic thinking skills that make you a better developer. The `/dev` command is your TDD coach, always guiding you toward better practices.

The goal is making senior-level TDD thinking automatic and natural.