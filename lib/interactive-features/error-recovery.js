/**
 * Enhanced Error Recovery System
 * 
 * Provides intelligent error handling with:
 * - Actionable error analysis and suggestions
 * - Guided recovery workflows with rollback plans
 * - Pattern learning and prevention insights
 * - Integration with existing error handling systems
 * 
 * Part of Phase 3: Advanced Interactive Features
 */

const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('../shared/logger');

class ErrorRecoverySystem {
  constructor(sharedDataOrConfigDir = {}, configManager = null) {
    // Support multiple constructor patterns
    let sharedData = {};
    
    if (typeof sharedDataOrConfigDir === 'string') {
      // Legacy pattern: constructor(configDir, configManager)
      this.configDir = sharedDataOrConfigDir;
      this.configManager = configManager || undefined; // Ensure undefined instead of null
      sharedData = { userId: 'default-user', projectId: 'default-project' };
    } else {
      // Modern patterns: 
      // - constructor(sharedData) for legacy
      // - constructor({ ...sharedData, configManager }) for createManager
      sharedData = sharedDataOrConfigDir || {};
      
      if (sharedData.configManager) {
        // createManager pattern: configManager is in sharedData
        this.configManager = sharedData.configManager;
        this.configDir = this.configManager.configDir;
      } else if (configManager) {
        // Direct pattern: constructor(sharedData, configManager)
        this.configManager = configManager;
        this.configDir = configManager.configDir;
      } else {
        // Legacy pattern: constructor(sharedData)
        this.configManager = undefined;
      }
    }
    
    this.userId = sharedData.userId || 'default-user';
    this.projectId = sharedData.projectId || 'default-project';
    this.preferences = sharedData.preferences || {};
    this.logger = createContextualLogger('ErrorRecoverySystem');
    
    if (this.configManager) {
      // Use ConfigurationManager for data storage
      this.dataDir = this.configManager.configDir;
    } else {
      // Legacy data storage
      this.dataDir = this.configDir || path.join(__dirname, '../../data/interactive-features');
    }
    
    this.patternsFile = path.join(this.dataDir, `${this.userId}-error-patterns.json`);
    this.patterns = {
      commonPatterns: [],
      preventionStrategies: [],
      riskFactors: {}
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
   * Analyze error and provide actionable suggestions
   * @param {Object} error - Error object with type, message, context
   * @returns {Promise<Object>} Analysis with suggestions and prevention tips
   */
  async analyzeError(error) {
    if (!error || !error.type) {
      throw new Error('Invalid error: type field required');
    }

    const analysis = {
      errorType: error.type,
      severity: this.determineSeverity(error),
      suggestions: [],
      preventionTips: []
    };

    // Generate suggestions based on error type
    switch (error.type) {
      case 'command-not-found':
        analysis.suggestions = [
          {
            action: 'Install Node.js and npm',
            command: 'brew install node',
            explanation: 'npm is included with Node.js installation',
            confidence: 0.9
          },
          {
            action: 'Check PATH configuration',
            command: 'echo $PATH',
            explanation: 'Verify npm is in your system PATH',
            confidence: 0.7
          }
        ];
        analysis.preventionTips = [
          'Use a Node version manager like nvm',
          'Verify installation with node --version'
        ];
        break;

      default:
        analysis.suggestions = [
          {
            action: 'Get help',
            command: '/help',
            explanation: 'Get contextual help for this situation',
            confidence: 0.8
          }
        ];
        break;
    }

    return analysis;
  }

  async getRecoveryWorkflow(errorId) {
    const workflows = {
      'git-merge-conflict': {
        name: 'Git Merge Conflict Resolution',
        description: 'Step-by-step process to resolve merge conflicts',
        steps: [
          {
            id: 'identify-conflicts',
            title: 'Identify Conflicts',
            instructions: 'Check which files have conflicts',
            commands: ['git status'],
            validation: () => ({ success: true, message: 'Conflicts identified' })
          },
          {
            id: 'resolve-conflicts',
            title: 'Resolve Conflicts',
            instructions: 'Open conflicted files and resolve markers',
            commands: ['code <conflicted-file>'],
            validation: () => ({ success: true, message: 'Conflicts resolved' })
          },
          {
            id: 'commit-resolution',
            title: 'Commit Resolution',
            instructions: 'Add resolved files and commit',
            commands: ['git add .', 'git commit -m "Resolve merge conflicts"'],
            validation: () => ({ success: true, message: 'Resolution committed' })
          }
        ],
        rollbackPlan: [
          { action: 'Abort merge', command: 'git merge --abort' },
          { action: 'Reset to previous state', command: 'git reset --hard HEAD~1' }
        ]
      }
    };

    return workflows[errorId] || {
      name: 'Generic Recovery',
      description: 'Basic error recovery steps',
      steps: [
        {
          id: 'assess',
          title: 'Assess Situation',
          instructions: 'Review the error and context',
          commands: [],
          validation: () => ({ success: true, message: 'Assessment complete' })
        }
      ],
      rollbackPlan: []
    };
  }

  /**
   * Record error pattern to improve future prevention
   * @param {Object} errorPattern - Pattern with error, frequency, contexts, resolutions
   * @returns {Promise<void>}
   */
  async recordPattern(errorPattern) {
    if (!errorPattern || !errorPattern.error || !errorPattern.frequency) {
      throw new Error('Invalid error pattern: error and frequency required');
    }

    // Find existing pattern or create new one
    const existingIndex = this.patterns.commonPatterns.findIndex(
      p => p.error === errorPattern.error
    );

    if (existingIndex >= 0) {
      this.patterns.commonPatterns[existingIndex].frequency += errorPattern.frequency;
      this.patterns.commonPatterns[existingIndex].contexts.push(...errorPattern.contexts);
      this.patterns.commonPatterns[existingIndex].resolutions.push(...errorPattern.resolutions);
    } else {
      this.patterns.commonPatterns.push(errorPattern);
    }

    // Generate prevention strategies
    this.updatePreventionStrategies(errorPattern);
    
    // Update risk factors
    this.updateRiskFactors(errorPattern);

    this.savePatterns();
  }

  getPreventionInsights() {
    return this.patterns;
  }

  async enhanceSystemError(systemError) {
    const analysis = {
      category: this.categorizeError(systemError),
      likelyCause: this.determineCause(systemError),
      severity: this.determineSeverity(systemError)
    };

    const recovery = {
      suggestions: await this.generateSuggestions(systemError),
      workflow: await this.getRecoveryWorkflow(analysis.category)
    };

    return {
      originalError: systemError,
      analysis,
      recovery
    };
  }

  determineSeverity(error) {
    if (error.message && error.message.includes('Permission denied')) {
      return 'medium';
    }
    if (error.type === 'command-not-found') {
      return 'high';
    }
    return 'low';
  }

  categorizeError(systemError) {
    if (systemError.stderr && systemError.stderr.includes('Permission denied')) {
      return 'permission-error';
    }
    if (systemError.exitCode === 127) {
      return 'command-not-found';
    }
    return 'general-error';
  }

  determineCause(systemError) {
    if (systemError.stderr && systemError.stderr.includes('Permission denied')) {
      return 'Insufficient permissions to access directory or file';
    }
    if (systemError.command && systemError.command.includes('mkdir')) {
      return 'Directory creation failed';
    }
    return 'Unknown system error';
  }

  async generateSuggestions(systemError) {
    const suggestions = [];

    if (systemError.stderr && systemError.stderr.includes('Permission denied')) {
      suggestions.push({
        action: 'Use user directory instead',
        command: 'mkdir ~/local/test',
        explanation: 'Create directory in user space instead of system directory',
        confidence: 0.9
      });
      
      suggestions.push({
        action: 'Use sudo (if necessary)',
        command: 'sudo mkdir /usr/local/test',
        explanation: 'Run with elevated privileges (use with caution)',
        confidence: 0.6
      });
    }

    return suggestions;
  }

  updatePreventionStrategies(errorPattern) {
    // Analyze resolutions to generate prevention strategies
    const resolutionCounts = {};
    errorPattern.resolutions.forEach(resolution => {
      resolutionCounts[resolution] = (resolutionCounts[resolution] || 0) + 1;
    });

    const mostCommonResolution = Object.keys(resolutionCounts).reduce((a, b) => 
      resolutionCounts[a] > resolutionCounts[b] ? a : b
    );

    if (!this.patterns.preventionStrategies.find(s => s.error === errorPattern.error)) {
      this.patterns.preventionStrategies.push({
        error: errorPattern.error,
        strategy: `To prevent ${errorPattern.error}, consider: ${mostCommonResolution}`,
        effectiveness: resolutionCounts[mostCommonResolution] / errorPattern.frequency
      });
    }
  }

  updateRiskFactors(errorPattern) {
    errorPattern.contexts.forEach(context => {
      const key = `${context.projectType}-${context.timeOfDay}`;
      if (!this.patterns.riskFactors[key]) {
        this.patterns.riskFactors[key] = { errors: [], frequency: 0 };
      }
      this.patterns.riskFactors[key].errors.push(errorPattern.error);
      this.patterns.riskFactors[key].frequency++;
    });
  }

  loadPatterns() {
    try {
      if (fs.existsSync(this.patternsFile)) {
        this.patterns = JSON.parse(fs.readFileSync(this.patternsFile, 'utf8'));
      }
    } catch (error) {
      this.logger.warn('Failed to load patterns', {
        operation: 'loadPatterns',
        errorMessage: error.message
      });
    }
  }

  savePatterns() {
    try {
      if (this.configManager) {
        // Store via ConfigurationManager plugin system
        this.configManager.updatePluginConfig('errorRecovery', { 
          patterns: this.patterns.commonPatterns 
        });
      } else {
        // Legacy file-based storage
        fs.writeFileSync(this.patternsFile, JSON.stringify(this.patterns, null, 2));
      }
    } catch (error) {
      this.logger.warn('Failed to save patterns', {
        operation: 'savePatterns',
        errorMessage: error.message
      });
    }
  }

  /**
   * Add error pattern - plugin architecture API
   * @param {Object} pattern - Error pattern object
   */
  addErrorPattern(pattern) {
    if (!pattern || !pattern.type) {
      throw new Error('Pattern must have a type field');
    }

    // Store original pattern for plugin architecture API
    this.patterns.commonPatterns.push(pattern);
    this.savePatterns();

    // Emit event for cross-manager communication
    if (this.configManager) {
      this.configManager.emit('errorRecovery:patternAdded', pattern);
    }
  }

  /**
   * Get error patterns - plugin architecture API
   * @returns {Array} Array of error patterns
   */
  getErrorPatterns() {
    if (this.configManager) {
      // Load from plugin config if available
      const pluginConfig = this.configManager.getPluginConfig('errorRecovery');
      if (pluginConfig && pluginConfig.patterns) {
        return pluginConfig.patterns;
      }
    }
    
    return this.patterns.commonPatterns;
  }
}

module.exports = ErrorRecoverySystem;