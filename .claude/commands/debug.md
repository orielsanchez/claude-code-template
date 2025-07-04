---
allowed-tools: all
description: Systematic debugging workflow with investigation, root cause analysis, and regression testing
---

# Systematic Debugging & Root Cause Analysis

Stop, Observe, Understand, Fix, Validate. We do not guess. We do not fix symptoms. We find the root cause, write a test that proves it, fix it, and validate the fix against all quality gates.

**Usage:** 
- `/debug <issue>` - Full systematic debugging workflow
- `/debug with-test <test_name>` - Start with existing failing test  
- `/debug --goto-fix "<hypothesis>"` - Fast-track when root cause is known
- `/debug investigate <symptoms>` - Investigation only (stops after Phase 2)
- `/debug regression <description>` - Create regression tests for resolved bugs

**Examples:** 
- `/debug "user login fails with 500 error on valid credentials"`
- `/debug with-test test_user_authentication_invalid_token`
- `/debug --goto-fix "User profile update missing updated_at field"`
- `/debug investigate "API responses are slow during peak hours"`

## The Systematic Debug Process

**YOU MUST SAY:** "Let me systematically investigate this issue before attempting any fixes."

For complex issues, say: "Let me think deeply about this problem using systematic investigation."

### **Phase 0: ISOLATE** (MANDATORY)

**CRITICAL:** Before any investigation, create a dedicated git branch to isolate the debugging effort.

1. **Create Debug Branch**: Prevents polluting main branch with experimental code
   - Branch name should be descriptive: `debug/fix-user-login-race-condition`
   - Command: `git checkout -b debug/fix-user-login-race-condition`
2. **Document Context**: Note current commit, affected systems, and reproduction environment

**Learning Objective**: Maintain clean git hygiene and enable safe experimentation

### **Phase 1: REPRODUCE & ISOLATE** 

**Goal:** Create a single, minimal, automated test that reliably reproduces the bug.

1. **Write Failing Regression Test**: Use `/tdd` workflow if no test exists
   - Test must FAIL for the expected reason
   - Document exact inputs, expected outputs, and actual behavior
   - Remove any unrelated complexity from the test case
2. **Verify Reproducibility**: Ensure the test fails consistently
3. **Document Symptoms**: Environment, timing, user actions, error messages

**Learning Objective**: Force precise thinking about the bug's behavior and create regression protection

**Integration**: This test becomes your regression test - it must pass after the fix

### **Phase 2: INVESTIGATE & HYPOTHESIZE** (Root Cause Analysis)

*This phase is skipped if using the `--goto-fix` flag.*

**Iterative Loop: Hypothesize → Validate → Refine**

1. **Formulate Initial Hypothesis**: State a clear, testable hypothesis about the root cause
   - *Example: "Hypothesis: The `calculate_total` function fails with negative numbers because of unsigned integer overflow"*

2. **Systematic Evidence Gathering**: Execute non-invasive checks to validate or refute hypothesis
   - **Static Analysis**: Examine code in the execution path for logical errors, type mismatches, anti-patterns
   - **History Analysis**: Use `git log -p <file>` to identify recent changes. Consider `git bisect` for unclear origins
   - **Dynamic Analysis**: If needed, add temporary, high-fidelity logging *on the debug branch* to trace execution

3. **USE TASK DELEGATION** for complex investigation:
   ```
   "I'll spawn agents to investigate different aspects:
   - Agent 1: Analyze the authentication flow and recent changes
   - Agent 2: Review database query patterns and performance
   - Agent 3: Examine error handling and logging systems"
   ```

4. **Confirm Root Cause**: Do not proceed until you have strong evidence pointing to a single root cause

**Learning Objective**: Develop systematic investigation skills and understand the WHY behind bugs

**Antipattern**: Jumping to conclusions or fixing symptoms without understanding root cause

### **Phase 3: TEST-FIRST FIX** (TDD Integration)

**Goal:** Implement the minimal fix to make the failing test pass.

1. **Implement Minimal Fix**: Write only the code needed to make the Phase 1 test pass
   - Follow language-specific quality standards from CLAUDE.md
   - Avoid over-engineering - resist adding features not covered by the test
   - Use proper error handling patterns for your language

2. **Verify Fix**: Run the specific failing test to confirm it now passes
3. **Regression Check**: Run full test suite to ensure no new failures introduced
4. **Refactor if Needed**: Improve design while keeping tests passing

**Learning Objective**: Experience how tests guide implementation and provide safety for improvements

**Quality Requirements**:
- Follow all forbidden patterns from CLAUDE.md
- Use proper error handling (Result<T, E> for Rust, proper exceptions for others)
- No unwrap(), expect(), panic!() in production code
- Delete old code when replacing functionality

### **Phase 4: VALIDATE & REFLECT** (Quality Enforcement)

**Goal:** Ensure the fix meets all project standards and capture learning.

1. **Quality Gates**: Run `/check` to ensure the fix meets all project quality standards
   - ALL linters must pass with zero warnings
   - ALL tests must pass
   - Hooks will automatically validate - fix any reported issues immediately

2. **Reflect & Document**:
   - **Root Cause Summary**: What actually caused the bug?
   - **Fix Summary**: What was changed and why?
   - **Key Learning**: What could prevent this class of bug in the future?
   - **Prevention Strategy**: What tests, patterns, or processes would catch this earlier?

3. **Cleanup**: Remove any temporary debugging code (print statements, extra logging)
4. **Final Commit**: Create clean, well-documented commit ready for pull request

**Learning Objective**: Build systematic thinking about software quality and failure prevention

**Integration**: Use `/ship` command to create final commit with proper documentation

## Usage Patterns Detailed

### **Standard Debugging: `/debug <issue>`**
Full 4-phase workflow for unknown bugs requiring investigation.

### **Known Test: `/debug with-test <test_name>`**
When you have a specific failing test - assumes Phase 1 is complete, starts with Phase 2.

### **Fast Track: `/debug --goto-fix "<hypothesis>"`**
For experienced developers with strong hypothesis about root cause:
- Still requires writing/updating the regression test (Phase 1)
- Skips deep investigation (Phase 2) 
- Proceeds directly to fix (Phase 3) and validation (Phase 4)

### **Investigation Only: `/debug investigate <symptoms>`**
When you need to understand a problem but aren't ready to fix:
- Executes Phases 0-2 only
- Documents findings for later action
- Useful for complex systems requiring analysis before fixes

### **Regression Testing: `/debug regression <description>`**
Create tests for bugs that were fixed without proper test coverage:
- Focuses on Phase 1 (writing comprehensive regression tests)
- Useful for hardening existing fixes

## Integration with Other Commands

- **`/debug` → `/tdd`**: Uses TDD workflow for regression test creation
- **`/debug` → `/check`**: Validates fix quality and runs all quality gates  
- **`/debug` → `/ship`**: Creates final commit with proper documentation
- **`/debug` → Systematic Tools**: Uses `thinkdeep`, `analyze`, etc. for complex investigation

## Senior-Level Debugging Patterns

### **Hypothesis-Driven Investigation**
```
1. State hypothesis clearly
2. Design tests to validate/invalidate hypothesis  
3. Gather evidence systematically
4. Refine hypothesis based on evidence
5. Repeat until confident in root cause
```

### **Git Forensics**
```bash
# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good <last_known_good_commit>

# Analyze specific file history
git log -p --follow <file>
git blame <file>
```

### **Systematic Evidence Collection**
- **Code Analysis**: Static review of execution paths
- **Historical Analysis**: When and how was this code introduced?
- **Dynamic Analysis**: What happens during execution?
- **Environmental Analysis**: What's different about failing cases?

## Antipatterns to Avoid

**Shotgun Debugging**: Making random changes hoping one will work
- **Solution**: Follow systematic investigation before making changes

**Fixing Symptoms**: Patching visible problems without understanding underlying cause  
- **Solution**: Always trace to root cause before implementing fix

**Skipping the Test**: Writing a fix without proving the bug exists and the fix works
- **Solution**: Regression test is mandatory - no exceptions

**Ignoring Quality Gates**: Committing fixes that fail `/check`
- **Solution**: All fixes must meet same quality bar as features

**Debugging Spirals**: Getting lost in complex investigation without structure
- **Solution**: Use systematic phases and task delegation for complex issues

**Working on Main Branch**: Making experimental changes on main development branch
- **Solution**: Always create dedicated debug branch (Phase 0)

## Learning Integration

### **Before Starting**:
- State your hypothesis about the problem
- Identify what you want to understand about the system
- Set learning objectives beyond just fixing the immediate issue

### **During Investigation**: 
- Explain WHY you're testing each hypothesis
- Connect bug patterns to system architecture understanding
- Document insights about failure modes and edge cases

### **After Completion**:
- Review what the investigation taught you about the system
- Identify patterns that could be applied to prevent similar bugs
- Update personal knowledge base with debugging techniques learned

**Remember**: Every bug is a learning opportunity. The goal isn't just working code - it's understanding WHY the bug occurred and how to prevent similar issues.

The `/debug` command transforms reactive firefighting into systematic engineering that strengthens both your codebase and your debugging skills.