/**
 * Swift Integration Tests
 * 
 * Tests for Swift integration with the overall system
 */

const { detectFrameworks } = require('../lib/detectors/index');
const ConfigGeneratorFactory = require('../lib/config-generators/ConfigGeneratorFactory');
const SwiftConfigGenerator = require('../lib/config-generators/SwiftConfigGenerator');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Swift Integration', () => {
  let tempDir;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swift-integration-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('framework detection integration', () => {
    test('should detect Swift projects through main detection system', () => {
      // Create a Swift Package Manager project
      const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TestPackage",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0")
    ]
)`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('swift');
      expect(result.primary).toBe('swift');
      expect(result.frameworks).toContain('vapor');
      expect(result.tools).toContain('swift-package-manager');
    });

    test('should handle Swift in multi-language projects', () => {
      // Create a multi-language project with Swift and JavaScript
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name": "test", "version": "1.0.0"}');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('swift');
      expect(result.languages).toContain('javascript');
      // Primary should be the first detected language (implementation dependent)
      expect(['swift', 'javascript']).toContain(result.primary);
    });

    test('should detect Xcode projects through main detection system', () => {
      // Create mock Xcode project
      const xcodeProjDir = path.join(tempDir, 'TestApp.xcodeproj');
      fs.mkdirSync(xcodeProjDir);
      fs.writeFileSync(path.join(xcodeProjDir, 'project.pbxproj'), '// Mock Xcode project');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('swift');
      expect(result.primary).toBe('swift');
      expect(result.tools).toContain('xcode');
    });
  });

  describe('configuration factory integration', () => {
    test('should create SwiftConfigGenerator for Swift projects', () => {
      const mockDetected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: ['vapor'],
        tools: ['swift-package-manager'],
        testFrameworks: [],
        bundlers: []
      };

      const generator = ConfigGeneratorFactory.create(mockDetected);

      expect(generator).toBeInstanceOf(SwiftConfigGenerator);
    });

    test('should prioritize Swift in mixed-language projects', () => {
      const mockDetected = {
        primary: 'swift',
        languages: ['swift', 'javascript'],
        frameworks: ['vapor', 'express'],
        tools: ['swift-package-manager', 'npm'],
        testFrameworks: [],
        bundlers: []
      };

      const generator = ConfigGeneratorFactory.create(mockDetected);

      // Should create SwiftConfigGenerator since swift is primary
      expect(generator).toBeInstanceOf(SwiftConfigGenerator);
    });

    test('should generate complete configuration for Swift projects', () => {
      const mockDetected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: ['vapor', 'swiftui'],
        tools: ['swift-package-manager', 'swiftlint'],
        testFrameworks: ['swift-testing'],
        bundlers: []
      };

      const generator = ConfigGeneratorFactory.create(mockDetected);
      const config = generator.generate();

      expect(config).toBeDefined();
      expect(config.hooks).toBeDefined();
      expect(config.hooks).toContain('swiftlint lint --strict');
      expect(config.commands).toBeDefined();
      expect(config.commands.dev).toBe('swift run');
      expect(config.gitignore).toBeDefined();
      expect(config.gitignore).toContain('.build/');
    });
  });

  describe('ecosystem detection integration', () => {
    test('should properly categorize Swift as separate ecosystem', () => {
      // Test through the main detection flow
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name": "test"}');
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "test"');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('swift');
      expect(result.languages).toContain('javascript');
      expect(result.languages).toContain('rust');
      
      // Should handle multi-ecosystem project correctly
      expect(result.languages.length).toBeGreaterThan(1);
    });
  });

  describe('end-to-end workflow', () => {
    test('should complete full Swift project setup workflow', () => {
      // 1. Create Swift project
      const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FullWorkflowTest",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/apple/swift-testing.git", from: "0.1.0")
    ],
    targets: [
        .target(name: "FullWorkflowTest", dependencies: ["Vapor"]),
        .testTarget(name: "FullWorkflowTestTests", dependencies: ["FullWorkflowTest", "swift-testing"])
    ]
)`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      fs.writeFileSync(path.join(tempDir, '.swiftlint.yml'), 'disabled_rules: []');

      // 2. Detect project
      const detected = detectFrameworks(tempDir);

      expect(detected.languages).toContain('swift');
      expect(detected.frameworks).toContain('vapor');
      expect(detected.frameworks).toContain('swift-testing');
      expect(detected.tools).toContain('swift-package-manager');
      expect(detected.tools).toContain('swiftlint');

      // 3. Generate configuration
      const generator = ConfigGeneratorFactory.create(detected);
      const config = generator.generateFrameworkSpecificConfig(detected.frameworks);

      // 4. Verify complete configuration
      expect(config.hooks).toContain('swiftlint lint --strict');
      expect(config.hooks).toContain('swift test');
      expect(config.commands['vapor-serve']).toBe('swift run App serve');
      expect(config.commands['test-modern']).toBe('swift test --enable-experimental-swift-testing');
      expect(config.gitignore).toContain('.build/');
      expect(config.gitignore).toContain('.env');
    });

    test('should handle Xcode + CocoaPods project workflow', () => {
      // 1. Create Xcode project with CocoaPods
      const xcodeProjDir = path.join(tempDir, 'iOSApp.xcodeproj');
      fs.mkdirSync(xcodeProjDir);
      fs.writeFileSync(path.join(xcodeProjDir, 'project.pbxproj'), '// Mock iOS project');
      
      fs.writeFileSync(path.join(tempDir, 'Podfile'), `platform :ios, '13.0'
target 'iOSApp' do
  use_frameworks!
  pod 'Alamofire', '~> 5.0'
end`);

      // 2. Detect project
      const detected = detectFrameworks(tempDir);

      expect(detected.languages).toContain('swift');
      expect(detected.tools).toContain('xcode');
      expect(detected.tools).toContain('cocoapods');

      // 3. Generate app-specific configuration
      const generator = ConfigGeneratorFactory.create(detected);
      const config = generator.generateAppConfig();

      // 4. Verify app configuration
      expect(config.gitignore).toContain('Pods/');
      expect(config.gitignore).toContain('*.ipa');
      expect(config.commands['install-pods']).toBe('pod install');
      expect(config.commands['ios-simulator']).toBeDefined();
    });
  });

  describe('error handling integration', () => {
    test('should handle detection errors gracefully', () => {
      // Create a corrupted Swift project
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), 'corrupted content that is not valid swift');

      const result = detectFrameworks(tempDir);

      // Should still detect as Swift project but handle parsing errors gracefully
      expect(result.languages).toContain('swift');
    });

    test('should handle missing configuration gracefully', () => {
      const mockDetected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const generator = ConfigGeneratorFactory.create(mockDetected);
      const config = generator.generate();

      // Should generate basic configuration even without detected frameworks
      expect(config).toBeDefined();
      expect(config.hooks).toBeDefined();
      expect(config.commands).toBeDefined();
    });
  });

  describe('performance integration', () => {
    test('should detect Swift projects efficiently', () => {
      // Create a project with many files
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      
      const sourcesDir = path.join(tempDir, 'Sources');
      fs.mkdirSync(sourcesDir);
      
      // Create multiple Swift files
      for (let i = 0; i < 50; i++) {
        fs.writeFileSync(path.join(sourcesDir, `File${i}.swift`), `// Swift file ${i}\nimport Foundation`);
      }

      const startTime = Date.now();
      const result = detectFrameworks(tempDir);
      const endTime = Date.now();

      expect(result.languages).toContain('swift');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('compatibility with existing languages', () => {
    test('should not interfere with JavaScript detection', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name": "test", "dependencies": {"express": "^4.0.0"}}');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('javascript');
      expect(result.frameworks).toContain('express');
      expect(result.tools).toContain('npm');
    });

    test('should not interfere with Python detection', () => {
      fs.writeFileSync(path.join(tempDir, 'requirements.txt'), 'django==4.0.0');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('python');
      expect(result.tools).toContain('pip');
      // Note: Django framework detection from requirements.txt is not implemented in existing codebase
    });

    test('should not interfere with Rust detection', () => {
      fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), '[package]\nname = "test"\n[dependencies]\naxum = "0.6"');

      const result = detectFrameworks(tempDir);

      expect(result.languages).toContain('rust');
      expect(result.frameworks).toContain('axum');
      expect(result.tools).toContain('cargo');
    });
  });
});