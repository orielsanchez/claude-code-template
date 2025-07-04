---
allowed-tools: all
description: Execute production-quality implementation with strict standards
---

**CRITICAL WORKFLOW - NO SHORTCUTS!**

You are tasked with implementing: $ARGUMENTS

**MANDATORY SEQUENCE:**
1. **RESEARCH FIRST** - "Let me research the codebase and create a plan before implementing"
2. **PLAN** - Present a detailed plan and verify approach
3. **TEST DESIGN** - Write failing tests that define the behavior (TDD RED phase)
4. **IMPLEMENT** - Let AI satisfy the test contracts (TDD GREEN phase)
5. **REFACTOR** - Improve design with test safety net (TDD BLUE phase)

**YOU MUST SAY:** "Let me research the codebase and create a plan before implementing."

For complex tasks, say: "Let me ultrathink about this architecture before proposing a solution."

**TDD INTEGRATION:**
- Step 3 (TEST DESIGN): Write tests for the interface you wish existed
- Step 4 (IMPLEMENT): Provide failing tests as context to AI
- Step 5 (REFACTOR): Use tests as safety net for improvements
- Follow the TDD-AI feedback loop: RED → GREEN → BLUE

**USE MULTIPLE AGENTS** when the task has independent parts:
"I'll spawn agents to tackle different aspects of this problem"

Consult ~/.claude/CLAUDE.md IMMEDIATELY and follow it EXACTLY.

**Critical Requirements:**

**HOOKS ARE WATCHING**
The smart-lint.sh hook will verify EVERYTHING. It will:
- Block operations if you ignore linter warnings
- Track repeated violations
- Prevent commits with any issues
- Force you to fix problems before proceeding

**Completion Standards (NOT NEGOTIABLE):**
- The task is NOT complete until ALL linters pass with zero warnings (clippy with all checks enabled)
- ALL tests must pass with meaningful coverage of business logic (skip testing main(), simple CLI parsing, etc.)
- The feature must be fully implemented and working end-to-end
- No placeholder comments, TODOs, or "good enough" compromises

**Reality Checkpoints (MANDATORY):**
- After EVERY 3 file edits: Run linters
- After implementing each component: Validate it works
- Before saying "done": Run FULL test suite
- If hooks fail: STOP and fix immediately

**Code Evolution Rules:**
- This is a feature branch - implement the NEW solution directly
- DELETE old code when replacing it - no keeping both versions
- NO migration functions, compatibility layers, or deprecated methods
- NO versioned function names (e.g., process_data_v2, process_data_new)
- When refactoring, replace the existing implementation entirely
- If changing an API, change it everywhere - no gradual transitions

**Language-Specific Quality Requirements:**

**For ALL languages:**
- Follow established patterns in the codebase
- Use language-appropriate linters at MAX strictness
- Delete old code when replacing functionality
- No compatibility shims or transition helpers

**For Rust specifically:**
- Absolutely NO unwrap() or expect() in production code - use proper error handling with Result<T, E>
- NO panic!() - use Result<T, E> for error propagation
- Use the ? operator for error handling - it's idiomatic and clean
- Avoid unnecessary unsafe blocks - if you need unsafe, document why extensively
- Follow standard Rust project layout (src/, tests/, benches/, examples/)
- NO blocking operations in async contexts - use proper async/await patterns
- Use channels (tokio::sync::mpsc) for communication between tasks
- Use select! for handling multiple async operations with timeouts

**Documentation Requirements:**
- Reference specific sections of relevant documentation (e.g., "Per the Rust Reference section 3.2...")
- Include links to official Rust docs, relevant RFCs, or API documentation as needed
- Document WHY decisions were made, not just WHAT the code does

**Implementation Approach:**
- Start by outlining the complete solution architecture
- When modifying existing code, replace it entirely - don't create parallel implementations
- Run linters after EVERY file creation/modification
- If a linter fails, fix it immediately before proceeding
- Write meaningful tests for business logic, skip trivial tests for main() or simple wiring
- Benchmark critical paths with cargo bench

**Procrastination Patterns (FORBIDDEN):**
- "I'll fix the linter warnings at the end" → NO, fix immediately
- "Let me get it working first" → NO, write clean code from the start
- "This is good enough for now" → NO, do it right the first time
- "The tests can come later" → NO, test as you go
- "I'll refactor in a follow-up" → NO, implement the final design now

**Specific Antipatterns to Avoid:**
- Do NOT create elaborate error type hierarchies without clear benefit
- Do NOT use unwrap() or expect() - handle errors properly
- Do NOT keep old implementations alongside new ones
- Do NOT create "transition" or "compatibility" code
- Do NOT stop at "mostly working" - the code must be production-ready
- Do NOT accept any linter warnings as "acceptable" - fix them all
- Do NOT use blocking operations in async contexts
- Do NOT ignore clippy suggestions - they're usually right

**Completion Checklist (ALL must be checked):**
- [ ] Research phase completed with codebase understanding
- [ ] Plan reviewed and approach validated  
- [ ] ALL linters pass with ZERO warnings (cargo clippy)
- [ ] ALL tests pass (cargo test)
- [ ] Feature works end-to-end in realistic scenarios
- [ ] Old/replaced code is DELETED
- [ ] Documentation/comments are complete
- [ ] Reality checkpoints were performed regularly
- [ ] NO TODOs, FIXMEs, or "temporary" code remains

**STARTING NOW** with research phase to understand the codebase...

(Remember: The hooks will verify everything. No excuses. No shortcuts.)