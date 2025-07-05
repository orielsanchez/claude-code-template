const { templateManager } = require('./template-manager');

/**
 * Load and process template files with variable substitution
 * Enhanced with caching, better error handling, and validation
 */
function loadTemplate(templateName, variables = {}) {
  const result = templateManager.loadTemplate(templateName, variables);
  
  // For template-loader usage, return content string for generator compatibility
  if (result && typeof result === 'object' && result.content) {
    return result.content;
  }
  
  return result;
}

/**
 * Validate a template exists and get its variables
 */
function validateTemplate(templateName) {
  return templateManager.loader.validateTemplate(templateName);
}

/**
 * Get all variables used in a template
 */
function getTemplateVariables(templateName) {
  return templateManager.getTemplateVariables(templateName);
}

/**
 * Clear template cache
 */
function clearTemplateCache() {
  templateManager.clearCache();
}

/**
 * Get cache statistics
 */
function getTemplateCacheStats() {
  return templateManager.getCacheStats();
}

module.exports = {
  loadTemplate,
  validateTemplate,
  getTemplateVariables,
  clearTemplateCache,
  getTemplateCacheStats
};