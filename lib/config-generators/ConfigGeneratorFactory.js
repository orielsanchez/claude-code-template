/**
 * Configuration Generator Factory
 * 
 * Selects appropriate configuration generator based on detected languages/frameworks
 */

const JavaScriptConfigGenerator = require('./JavaScriptConfigGenerator');
const PythonConfigGenerator = require('./PythonConfigGenerator');
const RustConfigGenerator = require('./RustConfigGenerator');
const BaseConfigGenerator = require('./BaseConfigGenerator');

class GenericConfigGenerator extends BaseConfigGenerator {
  generate() {
    return this.generateBase();
  }
}

class ConfigGeneratorFactory {
  /**
   * Create appropriate configuration generator based on detection results
   * @param {Object} detected - Detection results from detectFrameworks
   * @returns {BaseConfigGenerator} Appropriate configuration generator
   */
  static create(detected) {
    // Determine primary language ecosystem
    if (detected.languages.includes('javascript') || detected.languages.includes('typescript')) {
      return new JavaScriptConfigGenerator(detected);
    }
    
    if (detected.languages.includes('python')) {
      return new PythonConfigGenerator(detected);
    }
    
    if (detected.languages.includes('rust')) {
      return new RustConfigGenerator(detected);
    }
    
    // Default to generic generator for unknown projects
    return new GenericConfigGenerator(detected);
  }
}

module.exports = ConfigGeneratorFactory;