/**
 * Swift Detector Tests
 * 
 * Tests for SwiftDetector functionality
 */

const { SwiftDetector, detectSwiftProject } = require('../lib/detectors/SwiftDetector');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('SwiftDetector', () => {
  let tempDir;
  let detector;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swift-detector-test-'));
    detector = new SwiftDetector();
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Package.swift detection', () => {
    test('should detect Swift Package Manager project', () => {
      const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MySwiftPackage",
    platforms: [
        .macOS(.v10_15),
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "MySwiftPackage",
            targets: ["MySwiftPackage"]),
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/apple/swift-testing.git", from: "0.1.0")
    ],
    targets: [
        .target(
            name: "MySwiftPackage",
            dependencies: [
                .product(name: "Vapor", package: "vapor")
            ]),
        .testTarget(
            name: "MySwiftPackageTests",
            dependencies: ["MySwiftPackage", "swift-testing"]),
    ]
)`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      
      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(true);
      expect(result.languages).toContain('swift');
      expect(result.tools).toContain('swift-package-manager');
      expect(result.tools).toContain('swift-compiler');
      expect(result.frameworks).toContain('vapor');
      expect(result.frameworks).toContain('swift-testing');
      expect(result.primary).toBe('swift');
    });

    test('should parse complex Package.swift dependencies', () => {
      const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ComplexSwiftPackage",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.0.0"),
        .package(url: "https://github.com/apple/swift-nio.git", from: "2.0.0"),
        .package(url: "https://github.com/realm/realm-swift.git", from: "10.0.0")
    ],
    targets: [
        .target(
            name: "ComplexSwiftPackage",
            dependencies: [
                "Vapor",
                "Alamofire", 
                .product(name: "NIO", package: "swift-nio"),
                .product(name: "RealmSwift", package: "realm-swift")
            ]),
    ]
)`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      
      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.frameworks).toContain('vapor');
      expect(result.frameworks).toContain('alamofire');
      expect(result.frameworks).toContain('swift-nio');
      expect(result.frameworks).toContain('realm-swift');
    });
  });

  describe('Xcode project detection', () => {
    test('should detect Xcode project files', () => {
      // Create mock .xcodeproj directory
      const xcodeProjDir = path.join(tempDir, 'TestProject.xcodeproj');
      fs.mkdirSync(xcodeProjDir);
      fs.writeFileSync(path.join(xcodeProjDir, 'project.pbxproj'), '// Mock Xcode project file');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(true);
      expect(result.languages).toContain('swift');
      expect(result.tools).toContain('xcode');
      expect(result.tools).toContain('swift-compiler');
      expect(result.primary).toBe('swift');
    });

    test('should detect Xcode workspace files', () => {
      // Create mock .xcworkspace directory
      const xcworkspaceDir = path.join(tempDir, 'TestWorkspace.xcworkspace');
      fs.mkdirSync(xcworkspaceDir);
      fs.writeFileSync(path.join(xcworkspaceDir, 'contents.xcworkspacedata'), '<?xml version="1.0" encoding="UTF-8"?>');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(true);
      expect(result.languages).toContain('swift');
      expect(result.tools).toContain('xcode');
    });
  });

  describe('Swift source file analysis', () => {
    test('should detect frameworks from import statements', () => {
      // Create Sources directory and Swift files
      const sourcesDir = path.join(tempDir, 'Sources');
      fs.mkdirSync(sourcesDir, { recursive: true });

      const swiftContent = `import Foundation
import SwiftUI
import Combine
import UIKit
import Vapor

struct ContentView: View {
    var body: some View {
        Text("Hello, Swift!")
    }
}`;

      fs.writeFileSync(path.join(sourcesDir, 'ContentView.swift'), swiftContent);
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9\nimport PackageDescription');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.frameworks).toContain('foundation');
      expect(result.frameworks).toContain('swiftui');
      expect(result.frameworks).toContain('combine');
      expect(result.frameworks).toContain('uikit');
      expect(result.frameworks).toContain('vapor');
    });
  });

  describe('Additional tool detection', () => {
    test('should detect SwiftLint configuration', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, '.swiftlint.yml'), 'disabled_rules:\n  - line_length');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.tools).toContain('swiftlint');
    });

    test('should detect SwiftFormat configuration', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, '.swiftformat'), '--swiftversion 5.9');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.tools).toContain('swiftformat');
    });

    test('should detect CocoaPods configuration', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, 'Podfile'), 'platform :ios, "13.0"');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.tools).toContain('cocoapods');
    });

    test('should detect Carthage configuration', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');
      fs.writeFileSync(path.join(tempDir, 'Cartfile'), 'github "Alamofire/Alamofire" ~> 5.0');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.tools).toContain('carthage');
    });
  });

  describe('Edge cases', () => {
    test('should handle non-Swift projects gracefully', () => {
      // Create a non-Swift project
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name": "test"}');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(false);
      expect(result.languages).not.toContain('swift');
    });

    test('should handle invalid Package.swift gracefully', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), 'invalid swift content');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(true);
      expect(result.languages).toContain('swift');
      // Should still detect as Swift project even with invalid Package.swift
    });

    test('should handle directory access errors gracefully', () => {
      // Create a directory we can't read
      const restrictedDir = path.join(tempDir, 'restricted');
      fs.mkdirSync(restrictedDir);
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');

      // Try to change permissions (may not work on all systems)
      try {
        fs.chmodSync(restrictedDir, 0o000);
      } catch (error) {
        // Skip this test if we can't change permissions
        return;
      }

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      const detected = detector.detect(tempDir, result);

      expect(detected).toBe(true);
      expect(result.languages).toContain('swift');

      // Restore permissions for cleanup
      try {
        fs.chmodSync(restrictedDir, 0o755);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
  });

  describe('backward compatibility function', () => {
    test('detectSwiftProject function should work', () => {
      fs.writeFileSync(path.join(tempDir, 'Package.swift'), '// swift-tools-version: 5.9');

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detectSwiftProject(tempDir, result);

      expect(result.languages).toContain('swift');
      expect(result.tools).toContain('swift-package-manager');
      expect(result.primary).toBe('swift');
    });
  });

  describe('framework pattern matching', () => {
    test('should match framework patterns correctly', () => {
      const packageSwift = `dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/apple/swift-testing.git", from: "0.1.0"),
        .package(url: "https://github.com/ReactiveX/RxSwift.git", from: "6.0.0")
      ]`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);

      const result = {
        primary: 'generic',
        languages: [],
        frameworks: [],
        tools: [],
        testFrameworks: [],
        bundlers: []
      };

      detector.detect(tempDir, result);

      expect(result.frameworks).toContain('vapor');
      expect(result.frameworks).toContain('swift-testing');
      expect(result.frameworks).toContain('rxswift');
    });
  });
});