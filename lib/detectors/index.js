/**
 * Framework Detection Orchestrator
 * 
 * Coordinates all language-specific detectors and handles multi-language projects
 */

const { detectJavaScriptProject } = require('./javascript');
const { detectPythonProject } = require('./python');
const { detectRustProject } = require('./rust');

/**
 * Detect ecosystem types in project for multi-language handling
 * @param {Object} result - Detection result with languages populated
 * @returns {Set<string>} Set of detected ecosystems
 */
function detectEcosystems(result) {
  const ecosystems = new Set();
  
  if (result.languages.includes('javascript') || result.languages.includes('typescript')) {
    ecosystems.add('js');
  }
  if (result.languages.includes('python')) {
    ecosystems.add('python');
  }
  if (result.languages.includes('rust')) {
    ecosystems.add('rust');
  }
  
  return ecosystems;
}

/**
 * Handle multi-language project primary resolution
 * @param {Object} result - Detection result object to modify
 */
function resolveMultiLanguagePrimary(result) {
  const ecosystems = detectEcosystems(result);
  
  // For true multi-language projects (different ecosystems), prioritize the first language
  // JavaScript + TypeScript is not considered multi-language (same ecosystem)
  if (ecosystems.size > 1) {
    result.primary = result.languages[0];
  }
}

/**
 * Create initial detection result structure
 * @returns {Object} Empty detection result
 */
function createDetectionResult() {
  return {
    primary: 'generic',
    languages: [],
    frameworks: [],
    tools: [],
    testFrameworks: [],
    bundlers: []
  };
}

/**
 * Detect frameworks and tools in a project directory
 * @param {string} projectPath - Path to project directory
 * @returns {Object} Detection results
 */
function detectFrameworks(projectPath) {
  const result = createDetectionResult();

  try {
    // Run all language-specific detectors
    detectJavaScriptProject(projectPath, result);
    detectPythonProject(projectPath, result);
    detectRustProject(projectPath, result);
    
    // Handle multi-language projects
    resolveMultiLanguagePrimary(result);

  } catch (error) {
    // Framework detection failed, return default result
  }

  return result;
}

module.exports = {
  detectFrameworks,
  // Export individual components for testing
  detectEcosystems,
  resolveMultiLanguagePrimary,
  createDetectionResult
};