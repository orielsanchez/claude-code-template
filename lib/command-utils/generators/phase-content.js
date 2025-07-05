/**
 * Generate phase content sections for workflow commands
 */
function generatePhaseContent(phaseConfig) {
  const { number, name, goal, steps, keyActions, deliverables, learningObjective } = phaseConfig;
  
  let output = `## Phase ${number}: ${name.toUpperCase()}\n\n`;
  output += `**Goal:** ${goal}\n\n`;
  
  // Handle both 'steps' (legacy) and 'keyActions' (new planning format)
  const actions = keyActions || steps || [];
  if (actions.length > 0) {
    if (keyActions) {
      // New planning format - no bold, use "Key Actions" header
      output += `**Key Actions:**\n`;
      actions.forEach((action, index) => {
        output += `${index + 1}. ${action}\n`;
      });
    } else {
      // Legacy format - keep bold formatting for backward compatibility
      actions.forEach((action, index) => {
        output += `${index + 1}. **${action}**\n`;
      });
    }
    output += '\n';
  }
  
  // Add deliverables section for planning phases
  if (deliverables && deliverables.length > 0) {
    output += `**Deliverables:**\n`;
    deliverables.forEach(deliverable => {
      output += `- ${deliverable}\n`;
    });
    output += '\n';
  }
  
  if (learningObjective) {
    output += `**Learning Objective**: ${learningObjective}\n\n`;
  }
  
  return output;
}

module.exports = {
  generatePhaseContent
};