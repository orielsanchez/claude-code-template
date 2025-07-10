const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('../../shared/logger');

class EnhancedTemplateLoader {
  constructor() {
    this.logger = createContextualLogger('EnhancedTemplateLoader');
    this.cache = new Map();
    this.templateDir = __dirname;
  }

  loadTemplate(templateName, variables = {}) {
    const content = this.getTemplateContent(templateName);
    return this.processVariables(content, variables);
  }

  getTemplateContent(templateName) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    const templatePath = path.join(this.templateDir, `${templateName}.md`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName} at ${templatePath}`);
    }

    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      this.cache.set(templateName, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to read template ${templateName}: ${error.message}`);
    }
  }

  processVariables(content, variables) {
    let processed = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      
      if (Array.isArray(value)) {
        processed = this.processArrayVariable(processed, key, value, regex);
      } else if (this.isEmptyValue(value)) {
        processed = this.removeEmptyVariable(processed, key);
      } else {
        processed = processed.replace(regex, String(value));
      }
    });

    return processed;
  }

  processArrayVariable(content, key, value, regex) {
    if (key === 'phaseSteps') {
      const numberedSteps = value.map((step, index) => `${index + 1}. ${step}`).join('\n');
      return content.replace(regex, numberedSteps);
    } else if (value.length === 0) {
      return this.removeEmptyVariable(content, key);
    } else {
      return content.replace(regex, value.join(','));
    }
  }

  removeEmptyVariable(content, key) {
    return content.replace(new RegExp(`\\n?{{${key}}}\\n?`, 'g'), '');
  }

  isEmptyValue(value) {
    return value === '' || value === null || value === undefined;
  }

  clearCache() {
    this.cache.clear();
  }

  preloadTemplates(templateNames) {
    templateNames.forEach(name => {
      try {
        this.getTemplateContent(name);
      } catch (error) {
        this.logger.warn('Failed to preload template', {
          operation: 'preloadTemplate',
          templateName: name,
          errorMessage: error.message
        });
      }
    });
  }

  validateTemplate(templateName) {
    try {
      const content = this.getTemplateContent(templateName);
      const variables = this.extractVariables(content);
      return { valid: true, variables };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  extractVariables(content) {
    const variableRegex = /{{([^}]+)}}/g;
    const variables = new Set();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }
}

const templateLoader = new EnhancedTemplateLoader();

function loadTemplate(templateName, variables = {}) {
  return templateLoader.loadTemplate(templateName, variables);
}

module.exports = {
  loadTemplate,
  EnhancedTemplateLoader,
  templateLoader
};