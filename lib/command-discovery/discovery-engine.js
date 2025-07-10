const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('../shared/logger');

/**
 * Command Discovery Engine
 * 
 * Addresses Phase 1 UX finding: "Difficult to discover available commands without trial and error"
 * Provides interactive command exploration for experienced developers
 */
class CommandDiscovery {
  constructor(config = {}) {
    this.commandsPath = config.commandsPath || path.join(__dirname, '../../.claude/commands');
    this.cache = new Map();
    this.usageData = [];
    this.logger = createContextualLogger('DiscoveryEngine');
    this.discoveryPatterns = {
      popularSearches: [],
      effectiveCommands: [],
      userPreferences: {}
    };
  }

  /**
   * Load and parse all available commands
   */
  getAvailableCommands() {
    const cacheKey = 'available_commands';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const commands = [];

    try {
      if (!fs.existsSync(this.commandsPath)) {
        return [];
      }

      const files = fs.readdirSync(this.commandsPath)
        .filter(file => file.endsWith('.md') && file !== 'README.md');

      for (const file of files) {
        const commandPath = path.join(this.commandsPath, file);
        const content = fs.readFileSync(commandPath, 'utf8');
        const command = this.parseCommandFile(file, content);
        if (command) {
          commands.push(command);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to load commands', {
        operation: 'loadCommands',
        errorMessage: error.message
      });
      return [];
    }

    this.cache.set(cacheKey, commands);
    return commands;
  }

  /**
   * Parse command file and extract metadata
   */
  parseCommandFile(filename, content) {
    const name = path.basename(filename, '.md');
    
    // Extract description from content
    const lines = content.split('\n');
    let description = 'No description available';
    let category = 'system';
    
    // Look for description in first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') && !line.includes('---')) {
        description = line.replace(/^#+\s*/, '');
        break;
      }
    }

    // Categorize commands based on patterns
    category = this.categorizeCommand(name, content);

    // Extract usage examples
    const examples = this.extractExamples(content);
    const syntax = this.extractSyntax(content, name);

    return {
      name,
      description,
      category,
      usage: syntax,
      examples,
      filePath: path.join(this.commandsPath, filename)
    };
  }

  /**
   * Categorize command based on name and content
   */
  categorizeCommand(name, content) {
    const developmentCommands = ['dev', 'debug', 'refactor'];
    const qualityCommands = ['check'];
    const completionCommands = ['ship'];
    const systemCommands = ['help', 'claude-md', 'prompt', 'plan'];

    if (developmentCommands.includes(name)) return 'development';
    if (qualityCommands.includes(name)) return 'quality';
    if (completionCommands.includes(name)) return 'completion';
    if (systemCommands.includes(name)) return 'system';

    // Analyze content for categorization
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('test') || lowerContent.includes('debug')) return 'development';
    if (lowerContent.includes('quality') || lowerContent.includes('lint')) return 'quality';
    if (lowerContent.includes('commit') || lowerContent.includes('ship')) return 'completion';
    
    return 'system';
  }

  /**
   * Extract usage examples from command content
   */
  extractExamples(content) {
    const examples = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    let currentExample = '';

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock && currentExample.trim()) {
          examples.push(currentExample.trim());
          currentExample = '';
        }
        inCodeBlock = !inCodeBlock;
      } else if (inCodeBlock) {
        currentExample += line + '\n';
      } else if (line.trim().startsWith('/')) {
        // Direct command examples
        examples.push(line.trim());
      }
    }

    return examples.slice(0, 3); // Limit to 3 examples
  }

  /**
   * Extract command syntax
   */
  extractSyntax(content, commandName) {
    const lines = content.split('\n');
    
    // Look for syntax patterns
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(`/${commandName}`) || trimmed.startsWith(`**/${commandName}`)) {
        return trimmed.replace(/\*\*/g, '');
      }
    }

    return `/${commandName} [options]`;
  }

  /**
   * Get commands organized by category
   */
  getCommandCategories() {
    const commands = this.getAvailableCommands();
    const categories = {
      development: [],
      quality: [],
      completion: [],
      system: []
    };

    for (const command of commands) {
      if (categories[command.category]) {
        categories[command.category].push(command.name);
      }
    }

    return categories;
  }

  /**
   * Explore commands by category
   */
  exploreByCategory(categoryName) {
    const commands = this.getAvailableCommands();
    const categoryCommands = commands.filter(cmd => cmd.category === categoryName);

    const descriptions = {
      development: 'Commands for building and developing features',
      quality: 'Commands for ensuring code quality and standards',
      completion: 'Commands for finalizing and shipping work',
      system: 'System commands for help and configuration'
    };

    return {
      category: categoryName,
      description: descriptions[categoryName] || 'Available commands',
      commands: categoryCommands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        usage: cmd.usage,
        examples: cmd.examples
      }))
    };
  }

  /**
   * Suggest commands based on workflow context
   */
  suggestCommands(context) {
    const commands = this.getAvailableCommands();
    const suggestions = [];

    const task = context.currentTask?.toLowerCase() || '';
    const recent = context.recentCommands || [];
    const userType = context.userType || 'general';

    // Rule-based suggestions
    if (task.includes('feature') || task.includes('implement')) {
      suggestions.push({
        command: '/dev',
        reason: 'Perfect for implementing new features with TDD',
        confidence: 0.9
      });
    }

    if (task.includes('bug') || task.includes('fix') || task.includes('debug')) {
      suggestions.push({
        command: '/debug',
        reason: 'Systematic debugging workflow for fixing issues',
        confidence: 0.95
      });
    }

    if (task.includes('refactor') || task.includes('improve')) {
      suggestions.push({
        command: '/refactor',
        reason: 'Systematic code improvement and refactoring',
        confidence: 0.85
      });
    }

    if (recent.includes('/dev') || recent.includes('/debug')) {
      suggestions.push({
        command: '/check',
        reason: 'Verify quality after development work',
        confidence: 0.8
      });
    }

    if (task.includes('plan') || task.includes('strategy')) {
      suggestions.push({
        command: '/plan',
        reason: 'Strategic planning and roadmap creation',
        confidence: 0.9
      });
    }

    // Add completion suggestion if development commands were used
    if (recent.some(cmd => ['/dev', '/debug', '/refactor'].includes(cmd))) {
      suggestions.push({
        command: '/ship',
        reason: 'Complete and commit your changes',
        confidence: 0.7
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Search commands by intent or keyword
   */
  searchCommands(query) {
    const commands = this.getAvailableCommands();
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const command of commands) {
      let relevanceScore = 0;

      // Check name match
      if (command.name.includes(lowerQuery)) {
        relevanceScore += 50;
      }

      // Check description match
      if (command.description.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 30;
      }

      // Check examples match
      const exampleText = command.examples.join(' ').toLowerCase();
      if (exampleText.includes(lowerQuery)) {
        relevanceScore += 20;
      }

      // Keyword-based scoring
      const keywords = {
        'test': ['dev', 'debug', 'check'],
        'bug': ['debug'],
        'fix': ['debug', 'refactor'],
        'quality': ['check'],
        'commit': ['ship'],
        'help': ['help', 'prompt'],
        'plan': ['plan'],
        'feature': ['dev']
      };

      for (const [keyword, relatedCommands] of Object.entries(keywords)) {
        if (lowerQuery.includes(keyword) && relatedCommands.includes(command.name)) {
          relevanceScore += 40;
        }
      }

      if (relevanceScore > 0) {
        results.push({
          ...command,
          relevanceScore
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get detailed information about a specific command
   */
  getCommandDetails(commandName) {
    const commands = this.getAvailableCommands();
    const command = commands.find(cmd => cmd.name === commandName);

    if (!command) {
      return null;
    }

    // Find related commands
    const relatedCommands = this.findRelatedCommands(command);

    return {
      ...command,
      syntax: command.usage,
      relatedCommands
    };
  }

  /**
   * Get command by name with enhancements information
   */
  getCommand(commandName) {
    const commands = this.getAvailableCommands();
    const command = commands.find(cmd => cmd.name === commandName);

    if (!command) {
      return undefined;
    }

    // Add enhancements information for ship command
    if (commandName === 'ship') {
      return {
        ...command,
        enhancements: {
          commitTemplates: true,
          rollbackSupport: true,
          advancedGitWorkflow: true
        }
      };
    }

    return command;
  }

  /**
   * Find commands related to the given command
   */
  findRelatedCommands(command) {
    const commands = this.getAvailableCommands();
    const related = [];

    // Same category commands
    const sameCategory = commands.filter(cmd => 
      cmd.category === command.category && cmd.name !== command.name
    );

    // Workflow-based relationships
    const workflows = {
      'dev': ['check', 'ship'],
      'debug': ['check', 'ship'],
      'refactor': ['check', 'ship'],
      'check': ['ship'],
      'plan': ['dev']
    };

    const workflowRelated = workflows[command.name] || [];
    
    for (const relatedName of workflowRelated) {
      const relatedCommand = commands.find(cmd => cmd.name === relatedName);
      if (relatedCommand) {
        related.push(relatedCommand.name);
      }
    }

    // Combine and deduplicate
    const allRelated = [...sameCategory.map(cmd => cmd.name), ...related];
    return [...new Set(allRelated)].slice(0, 4);
  }

  /**
   * Generate workflow guidance for a scenario
   */
  generateWorkflowGuidance(scenario) {
    const lowerScenario = scenario.toLowerCase();
    let workflow = [];

    if (lowerScenario.includes('new feature') || lowerScenario.includes('implement')) {
      workflow = [
        {
          command: '/plan',
          description: 'Plan the feature implementation',
          rationale: 'Strategic planning prevents rework'
        },
        {
          command: '/dev',
          description: 'Implement with TDD approach',
          rationale: 'Test-driven development ensures quality'
        },
        {
          command: '/check',
          description: 'Verify code quality',
          rationale: 'Catch issues before shipping'
        },
        {
          command: '/ship',
          description: 'Commit and document changes',
          rationale: 'Complete the development cycle'
        }
      ];
    } else if (lowerScenario.includes('bug') || lowerScenario.includes('fix')) {
      workflow = [
        {
          command: '/debug',
          description: 'Systematic bug investigation',
          rationale: 'Find root cause before fixing'
        },
        {
          command: '/check',
          description: 'Verify the fix works',
          rationale: 'Ensure no regressions introduced'
        },
        {
          command: '/ship',
          description: 'Commit the bug fix',
          rationale: 'Document the resolution'
        }
      ];
    } else if (lowerScenario.includes('refactor') || lowerScenario.includes('improve')) {
      workflow = [
        {
          command: '/refactor',
          description: 'Systematic code improvement',
          rationale: 'Safe refactoring with test coverage'
        },
        {
          command: '/check',
          description: 'Verify improvements',
          rationale: 'Ensure quality improvements achieved'
        },
        {
          command: '/ship',
          description: 'Commit improvements',
          rationale: 'Document architectural changes'
        }
      ];
    } else {
      // General workflow
      workflow = [
        {
          command: '/help',
          description: 'Get context-specific help',
          rationale: 'Understand available options'
        },
        {
          command: '/plan',
          description: 'Plan your approach',
          rationale: 'Clear direction improves outcomes'
        }
      ];
    }

    return {
      scenario,
      recommendedWorkflow: workflow.map(step => step.command).join(' → '),
      steps: workflow,
      alternativeApproaches: this.generateAlternatives(workflow)
    };
  }

  /**
   * Generate alternative approaches
   */
  generateAlternatives(primaryWorkflow) {
    const alternatives = [];

    if (primaryWorkflow.some(step => step.command === '/dev')) {
      alternatives.push({
        name: 'Quick Implementation',
        workflow: ['/dev', '/ship'],
        description: 'For simple changes that don\'t require extensive planning'
      });
    }

    if (primaryWorkflow.some(step => step.command === '/debug')) {
      alternatives.push({
        name: 'Quick Fix',
        workflow: ['/refactor', '/check'],
        description: 'If the issue is a known code smell rather than a bug'
      });
    }

    return alternatives;
  }

  /**
   * Record discovery usage for analytics
   */
  recordDiscoveryUsage(usageData) {
    this.usageData.push({
      ...usageData,
      timestamp: usageData.timestamp || new Date()
    });

    // Update patterns
    if (usageData.searchQuery) {
      this.discoveryPatterns.popularSearches.push(usageData.searchQuery);
    }

    if (usageData.selectedCommand && usageData.wasHelpful) {
      this.discoveryPatterns.effectiveCommands.push(usageData.selectedCommand);
    }

    if (usageData.userType) {
      if (!this.discoveryPatterns.userPreferences[usageData.userType]) {
        this.discoveryPatterns.userPreferences[usageData.userType] = [];
      }
      if (usageData.selectedCommand) {
        this.discoveryPatterns.userPreferences[usageData.userType].push(usageData.selectedCommand);
      }
    }
  }

  /**
   * Get discovery patterns for improvement
   */
  getDiscoveryPatterns() {
    return {
      popularSearches: [...new Set(this.discoveryPatterns.popularSearches)],
      effectiveCommands: [...new Set(this.discoveryPatterns.effectiveCommands)],
      userPreferences: this.discoveryPatterns.userPreferences
    };
  }

  /**
   * Generate explore command output
   */
  generateExploreOutput() {
    const categories = this.getCommandCategories();
    
    return `
Command Discovery

Interactive command exploration to help you find the right tool for your task.

Categories:
• development  - Build, debug, and develop features  
• quality      - Code quality and validation
• completion   - Finalize and ship your work
• system       - Help, configuration, and utilities

Usage:
• /explore category development    - Browse development commands
• /explore search "fix bug"        - Search by intent or keyword  
• /explore suggest                 - Get suggestions for current context
• /explore workflow "new feature"  - Get step-by-step guidance

Quick Commands:
${Object.entries(categories).map(([cat, commands]) => 
  `• ${cat}: ${commands.slice(0, 3).map(cmd => `/${cmd}`).join(', ')}`
).join('\n')}

Try: /explore category development
`;
  }

  /**
   * Generate category-specific output
   */
  generateCategoryOutput(category) {
    const exploration = this.exploreByCategory(category);
    
    let output = `\n${category.charAt(0).toUpperCase() + category.slice(1)} Commands\n\n`;
    output += `${exploration.description}\n\n`;

    for (const command of exploration.commands) {
      output += `/${command.name}\n`;
      output += `   ${command.description}\n`;
      output += `   Usage: ${command.usage}\n`;
      
      if (command.examples.length > 0) {
        output += `   Examples:\n`;
        command.examples.slice(0, 2).forEach(example => {
          output += `     ${example}\n`;
        });
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Format search results
   */
  formatSearchResults(query, results) {
    if (results.length === 0) {
      return `\nNo commands found for "${query}"\n\nTry: /explore category development\n`;
    }

    let output = `\nSearch Results for "${query}"\n\n`;
    output += `Found ${results.length} commands:\n\n`;

    for (const result of results.slice(0, 5)) {
      output += `/${result.name}\n`;
      output += `   ${result.description}\n`;
      output += `   Relevance: ${Math.round(result.relevanceScore)}%\n`;
      
      if (result.examples.length > 0) {
        output += `   Example: ${result.examples[0]}\n`;
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Format command suggestions
   */
  formatSuggestions(suggestions) {
    if (suggestions.length === 0) {
      return '\nNo specific suggestions available. Try /explore category development\n';
    }

    let output = '\nRecommended Commands\n\n';
    output += 'Based on your current task:\n\n';

    for (const suggestion of suggestions.slice(0, 3)) {
      output += `${suggestion.command}\n`;
      output += `   ${suggestion.reason}\n`;
      output += `   Confidence: ${Math.round(suggestion.confidence * 100)}%\n\n`;
    }

    return output;
  }

  /**
   * Get discovery analytics
   */
  getDiscoveryAnalytics() {
    return {
      totalUsage: this.usageData.length,
      popularCategories: this.calculatePopularCategories(),
      searchPatterns: this.discoveryPatterns.popularSearches,
      effectiveCommands: this.discoveryPatterns.effectiveCommands
    };
  }

  /**
   * Calculate popular categories from usage data
   */
  calculatePopularCategories() {
    const categories = {};
    for (const usage of this.usageData) {
      if (usage.category) {
        categories[usage.category] = (categories[usage.category] || 0) + 1;
      }
    }
    return categories;
  }

  /**
   * Get usage data formatted for UX research
   */
  getUsageDataForResearch() {
    return {
      discoveryPatterns: this.getDiscoveryPatterns(),
      commandPreferences: this.calculateCommandPreferences(),
      searchEffectiveness: this.calculateSearchEffectiveness()
    };
  }

  /**
   * Calculate command preferences
   */
  calculateCommandPreferences() {
    const preferences = {};
    for (const usage of this.usageData) {
      if (usage.selectedCommand) {
        preferences[usage.selectedCommand] = (preferences[usage.selectedCommand] || 0) + 1;
      }
    }
    return preferences;
  }

  /**
   * Calculate search effectiveness
   */
  calculateSearchEffectiveness() {
    const searches = this.usageData.filter(u => u.action === 'search');
    if (searches.length === 0) return { effectiveness: 0, totalSearches: 0 };

    const successful = searches.filter(s => s.wasHelpful).length;
    return {
      effectiveness: successful / searches.length,
      totalSearches: searches.length,
      successfulSearches: successful
    };
  }

  /**
   * Invalidate cache (for testing and updates)
   */
  invalidateCache() {
    this.cache.clear();
  }
}

module.exports = CommandDiscovery;