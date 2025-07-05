/**
 * TDD Tests for Phase 3: Advanced Interactive Features
 * 
 * These tests define the behavior for:
 * - Interactive Setup Wizard with environment detection
 * - Smart Command Suggestion Engine with context awareness
 * - Layered Help System with progressive disclosure
 * - Enhanced Error Recovery with actionable guidance
 */

const fs = require('fs');
const path = require('path');

// Import the modules we're going to implement
const InteractiveSetupWizard = require('../lib/interactive-features/setup-wizard');
const SmartAssistant = require('../lib/interactive-features/smart-assistant');
const LayeredHelpSystem = require('../lib/interactive-features/help-system');
const ErrorRecoverySystem = require('../lib/interactive-features/error-recovery');

describe('Phase 3: Advanced Interactive Features', () => {
  
  beforeEach(() => {
    // Clean up any test data files
    const testDataDir = path.join(__dirname, '../data/interactive-features');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('InteractiveSetupWizard', () => {
    let wizard;

    beforeEach(() => {
      wizard = new InteractiveSetupWizard();
    });

    test('should detect development environment and suggest optimizations', async () => {
      // Mock environment detection
      const mockProjectPath = '/test/project';
      const mockFiles = ['package.json', '.git', 'src/'];
      
      const analysis = await wizard.analyzeEnvironment(mockProjectPath, mockFiles);
      
      expect(analysis).toMatchObject({
        projectType: 'nodejs',
        detectedFeatures: expect.arrayContaining(['git', 'npm']),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: 'optimization',
            title: expect.any(String),
            description: expect.any(String),
            priority: expect.stringMatching(/^(high|medium|low)$/)
          })
        ])
      });
    });

    test('should guide user through complex Git configuration setup', async () => {
      const gitConfig = {
        hasGit: false,
        needsRemote: true,
        branchStrategy: 'gitflow'
      };

      const steps = await wizard.generateGitSetupSteps(gitConfig);
      
      expect(steps).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'git-init',
          title: 'Initialize Git Repository',
          commands: expect.arrayContaining(['git init']),
          validation: expect.any(Function)
        }),
        expect.objectContaining({
          id: 'git-remote',
          title: 'Configure Remote Repository',
          commands: expect.any(Array),
          validation: expect.any(Function)
        })
      ]));
    });

    test('should validate each setup step before proceeding', async () => {
      const step = {
        id: 'test-step',
        title: 'Test Step',
        commands: ['echo "test"'],
        validation: () => ({ success: true, message: 'Step completed' })
      };

      const result = await wizard.executeStep(step);
      
      expect(result).toMatchObject({
        stepId: 'test-step',
        success: true,
        output: expect.any(String),
        validationResult: expect.objectContaining({
          success: true,
          message: 'Step completed'
        })
      });
    });

    test('should track setup progress and allow resuming', async () => {
      const steps = [
        { id: 'step1', title: 'Step 1', commands: ['echo "1"'] },
        { id: 'step2', title: 'Step 2', commands: ['echo "2"'] },
        { id: 'step3', title: 'Step 3', commands: ['echo "3"'] }
      ];

      wizard.initializeProgress(steps);
      await wizard.completeStep('step1');
      
      const progress = wizard.getProgress();
      expect(progress).toMatchObject({
        totalSteps: 3,
        completedSteps: 1,
        currentStep: 'step2',
        percentage: 33
      });

      // Test resuming from saved progress
      const newWizard = new InteractiveSetupWizard();
      const resumedProgress = await newWizard.resumeProgress();
      expect(resumedProgress.currentStep).toBe('step2');
    });
  });

  describe('SmartAssistant', () => {
    let assistant;

    beforeEach(() => {
      assistant = new SmartAssistant();
    });

    test('should suggest relevant commands based on user context', async () => {
      const context = {
        currentDirectory: '/project',
        recentCommands: ['/dev', '/check'],
        projectType: 'nodejs',
        lastError: null,
        timeOfDay: 'morning'
      };

      const suggestions = await assistant.getSuggestions(context);
      
      expect(suggestions).toEqual(expect.arrayContaining([
        expect.objectContaining({
          command: expect.any(String),
          relevanceScore: expect.any(Number),
          reason: expect.any(String),
          category: expect.stringMatching(/^(development|testing|debugging|quality)$/)
        })
      ]));

      // Verify suggestions are sorted by relevance
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].relevanceScore).toBeLessThanOrEqual(suggestions[i-1].relevanceScore);
      }
    });

    test('should learn from user patterns and improve suggestions', async () => {
      const usage = {
        command: '/test',
        context: { projectType: 'nodejs', timeOfDay: 'afternoon' },
        timestamp: new Date().toISOString(),
        outcome: 'successful'
      };

      await assistant.recordUsage(usage);
      
      const patterns = assistant.getLearnedPatterns();
      expect(patterns).toMatchObject({
        commandFrequency: expect.objectContaining({
          '/test': expect.any(Number)
        }),
        contextualPreferences: expect.any(Object),
        successPatterns: expect.any(Array)
      });
    });

    test('should integrate with existing command discovery system', async () => {
      const discoveryData = {
        availableCommands: ['/dev', '/debug', '/check', '/ship'],
        userPreferences: { preferredCategories: ['development'] },
        recentSearches: ['testing', 'git']
      };

      const integratedSuggestions = await assistant.integrateWithDiscovery(discoveryData);
      
      expect(integratedSuggestions).toMatchObject({
        primarySuggestions: expect.any(Array),
        discoverySuggestions: expect.any(Array),
        combinedRelevance: expect.any(Number)
      });
    });

    test('should provide workflow suggestions for common scenarios', async () => {
      const scenario = {
        type: 'new-feature',
        projectState: 'clean-working-tree',
        lastCommand: '/dev'
      };

      const workflow = await assistant.suggestWorkflow(scenario);
      
      expect(workflow).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        steps: expect.arrayContaining([
          expect.objectContaining({
            command: expect.any(String),
            description: expect.any(String),
            optional: expect.any(Boolean)
          })
        ]),
        estimatedDuration: expect.any(String)
      });
    });
  });

  describe('LayeredHelpSystem', () => {
    let helpSystem;

    beforeEach(() => {
      helpSystem = new LayeredHelpSystem();
    });

    test('should provide progressive help levels (quick → detailed → tutorial)', async () => {
      const topic = 'git-workflow';
      
      const quickHelp = await helpSystem.getQuickHelp(topic);
      expect(quickHelp).toMatchObject({
        topic: 'git-workflow',
        level: 'quick',
        content: expect.any(String),
        nextLevel: 'detailed',
        estimatedReadTime: expect.stringMatching(/\d+\s*(second|minute)s?/)
      });

      const detailedHelp = await helpSystem.getDetailedHelp(topic);
      expect(detailedHelp).toMatchObject({
        topic: 'git-workflow',
        level: 'detailed',
        content: expect.any(String),
        sections: expect.any(Array),
        nextLevel: 'tutorial',
        estimatedReadTime: expect.stringMatching(/\d+\s*minutes?/)
      });

      const tutorial = await helpSystem.getTutorial(topic);
      expect(tutorial).toMatchObject({
        topic: 'git-workflow',
        level: 'tutorial',
        steps: expect.any(Array),
        interactive: true,
        estimatedDuration: expect.stringMatching(/\d+\s*minutes?/)
      });
    });

    test('should show context-sensitive help based on current state', async () => {
      const context = {
        currentCommand: '/dev',
        projectType: 'nodejs',
        gitStatus: 'clean',
        lastError: null,
        userExperience: 'intermediate'
      };

      const contextHelp = await helpSystem.getContextualHelp(context);
      
      expect(contextHelp).toMatchObject({
        relevantTopics: expect.any(Array),
        quickActions: expect.any(Array),
        suggestedLevel: expect.stringMatching(/^(quick|detailed|tutorial)$/),
        customContent: expect.any(String)
      });
    });

    test('should track help usage and optimize content', async () => {
      const usage = {
        topic: 'testing',
        level: 'detailed',
        timeSpent: 180, // seconds
        helpful: true,
        followedSuggestions: true
      };

      await helpSystem.recordUsage(usage);
      
      const analytics = helpSystem.getUsageAnalytics();
      expect(analytics).toMatchObject({
        popularTopics: expect.any(Array),
        effectiveLevels: expect.any(Object),
        averageTimeSpent: expect.any(Object),
        helpfulnessRatings: expect.any(Object)
      });
    });

    test('should provide interactive tutorial flows with validation', async () => {
      const tutorialId = 'first-feature-development';
      
      const tutorial = await helpSystem.startInteractiveTutorial(tutorialId);
      
      expect(tutorial).toMatchObject({
        id: tutorialId,
        currentStep: 1,
        totalSteps: expect.any(Number),
        step: expect.objectContaining({
          instruction: expect.any(String),
          command: expect.any(String),
          validation: expect.any(Function),
          hints: expect.any(Array)
        })
      });

      // Test step progression
      const nextStep = await tutorial.completeStep(true);
      expect(nextStep.currentStep).toBe(2);
    });
  });

  describe('ErrorRecoverySystem', () => {
    let errorSystem;

    beforeEach(() => {
      errorSystem = new ErrorRecoverySystem();
    });

    test('should provide actionable suggestions for common errors', async () => {
      const error = {
        type: 'command-not-found',
        message: 'command not found: npm',
        context: {
          os: 'darwin',
          shell: 'zsh',
          attemptedCommand: 'npm install'
        }
      };

      const recovery = await errorSystem.analyzeError(error);
      
      expect(recovery).toMatchObject({
        errorType: 'command-not-found',
        severity: expect.stringMatching(/^(low|medium|high|critical)$/),
        suggestions: expect.arrayContaining([
          expect.objectContaining({
            action: expect.any(String),
            command: expect.any(String),
            explanation: expect.any(String),
            confidence: expect.any(Number)
          })
        ]),
        preventionTips: expect.any(Array)
      });
    });

    test('should guide users through recovery workflows', async () => {
      const errorId = 'git-merge-conflict';
      
      const workflow = await errorSystem.getRecoveryWorkflow(errorId);
      
      expect(workflow).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            instructions: expect.any(String),
            commands: expect.any(Array),
            validation: expect.any(Function)
          })
        ]),
        rollbackPlan: expect.any(Array)
      });
    });

    test('should learn from error patterns to prevent future issues', async () => {
      const errorPattern = {
        error: 'test-failure',
        frequency: 3,
        contexts: [
          { projectType: 'nodejs', timeOfDay: 'late' },
          { projectType: 'nodejs', timeOfDay: 'morning' },
          { projectType: 'python', timeOfDay: 'afternoon' }
        ],
        resolutions: ['fix-test-data', 'update-dependencies', 'fix-test-data']
      };

      await errorSystem.recordPattern(errorPattern);
      
      const insights = errorSystem.getPreventionInsights();
      expect(insights).toMatchObject({
        commonPatterns: expect.any(Array),
        preventionStrategies: expect.any(Array),
        riskFactors: expect.any(Object)
      });
    });

    test('should integrate with existing error handling systems', async () => {
      const systemError = {
        source: 'setup-script',
        exitCode: 1,
        stderr: 'Permission denied',
        command: 'mkdir /usr/local/test'
      };

      const enhancedError = await errorSystem.enhanceSystemError(systemError);
      
      expect(enhancedError).toMatchObject({
        originalError: systemError,
        analysis: expect.objectContaining({
          category: expect.any(String),
          likelyCause: expect.any(String),
          severity: expect.any(String)
        }),
        recovery: expect.objectContaining({
          suggestions: expect.any(Array),
          workflow: expect.any(Object)
        })
      });
    });
  });

  describe('Integration Tests', () => {
    test('all Phase 3 systems should work together cohesively', async () => {
      const wizard = new InteractiveSetupWizard();
      const assistant = new SmartAssistant();
      const helpSystem = new LayeredHelpSystem();
      const errorSystem = new ErrorRecoverySystem();

      // Test cross-system integration
      const setupContext = await wizard.analyzeEnvironment('/test/project', ['package.json']);
      const suggestions = await assistant.getSuggestions({
        currentDirectory: '/test/project',
        projectType: setupContext.projectType
      });

      expect(suggestions).toBeDefined();
      expect(setupContext.projectType).toBe('nodejs');
    });

    test('should maintain data consistency across all systems', async () => {
      // Test that all systems can read/write to shared data structures
      const sharedData = {
        userId: 'test-user',
        projectId: 'test-project',
        preferences: { helpLevel: 'detailed' }
      };

      const wizard = new InteractiveSetupWizard(sharedData);
      const assistant = new SmartAssistant(sharedData);
      const helpSystem = new LayeredHelpSystem(sharedData);
      const errorSystem = new ErrorRecoverySystem(sharedData);

      expect(wizard.getUserId()).toBe('test-user');
      expect(assistant.getUserId()).toBe('test-user');
      expect(helpSystem.getUserId()).toBe('test-user');
      expect(errorSystem.getUserId()).toBe('test-user');
    });
  });
});