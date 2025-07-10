/**
 * Rust Configuration Generator
 * 
 * Generates configuration for Rust projects
 */

const BaseConfigGenerator = require('./BaseConfigGenerator');

class RustConfigGenerator extends BaseConfigGenerator {
  /**
   * Generate Rust specific configuration
   * @returns {Object} Complete configuration object
   */
  generate() {
    // Start with base configuration
    this.generateBase();

    // Handle null/undefined detected objects gracefully
    if (!this.detected) {
      return this.config;
    }

    // Modern Rust 2025 hooks with AI-enhanced tooling
    const hooks = [
      'cargo clippy -- -D warnings -D clippy::all -D clippy::pedantic',
      'cargo fmt -- --check',
      'cargo check --all-targets --all-features',
      'cargo nextest run --all-targets --all-features || cargo test --all-targets --all-features',
      'cargo audit || echo "cargo-audit not installed, skipping security audit"',
      'cargo deny check || echo "cargo-deny not installed, skipping license check"'
    ];
    this.addHooks(hooks);

    // Comprehensive Rust gitignore
    this.addGitignore([
      '/target/',
      'Cargo.lock',
      '*.pdb',
      '.cargo/',
      'flamegraph.svg',
      'perf.data*'
    ]);

    // Modern Rust 2025 commands with AI-enhanced tooling
    const commands = {
      dev: 'cargo run',
      'dev-watch': 'cargo watch -x run',
      test: 'cargo nextest run --all-features',
      'test-legacy': 'cargo test --all-features',
      'test-watch': 'cargo watch -x "nextest run --all-features"',
      build: 'cargo build --release --all-features',
      lint: 'cargo clippy --all-targets --all-features -- -D warnings',
      format: 'cargo fmt',
      'format-check': 'cargo fmt -- --check',
      bench: 'cargo bench',
      doc: 'cargo doc --open --all-features',
      audit: 'cargo audit',
      outdated: 'cargo outdated',
      clean: 'cargo clean',
      coverage: 'cargo llvm-cov nextest --all-features --html',
      flamegraph: 'cargo flamegraph',
      'setup-tools': 'cargo install cargo-nextest cargo-llvm-cov cargo-audit cargo-deny cargo-flamegraph'
    };
    this.addCommands(commands);

    // Modern Rust 2025 Claude.md additions with comprehensive best practices
    if (this.detected.primary === 'rust') {
      this.addClaudeMdAdditions(`
## Rust 2025 Edition Development Standards (July 2025)

### Core Principles
- **Edition**: Use Rust 2024 edition with minimum version 1.85 (async closures stabilized Feb 2025)
- **Error Handling**: Use \`Result<T, E>\` and \`Option<T>\` - NO \`unwrap()\`, \`expect()\`, or \`panic!()\` in production
- **Async First**: Prefer async patterns with Tokio runtime and modern async closures
- **Zero-Cost Abstractions**: Leverage Rust's type system for compile-time guarantees

### Modern Rust Patterns (2025)
- **Error Handling**: Use \`anyhow\` for applications, \`thiserror\` for libraries
- **Async Closures**: Use stabilized \`async || {}\` syntax (Rust 1.85+) - no explicit move needed
- **Pattern Matching**: Use improved pattern matching with lifetime capture
- **Prelude**: \`Future\` and \`IntoFuture\` are now in prelude
- **Async Iterators**: Use \`futures::stream::iter().then(async |item| ...).collect().await\`

### Recommended Crate Stack (2025 Expert Practices)
- **Web**: Axum 0.8+ (expert choice) with tower-http 0.6+ middleware
- **Async Runtime**: Tokio 1.0+ with full features
- **Serialization**: Serde with derive features
- **CLI**: Clap 4.0+ with derive API
- **Testing**: cargo-nextest (modern runner) + rstest + criterion + cargo-llvm-cov
- **Database**: SQLx for async database operations
- **Development**: cargo-watch, cargo-flamegraph for profiling

### Code Quality Standards (2025)
- **Testing**: Use \`cargo nextest run\` (modern test runner with leak detection)
- **Clippy**: Use \`clippy::all\` and \`clippy::pedantic\` lints
- **Formatting**: Strict rustfmt with 2024 style edition
- **Coverage**: Use \`cargo llvm-cov nextest --html\` for test coverage
- **Documentation**: All public APIs must have doc comments
- **Security**: Regular \`cargo audit\` and \`cargo deny check\` for vulnerabilities
- **Profiling**: Use \`cargo flamegraph\` for performance analysis

### rust-analyzer 2025 Features (v0.3.2482+)
- **Struct Padding Analysis**: Hover on structs to see memory layout and padding
- **Cfg-Aware Imports**: Intelligent import handling for conditional compilation
- **Enhanced Macro Resolution**: Better IDE support for complex macros
- **Performance Improvements**: Faster completion and better memory usage

### IDE Setup (VS Code / RustRover)
\`\`\`json
// settings.json for VS Code with rust-analyzer 2025
{
  "rust-analyzer.experimental.procAttrMacros": true,
  "rust-analyzer.cargo.features": "all",
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.completion.addCallParentheses": true,
  "rust-analyzer.hover.memoryLayout.enable": true
}
\`\`\`

### Setup Commands (run once per project)
\`\`\`bash
# Install modern Rust 2025 tooling
cargo install cargo-nextest cargo-llvm-cov cargo-audit cargo-deny cargo-flamegraph cargo-watch
\`\`\`

### Project Structure
\`\`\`
src/
├── main.rs              # Binary entry point
├── lib.rs               # Library root
├── error.rs             # Error types (using thiserror)
├── config.rs            # Configuration management
├── handlers/            # Request handlers (for web apps)
├── models/              # Data models
├── services/            # Business logic
└── utils/               # Utility functions

tests/
├── integration/         # Integration tests
└── common/              # Test utilities
\`\`\`

### Performance & Safety
- **Memory Safety**: Leverage borrow checker, avoid unsafe unless absolutely necessary
- **Concurrency**: Use Rayon for CPU-bound parallelism, Tokio for I/O concurrency
- **Profiling**: Use \`cargo flamegraph\` and Tokio Console for performance analysis
- **Optimization**: Profile-guided optimization for production builds

### CI/CD Integration
- Run \`cargo fmt --check\` for formatting
- Run \`cargo clippy -- -D warnings\` for linting
- Run \`cargo test --all-features\` for testing
- Run \`cargo audit\` for security scanning
- Use \`cargo-deny\` for license and security policies
`);
    }

    return this.config;
  }
}

module.exports = RustConfigGenerator;