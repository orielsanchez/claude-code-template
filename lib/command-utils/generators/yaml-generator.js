const { generateHeader } = require('./command-header');

class YamlGenerator {
  static generate(config) {
    return generateHeader({
      allowedTools: config.allowedTools || 'all',
      description: config.description,
      customFields: config.customFields || {}
    });
  }
}

module.exports = YamlGenerator;