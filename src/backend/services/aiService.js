// LLM Configuration as per ai.spec.md
const LLM_CONFIG = {
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  temperature: 0,
};

class AIService {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
    this.initializeClient();
  }

  initializeClient() {
    // Do nothing unitl we migrate LLM call into AIService
  }

  // Convert UI messages to Anthropic format
  formatConversationHistory() {
    return this.conversationHistory.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.text,
    }));
  }

  // Add message to conversation history
  addToHistory(message) {
    this.conversationHistory.push({
      id: message.id || Date.now().toString(),
      type: message.type,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString(),
    });
  }

  // Clear conversation history (for new sessions)
  clearHistory() {
    this.conversationHistory = [];
    console.log("Conversation history cleared");
  }
  
  // Get conversation history
  getConversationHistory() {
    return [...this.conversationHistory];
  }

  // Check if service is ready
  isReady() {
    return this.client !== null;
  }

  // Get service status for health checks
  getStatus() {
    return {
      ready: this.isReady(),
      apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
      conversationCount: this.conversationHistory.length,
      model: LLM_CONFIG.model,
      lastActivity: this.conversationHistory.length > 0 
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp 
        : null
    };
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;