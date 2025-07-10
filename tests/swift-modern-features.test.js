/**
 * Swift 6 & Modern Features Enhancement Tests
 * 
 * RED phase tests for cutting-edge Swift 6 and modern framework detection
 * Target: Detect Swift 6 concurrency, SwiftUI modern patterns, testing frameworks
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the Swift detector and config generator
const { detectSwiftProject } = require('../lib/detectors/SwiftDetector');
const SwiftConfigGenerator = require('../lib/config-generators/SwiftConfigGenerator');

describe('Swift 6 & Modern Features Enhancement', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swift6-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Swift 6 Concurrency Detection', () => {
    it('should detect Swift 6 async/await patterns', () => {
      // Create modern Swift 6 async code
      const swiftCode = `
import Foundation

@MainActor
class DataManager: ObservableObject {
    @Published var data: [String] = []
    
    func loadData() async throws {
        let url = URL(string: "https://api.example.com/data")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let decoded = try JSONDecoder().decode([String].self, from: data)
        
        await MainActor.run {
            self.data = decoded
        }
    }
}

actor NetworkCache {
    private var cache: [String: Data] = [:]
    
    func store(_ data: Data, for key: String) {
        cache[key] = data
    }
    
    func retrieve(for key: String) -> Data? {
        return cache[key]
    }
}
`;

      fs.writeFileSync(path.join(tempDir, 'DataManager.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      // Should detect Swift 6 concurrency features
      expect(result.frameworks).toContain('swift-concurrency');
      expect(result.frameworks).toContain('mainactor');
      expect(result.frameworks).toContain('actor-model');
    });

    it('should detect TaskGroup and structured concurrency', () => {
      const swiftCode = `
import Foundation

func processMultipleURLs(_ urls: [URL]) async throws -> [Data] {
    return try await withThrowingTaskGroup(of: Data.self) { group in
        for url in urls {
            group.addTask {
                let (data, _) = try await URLSession.shared.data(from: url)
                return data
            }
        }
        
        var results: [Data] = []
        for try await result in group {
            results.append(result)
        }
        return results
    }
}

@TaskLocal static var requestID: UUID?
`;

      fs.writeFileSync(path.join(tempDir, 'ConcurrentProcessor.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('task-group');
      expect(result.frameworks).toContain('task-local');
      expect(result.frameworks).toContain('structured-concurrency');
    });

    it('should detect AsyncSequence and AsyncIterator patterns', () => {
      const swiftCode = `
import Foundation

struct NumberStream: AsyncSequence {
    typealias Element = Int
    
    func makeAsyncIterator() -> AsyncIterator {
        AsyncIterator()
    }
    
    struct AsyncIterator: AsyncIteratorProtocol {
        private var current = 0
        
        mutating func next() async -> Int? {
            await Task.sleep(nanoseconds: 100_000_000) // 0.1 second
            current += 1
            return current <= 10 ? current : nil
        }
    }
}

// Usage with async for-in
func processNumbers() async {
    for await number in NumberStream() {
        print("Processing: \\(number)")
    }
}
`;

      fs.writeFileSync(path.join(tempDir, 'AsyncStream.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('async-sequence');
      expect(result.frameworks).toContain('async-iterator');
    });
  });

  describe('SwiftUI Modern Patterns Detection', () => {
    it('should detect SwiftUI with Observation framework', () => {
      const swiftCode = `
import SwiftUI
import Observation

@Observable
class AppModel {
    var name: String = ""
    var isLoading: Bool = false
    
    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        
        // Simulate network call
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        name = "Updated"
    }
}

struct ContentView: View {
    @State private var model = AppModel()
    
    var body: some View {
        VStack {
            Text("Hello, \\(model.name)!")
            
            if model.isLoading {
                ProgressView()
            }
            
            Button("Refresh") {
                Task {
                    await model.refresh()
                }
            }
        }
        .animation(.easeInOut, value: model.isLoading)
    }
}

#Preview {
    ContentView()
}
`;

      fs.writeFileSync(path.join(tempDir, 'ContentView.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('swiftui');
      expect(result.frameworks).toContain('observation');
      expect(result.frameworks).toContain('swiftui-previews');
    });

    it('should detect SwiftData integration', () => {
      const swiftCode = `
import SwiftUI
import SwiftData

@Model
class Recipe {
    var name: String
    var ingredients: [String]
    var instructions: String
    var dateCreated: Date
    
    init(name: String, ingredients: [String], instructions: String) {
        self.name = name
        self.ingredients = ingredients
        self.instructions = instructions
        self.dateCreated = Date()
    }
}

@main
struct RecipeApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: Recipe.self)
    }
}
`;

      fs.writeFileSync(path.join(tempDir, 'RecipeApp.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('swiftdata');
      expect(result.frameworks).toContain('swiftui');
    });

    it('should detect TipKit integration', () => {
      const swiftCode = `
import SwiftUI
import TipKit

struct AddRecipeTip: Tip {
    var title: Text {
        Text("Add Your First Recipe")
    }
    
    var message: Text? {
        Text("Tap the + button to add a new recipe to your collection.")
    }
    
    var image: Image? {
        Image(systemName: "plus.circle")
    }
}

struct RecipeListView: View {
    private let addRecipeTip = AddRecipeTip()
    
    var body: some View {
        NavigationView {
            VStack {
                TipView(addRecipeTip)
                    .tipBackground(.regularMaterial)
                
                // Recipe list content
            }
        }
        .task {
            try? Tips.configure([
                .displayFrequency(.immediate),
                .datastoreLocation(.applicationDefault)
            ])
        }
    }
}
`;

      fs.writeFileSync(path.join(tempDir, 'TipKitExample.swift'), swiftCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('tipkit');
      expect(result.frameworks).toContain('swiftui');
    });
  });

  describe('Modern Testing Framework Detection', () => {
    it('should detect swift-testing framework', () => {
      const packageSwift = `
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ModernApp",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-testing.git", from: "0.5.0")
    ],
    targets: [
        .target(name: "ModernApp"),
        .testTarget(
            name: "ModernAppTests",
            dependencies: [
                "ModernApp",
                .product(name: "Testing", package: "swift-testing")
            ]
        )
    ]
)
`;

      const testCode = `
import Testing
import Foundation
@testable import ModernApp

@Test("User creation with valid data")
func testUserCreation() async throws {
    let user = try await UserService.createUser(name: "John", email: "john@example.com")
    #expect(user.name == "John")
    #expect(user.email == "john@example.com")
}

@Test("User validation", arguments: [
    ("", "invalid"),
    ("john", "john@example.com"),
    ("jane", "jane@example.com")
])
func testUserValidation(name: String, email: String) throws {
    let isValid = UserValidator.validate(name: name, email: email)
    if name.isEmpty {
        #expect(!isValid)
    } else {
        #expect(isValid)
    }
}

@Suite("Network Tests")
struct NetworkTests {
    @Test("API response parsing")
    func testAPIResponse() async throws {
        let response = try await APIClient.fetchUser(id: 123)
        #expect(response.id == 123)
    }
}
`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      fs.mkdirSync(path.join(tempDir, 'Tests', 'ModernAppTests'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'Tests', 'ModernAppTests', 'UserTests.swift'), testCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.testFrameworks).toContain('swift-testing');
      expect(result.frameworks).toContain('modern-testing');
    });

    it('should detect XCTest vs swift-testing preference', () => {
      const mixedTestCode = `
import XCTest
import Testing
@testable import ModernApp

// Legacy XCTest
class LegacyUserTests: XCTestCase {
    func testUserCreation() {
        let user = User(name: "John")
        XCTAssertEqual(user.name, "John")
    }
}

// Modern swift-testing
@Test("Modern user creation")
func testModernUserCreation() async throws {
    let user = try await UserService.createUser(name: "Jane")
    #expect(user.name == "Jane")
}
`;

      fs.mkdirSync(path.join(tempDir, 'Tests'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'Tests', 'MixedTests.swift'), mixedTestCode);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.testFrameworks).toContain('swift-testing');
      expect(result.testFrameworks).toContain('xctest');
      expect(result.frameworks).toContain('mixed-testing');
    });
  });

  describe('Swift Package Manager Modern Features', () => {
    it('should detect Swift Package Manager plugins', () => {
      const packageSwift = `
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ModernPackage",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "ModernPackage", targets: ["ModernPackage"]),
        .plugin(name: "CodeGenPlugin", targets: ["CodeGenPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-docc-plugin", from: "1.0.0"),
        .package(url: "https://github.com/apple/swift-format.git", from: "509.0.0")
    ],
    targets: [
        .target(name: "ModernPackage"),
        .plugin(
            name: "CodeGenPlugin",
            capability: .buildTool(),
            dependencies: []
        ),
        .testTarget(
            name: "ModernPackageTests",
            dependencies: ["ModernPackage"]
        )
    ]
)
`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('spm-plugins');
      expect(result.frameworks).toContain('swift-docc');
      expect(result.frameworks).toContain('swift-format');
      expect(result.tools).toContain('build-plugins');
    });

    it('should detect Swift 6 language mode', () => {
      const packageSwift = `
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Swift6Project",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
        .tvOS(.v17)
    ],
    targets: [
        .target(
            name: "Swift6Project",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableUpcomingFeature("BareSlashRegexLiterals"),
                .enableExperimentalFeature("AccessLevelOnImport")
            ]
        )
    ]
)
`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);

      expect(result.frameworks).toContain('swift-6-mode');
      expect(result.frameworks).toContain('strict-concurrency');
      expect(result.frameworks).toContain('experimental-features');
    });
  });

  describe('Configuration Generation for Modern Features', () => {
    it('should generate Swift 6 specific configuration', () => {
      const detected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: ['swiftui', 'swift-concurrency', 'swift-testing', 'swift-6-mode'],
        testFrameworks: ['swift-testing'],
        tools: ['swift-package-manager'],
        bundlers: []
      };

      const generator = new SwiftConfigGenerator(detected);
      const config = generator.generate();

      // Should include Swift 6 specific hooks
      expect(config.hooks).toContain('swift build -Xswiftc -strict-concurrency=complete');
      expect(config.hooks).toContain('swift test --enable-code-coverage');
      
      // Should include modern commands
      expect(config.commands).toHaveProperty('test-swift-testing');
      expect(config.commands).toHaveProperty('preview-docs');
      expect(config.commands).toHaveProperty('generate-docc');
      
      // Should include SwiftUI specific additions
      expect(config.claudeMdAdditions).toContain('SwiftUI');
      expect(config.claudeMdAdditions).toContain('Swift 6');
      expect(config.claudeMdAdditions).toContain('Concurrency');
    });

    it('should generate different config for legacy vs modern Swift', () => {
      const modernDetected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: ['swift-6-mode', 'swift-testing'],
        testFrameworks: ['swift-testing'],
        tools: ['swift-package-manager']
      };

      const legacyDetected = {
        primary: 'swift',
        languages: ['swift'],
        frameworks: ['swift-5-mode'],
        testFrameworks: ['xctest'],
        tools: ['swift-package-manager']
      };

      const modernConfig = new SwiftConfigGenerator(modernDetected).generate();
      const legacyConfig = new SwiftConfigGenerator(legacyDetected).generate();

      // Modern should have Swift 6 features
      expect(modernConfig.hooks).toContain('swift build -Xswiftc -strict-concurrency=complete');
      
      // Legacy should not have Swift 6 strict concurrency
      expect(legacyConfig.hooks).not.toContain('swift build -Xswiftc -strict-concurrency=complete');
    });
  });

  describe('Performance and Integration', () => {
    it('should detect modern Swift features efficiently', () => {
      // Create a complex modern Swift project
      const packageSwift = `
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ComplexModernApp",
    platforms: [.iOS(.v17), .macOS(.v14)],
    dependencies: [
        .package(url: "https://github.com/apple/swift-testing.git", from: "0.5.0"),
        .package(url: "https://github.com/apple/swift-docc-plugin", from: "1.0.0")
    ]
)
`;

      const modernSwiftCode = `
import SwiftUI
import SwiftData
import Observation

@Observable
@MainActor
class AppState {
    var data: [Item] = []
    
    func loadData() async throws {
        // Modern async/await pattern
    }
}

actor DataCache {
    // Actor model
}

#Preview {
    ContentView()
}
`;

      fs.writeFileSync(path.join(tempDir, 'Package.swift'), packageSwift);
      fs.writeFileSync(path.join(tempDir, 'App.swift'), modernSwiftCode);

      const start = Date.now();
      const result = { languages: [], frameworks: [], tools: [], testFrameworks: [], bundlers: [] };
      detectSwiftProject(tempDir, result);
      const elapsed = Date.now() - start;

      // Should detect efficiently (under 100ms)
      expect(elapsed).toBeLessThan(100);
      
      // Should detect all modern features
      expect(result.frameworks).toContain('swiftui');
      expect(result.frameworks).toContain('observation');
      expect(result.frameworks).toContain('swift-concurrency');
      expect(result.frameworks).toContain('mainactor');
    });
  });
});