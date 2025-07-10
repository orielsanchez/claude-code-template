/**
 * Framework Detector Integration Tests
 * 
 * RED phase tests for complete framework detection pipeline
 * Target: 0% → 95%+ coverage for lib/framework-detector.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the functions we're testing (will initially fail)
const {
  detectFrameworks,
  generateConfiguration,
  enhancedSetup
} = require('../lib/framework-detector');

describe('Framework Detector Integration', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'framework-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('detectFrameworks', () => {
    it('should detect Next.js React project correctly', () => {
      // Setup Next.js project structure
      const packageJson = {
        dependencies: {
          'react': '^18.0.0',
          'next': '^13.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          '@types/react': '^18.0.0',
          'jest': '^29.0.0'
        }
      };

      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');
      fs.writeFileSync(path.join(tempDir, 'next.config.js'), 'module.exports = {}');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('javascript');
      expect(result.languages).toContain('typescript');
      expect(result.frameworks).toContain('react');
      expect(result.frameworks).toContain('nextjs');
      expect(result.testFrameworks).toContain('jest');
      expect(result.primary).toBe('nextjs');
      expect(result.tools).toContain('npm');
    });

    it('should detect Django Python project correctly', () => {
      // Setup Django project structure
      const requirements = `
Django==4.2.0
django-rest-framework==3.14.0
pytest==7.2.0
black==23.0.0
`;
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), requirements);
      fs.writeFileSync(path.join(tempDir, 'manage.py'), '#!/usr/bin/env python\nimport django');
      fs.mkdirSync(path.join(tempDir, 'myproject'));
      fs.writeFileSync(path.join(tempDir, 'myproject', '__init__.py'), '');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('python');
      expect(result.frameworks).toContain('django');
      expect(result.primary).toBe('django');
      expect(result.tools).toContain('pip');
    });

    it('should detect Rust Axum project correctly', () => {
      // Setup Rust Axum project structure
      const cargoToml = `
[package]
name = "rust-api"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7.0"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }

[dev-dependencies]
criterion = "0.5"
`;
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), cargoToml);
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.writeFileSync(path.join(tempDir, 'src', 'main.rs'), 'fn main() {}');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('rust');
      expect(result.frameworks).toContain('axum');
      expect(result.frameworks).toContain('tokio');
      expect(result.primary).toBe('axum');
      expect(result.tools).toContain('cargo');
    });

    it('should detect Swift Vapor project correctly', () => {
      // Setup Swift Vapor project structure
      const packageSwift = `
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "VaporApp",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/vapor/fluent.git", from: "4.0.0")
    ],
    targets: [
        .target(
            name: "VaporApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "Fluent", package: "fluent")
            ]
        )
    ]
)
`;
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      fs.mkdirSync(path.join(tempDir, 'Sources'));
      fs.mkdirSync(path.join(tempDir, 'Sources', 'VaporApp'));
      fs.writeFileSync(path.join(tempDir, 'Sources', 'VaporApp', 'main.swift'), 'import Vapor');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('swift');
      expect(result.frameworks).toContain('vapor');
      expect(result.frameworks).toContain('fluent');
      expect(result.primary).toBe('swift');
      expect(result.tools).toContain('swift-package-manager');
    });

    it('should handle multi-language projects (JS + Rust)', () => {
      // Setup polyglot project structure
      const packageJson = {
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 'typescript': '^5.0.0' }
      };
      const cargoToml = `
[package]
name = "rust-backend"
version = "0.1.0"

[dependencies]
axum = "0.7.0"
`;

      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), cargoToml);

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('javascript');
      expect(result.languages).toContain('typescript');
      expect(result.languages).toContain('rust');
      expect(result.frameworks).toContain('react');
      expect(result.frameworks).toContain('axum');
      // Should prioritize the first detected language for multi-ecosystem projects
      expect(result.primary).toBe('javascript');
    });

    it('should handle invalid project path gracefully', () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist');

      const result = detectFrameworks(nonExistentPath);

      expect(result).toEqual({
        languages: [],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: [],
        primary: 'generic'
      });
    });

    it('should handle empty project directory', () => {
      // tempDir exists but is empty

      const result = detectFrameworks(tempDir);

      expect(result).toEqual({
        languages: [],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: [],
        primary: 'generic'
      });
    });

    it('should detect all project components comprehensively', () => {
      // Setup comprehensive JavaScript project
      const packageJson = {
        dependencies: {
          'react': '^18.0.0',
          'express': '^4.18.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'jest': '^29.0.0',
          'cypress': '^12.0.0',
          'webpack': '^5.0.0',
          'vite': '^4.0.0'
        }
      };

      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      fs.writeFileSync(path.join(tempDir, 'webpack.config.js'), 'module.exports = {}');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('javascript');
      expect(result.languages).toContain('typescript');
      expect(result.frameworks).toContain('react');
      expect(result.frameworks).toContain('express');
      expect(result.testFrameworks).toContain('jest');
      expect(result.testFrameworks).toContain('cypress');
      expect(result.bundlers).toContain('webpack');
      expect(result.bundlers).toContain('vite');
      expect(result.tools).toContain('yarn');
    });
  });

  describe('generateConfiguration', () => {
    it('should generate configuration for Next.js project', () => {
      const detected = {
        languages: ['javascript', 'typescript'],
        frameworks: ['react', 'nextjs'],
        testFrameworks: ['jest'],
        bundlers: ['webpack'],
        tools: ['npm'],
        primary: 'nextjs'
      };

      const config = generateConfiguration(detected);

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(config.hooks).toContain('eslint --ext .js,.jsx,.ts,.tsx src/');
      expect(config.hooks).toContain('next lint');
      expect(config.commands.dev).toBe('npm run dev');
      expect(config.commands.build).toBe('npm run build');
      expect(config.claudeMdAdditions).toContain('Next.js');
    });

    it('should generate configuration for Django project', () => {
      const detected = {
        languages: ['python'],
        frameworks: ['django'],
        testFrameworks: [],
        bundlers: [],
        tools: ['pip'],
        primary: 'django'
      };

      const config = generateConfiguration(detected);

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config.hooks).toContain('flake8 .');
      expect(config.hooks).toContain('black --check .');
      expect(config.commands.dev).toBe('python manage.py runserver');
      expect(config.commands.test).toBe('python manage.py test');
    });

    it('should generate configuration for Rust project', () => {
      const detected = {
        languages: ['rust'],
        frameworks: ['axum', 'tokio'],
        testFrameworks: [],
        bundlers: [],
        tools: ['cargo'],
        primary: 'axum'
      };

      const config = generateConfiguration(detected);

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config.hooks).toContain('cargo clippy -- -D warnings -D clippy::all -D clippy::pedantic');
      expect(config.hooks).toContain('cargo fmt -- --check');
      expect(config.commands.dev).toBe('cargo run');
      expect(config.commands.test).toBe('cargo nextest run --all-features');
    });

    it('should handle unknown frameworks gracefully', () => {
      const detected = {
        languages: [],
        frameworks: [],
        testFrameworks: [],
        bundlers: [],
        tools: [],
        primary: 'generic'
      };

      const config = generateConfiguration(detected);

      expect(config).toHaveProperty('hooks');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('claudeMdAdditions');
      expect(Array.isArray(config.hooks)).toBe(true);
      expect(typeof config.commands).toBe('object');
    });
  });

  describe('enhancedSetup', () => {
    it('should perform complete setup for Next.js project', async () => {
      // Setup Next.js project
      const packageJson = {
        dependencies: { 'react': '^18.0.0', 'next': '^13.0.0' },
        devDependencies: { 'typescript': '^5.0.0', 'jest': '^29.0.0' }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const result = await enhancedSetup(tempDir);

      expect(result.success).toBe(true);
      expect(result.detected.primary).toBe('nextjs');
      expect(result.report.configured).toContain('hooks');
      expect(result.report.configured).toContain('gitignore');
      expect(result.report.configured).toContain('claude-md');

      // Verify files were created
      expect(fs.existsSync(path.join(tempDir, '.claude'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.claude', 'hooks'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'CLAUDE.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.claude', 'hooks', 'smart-lint.sh'))).toBe(true);

      // Verify CLAUDE.md content
      const claudeMdContent = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf8');
      expect(claudeMdContent).toContain('Auto-detected project: nextjs');
      expect(claudeMdContent).toContain('Development Partnership');

      // Verify hook script is executable
      const hookPath = path.join(tempDir, '.claude', 'hooks', 'smart-lint.sh');
      const stats = fs.statSync(hookPath);
      expect(stats.mode & parseInt('755', 8)).toBeTruthy();
    });

    it('should handle setup for Django project', async () => {
      // Setup Django project
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'Django==4.2.0');
      fs.writeFileSync(path.join(tempDir, 'manage.py'), '#!/usr/bin/env python');

      const result = await enhancedSetup(tempDir);

      expect(result.success).toBe(true);
      expect(result.detected.primary).toBe('django');

      // Verify hook content for Python project
      const hookContent = fs.readFileSync(path.join(tempDir, '.claude', 'hooks', 'smart-lint.sh'), 'utf8');
      expect(hookContent).toContain('flake8 .');
      expect(hookContent).toContain('exit 1');
    });

    it('should not overwrite existing CLAUDE.md', async () => {
      // Create existing CLAUDE.md
      const existingContent = '# My Custom CLAUDE.md\nThis should not be overwritten.';
      fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), existingContent);

      // Setup project
      const packageJson = { dependencies: { 'react': '^18.0.0' } };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const result = await enhancedSetup(tempDir);

      expect(result.success).toBe(true);

      // Verify existing content preserved
      const claudeMdContent = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf8');
      expect(claudeMdContent).toBe(existingContent);
    });

    it('should handle file system errors gracefully', async () => {
      // Use a path that will cause permission errors (assuming typical Unix permissions)
      const restrictedPath = '/root/test-project';

      const result = await enhancedSetup(restrictedPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should create directories recursively', async () => {
      // Setup project in nested path
      const nestedPath = path.join(tempDir, 'deep', 'nested', 'project');
      fs.mkdirSync(nestedPath, { recursive: true });

      const packageJson = { dependencies: { 'express': '^4.18.0' } };
      fs.writeFileSync(path.join(nestedPath, 'package.json'), JSON.stringify(packageJson, null, 2));

      const result = await enhancedSetup(nestedPath);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(nestedPath, '.claude', 'hooks'))).toBe(true);
    });

    it('should generate valid shell script for hooks', async () => {
      // Setup project with multiple linting tools
      const packageJson = {
        dependencies: { 'react': '^18.0.0' },
        devDependencies: { 
          'typescript': '^5.0.0',
          'eslint': '^8.0.0',
          'prettier': '^2.8.0'
        }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const result = await enhancedSetup(tempDir);

      expect(result.success).toBe(true);

      // Verify hook script syntax
      const hookContent = fs.readFileSync(path.join(tempDir, '.claude', 'hooks', 'smart-lint.sh'), 'utf8');
      expect(hookContent).toMatch(/^#!/); // Shebang
      expect(hookContent).toContain('|| exit 1'); // Error handling
      expect(hookContent).toContain('Auto-generated hooks for');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should detect frameworks in under 100ms for typical projects', async () => {
      // Setup medium-complexity project
      const packageJson = {
        dependencies: {
          'react': '^18.0.0',
          'next': '^13.0.0',
          'lodash': '^4.17.21'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'jest': '^29.0.0',
          'eslint': '^8.0.0'
        }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const startTime = performance.now();
      const result = detectFrameworks(tempDir);
      const endTime = performance.now();

      expect(result.primary).toBe('nextjs');
      expect(endTime - startTime).toBeLessThan(100); // Should be under 100ms
    });

    it('should handle large dependency lists efficiently', () => {
      // Create project with many dependencies
      const largeDependencies = {};
      for (let i = 0; i < 100; i++) {
        largeDependencies[`package-${i}`] = '^1.0.0';
      }

      const packageJson = {
        dependencies: {
          'react': '^18.0.0',
          ...largeDependencies
        }
      };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const startTime = performance.now();
      const result = detectFrameworks(tempDir);
      const endTime = performance.now();

      expect(result.frameworks).toContain('react');
      expect(endTime - startTime).toBeLessThan(200); // Should handle large lists efficiently
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle malformed package.json gracefully', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{ "dependencies": { "react": }'); // Invalid JSON

      const result = detectFrameworks(tempDir);
      expect(result.primary).toBe('javascript');
      expect(result.languages).toContain('javascript');
      expect(result.frameworks).toEqual([]);
    });

    it('should handle missing permissions gracefully', async () => {
      // Create a directory structure but make it unwritable
      fs.mkdirSync(path.join(tempDir, 'protected'));
      fs.chmodSync(path.join(tempDir, 'protected'), 0o444); // Read-only

      const packageJson = { dependencies: { 'react': '^18.0.0' } };
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Attempt setup in the protected directory shouldn't crash
      const result = await enhancedSetup(tempDir);
      expect(result).toHaveProperty('success');
      
      // Cleanup
      fs.chmodSync(path.join(tempDir, 'protected'), 0o755);
    });
  });
});