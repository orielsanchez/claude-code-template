/**
 * Configuration Generator Factory
 * 
 * Selects appropriate configuration generator based on detected languages/frameworks
 */

const JavaScriptConfigGenerator = require('./JavaScriptConfigGenerator');
const PythonConfigGenerator = require('./PythonConfigGenerator');
const RustConfigGenerator = require('./RustConfigGenerator');
const SwiftConfigGenerator = require('./SwiftConfigGenerator');
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
    // Use primary language if available, otherwise fall back to detection order
    const primaryLanguage = detected.primary || detected.languages[0] || 'generic';
    
    // Create generator based on primary language
    switch (primaryLanguage) {
      case 'javascript':
      case 'typescript':
        return new JavaScriptConfigGenerator(detected);
      
      case 'python':
        return new PythonConfigGenerator(detected);
      
      case 'rust':
        return new RustConfigGenerator(detected);
      
      case 'swift':
        return new SwiftConfigGenerator(detected);
      
      default:
        // Fallback to language detection order for backward compatibility
        if (detected.languages.includes('javascript') || detected.languages.includes('typescript')) {
          return new JavaScriptConfigGenerator(detected);
        }
        
        if (detected.languages.includes('python')) {
          return new PythonConfigGenerator(detected);
        }
        
        if (detected.languages.includes('rust')) {
          return new RustConfigGenerator(detected);
        }
        
        if (detected.languages.includes('swift')) {
          return new SwiftConfigGenerator(detected);
        }
        
        // Default to generic generator for unknown projects
        return new GenericConfigGenerator(detected);
    }
  }
}

module.exports = ConfigGeneratorFactory;