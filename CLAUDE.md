# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## AUTOMATED CHECKS ARE MANDATORY

**ALL hook issues are BLOCKING - EVERYTHING must be GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement

**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use enhanced thinking tools to engage maximum reasoning capacity. Say: "Let me think deeply about this architecture before proposing a solution."

### USE TASK DELEGATION!

_Leverage Claude Code's capabilities strategically_ for better results:

- Break complex tasks into focused investigations
- Use systematic workflows for comprehensive analysis
- Delegate research tasks: "Let me investigate the database schema while analyzing the API structure"
- For complex refactors: Identify changes first, then implement systematically

Use the Task tool and systematic workflows whenever a problem has multiple independent parts.

### Enhanced Reality Checkpoints

**Stop and validate** at these moments:

- After implementing a complete feature
- Before starting a new major component
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** (BLOCKING)

**Knowledge checkpoints:**
- After every major component: Explain the design choices made
- Before declaring "done": Can I implement this again without AI?
- Weekly: Review and explain recent patterns learned
- Monthly: Implement something similar from scratch to test retention

Run your project's quality checks (tests, linting, formatting)

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures and knowledge brownouts.

### CRITICAL: Hook Failures Are BLOCKING

**When hooks report ANY issues (exit code 2), you MUST:**

1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every issue until everything is GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:

- Formatting issues (prettier, black, rustfmt, etc.)
- Linting violations (eslint, flake8, clippy, etc.) 
- Forbidden patterns (defined by your project)
- ALL other quality checks

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**

- When interrupted by a hook failure, maintain awareness of your original task
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Knowledge Preservation Protocol

### Before AI Assistance:
- State your hypothesis about the problem/approach
- Identify which concepts you want to understand deeply
- Set learning objectives: "I want to understand X pattern"

### During Implementation:
- Explain the "why" behind each architectural decision
- Connect new patterns to existing knowledge
- Document mental models and intuition being built

### After Completion:
- Summarize key insights gained
- Update personal knowledge base with new patterns
- Identify areas for deeper independent study

## Test-Driven Development Protocol

**"Write the test, let AI satisfy the contract" - TDD with AI reduces debugging by 90%**

### The TDD-AI Feedback Loop:

1. **RED**: Write a failing test that defines the exact behavior
   - Be specific about inputs, outputs, and edge cases
   - Test the interface you wish existed
   - Document assumptions and constraints in tests

2. **GREEN**: Let AI implement the minimal code to pass
   - Provide the failing test as context
   - Ask AI to implement ONLY what's needed to pass
   - Resist over-engineering at this stage

3. **REFACTOR**: Improve design with test safety net
   - Clean up implementation with AI assistance
   - Tests ensure behavior preservation
   - Extract patterns and improve architecture

### TDD Commands Integration:
- Use `/tdd <feature>` to start test-first development
- All `/next` commands should begin with test design
- `/check` validates both implementation AND test quality

### TDD Learning Objectives:
- **Requirements Clarity**: Tests force precise thinking about behavior
- **Interface Design**: Write tests for the API you want to use
- **Regression Protection**: Changes can't break existing behavior
- **Documentation**: Tests serve as executable specifications

### Senior-Level TDD Thinking:
- Tests reveal design problems before implementation
- Good tests enable fearless refactoring
- Test structure mirrors system architecture
- Edge cases in tests prevent production surprises

**Why This Works With AI:**
- Tests provide unambiguous specifications
- AI can't misinterpret test requirements
- Failing tests guide AI toward correct solutions
- Passing tests validate AI implementations

## Working Memory Management

### When context gets long:

- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:

```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Language-Specific Quality Rules

### UNIVERSAL FORBIDDEN PATTERNS:

- **NO emojis** in code, comments, documentation, commit messages, or any project files
- **NO Claude attribution** in commit messages ("Generated with Claude Code", "Co-Authored-By: Claude", etc.)
- **NO** keeping old and new code together - delete when replacing
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew, etc.)
- **NO** TODOs in final production code
- **NO** console.log/print statements in production
- **NO** hardcoded secrets or API keys
- **NO** broad exception catching without specific handling

### Language-Specific Additions:

**Rust:** No unwrap(), expect(), panic!() - use Result<T, E>
**JavaScript/TypeScript:** No any types, use strict mode
**Python:** No bare except clauses, use type hints
**Go:** No empty error checks, handle all errors

**AUTOMATED ENFORCEMENT**: Quality hooks will BLOCK commits that violate these rules.  
When you see "FORBIDDEN PATTERN", you MUST fix it immediately!

### Universal Quality Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `user_id` not `id`, `process_payment` not `do_stuff`
- **Early returns** to reduce nesting depth
- **Proper error handling** for your language (exceptions, Result types, etc.)
- **Comprehensive tests** for complex logic
- **Consistent code style** following project/language conventions
- **Clear separation of concerns** - single responsibility principle

### Example Patterns:

**JavaScript/TypeScript:**
```javascript
// GOOD: Proper error handling
async function fetchUserData(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

// BAD: No error handling
async function fetchUserData(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return await response.json(); // Can throw!
}
```

**Python:**
```python
# GOOD: Proper error handling
def parse_config(path: Path) -> Optional[Config]:
    try:
        with open(path) as f:
            return Config.from_json(f.read())
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Config parse failed: {e}")
        return None

# BAD: Bare except
def parse_config(path: Path) -> Config:
    try:
        with open(path) as f:
            return Config.from_json(f.read())
    except:  # Too broad!
        return Config()
```

## Implementation Standards

### Our code is complete when:

- All linters pass with zero issues
- All tests pass
- Feature works end-to-end
- Old code is deleted
- Documentation on all public items

### Testing Strategy

- **Complex business logic** → Write tests first (TDD)
- **Red → Green → Refactor** cycle for new features
- **Simple operations** → Write tests after implementation
- **Critical paths** → Add performance/integration tests
- **Skip testing** trivial getters/setters and framework boilerplate

### Project Structure Examples

**Node.js/TypeScript:**
```
src/
├── index.ts      # Application entrypoint
├── lib/          # Core modules
├── types/        # Type definitions
├── utils/        # Utility functions
└── config/       # Configuration
tests/            # Test files
docs/             # Documentation
```

**Python:**
```
src/package_name/
├── __init__.py   # Package entrypoint
├── core/         # Core modules
├── utils/        # Utility modules
└── config.py     # Configuration
tests/            # Test files
docs/             # Documentation
```

## Problem-Solving Together

When you're stuck or confused:

1. **Stop** - Don't spiral into complex solutions
2. **Break it down** - Use systematic investigation tools
3. **Think deeply** - For complex problems, engage enhanced reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:

- No premature optimization
- Benchmark before claiming something is faster
- Use appropriate profiling tools for your language
- Focus on algorithmic improvements over micro-optimizations

### **Security Always**:

- Validate all inputs at boundaries
- Use established crypto libraries (never roll your own)
- Parameterized queries for SQL (never concatenate!)
- Sanitize user input and escape outputs
- Follow OWASP guidelines for your stack

## Communication Protocol

### Progress Updates:

```
- Implemented authentication (all tests passing)
- Added rate limiting
- Found issue with token expiration - investigating
```

### Suggesting Improvements:

"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Technical Mastery Progression

### Current Focus: [Update weekly]
- Target concept: Core patterns for your tech stack
- Learning method: Implement features from scratch with understanding
- Knowledge gap: [Identify specific areas needing improvement]

### Depth Markers:
- **Novice**: Can use with AI guidance
- **Intermediate**: Can explain to others
- **Advanced**: Can implement from first principles
- **Expert**: Can teach and extend the concept

### Universal Mastery Areas to Track:
- **System Design & Architecture**: Novice → Intermediate → Advanced → Expert
- **Error Handling Patterns**: Novice → Intermediate → Advanced → Expert
- **Testing & Quality Assurance**: Novice → Intermediate → Advanced → Expert
- **Performance & Optimization**: Novice → Intermediate → Advanced → Expert
- **Security Best Practices**: Novice → Intermediate → Advanced → Expert
- **Test-Driven Development**: Novice → Intermediate → Advanced → Expert

### TDD Mastery Progression:
- **Novice**: Can write basic tests with guidance - Following examples and patterns
- **Intermediate**: Can design test suites independently - Understanding when and what to test
- **Advanced**: Can use TDD to drive architecture - Tests reveal design decisions
- **Expert**: Can teach TDD patterns to others - Mentor others in test-first thinking

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.
