/**
 * TDD Tests for Phase 4: Accessibility & Personalization
 * 
 * These tests define the behavior for:
 * - Phase 4.1: Accessibility Manager with screen reader support and WCAG compliance
 * - Phase 4.2: User Preference System with configuration hierarchy
 * - Phase 4.3: Personalized Onboarding with experience level adaptation
 * - Phase 4.4: CLI Theme System with semantic output and color management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the modules we're going to implement
const AccessibilityManager = require('../lib/accessibility-personalization/accessibility-manager');
const UserPreferenceManager = require('../lib/accessibility-personalization/preference-manager');
const PersonalizedOnboarding = require('../lib/accessibility-personalization/personalized-onboarding');
const ThemeManager = require('../lib/accessibility-personalization/theme-manager');

describe('Phase 4: Accessibility & Personalization', () => {
  
  beforeEach(() => {
    // Clean up any test data files
    const testDataDir = path.join(__dirname, '../data/accessibility-personalization');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    
    // Reset environment variables
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    delete process.env.CLAUDE_OUTPUT_FORMAT;
    delete process.env.CLAUDE_THEME;
  });

  describe('Phase 4.1: AccessibilityManager', () => {
    let accessibilityManager;

    beforeEach(() => {
      accessibilityManager = new AccessibilityManager();
    });

    test('should provide structured JSON output for screen readers', async () => {
      const testData = {
        status: 'success',
        message: 'Command completed successfully',
        items: [
          { id: 1, name: 'Item 1', status: 'active' },
          { id: 2, name: 'Item 2', status: 'inactive' }
        ]
      };

      const structuredOutput = await accessibilityManager.formatForScreenReader(testData);
      
      expect(structuredOutput).toMatchObject({
        format: 'structured',
        announcement: expect.stringContaining('Success: Command completed successfully'),
        data: expect.objectContaining({
          summary: expect.stringContaining('Found 2 items'),
          items: expect.arrayContaining([
            expect.objectContaining({
              description: 'Item 1, status: active',
              semanticRole: 'listitem'
            })
          ])
        }),
        screenReaderText: expect.any(String)
      });
    });

    test('should respect NO_COLOR environment variable', () => {
      process.env.NO_COLOR = '1';
      
      const coloredText = accessibilityManager.formatOutput('Success message', { 
        type: 'success',
        useColor: true 
      });
      
      expect(coloredText).not.toContain('\x1b['); // No ANSI color codes
      expect(coloredText).toContain('[OK] Success: Success message');
    });

    test('should validate WCAG AA contrast ratios for color schemes', () => {
      const testColors = [
        { foreground: '#000000', background: '#ffffff' }, // 21:1 - Excellent
        { foreground: '#767676', background: '#ffffff' }, // 4.54:1 - AA compliant
        { foreground: '#cccccc', background: '#ffffff' }, // 1.61:1 - Non-compliant
      ];

      testColors.forEach(({ foreground, background }) => {
        const validation = accessibilityManager.validateContrast(foreground, background);
        
        expect(validation).toMatchObject({
          ratio: expect.any(Number),
          wcagAA: expect.any(Boolean),
          wcagAAA: expect.any(Boolean),
          recommendation: expect.any(String)
        });
      });

      // Specific validation for known values
      const excellentContrast = accessibilityManager.validateContrast('#000000', '#ffffff');
      expect(excellentContrast.wcagAA).toBe(true);
      expect(excellentContrast.ratio).toBeGreaterThan(4.5);

      const poorContrast = accessibilityManager.validateContrast('#cccccc', '#ffffff');
      expect(poorContrast.wcagAA).toBe(false);
    });

    test('should announce progress updates with semantic prefixes', async () => {
      const progressData = [
        { step: 1, total: 3, message: 'Initializing', type: 'progress' },
        { step: 2, total: 3, message: 'Processing', type: 'progress' },
        { step: 3, total: 3, message: 'Completed', type: 'success' }
      ];

      const announcements = [];
      accessibilityManager.onAnnouncement((text) => announcements.push(text));

      for (const progress of progressData) {
        await accessibilityManager.announceProgress(progress);
      }

      expect(announcements).toEqual([
        '[PROGRESS] Progress: Step 1 of 3 - Initializing',
        '[PROGRESS] Progress: Step 2 of 3 - Processing', 
        '[OK] Success: Step 3 of 3 - Completed'
      ]);
    });

    test('should provide alternative text representations for visual elements', () => {
      const visualElements = [
        { type: 'table', data: { headers: ['Name', 'Status'], rows: [['Item 1', 'Active']] } },
        { type: 'progress-bar', data: { current: 7, total: 10, label: 'Installation' } },
        { type: 'tree', data: { name: 'project', children: [{ name: 'src' }, { name: 'tests' }] } }
      ];

      visualElements.forEach(element => {
        const altText = accessibilityManager.generateAlternativeText(element);
        
        expect(altText).toMatchObject({
          type: element.type,
          description: expect.any(String),
          structuredText: expect.any(String),
          screenReaderFormat: expect.any(String)
        });
      });

      // Specific test for table alternative text
      const tableAlt = accessibilityManager.generateAlternativeText(visualElements[0]);
      expect(tableAlt.description).toContain('Table with 2 columns and 1 row');
      expect(tableAlt.screenReaderFormat).toContain('Name: Item 1, Status: Active');
    });
  });

  describe('Phase 4.2: UserPreferenceManager', () => {
    let preferenceManager;
    let tempConfigDir;

    beforeEach(() => {
      tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-test-'));
      preferenceManager = new UserPreferenceManager({ 
        configDir: tempConfigDir,
        appName: 'claude-test'
      });
    });

    afterEach(() => {
      if (fs.existsSync(tempConfigDir)) {
        fs.rmSync(tempConfigDir, { recursive: true, force: true });
      }
    });

    test('should load configuration from hierarchy (CLI → env → file → defaults)', async () => {
      // Set up configuration sources
      process.env.CLAUDE_OUTPUT_FORMAT = 'json';
      process.env.CLAUDE_THEME = 'high-contrast';
      
      const configFile = path.join(tempConfigDir, 'config.json');
      fs.writeFileSync(configFile, JSON.stringify({
        outputFormat: 'table',
        theme: 'default',
        accessibility: { screenReader: true }
      }));

      const cliOptions = { outputFormat: 'structured' };

      const config = await preferenceManager.loadConfiguration(cliOptions);
      
      // CLI options should take precedence
      expect(config.outputFormat).toBe('structured');
      // Environment should override file
      expect(config.theme).toBe('high-contrast');
      // File should provide values not in CLI or env
      expect(config.accessibility.screenReader).toBe(true);
      // Defaults should fill in gaps
      expect(config.verbosity).toBe('normal'); // Default value
    });

    test('should validate configuration against JSON schema', async () => {
      const validConfig = {
        outputFormat: 'json',
        theme: 'default',
        accessibility: {
          screenReader: true,
          highContrast: false,
          semanticPrefixes: true
        }
      };

      const invalidConfig = {
        outputFormat: 'invalid-format',
        theme: 123, // Should be string
        accessibility: 'not-an-object'
      };

      const validResult = await preferenceManager.validateConfiguration(validConfig);
      expect(validResult).toMatchObject({
        valid: true,
        config: validConfig,
        errors: []
      });

      const invalidResult = await preferenceManager.validateConfiguration(invalidConfig);
      expect(invalidResult).toMatchObject({
        valid: false,
        config: expect.any(Object),
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String)
          })
        ])
      });
    });

    test('should store preferences in platform-appropriate locations', async () => {
      const preferences = {
        theme: 'dark',
        outputFormat: 'json',
        accessibility: { screenReader: true }
      };

      await preferenceManager.savePreferences(preferences);
      
      const savedPrefs = await preferenceManager.loadPreferences();
      expect(savedPrefs).toMatchObject(preferences);

      // Verify file was created in correct location
      const expectedPath = preferenceManager.getConfigPath();
      expect(fs.existsSync(expectedPath)).toBe(true);
      
      // Platform-specific validation (test uses temp directory, so just verify structure)
      const platformPath = preferenceManager.getPlatformAppropriateConfigPath();
      if (process.platform === 'win32') {
        expect(platformPath).toContain('AppData');
      } else if (process.platform === 'darwin') {
        expect(platformPath).toContain('Library/Preferences');
      } else {
        expect(platformPath).toContain('.config');
      }
    });

    test('should migrate configuration between versions', async () => {
      // Create old version config
      const oldConfig = {
        version: '1.0.0',
        colorMode: 'enabled', // Old field name
        format: 'pretty' // Old field name
      };

      const configPath = preferenceManager.getConfigPath();
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(oldConfig));

      const migratedConfig = await preferenceManager.migrateConfiguration();
      
      expect(migratedConfig).toMatchObject({
        version: expect.stringMatching(/^2\./), // Current version
        theme: 'default', // Migrated from colorMode
        outputFormat: 'human', // Migrated from format
        accessibility: expect.any(Object)
      });

      // Verify backup was created
      const backupPath = configPath + '.backup-1.0.0';
      expect(fs.existsSync(backupPath)).toBe(true);
    });

    test('should provide theme and output format customization', async () => {
      const customizations = {
        themes: {
          'my-theme': {
            success: '#00ff00',
            error: '#ff0000',
            info: '#0000ff',
            warning: '#ffff00'
          }
        },
        outputFormats: {
          'my-format': {
            template: '{{prefix}} {{message}}',
            dateFormat: 'iso',
            indentation: 4
          }
        }
      };

      await preferenceManager.saveCustomizations(customizations);
      
      const availableThemes = preferenceManager.getAvailableThemes();
      expect(availableThemes).toContain('my-theme');

      const availableFormats = preferenceManager.getAvailableOutputFormats();
      expect(availableFormats).toContain('my-format');

      const themeConfig = preferenceManager.getThemeConfiguration('my-theme');
      expect(themeConfig).toMatchObject(customizations.themes['my-theme']);
    });
  });

  describe('Phase 4.3: PersonalizedOnboarding', () => {
    let onboarding;

    beforeEach(() => {
      onboarding = new PersonalizedOnboarding();
    });

    test('should detect user experience level from usage patterns', async () => {
      const usagePatterns = [
        {
          user: 'beginner',
          patterns: {
            commandsUsed: ['/help', '/explore', '/help'],
            errors: 15,
            successRate: 0.6,
            averageSessionTime: 1800, // 30 minutes
            helpUsage: 'frequent'
          }
        },
        {
          user: 'expert',
          patterns: {
            commandsUsed: ['/dev', '/debug', '/ship', '/refactor'],
            errors: 2,
            successRate: 0.95,
            averageSessionTime: 300, // 5 minutes
            helpUsage: 'rare'
          }
        }
      ];

      for (const { user, patterns } of usagePatterns) {
        const experienceLevel = await onboarding.detectExperienceLevel(patterns);
        
        expect(experienceLevel).toMatchObject({
          level: expect.stringMatching(/^(beginner|intermediate|expert)$/),
          confidence: expect.any(Number),
          indicators: expect.any(Array),
          recommendations: expect.any(Array)
        });

        // Validate specific classifications
        if (user === 'beginner') {
          expect(experienceLevel.level).toBe('beginner');
          expect(experienceLevel.confidence).toBeGreaterThan(0.7);
        } else if (user === 'expert') {
          expect(experienceLevel.level).toBe('expert');
          expect(experienceLevel.confidence).toBeGreaterThan(0.8);
        }
      }
    });

    test('should customize onboarding flow based on accessibility needs', async () => {
      const accessibilityProfiles = [
        {
          name: 'screen-reader-user',
          needs: {
            screenReader: true,
            highContrast: false,
            reducedMotion: true,
            semanticStructure: true
          }
        },
        {
          name: 'low-vision-user',
          needs: {
            screenReader: false,
            highContrast: true,
            largeText: true,
            reducedMotion: false
          }
        }
      ];

      for (const profile of accessibilityProfiles) {
        const customFlow = await onboarding.customizeOnboardingFlow(profile.needs);
        
        expect(customFlow).toMatchObject({
          steps: expect.any(Array),
          accessibility: expect.objectContaining({
            outputFormat: expect.any(String),
            announcements: expect.any(Boolean),
            visualElements: expect.any(Boolean)
          }),
          estimatedDuration: expect.any(String)
        });

        // Validate screen reader customizations
        if (profile.needs.screenReader) {
          expect(customFlow.accessibility.outputFormat).toBe('structured');
          expect(customFlow.accessibility.announcements).toBe(true);
          expect(customFlow.steps).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'accessibility-setup',
                screenReaderOptimized: true
              })
            ])
          );
        }

        // Validate high contrast customizations
        if (profile.needs.highContrast) {
          expect(customFlow.accessibility.theme).toBe('high-contrast');
          expect(customFlow.steps).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'theme-setup',
                highContrastMode: true
              })
            ])
          );
        }
      }
    });

    test('should integrate with existing UX research data', async () => {
      // Mock existing UX research data (from Phase 1)
      const existingResearch = {
        painPoints: [
          { category: 'accessibility', severity: 'high', description: 'Difficult color contrast' },
          { category: 'onboarding', severity: 'medium', description: 'Too many options at once' }
        ],
        userPersonas: [
          { id: 'accessibility-focused', traits: ['screen-reader', 'keyboard-only'] },
          { id: 'efficiency-focused', traits: ['expert', 'fast-workflow'] }
        ]
      };

      const personalizedSetup = await onboarding.integrateWithResearch(existingResearch);
      
      expect(personalizedSetup).toMatchObject({
        addressedPainPoints: expect.arrayContaining([
          expect.objectContaining({
            painPoint: 'Difficult color contrast',
            solution: 'High contrast theme with WCAG AA compliance',
            implemented: true
          })
        ]),
        personaAdaptations: expect.any(Object),
        prioritizedFeatures: expect.any(Array)
      });

      // Verify accessibility pain points are addressed
      const accessibilityFixes = personalizedSetup.addressedPainPoints.filter(
        fix => fix.painPoint.includes('color contrast')
      );
      expect(accessibilityFixes).toHaveLength(1);
      expect(accessibilityFixes[0].solution).toContain('High contrast');
    });

    test('should adapt help content for different experience levels', async () => {
      const experienceLevels = ['beginner', 'intermediate', 'expert'];
      const topic = 'git-workflow';

      for (const level of experienceLevels) {
        const adaptedHelp = await onboarding.adaptHelpContent(topic, level);
        
        expect(adaptedHelp).toMatchObject({
          topic,
          experienceLevel: level,
          content: expect.objectContaining({
            overview: expect.any(String),
            steps: expect.any(Array),
            examples: expect.any(Array)
          }),
          interactionStyle: expect.any(String),
          estimatedTime: expect.any(String)
        });

        // Validate content adaptation
        if (level === 'beginner') {
          expect(adaptedHelp.content.steps.length).toBeGreaterThan(5); // More detailed steps
          expect(adaptedHelp.interactionStyle).toBe('guided');
          expect(adaptedHelp.content.overview).toContain('Introduction');
        } else if (level === 'expert') {
          expect(adaptedHelp.content.steps.length).toBeLessThan(4); // Fewer, high-level steps
          expect(adaptedHelp.interactionStyle).toBe('reference');
          expect(adaptedHelp.estimatedTime).toMatch(/\d+\s*seconds?/); // Quick reference
        }
      }
    });
  });

  describe('Phase 4.4: ThemeManager', () => {
    let themeManager;

    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    test('should switch between predefined theme sets', async () => {
      const predefinedThemes = ['default', 'dark', 'high-contrast', 'colorblind-friendly'];

      for (const themeName of predefinedThemes) {
        const theme = await themeManager.loadTheme(themeName);
        
        expect(theme).toMatchObject({
          name: themeName,
          colors: expect.objectContaining({
            success: expect.any(String),
            error: expect.any(String),
            warning: expect.any(String),
            info: expect.any(String)
          }),
          semantics: expect.objectContaining({
            success: expect.any(String),
            error: expect.any(String),
            warning: expect.any(String),
            info: expect.any(String)
          }),
          accessibility: expect.objectContaining({
            contrastValidated: expect.any(Boolean),
            wcagCompliance: expect.any(String)
          })
        });

        // Validate high contrast theme meets WCAG AA
        if (themeName === 'high-contrast') {
          expect(theme.accessibility.wcagCompliance).toBe('AA');
          expect(theme.accessibility.contrastValidated).toBe(true);
        }
      }
    });

    test('should render output with semantic prefixes beyond color', () => {
      const messages = [
        { type: 'success', content: 'Operation completed successfully' },
        { type: 'error', content: 'Failed to connect to server' },
        { type: 'warning', content: 'Deprecated API usage detected' },
        { type: 'info', content: 'Processing 15 items' }
      ];

      messages.forEach(message => {
        const rendered = themeManager.renderMessage(message);
        
        expect(rendered).toMatchObject({
          text: expect.any(String),
          semantic: expect.any(String),
          accessible: expect.any(String),
          structured: expect.any(Object)
        });

        // Verify semantic prefixes
        switch (message.type) {
          case 'success':
            expect(rendered.semantic).toContain('[OK] Success:');
            break;
          case 'error':
            expect(rendered.semantic).toContain('[ERROR] Error:');
            break;
          case 'warning':
            expect(rendered.semantic).toContain('[WARN] Warning:');
            break;
          case 'info':
            expect(rendered.semantic).toContain('[INFO] Info:');
            break;
        }

        // Verify accessible version works without color
        expect(rendered.accessible).not.toContain('\x1b['); // No ANSI codes
        expect(rendered.accessible).toContain(message.content);
      });
    });

    test('should provide alternative text representations for visual elements', () => {
      const visualElements = [
        {
          type: 'progress-indicator',
          data: { current: 7, total: 10, label: 'Installation Progress' }
        },
        {
          type: 'status-grid',
          data: { 
            items: [
              { name: 'Service A', status: 'running' },
              { name: 'Service B', status: 'stopped' }
            ]
          }
        },
        {
          type: 'file-tree',
          data: {
            root: 'project',
            structure: {
              'src/': ['main.js', 'utils.js'],
              'tests/': ['main.test.js']
            }
          }
        }
      ];

      visualElements.forEach(element => {
        const alternatives = themeManager.generateAlternatives(element);
        
        expect(alternatives).toMatchObject({
          visual: expect.any(String), // Normal colored output
          accessible: expect.any(String), // High contrast/no color
          screenReader: expect.any(String), // Structured for screen readers
          structured: expect.any(Object), // Machine-readable format
          description: expect.any(String) // Alt text description
        });

        // Verify progress indicator alternatives
        if (element.type === 'progress-indicator') {
          expect(alternatives.screenReader).toContain('Installation Progress: 7 of 10 completed');
          expect(alternatives.description).toContain('Progress bar showing 70% completion');
        }
      });
    });

    test('should validate color contrast meets accessibility standards', () => {
      const themeValidation = themeManager.validateThemeAccessibility('high-contrast');
      
      expect(themeValidation).toMatchObject({
        theme: 'high-contrast',
        overallCompliance: expect.stringMatching(/^(A|AA|AAA)$/),
        colorTests: expect.arrayContaining([
          expect.objectContaining({
            element: expect.any(String),
            foreground: expect.any(String),
            background: expect.any(String),
            ratio: expect.any(Number),
            wcagAA: expect.any(Boolean),
            wcagAAA: expect.any(Boolean)
          })
        ]),
        recommendations: expect.any(Array)
      });

      // Verify high contrast theme meets standards
      expect(themeValidation.overallCompliance).toMatch(/^(AA|AAA)$/);
      
      // Check that all critical elements meet WCAG AA (4.5:1 ratio)
      const criticalElements = themeValidation.colorTests.filter(
        test => ['error', 'success', 'warning'].includes(test.element)
      );
      
      criticalElements.forEach(test => {
        expect(test.wcagAA).toBe(true);
        expect(test.ratio).toBeGreaterThan(4.5);
      });
    });
  });

  describe('Integration Tests - Phase 4 Systems', () => {
    test('all Phase 4 systems should work together cohesively', async () => {
      const accessibilityManager = new AccessibilityManager();
      const preferenceManager = new UserPreferenceManager({ appName: 'claude-test' });
      const onboarding = new PersonalizedOnboarding();
      const themeManager = new ThemeManager();

      // Test cross-system integration
      const userPrefs = {
        accessibility: { screenReader: true, highContrast: true },
        theme: 'high-contrast',
        outputFormat: 'structured'
      };

      await preferenceManager.savePreferences(userPrefs);
      const loadedPrefs = await preferenceManager.loadPreferences();
      
      const theme = await themeManager.loadTheme(loadedPrefs.theme);
      const accessibleOutput = await accessibilityManager.formatForScreenReader({
        message: 'Test integration',
        type: 'success'
      });

      expect(loadedPrefs.theme).toBe('high-contrast');
      expect(theme.accessibility.wcagCompliance).toBe('AA');
      expect(accessibleOutput.format).toBe('structured');
    });

    test('should maintain data consistency across all Phase 4 systems', async () => {
      // Test that all systems can read/write to shared data structures
      const sharedData = {
        userId: 'test-user',
        preferences: {
          accessibility: { screenReader: true },
          theme: 'high-contrast',
          outputFormat: 'structured'
        }
      };

      const accessibilityManager = new AccessibilityManager(sharedData);
      const preferenceManager = new UserPreferenceManager(sharedData);
      const onboarding = new PersonalizedOnboarding(sharedData);
      const themeManager = new ThemeManager(sharedData);

      expect(accessibilityManager.getUserId()).toBe('test-user');
      expect(preferenceManager.getUserId()).toBe('test-user');
      expect(onboarding.getUserId()).toBe('test-user');
      expect(themeManager.getUserId()).toBe('test-user');
    });

    test('should integrate with existing Phase 1-3 systems', async () => {
      // Mock Phase 1-3 systems
      const mockUXResearch = { userPersonas: [{ id: 'accessibility-focused' }] };
      const mockCommandDiscovery = { recentCommands: ['/explore', '/help'] };
      const mockInteractiveFeatures = { helpUsage: 'frequent' };

      const onboarding = new PersonalizedOnboarding();
      
      const integration = await onboarding.integrateWithExistingSystems({
        uxResearch: mockUXResearch,
        commandDiscovery: mockCommandDiscovery,
        interactiveFeatures: mockInteractiveFeatures
      });

      expect(integration).toMatchObject({
        experienceLevel: expect.any(String),
        recommendedSettings: expect.any(Object),
        onboardingPath: expect.any(Array)
      });
    });
  });
});