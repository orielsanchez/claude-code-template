/**
 * Swift Configuration Generator
 * 
 * Generates configuration for Swift projects
 */

const BaseConfigGenerator = require('./BaseConfigGenerator');

class SwiftConfigGenerator extends BaseConfigGenerator {
  /**
   * Generate Swift specific configuration
   * @returns {Object} Complete configuration object
   */
  generate() {
    // Start with base configuration
    this.generateBase();

    // Modern Swift 2025 hooks with comprehensive tooling
    const hooks = [
      'swiftlint lint --strict',
      'swiftformat --lint .',
      'swift build --build-tests',
      'swift test',
      'swift package resolve',
      'swift package show-dependencies || echo "Not a Swift package, skipping dependency check"'
    ];
    this.addHooks(hooks);

    // Comprehensive Swift gitignore
    this.addGitignore([
      '.build/',
      '*.xcodeproj/xcuserdata/',
      '*.xcworkspace/xcuserdata/',
      '*.xcuserdatad',
      'DerivedData/',
      '*.hmap',
      '*.ipa',
      '*.dSYM.zip',
      '*.dSYM',
      'timeline.xctimeline',
      'playground.xcworkspace',
      '.swiftpm/',
      'Package.resolved',
      '.DS_Store'
    ]);

    // Modern Swift 2025 commands with comprehensive tooling
    const commands = {
      dev: 'swift run',
      'dev-watch': 'swift run --watch || echo "Install swift-watch for file watching"',
      test: 'swift test',
      'test-watch': 'swift test --watch || echo "Install swift-watch for test watching"',
      'test-parallel': 'swift test --parallel',
      build: 'swift build -c release',
      'build-debug': 'swift build',
      'build-verbose': 'swift build --verbose',
      lint: 'swiftlint lint --strict',
      'lint-fix': 'swiftlint lint --fix',
      format: 'swiftformat .',
      'format-check': 'swiftformat --lint .',
      clean: 'swift package clean',
      reset: 'swift package reset',
      resolve: 'swift package resolve',
      update: 'swift package update',
      'show-dependencies': 'swift package show-dependencies',
      'generate-xcodeproj': 'swift package generate-xcodeproj',
      'dump-package': 'swift package dump-package',
      archive: 'swift build -c release --arch arm64 --arch x86_64 || swift build -c release',
      'security-audit': 'swift package show-dependencies | grep -i security || echo "Manual security review recommended"'
    };
    this.addCommands(commands);

    // Swift-specific linting configuration
    this.addLintingConfig({
      swiftlint: {
        configFile: '.swiftlint.yml',
        rules: [
          'strict mode enabled',
          'line length: 120',
          'comprehensive rules'
        ]
      },
      swiftformat: {
        configFile: '.swiftformat',
        rules: [
          'consistent formatting',
          'modern Swift style'
        ]
      }
    });

    // Swift tooling requirements
    this.addToolingRequirements([
      'swift (>= 5.9)',
      'swiftlint (recommended)',
      'swiftformat (recommended)',
      'xcode (for iOS/macOS development)',
      'swift-testing (for modern testing)'
    ]);

    // Swift quality standards
    this.addQualityStandards([
      'Swift 6 concurrency safety',
      'Memory safety guarantees', 
      'Comprehensive test coverage',
      'SwiftLint rule compliance',
      'Consistent code formatting',
      'Package.swift best practices'
    ]);

    // Swift project structure recommendations
    this.addProjectStructure({
      'Package.swift': 'Swift Package Manager manifest',
      'Sources/': 'Source code directory',
      'Tests/': 'Test files directory',
      'README.md': 'Project documentation',
      '.swiftlint.yml': 'SwiftLint configuration',
      '.swiftformat': 'SwiftFormat configuration',
      '.gitignore': 'Git ignore patterns'
    });

    return this.config;
  }

  /**
   * Generate Swift Package Manager specific configuration
   * @returns {Object} SPM-focused configuration
   */
  generateSPMConfig() {
    this.generate();
    
    // Add SPM-specific commands
    const spmCommands = {
      'spm-init': 'swift package init',
      'spm-init-executable': 'swift package init --type executable',
      'spm-init-library': 'swift package init --type library',
      'spm-edit': 'swift package edit',
      'spm-unedit': 'swift package unedit',
      'spm-tools-version': 'swift package tools-version'
    };
    this.addCommands(spmCommands);

    return this.config;
  }

  /**
   * Generate Xcode project specific configuration
   * @returns {Object} Xcode-focused configuration
   */
  generateXcodeConfig() {
    this.generate();
    
    // Add Xcode-specific gitignore patterns
    this.addGitignore([
      '*.xcodeproj/project.xcworkspace/',
      '*.xcodeproj/xcuserdata/',
      '*.xcworkspace/xcuserdata/',
      'UserInterfaceState.xcuserstate',
      'project.xcworkspace/',
      'xcuserdata/',
      'build/',
      'IDEWorkspaceChecks.plist'
    ]);

    // Add Xcode-specific commands
    const xcodeCommands = {
      'xcode-build': 'xcodebuild -scheme YourScheme -configuration Release',
      'xcode-test': 'xcodebuild test -scheme YourScheme',
      'xcode-clean': 'xcodebuild clean',
      'xcode-archive': 'xcodebuild archive -scheme YourScheme',
      'xcode-analyze': 'xcodebuild analyze -scheme YourScheme'
    };
    this.addCommands(xcodeCommands);

    return this.config;
  }

  /**
   * Generate iOS/macOS app specific configuration
   * @returns {Object} App-focused configuration
   */
  generateAppConfig() {
    this.generateXcodeConfig();
    
    // Add app-specific gitignore patterns
    this.addGitignore([
      '*.app',
      '*.ipa',
      'Pods/',
      'Podfile.lock',
      'Carthage/Build/',
      'fastlane/report.xml',
      'fastlane/Preview.html',
      'fastlane/screenshots/**/*.png',
      'fastlane/test_output'
    ]);

    // Add app development commands
    const appCommands = {
      'ios-simulator': 'xcrun simctl boot "iPhone 15" && open -a Simulator',
      'device-list': 'xcrun simctl list devices',
      'reset-simulator': 'xcrun simctl erase all',
      'install-pods': 'pod install',
      'update-pods': 'pod update',
      'fastlane-setup': 'fastlane init'
    };
    this.addCommands(appCommands);

    return this.config;
  }

  /**
   * Add Swift-specific linting configuration
   * @param {Object} lintConfig - Linting configuration object
   */
  addLintingConfig(lintConfig) {
    if (!this.config.linting) {
      this.config.linting = {};
    }
    Object.assign(this.config.linting, lintConfig);
  }

  /**
   * Add Swift tooling requirements
   * @param {Array} requirements - Array of required tools
   */
  addToolingRequirements(requirements) {
    if (!this.config.tooling) {
      this.config.tooling = {};
    }
    this.config.tooling.requirements = requirements;
  }

  /**
   * Add Swift quality standards
   * @param {Array} standards - Array of quality standards
   */
  addQualityStandards(standards) {
    if (!this.config.quality) {
      this.config.quality = {};
    }
    this.config.quality.standards = standards;
  }

  /**
   * Add Swift project structure recommendations
   * @param {Object} structure - Project structure object
   */
  addProjectStructure(structure) {
    if (!this.config.project) {
      this.config.project = {};
    }
    this.config.project.structure = structure;
  }

  /**
   * Generate configuration based on detected Swift frameworks
   * @param {Array} frameworks - Detected frameworks
   * @returns {Object} Framework-specific configuration
   */
  generateFrameworkSpecificConfig(frameworks) {
    this.generate();

    if (frameworks.includes('vapor')) {
      this.addVaporConfig();
    }
    
    if (frameworks.includes('swiftui')) {
      this.addSwiftUIConfig();
    }
    
    if (frameworks.includes('swift-testing')) {
      this.addModernTestingConfig();
    }

    return this.config;
  }

  /**
   * Add Vapor-specific configuration
   */
  addVaporConfig() {
    const vaporCommands = {
      'vapor-serve': 'swift run App serve',
      'vapor-migrate': 'swift run App migrate',
      'vapor-revert': 'swift run App migrate --revert',
      'vapor-routes': 'swift run App routes'
    };
    this.addCommands(vaporCommands);

    this.addGitignore([
      '.env',
      '.env.*',
      'Public/uploads/',
      'logs/'
    ]);
  }

  /**
   * Add SwiftUI-specific configuration
   */
  addSwiftUIConfig() {
    const swiftUICommands = {
      'preview': 'open -a "Xcode" . && echo "Use Xcode previews for SwiftUI"',
      'ui-test': 'xcodebuild test -scheme YourScheme -destination "platform=iOS Simulator,name=iPhone 15"'
    };
    this.addCommands(swiftUICommands);
  }

  /**
   * Add modern Swift Testing framework configuration
   */
  addModernTestingConfig() {
    const testingCommands = {
      'test-modern': 'swift test --enable-experimental-swift-testing',
      'test-filter': 'swift test --filter'
    };
    this.addCommands(testingCommands);
  }
}

module.exports = SwiftConfigGenerator;