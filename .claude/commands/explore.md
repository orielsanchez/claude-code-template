---
allowed-tools: Read, Write, Edit, MultiEdit, Bash, LS, Glob, Grep, Task, TodoRead, TodoWrite
description: Interactive command discovery and exploration system
---

# Interactive Command Discovery

**Address command discovery pain points through guided exploration**

The `/explore` command provides interactive discovery of available commands, helping experienced developers find the right tool for their task without trial and error.

## Core Philosophy

Command discovery should be:
- **Intent-driven**: Search by what you want to accomplish
- **Contextual**: Get suggestions based on your current workflow
- **Educational**: Learn command relationships and best practices
- **Efficient**: Find the right command quickly

## Usage Patterns

### Browse by Category
```bash
/explore category development    # Browse development commands
/explore category quality        # Browse quality commands  
/explore category completion     # Browse completion commands
/explore category system         # Browse system commands
```

### Search by Intent
```bash
/explore search "fix bug"        # Find commands for debugging
/explore search "new feature"    # Find commands for development
/explore search "testing"        # Find commands for testing
/explore search "commit"         # Find commands for completion
```

### Get Contextual Suggestions
```bash
/explore suggest                 # Suggestions based on current context
/explore workflow "implement authentication"  # Step-by-step guidance
```

### Command Details
```bash
/explore details dev             # Deep dive into /dev command
/explore details debug           # Learn about /debug workflow
```

## Implementation

The explore command uses the `CommandDiscovery` engine which:

1. **Parses Available Commands**: Reads all `.claude/commands/*.md` files
2. **Categorizes by Purpose**: Groups commands by development workflow stage
3. **Provides Search**: Intent-based searching with relevance scoring
4. **Suggests Workflows**: Context-aware command recommendations
5. **Tracks Usage**: Analytics to improve discovery patterns

## Command Categories

- **Development**: `/dev`, `/debug`, `/refactor` - Building and improving code
- **Quality**: `/check` - Ensuring code quality and standards  
- **Completion**: `/ship` - Finalizing and documenting work
- **System**: `/help`, `/prompt`, `/plan` - System and planning commands

## Examples

**Quick Command Overview:**
```bash
You: /explore
AI: 🔍 Command Discovery

Interactive command exploration to help you find the right tool for your task.

📚 Categories:
• development  - Build, debug, and develop features  
• quality      - Code quality and validation
• completion   - Finalize and ship your work
• system       - Help, configuration, and utilities

🎯 Usage:
• /explore category development    - Browse development commands
• /explore search "fix bug"        - Search by intent or keyword  
• /explore suggest                 - Get suggestions for current context
• /explore workflow "new feature"  - Get step-by-step guidance
```

**Category Exploration:**
```bash
You: /explore category development
AI: 🔧 Development Commands

Commands for building and developing features

/dev
   TDD-First Development Workflow
   Usage: /dev [feature]
   Examples:
     /dev user registration endpoint
     /dev authentication system

/debug  
   Systematic Debugging & Root Cause Analysis
   Usage: /debug [issue]
   Examples:
     /debug user login fails with 500 error
```

**Intent-Based Search:**
```bash
You: /explore search "fix bug"
AI: 🔍 Search Results for "fix bug"

Found 2 commands:

/debug
   Systematic Debugging & Root Cause Analysis
   Relevance: 95%
   Example: /debug user login fails with 500 error

/refactor
   Systematic Refactoring & Code Improvement  
   Relevance: 40%
   Example: /refactor authentication module
```

**Workflow Guidance:**
```bash
You: /explore workflow "implement new feature"
AI: 💡 Recommended Workflow

For implementing new features:

/plan → /dev → /check → /ship

Steps:
1. /plan - Plan the feature implementation
   Rationale: Strategic planning prevents rework

2. /dev - Implement with TDD approach  
   Rationale: Test-driven development ensures quality

3. /check - Verify code quality
   Rationale: Catch issues before shipping

4. /ship - Commit and document changes
   Rationale: Complete the development cycle
```

## Integration Points

- **UX Research**: Tracks discovery patterns for continuous improvement
- **Analytics**: Measures command discovery effectiveness
- **Command System**: Reads from existing `.claude/commands/` structure
- **Workflow Intelligence**: Learns from usage patterns to improve suggestions

## Technical Implementation

```javascript
const CommandDiscovery = require('../lib/command-discovery/discovery-engine');

const discovery = new CommandDiscovery();

// Basic usage
const commands = discovery.getAvailableCommands();
const categories = discovery.getCommandCategories();

// Advanced features  
const suggestions = discovery.suggestCommands({
  currentTask: 'implementing new feature',
  recentCommands: ['/plan'],
  userType: 'experienced'
});

const workflow = discovery.generateWorkflowGuidance('fix authentication bug');
```

## Phase 2 UX Improvement

This command directly addresses the Phase 1 finding:
- **Pain Point**: "Difficult to discover available commands without trial and error"
- **Impact Score**: 21/100 (medium priority)  
- **User Type**: Experienced developers
- **Solution**: Interactive command exploration with intent-based discovery

### Success Metrics

- Reduced command discovery time
- Increased usage of appropriate commands for tasks
- Higher user satisfaction with command system
- Improved workflow efficiency

## Learning Integration

The explore command teaches while it helps:
- **Command Relationships**: Shows how commands work together
- **Best Practices**: Demonstrates recommended workflows
- **Progressive Discovery**: Guides users from simple to advanced usage
- **Context Awareness**: Learns user patterns to improve suggestions

## Future Enhancements

- Voice-guided command discovery
- Visual workflow diagrams  
- Integration with project context
- Personalized command recommendations
- Community-driven command examples