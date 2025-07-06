/**
 * TDD Tests for Enhanced /ship Command
 * 
 * These tests define the behavior for:
 * - Enhanced commit message generation with context awareness
 * - Interactive commit message templates
 * - Advanced git workflow integration
 * - Rollback capabilities
 * - Enhanced error handling and validation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the modules we're going to implement
const ShipEngine = require('../lib/ship-command/ship-engine');
const CommitTemplates = require('../lib/ship-command/commit-templates');
const GitWorkflow = require('../lib/ship-command/git-workflow');

describe('Enhanced /ship Command', () => {
  let tempDir;
  let shipEngine;
  let commitTemplates;
  let gitWorkflow;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ship-test-'));
    
    // Initialize test instances
    shipEngine = new ShipEngine({ workingDir: tempDir });
    commitTemplates = new CommitTemplates();
    gitWorkflow = new GitWorkflow({ workingDir: tempDir });
    
    // Clean up any previous test state
    delete process.env.CLAUDE_SHIP_MODE;
    delete process.env.CLAUDE_COMMIT_TEMPLATE;
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Enhanced Commit Message Generation', () => {
    test('should generate context-aware commit messages based on file patterns', async () => {
      // Setup: Create test files with different patterns
      const testFiles = [
        { path: 'src/auth/login.js', content: 'function login() {}' },
        { path: 'src/auth/logout.js', content: 'function logout() {}' },
        { path: 'tests/auth.test.js', content: 'describe("auth", () => {})' }
      ];
      
      const changes = await shipEngine.analyzeChanges(testFiles);
      const commitMessage = await shipEngine.generateCommitMessage(changes);
      
      // Expected: Should detect authentication-related changes
      expect(commitMessage).toMatch(/feat.*auth/i);
      expect(commitMessage).toContain('authentication');
      expect(commitMessage).toContain('login');
      expect(commitMessage).toContain('logout');
      expect(commitMessage).toContain('test coverage');
    });

    test('should use different templates for different change types', async () => {
      const testCases = [
        {
          changes: [{ type: 'feat', files: ['src/api/users.js'] }],
          expectedPattern: /^feat:/
        },
        {
          changes: [{ type: 'fix', files: ['src/utils/validation.js'] }],
          expectedPattern: /^fix:/
        },
        {
          changes: [{ type: 'docs', files: ['README.md', 'docs/api.md'] }],
          expectedPattern: /^docs:/
        },
        {
          changes: [{ type: 'refactor', files: ['src/legacy/old-service.js'] }],
          expectedPattern: /^refactor:/
        }
      ];

      for (const testCase of testCases) {
        const commitMessage = await shipEngine.generateCommitMessage(testCase.changes);
        expect(commitMessage).toMatch(testCase.expectedPattern);
      }
    });

    test('should analyze git diff to determine commit scope automatically', async () => {
      const mockGitDiff = `
diff --git a/src/auth/jwt.js b/src/auth/jwt.js
new file mode 100644
index 0000000..abc123
--- /dev/null
+++ b/src/auth/jwt.js
@@ -0,0 +1,15 @@
+function generateToken(user) {
+  return jwt.sign(user, process.env.JWT_SECRET);
+}
      `;
      
      const scope = await shipEngine.determineScope(mockGitDiff);
      const commitMessage = await shipEngine.generateCommitMessage(null, { scope });
      
      expect(scope).toBe('auth');
      expect(commitMessage).toContain('(auth)');
    });

    test('should suggest breaking change indicators when appropriate', async () => {
      const breakingChanges = [
        { type: 'removed', item: 'deprecated API endpoint' },
        { type: 'changed', item: 'function signature', from: 'login(user)', to: 'login(user, options)' }
      ];
      
      const commitMessage = await shipEngine.generateCommitMessage(breakingChanges);
      
      expect(commitMessage).toContain('BREAKING CHANGE');
      expect(commitMessage).toMatch(/!.*:/); // Breaking change indicator
    });
  });

  describe('Interactive Commit Message Templates', () => {
    test('should offer commit message templates based on change analysis', async () => {
      const changes = { type: 'feat', scope: 'auth', files: ['src/auth/login.js'] };
      
      const templates = await commitTemplates.getRelevantTemplates(changes);
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      
      const featTemplate = templates.find(t => t.type === 'feat');
      expect(featTemplate).toBeDefined();
      expect(featTemplate.template).toContain('feat({scope}):');
      expect(featTemplate.description).toContain('new feature');
    });

    test('should allow custom commit message templates in project config', async () => {
      const customConfig = {
        commitTemplates: {
          'feat': 'feature({scope}): {description}',
          'fix': 'bugfix({scope}): {description}',
          'custom': 'custom({scope}): {description} [custom-tag]'
        }
      };
      
      commitTemplates.loadCustomTemplates(customConfig);
      
      const template = commitTemplates.getTemplate('custom');
      expect(template).toBe('custom({scope}): {description} [custom-tag]');
    });

    test('should validate commit message format against conventional commits', () => {
      const testCases = [
        { message: 'feat: add user authentication', valid: true },
        { message: 'fix(auth): resolve login issue', valid: true },
        { message: 'docs: update API documentation', valid: true },
        { message: 'random commit message', valid: false },
        { message: 'FIX: wrong case', valid: false }
      ];
      
      for (const testCase of testCases) {
        const result = commitTemplates.validateFormat(testCase.message);
        expect(result.valid).toBe(testCase.valid);
      }
    });
  });

  describe('Advanced Git Workflow Integration', () => {
    test('should handle feature branch workflows correctly', async () => {
      // Setup: Mock git branch detection
      gitWorkflow.setMockBranch('feature/user-auth');
      
      const branchInfo = await gitWorkflow.getCurrentBranchInfo();
      
      expect(branchInfo.name).toBe('feature/user-auth');
      expect(branchInfo.type).toBe('feature');
      expect(branchInfo.isMainBranch).toBe(false);
      expect(branchInfo.canShip).toBe(true);
    });

    test('should detect and warn about shipping from wrong branch', async () => {
      // Setup: Mock being on main branch with uncommitted changes
      gitWorkflow.setMockBranch('main');
      gitWorkflow.setMockHasUncommittedChanges(true);
      
      const validation = await gitWorkflow.validateShipConditions();
      
      expect(validation.canShip).toBe(false);
      expect(validation.warnings).toContain('shipping directly from main branch');
      expect(validation.recommendations).toContain('create feature branch');
    });

    test('should support shipping to different target branches', async () => {
      const shipOptions = {
        targetBranch: 'develop',
        createPR: true,
        mergeBranch: false
      };
      
      const result = await gitWorkflow.ship(shipOptions);
      
      expect(result.targetBranch).toBe('develop');
      expect(result.pullRequestCreated).toBe(true);
      expect(result.branchMerged).toBe(false);
    });

    test('should handle merge conflicts gracefully', async () => {
      // Setup: Mock merge conflict scenario
      gitWorkflow.setMockMergeConflict(true);
      
      const result = await gitWorkflow.attemptMerge('main');
      
      expect(result.success).toBe(false);
      expect(result.conflicts).toBeInstanceOf(Array);
      expect(result.resolutionSteps).toBeInstanceOf(Array);
      expect(result.resolutionSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Rollback Capabilities', () => {
    test('should allow rolling back last ship operation', async () => {
      // Setup: Mock previous ship operation
      const mockShipHistory = {
        lastShip: {
          commitHash: 'abc123',
          timestamp: new Date().toISOString(),
          files: ['src/auth/login.js'],
          message: 'feat: add user authentication'
        }
      };
      
      shipEngine.setMockShipHistory(mockShipHistory);
      
      const rollbackResult = await shipEngine.rollbackLastShip();
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.rolledBackCommit).toBe('abc123');
      expect(rollbackResult.filesRestored).toContain('src/auth/login.js');
    });

    test('should preserve rollback history for multiple operations', async () => {
      // Setup: Mock multiple ship operations
      const mockOperations = [
        { id: '1', commitHash: 'abc123', message: 'feat: add auth' },
        { id: '2', commitHash: 'def456', message: 'fix: auth validation' },
        { id: '3', commitHash: 'ghi789', message: 'docs: update auth docs' }
      ];
      
      shipEngine.setMockOperationHistory(mockOperations);
      
      const history = await shipEngine.getShipHistory();
      
      expect(history.operations).toHaveLength(3);
      expect(history.canRollback).toBe(true);
      expect(history.rollbackLimit).toBe(10); // Default limit
    });

    test('should handle rollback of documentation changes', async () => {
      const mockDocumentationChanges = {
        roadmap: { file: 'ROADMAP.md', changes: ['Added Phase 6'] },
        changelog: { file: 'CHANGELOG.md', changes: ['## v1.6.0'] }
      };
      
      const rollbackResult = await shipEngine.rollbackDocumentationChanges(mockDocumentationChanges);
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.filesRestored).toContain('ROADMAP.md');
      expect(rollbackResult.filesRestored).toContain('CHANGELOG.md');
    });
  });

  describe('Enhanced Error Handling', () => {
    test('should handle git authentication failures gracefully', async () => {
      // Setup: Mock git authentication failure
      shipEngine.setMockAuthFailure(true);
      
      const result = await shipEngine.ship({ message: 'test commit' });
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
      expect(result.error.message).toContain('authentication failed');
      expect(result.error.suggestions).toContain('check git credentials');
    });

    test('should provide actionable error messages for common failures', async () => {
      const testCases = [
        {
          error: 'merge conflict',
          expectedSuggestions: ['resolve conflicts', 'git status', 'git add']
        },
        {
          error: 'no changes to commit',
          expectedSuggestions: ['git status', 'check staged files']
        },
        {
          error: 'hook failed',
          expectedSuggestions: ['check linting', 'run tests', 'fix formatting']
        }
      ];

      for (const testCase of testCases) {
        const error = await shipEngine.handleCommonError(testCase.error);
        
        expect(error.suggestions).toEqual(expect.arrayContaining(testCase.expectedSuggestions));
        expect(error.actionable).toBe(true);
      }
    });

    test('should recover from partial ship operations', async () => {
      // Setup: Mock partial ship failure
      const partialShipState = {
        documentsUpdated: true,
        filesStaged: true,
        commitCreated: false,
        reason: 'hook failure'
      };
      
      const recovery = await shipEngine.recoverFromPartialShip(partialShipState);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps).toContain('fix hook issues');
      expect(recovery.recoverySteps).toContain('retry commit');
    });
  });

  describe('Integration with Existing Systems', () => {
    test('should integrate with command discovery system', async () => {
      const CommandDiscovery = require('../lib/command-discovery/discovery-engine');
      const discovery = new CommandDiscovery();
      
      const shipCommand = discovery.getCommand('ship');
      
      expect(shipCommand).toBeDefined();
      expect(shipCommand.enhancements).toBeDefined();
      expect(shipCommand.enhancements.commitTemplates).toBe(true);
      expect(shipCommand.enhancements.rollbackSupport).toBe(true);
      expect(shipCommand.enhancements.advancedGitWorkflow).toBe(true);
    });

    test('should maintain compatibility with existing /ship workflow', async () => {
      // Test that existing workflow still works with standard ship method
      const shipResult = await shipEngine.ship({ message: 'test commit' });
      
      expect(shipResult.success).toBe(true);
      expect(shipResult.message).toBe('test commit');
      expect(shipResult.commitHash).toBeTruthy();
    });
  });
});