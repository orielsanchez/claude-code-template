/**
 * TDD Tests for Phase 2: Command Discovery System
 * 
 * Addresses Phase 1 finding: "Difficult to discover available commands without trial and error"
 * Target: Experienced developers who want efficient command discovery
 * Impact Score: 21/100 (medium priority)
 */

const fs = require('fs');
const path = require('path');

// Import the module we're going to implement
const CommandDiscovery = require('../lib/command-discovery/discovery-engine');

describe('Phase 2: Command Discovery System', () => {
  let discovery;

  beforeEach(() => {
    discovery = new CommandDiscovery({
      commandsPath: path.join(__dirname, '../.claude/commands')
    });
  });

  describe('CommandDiscovery Engine', () => {
    test('should load and parse all available commands', () => {
      const commands = discovery.getAvailableCommands();

      expect(commands).toBeInstanceOf(Array);
      expect(commands.length).toBeGreaterThan(5); // We know there are 9+ commands
      
      const checkCommand = commands.find(cmd => cmd.name === 'check');
      expect(checkCommand).toBeDefined();
      expect(checkCommand).toHaveProperty('name', 'check');
      expect(checkCommand).toHaveProperty('description');
      expect(checkCommand).toHaveProperty('category');
      expect(checkCommand).toHaveProperty('usage');
    });

    test('should categorize commands by purpose and workflow', () => {
      const categories = discovery.getCommandCategories();

      expect(categories).toHaveProperty('development');
      expect(categories).toHaveProperty('quality');
      expect(categories).toHaveProperty('completion');
      expect(categories).toHaveProperty('system');

      expect(categories.development).toContain('dev');
      expect(categories.development).toContain('debug');
      expect(categories.quality).toContain('check');
      expect(categories.completion).toContain('ship');
    });

    test('should provide interactive command exploration by category', () => {
      const explorationResult = discovery.exploreByCategory('development');

      expect(explorationResult).toHaveProperty('category', 'development');
      expect(explorationResult).toHaveProperty('commands');
      expect(explorationResult).toHaveProperty('description');
      expect(explorationResult.commands).toBeInstanceOf(Array);
      expect(explorationResult.commands.length).toBeGreaterThan(0);

      const command = explorationResult.commands[0];
      expect(command).toHaveProperty('name');
      expect(command).toHaveProperty('description');
      expect(command).toHaveProperty('examples');
    });

    test('should suggest commands based on workflow context', () => {
      const workflowContext = {
        currentTask: 'implementing new feature',
        recentCommands: ['/plan'],
        projectType: 'web_app',
        userType: 'experienced'
      };

      const suggestions = discovery.suggestCommands(workflowContext);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('command');
      expect(suggestions[0]).toHaveProperty('reason');
      expect(suggestions[0]).toHaveProperty('confidence');

      // Should suggest TDD/dev commands for new feature implementation
      const hasDevSuggestion = suggestions.some(s => 
        s.command.includes('dev') || s.command.includes('tdd')
      );
      expect(hasDevSuggestion).toBe(true);
    });

    test('should provide command search by intent or keyword', () => {
      const searchResults = discovery.searchCommands('fix bug');

      expect(searchResults).toBeInstanceOf(Array);
      expect(searchResults.length).toBeGreaterThan(0);

      const debugCommand = searchResults.find(cmd => cmd.name === 'debug');
      expect(debugCommand).toBeDefined();
      expect(debugCommand).toHaveProperty('relevanceScore');
      expect(debugCommand.relevanceScore).toBeGreaterThan(0);
    });

    test('should show detailed command information with examples', () => {
      const commandDetails = discovery.getCommandDetails('dev');

      expect(commandDetails).toHaveProperty('name', 'dev');
      expect(commandDetails).toHaveProperty('description');
      expect(commandDetails).toHaveProperty('syntax');
      expect(commandDetails).toHaveProperty('examples');
      expect(commandDetails).toHaveProperty('relatedCommands');
      expect(commandDetails).toHaveProperty('category');

      expect(commandDetails.examples).toBeInstanceOf(Array);
      expect(commandDetails.examples.length).toBeGreaterThan(0);
      expect(commandDetails.relatedCommands).toBeInstanceOf(Array);
    });

    test('should generate interactive workflow guidance', () => {
      const scenario = 'I want to implement a new feature with tests';
      const guidance = discovery.generateWorkflowGuidance(scenario);

      expect(guidance).toHaveProperty('scenario');
      expect(guidance).toHaveProperty('recommendedWorkflow');
      expect(guidance).toHaveProperty('steps');
      expect(guidance).toHaveProperty('alternativeApproaches');

      expect(guidance.steps).toBeInstanceOf(Array);
      expect(guidance.steps.length).toBeGreaterThan(2);
      
      const firstStep = guidance.steps[0];
      expect(firstStep).toHaveProperty('command');
      expect(firstStep).toHaveProperty('description');
      expect(firstStep).toHaveProperty('rationale');
    });

    test('should track discovery patterns and improve suggestions', () => {
      // Simulate user discovery patterns
      discovery.recordDiscoveryUsage({
        searchQuery: 'debug issue',
        selectedCommand: 'debug',
        wasHelpful: true,
        userType: 'experienced'
      });

      discovery.recordDiscoveryUsage({
        category: 'development',
        selectedCommand: 'dev',
        wasHelpful: true,
        userType: 'experienced'
      });

      const patterns = discovery.getDiscoveryPatterns();

      expect(patterns).toHaveProperty('popularSearches');
      expect(patterns).toHaveProperty('effectiveCommands');
      expect(patterns).toHaveProperty('userPreferences');
      
      expect(patterns.popularSearches).toContain('debug issue');
      expect(patterns.effectiveCommands).toContain('debug');
    });
  });

  describe('Interactive CLI Interface', () => {
    test('should provide formatted output for /explore command', () => {
      const output = discovery.generateExploreOutput();

      expect(output).toContain('Command Discovery');
      expect(output).toContain('Categories:');
      expect(output).toContain('development');
      expect(output).toContain('quality');
      expect(output).toContain('Usage:');

      // Should include interactive prompts
      expect(output).toContain('explore category');
      expect(output).toContain('explore search');
    });

    test('should generate category-specific exploration output', () => {
      const output = discovery.generateCategoryOutput('development');

      expect(output).toContain('Development Commands');
      expect(output).toContain('/dev');
      expect(output).toContain('/debug');
      expect(output).toContain('Examples:');

      // Should show usage examples from actual command files
      expect(output).toContain('/dev user registration endpoint');
    });

    test('should provide search results formatting', () => {
      const searchResults = discovery.searchCommands('testing');
      const output = discovery.formatSearchResults('testing', searchResults);

      expect(output).toContain('Search Results for "testing"');
      expect(output).toContain('Found');
      expect(output).toContain('commands');
      
      if (searchResults.length > 0) {
        expect(output).toContain(searchResults[0].name);
      }
    });

    test('should show workflow suggestions in readable format', () => {
      const suggestions = discovery.suggestCommands({
        currentTask: 'bug fixing',
        userType: 'experienced'
      });
      
      const output = discovery.formatSuggestions(suggestions);

      expect(output).toContain('Recommended Commands');
      expect(output).toContain('Based on your current task');
      
      if (suggestions.length > 0) {
        expect(output).toContain(suggestions[0].command);
        expect(output).toContain(suggestions[0].reason);
      }
    });
  });

  describe('Command Integration', () => {
    test('should integrate with existing command system', () => {
      // Test that discovery can read actual command files
      const commandsPath = path.join(__dirname, '../.claude/commands');
      const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.md'));
      
      expect(files.length).toBeGreaterThan(5);
      
      const commands = discovery.getAvailableCommands();
      expect(commands.length).toBe(files.length - 1); // -1 for README.md
    });

    test('should parse command metadata from existing files', () => {
      const commands = discovery.getAvailableCommands();
      const checkCommand = commands.find(cmd => cmd.name === 'check');

      expect(checkCommand).toBeDefined();
      expect(checkCommand.description.toLowerCase()).toContain('quality');
      expect(checkCommand.category).toBe('quality');
    });

    test('should handle command file parsing errors gracefully', () => {
      // Test with invalid commands path
      const invalidDiscovery = new CommandDiscovery({
        commandsPath: '/invalid/path'
      });

      expect(() => {
        invalidDiscovery.getAvailableCommands();
      }).not.toThrow();

      const commands = invalidDiscovery.getAvailableCommands();
      expect(commands).toEqual([]);
    });
  });

  describe('Performance and Caching', () => {
    test('should cache command parsing for performance', () => {
      // Clear cache first to ensure fresh start
      discovery.invalidateCache();
      
      const start1 = performance.now();
      const commands1 = discovery.getAvailableCommands();
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      const commands2 = discovery.getAvailableCommands();
      const time2 = performance.now() - start2;

      expect(commands1).toEqual(commands2);
      expect(time2).toBeLessThan(time1 + 0.1); // Allow small tolerance for timing variations
    });

    test('should invalidate cache when commands are modified', () => {
      const initialCommands = discovery.getAvailableCommands();
      
      // Simulate cache invalidation
      discovery.invalidateCache();
      const refreshedCommands = discovery.getAvailableCommands();

      expect(refreshedCommands).toEqual(initialCommands);
    });
  });

  describe('Analytics Integration', () => {
    test('should track command discovery usage for analytics', () => {
      discovery.recordDiscoveryUsage({
        action: 'explore_category',
        category: 'development',
        timestamp: new Date(),
        userType: 'experienced'
      });

      discovery.recordDiscoveryUsage({
        action: 'search',
        query: 'debug',
        resultsCount: 2,
        selectedCommand: 'debug',
        timestamp: new Date()
      });

      const analytics = discovery.getDiscoveryAnalytics();

      expect(analytics).toHaveProperty('totalUsage');
      expect(analytics).toHaveProperty('popularCategories');
      expect(analytics).toHaveProperty('searchPatterns');
      expect(analytics.totalUsage).toBe(2);
    });

    test('should integrate with Phase 1 UX research tracking', () => {
      // This should integrate with existing UXResearchCollector
      const usageData = discovery.getUsageDataForResearch();

      expect(usageData).toHaveProperty('discoveryPatterns');
      expect(usageData).toHaveProperty('commandPreferences');
      expect(usageData).toHaveProperty('searchEffectiveness');
    });
  });
});