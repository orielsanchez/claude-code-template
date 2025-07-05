/**
 * Base Configuration Generator
 * 
 * Provides shared configuration logic for all language-specific generators
 */

class BaseConfigGenerator {
  constructor(detected) {
    this.detected = detected;
    this.config = {
      hooks: [],
      claudeMdAdditions: '',
      gitignore: [],
      commands: {}
    };
  }

  /**
   * Generate base gitignore entries common to all projects
   */
  generateBaseGitignore() {
    this.config.gitignore.push('.env', '.DS_Store', '*.log');
  }

  /**
   * Generate base configuration structure
   * @returns {Object} Base configuration object
   */
  generateBase() {
    this.generateBaseGitignore();
    return this.config;
  }

  /**
   * Add language-specific hooks
   * @param {string[]} hooks - Array of hook commands
   */
  addHooks(hooks) {
    this.config.hooks.push(...hooks);
  }

  /**
   * Add language-specific gitignore entries
   * @param {string[]} entries - Array of gitignore patterns
   */
  addGitignore(entries) {
    this.config.gitignore.push(...entries);
  }

  /**
   * Add language-specific commands
   * @param {Object} commands - Command definitions
   */
  addCommands(commands) {
    Object.assign(this.config.commands, commands);
  }

  /**
   * Add Claude.md additions
   * @param {string} additions - Markdown content to add
   */
  addClaudeMdAdditions(additions) {
    this.config.claudeMdAdditions += additions;
  }

  /**
   * Generate complete configuration - must be implemented by subclasses
   * @returns {Object} Complete configuration object
   */
  generate() {
    throw new Error('generate() must be implemented by subclasses');
  }
}

module.exports = BaseConfigGenerator;