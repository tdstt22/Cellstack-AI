/* global setTimeout */
// Mock AI response system for development and testing

const sampleResponses = {
  formulas: [
    {
      pattern: /sum|total|add/i,
      response:
        "I can help you create a SUM formula! Here's a basic example:\n\n```=SUM(A1:A10)```\n\nThis will sum all values in cells A1 through A10. You can modify the range to match your data.",
    },
    {
      pattern: /average|mean/i,
      response:
        "To calculate an average, you can use the AVERAGE function:\n\n```=AVERAGE(B1:B20)```\n\nThis calculates the mean of values in the range B1 to B20. The formula automatically ignores empty cells.",
    },
    {
      pattern: /vlookup|lookup/i,
      response: "VLOOKUP is great for finding data! Here's the syntax:\n\n```=VLOOKUP(lookup_value, table_array, col_index_num, FALSE)```\n\nFor example: `=VLOOKUP(A2, D:F, 2, FALSE)` looks up the value in A2 within columns D to F and returns the value from the 2nd column.",
    },
    {
      pattern: /xlookup/i,
      response: "XLOOKUP is the modern replacement for VLOOKUP:\n\n```=XLOOKUP(lookup_value, lookup_array, return_array)```\n\nExample: `=XLOOKUP(A2, D:D, E:E)` looks up A2 in column D and returns the corresponding value from column E.",
    },
    {
      pattern: /if|condition/i,
      response: "The IF function lets you create conditional logic:\n\n```=IF(condition, value_if_true, value_if_false)```\n\nExample: `=IF(A1>100, \"High\", \"Low\")` returns \"High\" if A1 is greater than 100, otherwise \"Low\".",
    },
    {
      pattern: /count|counting/i,
      response: "Here are useful counting functions:\n\n```=COUNT(A1:A10)```\nCounts numbers only\n\n```=COUNTA(A1:A10)```\nCounts non-empty cells\n\n```=COUNTIF(A1:A10, \">5\")```\nCounts cells meeting a condition",
    },
  ],
  explanations: [
    {
      pattern: /explain|what does|how does/i,
      response: "I'd be happy to explain Excel functions and formulas! Could you share the specific formula you'd like me to explain? You can copy and paste it into the chat, and I'll break down how it works step by step.",
    },
  ],
  errors: [
    {
      pattern: /error|#N\/A|#VALUE|#REF|#DIV|debug|fix/i,
      response: "I can help you troubleshoot Excel errors! Common issues include:\n\n• **#N/A**: Usually from lookup functions not finding a match\n• **#VALUE!**: Wrong data type (text where number expected)\n• **#REF!**: Invalid cell reference (deleted cells)\n• **#DIV/0!**: Division by zero\n\nCould you share the specific error or formula you're having trouble with?",
    },
  ],
  general: [
    {
      pattern: /hello|hi|hey|start/i,
      response: "Hello! I'm Rexcel AI, your Excel assistant. I can help you with:\n\n• Creating and explaining formulas\n• Data analysis and calculations\n• Troubleshooting errors\n• Excel automation tips\n\nWhat would you like to work on today?",
    },
    {
      pattern: /help|what can you do/i,
      response: "I'm here to help with all things Excel! Here's what I can do:\n\n• **Formula Creation**: SUM, AVERAGE, VLOOKUP, IF statements, and more\n• **Data Analysis**: Pivot tables, charts, statistical functions\n• **Error Debugging**: Fix #N/A, #VALUE!, #REF! and other errors\n• **Automation**: Tips for streamlining repetitive tasks\n\nJust describe what you're trying to accomplish, and I'll provide step-by-step guidance!",
    },
  ],
};

const defaultResponses = [
  "That's an interesting question! While I don't have a specific answer ready, I can help you explore Excel solutions. Could you provide more details about what you're trying to accomplish?",
  "I'd be happy to help! For this type of request, it would be helpful to know more about your data structure and what outcome you're looking for.",
  "Great question! Excel has many powerful features for this. Could you share more context about your spreadsheet and what you're trying to achieve?",
];

// Simulate realistic response delays
const getRandomDelay = () => {
  return Math.random() * 2000 + 1000; // 1-3 seconds
};

// Find the best matching response
const findBestResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Check all response categories
  const allCategories = [
    ...sampleResponses.formulas,
    ...sampleResponses.explanations,
    ...sampleResponses.errors,
    ...sampleResponses.general,
  ];
  
  for (const response of allCategories) {
    if (response.pattern.test(message)) {
      return response.response;
    }
  }
  
  // Return random default response if no match found
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Simulate error conditions occasionally
const shouldSimulateError = () => {
  return Math.random() < 0.05; // 5% chance of simulated error
};

// Main mock AI function
export const generateAIResponse = async (userMessage) => {
  // Simulate network delay
  const delay = getRandomDelay();
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Rarely simulate an error
      if (shouldSimulateError()) {
        reject(new Error("AI service temporarily unavailable. Please try again."));
        return;
      }
      
      const response = findBestResponse(userMessage);
      resolve(response);
    }, delay);
  });
};

// Generate a welcome message for new chats
export const getWelcomeMessage = () => {
  return "Hello! I'm Rexcel AI, your intelligent Excel assistant. I'm here to help you with formulas, data analysis, error debugging, and automation. What would you like to work on today?";
};

// Generate example prompts for empty state
export const getExamplePrompts = () => {
  return [
    "Create a SUM formula for my sales data",
    "Explain this VLOOKUP formula",
    "Help me fix #N/A errors",
    "How do I calculate averages?",
    "Create an IF statement for my conditions",
  ];
};