/**
 * Shared Detector Utilities Tests
 * 
 * TDD-first tests for Phase 2 consolidation utilities
 * These tests define the behavior we want before implementation
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Import utilities we're going to create (will fail initially)
const {
  DependencyParserFactory,
  FrameworkDetectionEngine,
  FilePatternMatcher
} = require('../../lib/detectors/shared-detector-utilities');

describe('DependencyParserFactory', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'detector-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('parseConfigFile', () => {
    it('should parse package.json with dependencies and devDependencies', () => {
      const packageJson = {
        dependencies: { react: '^18.0.0', lodash: '^4.17.21' },
        devDependencies: { jest: '^29.0.0', '@types/node': '^18.0.0' }
      };
      const packagePath = path.join(tempDir, 'package.json');
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

      const parser = DependencyParserFactory.create('json');
      const result = parser.parse(packagePath);

      expect(result).toEqual({
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies
      });
    });

    it('should parse Cargo.toml dependencies section', () => {
      const cargoToml = `
[package]
name = "test-project"
version = "0.1.0"

[dependencies]
axum = "0.7.0"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }

[dev-dependencies]
criterion = "0.5"
`;
      const cargoPath = path.join(tempDir, 'Cargo.toml');
      fs.writeFileSync(cargoPath, cargoToml);

      const parser = DependencyParserFactory.create('toml');
      const result = parser.parse(cargoPath);

      expect(result.dependencies).toHaveProperty('axum');
      expect(result.dependencies).toHaveProperty('tokio');
      expect(result.dependencies).toHaveProperty('serde');
      expect(result.devDependencies).toHaveProperty('criterion');
    });

    it('should parse requirements.txt as dependency list', () => {
      const requirements = `
django==4.2.0
flask>=2.0.0
requests~=2.28.0
pytest==7.2.0  # test dependency
`;
      const reqPath = path.join(tempDir, 'requirements.txt');
      fs.writeFileSync(reqPath, requirements);

      const parser = DependencyParserFactory.create('text');
      const result = parser.parse(reqPath);

      expect(result.dependencies).toHaveProperty('django');
      expect(result.dependencies).toHaveProperty('flask');
      expect(result.dependencies).toHaveProperty('requests');
      expect(result.dependencies).toHaveProperty('pytest');
    });

    it('should parse Package.swift dependencies', () => {
      const packageSwift = `
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TestProject",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.0.0"),
        .package(url: "https://github.com/Quick/Quick.git", from: "6.0.0")
    ],
    targets: [
        .target(
            name: "TestProject",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                "Alamofire"
            ]
        )
    ]
)
`;
      const packagePath = path.join(tempDir, 'Package.swift');
      fs.writeFileSync(packagePath, packageSwift);

      const parser = DependencyParserFactory.create('swift');
      const result = parser.parse(packagePath);

      expect(result.dependencies).toHaveProperty('vapor');
      expect(result.dependencies).toHaveProperty('alamofire');
      expect(result.dependencies).toHaveProperty('quick');
    });

    it('should handle missing files gracefully', () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist.json');
      
      const parser = DependencyParserFactory.create('json');
      const result = parser.parse(nonExistentPath);

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      const invalidJson = '{ "dependencies": { "react": "^18.0.0" ';
      const invalidPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(invalidPath, invalidJson);

      const parser = DependencyParserFactory.create('json');
      const result = parser.parse(invalidPath);

      expect(result).toBeNull();
    });

    it('should throw for unsupported parser types', () => {
      expect(() => {
        DependencyParserFactory.create('unsupported');
      }).toThrow('Unsupported parser type: unsupported');
    });
  });
});

describe('FrameworkDetectionEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new FrameworkDetectionEngine();
  });

  describe('detectFrameworks', () => {
    it('should detect primary frameworks with requirements', () => {
      const dependencies = {
        'react': '^18.0.0',
        'next': '^13.0.0',
        'typescript': '^5.0.0'
      };

      const patterns = {
        'react': { framework: 'react', primary: true },
        'next': { framework: 'nextjs', primary: true, requires: ['react'] },
        'typescript': { framework: 'typescript', primary: false }
      };

      const result = engine.detectFrameworks(dependencies, patterns);

      expect(result.frameworks).toContain('react');
      expect(result.frameworks).toContain('nextjs');
      expect(result.frameworks).toContain('typescript');
      expect(result.primary).toBe('nextjs'); // Should prioritize meta-framework
    });

    it('should skip frameworks with unmet requirements', () => {
      const dependencies = {
        'next': '^13.0.0',
        'typescript': '^5.0.0'
      };

      const patterns = {
        'next': { framework: 'nextjs', primary: true, requires: ['react'] },
        'typescript': { framework: 'typescript', primary: false }
      };

      const result = engine.detectFrameworks(dependencies, patterns);

      expect(result.frameworks).not.toContain('nextjs');
      expect(result.frameworks).toContain('typescript');
      expect(result.primary).toBeNull();
    });

    it('should detect test frameworks separately', () => {
      const dependencies = {
        'react': '^18.0.0',
        'jest': '^29.0.0',
        'cypress': '^12.0.0'
      };

      const frameworkPatterns = {
        'react': { framework: 'react', primary: true }
      };

      const testPatterns = {
        'jest': 'jest',
        'cypress': 'cypress'
      };

      const result = engine.detectFrameworks(dependencies, frameworkPatterns, testPatterns);

      expect(result.frameworks).toContain('react');
      expect(result.testFrameworks).toContain('jest');
      expect(result.testFrameworks).toContain('cypress');
    });

    it('should handle empty dependencies', () => {
      const dependencies = {};
      const patterns = {
        'react': { framework: 'react', primary: true }
      };

      const result = engine.detectFrameworks(dependencies, patterns);

      expect(result.frameworks).toHaveLength(0);
      expect(result.testFrameworks).toHaveLength(0);
      expect(result.primary).toBeNull();
    });

    it('should prioritize frameworks by primary flag and order', () => {
      const dependencies = {
        'express': '^4.18.0',
        'fastify': '^4.0.0',
        'react': '^18.0.0'
      };

      const patterns = {
        'express': { framework: 'express', primary: false },
        'fastify': { framework: 'fastify', primary: true },
        'react': { framework: 'react', primary: true }
      };

      const result = engine.detectFrameworks(dependencies, patterns);

      expect(result.frameworks).toContain('express');
      expect(result.frameworks).toContain('fastify');
      expect(result.frameworks).toContain('react');
      expect(result.primary).toBe('fastify'); // First primary framework found
    });
  });

  describe('validateRequirements', () => {
    it('should return true when all requirements are met', () => {
      const dependencies = { 'react': '^18.0.0', 'typescript': '^5.0.0' };
      const requirements = ['react', 'typescript'];

      const isValid = engine.validateRequirements(requirements, dependencies);

      expect(isValid).toBe(true);
    });

    it('should return false when requirements are missing', () => {
      const dependencies = { 'typescript': '^5.0.0' };
      const requirements = ['react', 'typescript'];

      const isValid = engine.validateRequirements(requirements, dependencies);

      expect(isValid).toBe(false);
    });

    it('should return true when no requirements specified', () => {
      const dependencies = { 'react': '^18.0.0' };
      const requirements = undefined;

      const isValid = engine.validateRequirements(requirements, dependencies);

      expect(isValid).toBe(true);
    });
  });
});

describe('FilePatternMatcher', () => {
  let tempDir;
  let matcher;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pattern-test-'));
    matcher = new FilePatternMatcher();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('findConfigFiles', () => {
    it('should find exact file matches', () => {
      const files = ['package.json', 'tsconfig.json', 'README.md'];
      files.forEach(file => {
        fs.writeFileSync(path.join(tempDir, file), '{}');
      });

      const patterns = ['package.json', 'tsconfig.json'];
      const found = matcher.findConfigFiles(tempDir, patterns);

      expect(found).toContain('package.json');
      expect(found).toContain('tsconfig.json');
      expect(found).not.toContain('README.md');
    });

    it('should find glob pattern matches', () => {
      const xcodeProject = path.join(tempDir, 'TestProject.xcodeproj');
      const xcodeWorkspace = path.join(tempDir, 'TestProject.xcworkspace');
      fs.mkdirSync(xcodeProject);
      fs.mkdirSync(xcodeWorkspace);
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '{}');

      const patterns = ['*.xcodeproj', '*.xcworkspace', 'Package.swift'];
      const found = matcher.findConfigFiles(tempDir, patterns);

      expect(found).toContain('TestProject.xcodeproj');
      expect(found).toContain('TestProject.xcworkspace');
      expect(found).toContain('Package.swift');
    });

    it('should handle nested directory patterns', () => {
      const cargoDir = path.join(tempDir, '.cargo');
      fs.mkdirSync(cargoDir);
      fs.writeFileSync(path.join(cargoDir, 'config.toml'), '{}');
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '{}');

      const patterns = ['Cargo.toml', '.cargo/config.toml'];
      const found = matcher.findConfigFiles(tempDir, patterns);

      expect(found).toContain('Cargo.toml');
      expect(found).toContain('.cargo/config.toml');
    });

    it('should return empty array when no patterns match', () => {
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');

      const patterns = ['package.json', 'Cargo.toml'];
      const found = matcher.findConfigFiles(tempDir, patterns);

      expect(found).toHaveLength(0);
    });

    it('should handle non-existent directory gracefully', () => {
      const nonExistentDir = path.join(tempDir, 'does-not-exist');
      const patterns = ['package.json'];

      const found = matcher.findConfigFiles(nonExistentDir, patterns);

      expect(found).toHaveLength(0);
    });
  });

  describe('batchFileExists', () => {
    it('should check multiple files efficiently', () => {
      const files = ['exists1.txt', 'exists2.txt'];
      files.forEach(file => {
        fs.writeFileSync(path.join(tempDir, file), 'content');
      });

      const checkFiles = [
        path.join(tempDir, 'exists1.txt'),
        path.join(tempDir, 'exists2.txt'),
        path.join(tempDir, 'missing.txt')
      ];

      const results = matcher.batchFileExists(checkFiles);

      expect(results[checkFiles[0]]).toBe(true);
      expect(results[checkFiles[1]]).toBe(true);
      expect(results[checkFiles[2]]).toBe(false);
    });

    it('should handle empty file list', () => {
      const results = matcher.batchFileExists([]);

      expect(results).toEqual({});
    });
  });
});

describe('Integration Tests', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect Next.js project with TypeScript correctly', () => {
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

    const parser = DependencyParserFactory.create('json');
    const dependencies = parser.parse(path.join(tempDir, 'package.json'));
    
    const patterns = {
      'react': { framework: 'react', primary: true },
      'next': { framework: 'nextjs', primary: true, requires: ['react'] },
      'typescript': { framework: 'typescript', primary: false }
    };

    const testPatterns = {
      'jest': 'jest'
    };

    const engine = new FrameworkDetectionEngine();
    const allDeps = { ...dependencies.dependencies, ...dependencies.devDependencies };
    const result = engine.detectFrameworks(allDeps, patterns, testPatterns);

    expect(result.frameworks).toContain('react');
    expect(result.frameworks).toContain('nextjs');
    expect(result.frameworks).toContain('typescript');
    expect(result.testFrameworks).toContain('jest');
    expect(result.primary).toBe('nextjs');
  });
});