/**
 * Smart Command Suggestion Engine
 * 
 * Provides context-aware command recommendations with:
 * - User behavior learning and pattern recognition
 * - Integration with command discovery system
 * - Workflow suggestion for common scenarios
 * - Contextual relevance scoring
 * 
 * Part of Phase 3: Advanced Interactive Features
 */

const fs = require('fs');
const path = require('path');

class SmartAssistant {
  constructor(sharedData = {}) {
    this.userId = sharedData.userId || 'default-user';
    this.projectId = sharedData.projectId || 'default-project';
    this.preferences = sharedData.preferences || {};
    this.dataDir = path.join(__dirname, '../../data/interactive-features');
    this.usageFile = path.join(this.dataDir, `${this.userId}-usage-patterns.json`);
    this.patterns = {
      commandFrequency: {},
      contextualPreferences: {},
      successPatterns: []
    };
    this.ensureDataDir();
    this.loadPatterns();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getUserId() {
    return this.userId;
  }

  /**
   * Get contextual command suggestions based on user environment and patterns
   * @param {Object} context - User context with projectType, recentCommands, etc.
   * @returns {Promise<Array>} Sorted array of suggestions with relevance scores
   */
  async getSuggestions(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context: object required');
    }

    const suggestions = [];

    // Base suggestions for development context
    if (context.projectType === 'nodejs') {
      suggestions.push({
        command: '/dev',
        relevanceScore: 0.9,
        reason: 'Primary development command for Node.js projects',
        category: 'development'
      });

      suggestions.push({
        command: '/test',
        relevanceScore: 0.8,
        reason: 'Run tests for Node.js project',
        category: 'testing'
      });
    }

    // Context-based suggestions
    if (context.recentCommands && context.recentCommands.includes('/dev')) {
      suggestions.push({
        command: '/check',
        relevanceScore: 0.85,
        reason: 'Quality check after development work',
        category: 'quality'
      });
    }

    if (context.timeOfDay === 'morning') {
      suggestions.push({
        command: '/debug',
        relevanceScore: 0.7,
        reason: 'Morning debugging session',
        category: 'debugging'
      });
    }

    // Sort by relevance score
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return suggestions;
  }

  /**
   * Record command usage to improve future suggestions
   * @param {Object} usage - Usage data with command, context, timestamp, outcome
   * @returns {Promise<void>}
   */
  async recordUsage(usage) {
    if (!usage || !usage.command || !usage.context) {
      throw new Error('Invalid usage data: command and context required');
    }

    // Update command frequency
    if (!this.patterns.commandFrequency[usage.command]) {
      this.patterns.commandFrequency[usage.command] = 0;
    }
    this.patterns.commandFrequency[usage.command]++;

    // Record contextual preferences
    const contextKey = `${usage.context.projectType}-${usage.context.timeOfDay}`;
    if (!this.patterns.contextualPreferences[contextKey]) {
      this.patterns.contextualPreferences[contextKey] = [];
    }
    this.patterns.contextualPreferences[contextKey].push(usage.command);

    // Record success patterns
    if (usage.outcome === 'successful') {
      this.patterns.successPatterns.push({
        command: usage.command,
        context: usage.context,
        timestamp: usage.timestamp
      });
    }

    this.savePatterns();
  }

  getLearnedPatterns() {
    return this.patterns;
  }

  async integrateWithDiscovery(discoveryData) {
    const primarySuggestions = [];
    const discoverySuggestions = [];

    // Generate suggestions based on available commands
    for (const command of discoveryData.availableCommands) {
      const frequency = this.patterns.commandFrequency[command] || 0;
      primarySuggestions.push({
        command,
        relevanceScore: frequency * 0.1 + 0.5,
        source: 'usage-patterns'
      });
    }

    // Generate discovery-based suggestions
    for (const search of discoveryData.recentSearches) {
      discoverySuggestions.push({
        query: search,
        relevanceScore: 0.6,
        source: 'discovery-history'
      });
    }

    const combinedRelevance = (primarySuggestions.length + discoverySuggestions.length) / 
                             discoveryData.availableCommands.length;

    return {
      primarySuggestions,
      discoverySuggestions,
      combinedRelevance
    };
  }

  async suggestWorkflow(scenario) {
    const workflows = {
      'new-feature': {
        name: 'New Feature Development',
        description: 'Complete workflow for developing a new feature',
        steps: [
          {
            command: '/dev <feature>',
            description: 'Start TDD development of the feature',
            optional: false
          },
          {
            command: '/check',
            description: 'Run quality checks',
            optional: false
          },
          {
            command: '/ship',
            description: 'Prepare and commit changes',
            optional: true
          }
        ],
        estimatedDuration: '30-60 minutes'
      }
    };

    return workflows[scenario.type] || {
      name: 'Generic Workflow',
      description: 'Basic development workflow',
      steps: [
        {
          command: '/dev',
          description: 'Start development',
          optional: false
        }
      ],
      estimatedDuration: '15-30 minutes'
    };
  }

  loadPatterns() {
    try {
      if (fs.existsSync(this.usageFile)) {
        this.patterns = JSON.parse(fs.readFileSync(this.usageFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Failed to load patterns:', error.message);
    }
  }

  savePatterns() {
    try {
      fs.writeFileSync(this.usageFile, JSON.stringify(this.patterns, null, 2));
    } catch (error) {
      console.warn('Failed to save patterns:', error.message);
    }
  }
}

module.exports = SmartAssistant;