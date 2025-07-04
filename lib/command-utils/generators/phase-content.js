/**
 * Generate phase content sections for workflow commands
 */
function generatePhaseContent(phaseConfig) {
  const { number, name, goal, steps, learningObjective } = phaseConfig;
  
  let output = `## Phase ${number}: ${name.toUpperCase()}\n\n`;
  output += `**Goal:** ${goal}\n\n`;
  
  if (steps && steps.length > 0) {
    steps.forEach((step, index) => {
      output += `${index + 1}. **${step}**\n`;
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