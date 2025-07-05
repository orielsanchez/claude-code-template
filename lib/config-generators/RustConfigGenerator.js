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

    // Rust specific hooks
    const hooks = ['cargo clippy -- -D warnings', 'cargo fmt -- --check'];
    this.addHooks(hooks);

    // Rust specific gitignore
    this.addGitignore(['/target/', 'Cargo.lock']);

    // Rust specific commands
    const commands = {
      dev: 'cargo run',
      test: 'cargo test',
      build: 'cargo build --release'
    };
    this.addCommands(commands);

    // Rust specific Claude.md additions
    if (this.detected.primary === 'rust') {
      this.addClaudeMdAdditions('\n## Rust Development Standards\n\n- Follow Rust idioms and conventions\n- Use proper error handling with Result types\n- Implement comprehensive testing\n');
    }

    return this.config;
  }
}

module.exports = RustConfigGenerator;