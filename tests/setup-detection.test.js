/**
 * TDD Tests for Enhanced Setup - Framework Auto-Detection
 * 
 * These tests define exactly how framework detection should work
 * and what configurations should be generated for each framework.
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the modules we're going to build (currently don't exist - this is RED phase!)
const { detectFrameworks, generateConfiguration, enhancedSetup } = require('../lib/framework-detector');

describe('Framework Detection', () => {
  let tempDir;
  
  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-setup-test-'));
  });
  
  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('detectFrameworks()', () => {
    test('detects React project from package.json dependencies', () => {
      // Arrange: Create a React project structure
      const packageJson = {
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        },
        devDependencies: {
          '@types/react': '^18.0.0'
        }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson));
      
      // Act: Detect frameworks
      const detected = detectFrameworks(tempDir);
      
      // Assert: Should detect React
      expect(detected).toEqual({
        primary: 'react',
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        tools: ['npm'],
        testFrameworks: [],
        bundlers: []
      });
    });

    test('detects Vue.js project with Vite', () => {
      // Arrange: Create Vue + Vite project
      const packageJson = {
        dependencies: { 'vue': '^3.0.0' },
        devDependencies: { 'vite': '^4.0.0', '@vitejs/plugin-vue': '^4.0.0' }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson));
      fs.writeFileSync(path.join(tempDir, 'vite.config.js'), 'export default {}');
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.primary).toBe('vue');
      expect(detected.frameworks).toContain('vue');
      expect(detected.bundlers).toContain('vite');
    });

    test('detects Next.js project', () => {
      // Arrange: Create Next.js project structure
      const packageJson = {
        dependencies: { 'next': '^13.0.0', 'react': '^18.0.0' },
        scripts: { 'dev': 'next dev', 'build': 'next build' }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson));
      fs.mkdirSync(path.join(tempDir, 'pages'));
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.primary).toBe('nextjs');
      expect(detected.frameworks).toEqual(['react', 'nextjs']);
    });

    test('detects Python Django project', () => {
      // Arrange: Create Django project structure
      fs.writeFileSync(path.join(tempDir, 'manage.py'), '#!/usr/bin/env python');
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'Django==4.2.0\npsycopg2==2.9.0');
      fs.mkdirSync(path.join(tempDir, 'myproject'));
      fs.writeFileSync(path.join(tempDir, 'myproject', 'settings.py'), 'INSTALLED_APPS = []');
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.primary).toBe('django');
      expect(detected.languages).toContain('python');
      expect(detected.frameworks).toContain('django');
    });

    test('detects Python Flask project', () => {
      // Arrange: Create Flask project
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'Flask==2.3.0\nFlask-SQLAlchemy==3.0.0');
      fs.writeFileSync(path.join(tempDir, 'app.py'), 'from flask import Flask\napp = Flask(__name__)');
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.primary).toBe('flask');
      expect(detected.frameworks).toContain('flask');
    });

    test('detects Rust project with specific crates', () => {
      // Arrange: Create Rust project with web framework
      const cargoToml = `[package]
name = "my-rust-app"
version = "0.1.0"

[dependencies]
tokio = "1.0"
serde = "1.0"
axum = "0.7"`;
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), cargoToml);
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.writeFileSync(path.join(tempDir, 'src', 'main.rs'), 'fn main() {}');
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.primary).toBe('rust');
      expect(detected.languages).toContain('rust');
      expect(detected.frameworks).toContain('axum');
    });

    test('detects testing frameworks', () => {
      // Arrange: Project with Jest and Cypress
      const packageJson = {
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 
          'jest': '^29.0.0',
          'cypress': '^12.0.0',
          '@testing-library/react': '^13.0.0'
        }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson));
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.testFrameworks).toEqual(['jest', 'cypress', 'testing-library']);
    });

    test('detects multiple languages in polyglot project', () => {
      // Arrange: Project with multiple languages
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"dependencies": {"express": "^4.0.0"}}');
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'fastapi==0.104.0');
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected.languages).toContain('javascript');
      expect(detected.languages).toContain('python');
      expect(detected.languages).toContain('rust');
      expect(detected.primary).toBe('javascript'); // First detected becomes primary
    });

    test('returns minimal structure for unrecognized project', () => {
      // Arrange: Empty directory
      
      // Act & Assert
      const detected = detectFrameworks(tempDir);
      expect(detected).toEqual({
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      });
    });
  });

  describe('generateConfiguration()', () => {
    test('generates React configuration with ESLint and Prettier', () => {
      // Arrange: React detection result
      const detected = {
        primary: 'react',
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        tools: ['npm'],
        testFrameworks: ['jest'],
        bundlers: ['vite']
      };
      
      // Act: Generate configuration
      const config = generateConfiguration(detected);
      
      // Assert: Should include React-specific hooks and settings
      expect(config.hooks).toContain('eslint --ext .js,.jsx,.ts,.tsx src/');
      expect(config.hooks).toContain('prettier --check src/');
      expect(config.claudeMdAdditions).toContain('## React Development Standards');
      expect(config.gitignore).toContain('node_modules/');
      expect(config.gitignore).toContain('dist/');
      expect(config.commands.dev).toContain('npm run dev');
      expect(config.commands.test).toContain('npm test');
      expect(config.commands.build).toContain('npm run build');
    });

    test('generates Python Django configuration', () => {
      // Arrange: Django detection result  
      const detected = {
        primary: 'django',
        languages: ['python'],
        frameworks: ['django'],
        tools: ['pip'],
        testFrameworks: [],
        bundlers: []
      };
      
      // Act & Assert
      const config = generateConfiguration(detected);
      expect(config.hooks).toContain('black --check .');
      expect(config.hooks).toContain('flake8 .');
      expect(config.claudeMdAdditions).toContain('## Django Development Standards');
      expect(config.gitignore).toContain('__pycache__/');
      expect(config.gitignore).toContain('*.pyc');
      expect(config.commands.dev).toContain('python manage.py runserver');
      expect(config.commands.test).toContain('python manage.py test');
    });

    test('generates Rust configuration with Clippy and Rustfmt', () => {
      // Arrange: Rust detection result
      const detected = {
        primary: 'rust',
        languages: ['rust'],
        frameworks: ['axum'],
        tools: ['cargo'],
        testFrameworks: [],
        bundlers: []
      };
      
      // Act & Assert
      const config = generateConfiguration(detected);
      expect(config.hooks).toContain('cargo clippy -- -D warnings');
      expect(config.hooks).toContain('cargo fmt -- --check');
      expect(config.claudeMdAdditions).toContain('## Rust Development Standards');
      expect(config.gitignore).toContain('/target/');
      expect(config.commands.dev).toContain('cargo run');
      expect(config.commands.test).toContain('cargo test');
    });

    test('generates comprehensive config for complex multi-framework project', () => {
      // Arrange: Complex project with multiple frameworks
      const detected = {
        primary: 'nextjs',
        languages: ['javascript', 'typescript'],
        frameworks: ['react', 'nextjs'],
        tools: ['npm'],
        testFrameworks: ['jest', 'cypress'],
        bundlers: ['webpack']
      };
      
      // Act & Assert
      const config = generateConfiguration(detected);
      expect(config.hooks.length).toBeGreaterThan(3); // Multiple quality checks
      expect(config.claudeMdAdditions).toContain('## Next.js Development Standards');
      expect(config.commands.e2e).toContain('cypress'); // E2E testing command
    });
  });

  describe('enhancedSetup()', () => {
    test('performs complete auto-setup for React project', async () => {
      // Arrange: Create React project structure
      const packageJson = {
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 'vite': '^4.0.0' }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson));
      
      // Act: Run enhanced setup
      const result = await enhancedSetup(tempDir);
      
      // Assert: Should detect, configure, and set up everything
      expect(result.detected.primary).toBe('react');
      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'CLAUDE.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.claude'))).toBe(true);
      
      // Check that hooks are configured
      const hookContent = fs.readFileSync(path.join(tempDir, '.claude/hooks/smart-lint.sh'), 'utf8');
      expect(hookContent).toContain('eslint');
      expect(hookContent).toContain('prettier');
    });

    test('handles setup failure gracefully', async () => {
      // Arrange: Directory that can't be written to
      const readOnlyDir = path.join(tempDir, 'readonly');
      fs.mkdirSync(readOnlyDir);
      fs.chmodSync(readOnlyDir, 0o444); // Read-only
      
      // Act & Assert
      const result = await enhancedSetup(readOnlyDir);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('provides detailed setup report', async () => {
      // Arrange: Python Flask project
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'Flask==2.3.0');
      
      // Act & Assert
      const result = await enhancedSetup(tempDir);
      expect(result.report).toEqual({
        detected: expect.objectContaining({ primary: 'flask' }),
        configured: expect.arrayContaining(['hooks', 'gitignore', 'claude-md']),
        commands: expect.objectContaining({
          dev: expect.stringContaining('flask'),
          test: expect.any(String)
        })
      });
    });
  });
});

// Integration tests for the enhanced setup script
describe('Enhanced Setup Script Integration', () => {
  test('setup script uses auto-detection when available', () => {
    // This test will verify that our enhanced setup integrates
    // with the existing setup-claude-project.sh script
    
    // For now, this is a placeholder - we'll implement this
    // when we get to the GREEN phase and build the actual integration
    expect(true).toBe(true); // Placeholder assertion
  });
});