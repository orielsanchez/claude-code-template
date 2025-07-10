/**
 * Swift Configuration Generator Tests
 * 
 * Tests for SwiftConfigGenerator functionality
 */

const SwiftConfigGenerator = require('../lib/config-generators/SwiftConfigGenerator');

describe('SwiftConfigGenerator', () => {
  let generator;
  let mockDetected;

  beforeEach(() => {
    mockDetected = {
      primary: 'swift',
      languages: ['swift'],
      frameworks: ['vapor', 'swiftui'],
      tools: ['swift-package-manager', 'swiftlint'],
      testFrameworks: ['swift-testing'],
      bundlers: []
    };
    generator = new SwiftConfigGenerator(mockDetected);
  });

  describe('basic configuration generation', () => {
    test('should generate basic Swift configuration', () => {
      const config = generator.generate();

      expect(config).toBeDefined();
      expect(config.hooks).toBeDefined();
      expect(config.gitignore).toBeDefined();
      expect(config.commands).toBeDefined();
    });

    test('should include Swift-specific hooks', () => {
      const config = generator.generate();

      expect(config.hooks).toContain('swiftlint lint --strict');
      expect(config.hooks).toContain('swiftformat --lint .');
      expect(config.hooks).toContain('swift build --build-tests');
      expect(config.hooks).toContain('swift test');
      expect(config.hooks).toContain('swift package resolve');
    });

    test('should include Swift-specific gitignore patterns', () => {
      const config = generator.generate();

      expect(config.gitignore).toContain('.build/');
      expect(config.gitignore).toContain('*.xcodeproj/xcuserdata/');
      expect(config.gitignore).toContain('*.xcworkspace/xcuserdata/');
      expect(config.gitignore).toContain('DerivedData/');
      expect(config.gitignore).toContain('.swiftpm/');
      expect(config.gitignore).toContain('Package.resolved');
    });

    test('should include Swift development commands', () => {
      const config = generator.generate();

      expect(config.commands.dev).toBe('swift run');
      expect(config.commands.test).toBe('swift test');
      expect(config.commands.build).toBe('swift build -c release');
      expect(config.commands.lint).toBe('swiftlint lint --strict');
      expect(config.commands.format).toBe('swiftformat .');
      expect(config.commands.clean).toBe('swift package clean');
    });
  });

  describe('Swift Package Manager specific configuration', () => {
    test('should generate SPM-specific configuration', () => {
      const config = generator.generateSPMConfig();

      expect(config.commands['spm-init']).toBe('swift package init');
      expect(config.commands['spm-init-executable']).toBe('swift package init --type executable');
      expect(config.commands['spm-init-library']).toBe('swift package init --type library');
      expect(config.commands['spm-tools-version']).toBe('swift package tools-version');
    });
  });

  describe('Xcode project specific configuration', () => {
    test('should generate Xcode-specific configuration', () => {
      const config = generator.generateXcodeConfig();

      expect(config.gitignore).toContain('*.xcodeproj/project.xcworkspace/');
      expect(config.gitignore).toContain('UserInterfaceState.xcuserstate');
      expect(config.gitignore).toContain('build/');
      expect(config.gitignore).toContain('IDEWorkspaceChecks.plist');

      expect(config.commands['xcode-build']).toBeDefined();
      expect(config.commands['xcode-test']).toBeDefined();
      expect(config.commands['xcode-clean']).toBeDefined();
    });
  });

  describe('iOS/macOS app specific configuration', () => {
    test('should generate app-specific configuration', () => {
      const config = generator.generateAppConfig();

      expect(config.gitignore).toContain('*.app');
      expect(config.gitignore).toContain('*.ipa');
      expect(config.gitignore).toContain('Pods/');
      expect(config.gitignore).toContain('Podfile.lock');
      expect(config.gitignore).toContain('Carthage/Build/');

      expect(config.commands['ios-simulator']).toBeDefined();
      expect(config.commands['device-list']).toBeDefined();
      expect(config.commands['install-pods']).toBeDefined();
    });
  });

  describe('framework-specific configurations', () => {
    test('should add Vapor-specific configuration', () => {
      const mockVaporDetected = {
        ...mockDetected,
        frameworks: ['vapor']
      };
      const vaporGenerator = new SwiftConfigGenerator(mockVaporDetected);
      const config = vaporGenerator.generateFrameworkSpecificConfig(['vapor']);

      expect(config.commands['vapor-serve']).toBe('swift run App serve');
      expect(config.commands['vapor-migrate']).toBe('swift run App migrate');
      expect(config.commands['vapor-revert']).toBe('swift run App migrate --revert');
      expect(config.commands['vapor-routes']).toBe('swift run App routes');

      expect(config.gitignore).toContain('.env');
      expect(config.gitignore).toContain('.env.*');
      expect(config.gitignore).toContain('Public/uploads/');
    });

    test('should add SwiftUI-specific configuration', () => {
      const mockSwiftUIDetected = {
        ...mockDetected,
        frameworks: ['swiftui']
      };
      const swiftUIGenerator = new SwiftConfigGenerator(mockSwiftUIDetected);
      const config = swiftUIGenerator.generateFrameworkSpecificConfig(['swiftui']);

      expect(config.commands.preview).toBeDefined();
      expect(config.commands['ui-test']).toBeDefined();
    });

    test('should add swift-testing configuration', () => {
      const mockTestingDetected = {
        ...mockDetected,
        frameworks: ['swift-testing']
      };
      const testingGenerator = new SwiftConfigGenerator(mockTestingDetected);
      const config = testingGenerator.generateFrameworkSpecificConfig(['swift-testing']);

      expect(config.commands['test-modern']).toBe('swift test --enable-experimental-swift-testing');
      expect(config.commands['test-filter']).toBe('swift test --filter');
    });
  });

  describe('quality standards and tooling', () => {
    test('should include linting configuration', () => {
      const config = generator.generate();

      expect(config.linting).toBeDefined();
      expect(config.linting.swiftlint).toBeDefined();
      expect(config.linting.swiftlint.configFile).toBe('.swiftlint.yml');
      expect(config.linting.swiftformat).toBeDefined();
      expect(config.linting.swiftformat.configFile).toBe('.swiftformat');
    });

    test('should include tooling requirements', () => {
      const config = generator.generate();

      expect(config.tooling).toBeDefined();
      expect(config.tooling.requirements).toContain('swift (>= 5.9)');
      expect(config.tooling.requirements).toContain('swiftlint (recommended)');
      expect(config.tooling.requirements).toContain('swiftformat (recommended)');
    });

    test('should include quality standards', () => {
      const config = generator.generate();

      expect(config.quality).toBeDefined();
      expect(config.quality.standards).toContain('Swift 6 concurrency safety');
      expect(config.quality.standards).toContain('Memory safety guarantees');
      expect(config.quality.standards).toContain('Comprehensive test coverage');
      expect(config.quality.standards).toContain('SwiftLint rule compliance');
    });

    test('should include project structure recommendations', () => {
      const config = generator.generate();

      expect(config.project).toBeDefined();
      expect(config.project.structure).toBeDefined();
      expect(config.project.structure['Package.swift']).toBe('Swift Package Manager manifest');
      expect(config.project.structure['Sources/']).toBe('Source code directory');
      expect(config.project.structure['Tests/']).toBe('Test files directory');
    });
  });

  describe('command variations', () => {
    test('should include development and build commands', () => {
      const config = generator.generate();

      expect(config.commands.dev).toBe('swift run');
      expect(config.commands['dev-watch']).toContain('swift run --watch');
      expect(config.commands.build).toBe('swift build -c release');
      expect(config.commands['build-debug']).toBe('swift build');
      expect(config.commands['build-verbose']).toBe('swift build --verbose');
    });

    test('should include testing commands', () => {
      const config = generator.generate();

      expect(config.commands.test).toBe('swift test');
      expect(config.commands['test-watch']).toContain('swift test --watch');
      expect(config.commands['test-parallel']).toBe('swift test --parallel');
    });

    test('should include linting and formatting commands', () => {
      const config = generator.generate();

      expect(config.commands.lint).toBe('swiftlint lint --strict');
      expect(config.commands['lint-fix']).toBe('swiftlint lint --fix');
      expect(config.commands.format).toBe('swiftformat .');
      expect(config.commands['format-check']).toBe('swiftformat --lint .');
    });

    test('should include package management commands', () => {
      const config = generator.generate();

      expect(config.commands.clean).toBe('swift package clean');
      expect(config.commands.reset).toBe('swift package reset');
      expect(config.commands.resolve).toBe('swift package resolve');
      expect(config.commands.update).toBe('swift package update');
      expect(config.commands['show-dependencies']).toBe('swift package show-dependencies');
    });
  });

  describe('helper methods', () => {
    test('should add linting configuration correctly', () => {
      generator.addLintingConfig({
        customLinter: {
          configFile: '.custom-lint.yml',
          rules: ['custom rule']
        }
      });

      expect(generator.config.linting.customLinter).toBeDefined();
      expect(generator.config.linting.customLinter.configFile).toBe('.custom-lint.yml');
    });

    test('should add tooling requirements correctly', () => {
      generator.addToolingRequirements(['swift 6.0', 'custom-tool']);

      expect(generator.config.tooling.requirements).toContain('swift 6.0');
      expect(generator.config.tooling.requirements).toContain('custom-tool');
    });

    test('should add quality standards correctly', () => {
      generator.addQualityStandards(['custom standard']);

      expect(generator.config.quality.standards).toContain('custom standard');
    });

    test('should add project structure correctly', () => {
      generator.addProjectStructure({
        'custom/': 'Custom directory'
      });

      expect(generator.config.project.structure['custom/']).toBe('Custom directory');
    });
  });

  describe('configuration inheritance', () => {
    test('should inherit from BaseConfigGenerator', () => {
      const config = generator.generate();

      // Should have base configuration properties
      expect(config.hooks).toBeDefined();
      expect(config.gitignore).toBeDefined();
      expect(config.commands).toBeDefined();
    });

    test('should override base commands with Swift-specific ones', () => {
      const config = generator.generate();

      // Swift-specific commands should override or extend base commands
      expect(config.commands.dev).toBe('swift run');
      expect(config.commands.test).toBe('swift test');
      expect(config.commands.build).toBe('swift build -c release');
    });
  });
});