/* eslint-disable no-console */
const Anthropic = require("@anthropic-ai/sdk");

// System prompt from ai.spec.md
const SYSTEM_PROMPT = `You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message

Your response should be in proper Markdown format only.`;

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
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === "sk-ant-replace-with-your-actual-api-key") {
      console.warn(
        "Anthropic API key not configured properly. Please set ANTHROPIC_API_KEY in your .env file."
      );
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
      console.log("Backend Anthropic client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Anthropic client:", error);
    }
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

  // Streaming response generator
  async *streamResponse(userMessage, context = null, existingHistory = []) {
    if (!this.client) {
      throw new Error("AI service not initialized. Please configure your API key.");
    }

    try {
      // Use existing history from frontend if provided, otherwise use internal history
      let messages;
      if (existingHistory && existingHistory.length > 0) {
        // Use the provided history from frontend and add the current user message
        messages = [...existingHistory, {
          role: "user",
          content: userMessage
        }];
        console.log("Backend: Using provided history with", existingHistory.length, "previous messages");
      } else {
        // Fall back to internal history management
        const userMsg = {
          id: Date.now().toString() + "-user",
          type: "user",
          text: userMessage,
          timestamp: new Date().toISOString(),
        };
        this.addToHistory(userMsg);
        messages = this.formatConversationHistory();
        console.log("Backend: Using internal history with", messages.length, "messages");
      }

      // Add context information if provided
      if (context && Object.keys(context).length > 0) {
        const contextualMessage = `${userMessage}\n\n<spreadsheet>\n${JSON.stringify(context, null, 2)}\n</spreadsheet>`;
        // Update the last message in history with context
        messages[messages.length - 1].content = contextualMessage;
      }

      console.log("Backend sending request to Anthropic API:", {
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.max_tokens,
        temperature: LLM_CONFIG.temperature,
        messageCount: messages.length,
        hasContext: !!context
      });

      // Create streaming request
      const stream = this.client.messages.stream({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.max_tokens,
        temperature: LLM_CONFIG.temperature,
        system: SYSTEM_PROMPT,
        messages: messages
      });

      let fullResponse = "";
      const aiMessageId = Date.now().toString() + "-ai";

      // Yield streaming chunks
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text") {
          const chunk = event.delta.text;
          fullResponse += chunk;

          yield {
            id: aiMessageId,
            type: "ai",
            text: chunk,
            isChunk: true,
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Get final message
      const streamFinalMessage = await stream.finalMessage();
      
      // Create AI message object
      const aiMsg = {
        id: aiMessageId,
        type: "ai",
        text: fullResponse,
        timestamp: new Date().toISOString(),
      };

      // Add complete AI response to history only if using internal history management
      if (!existingHistory || existingHistory.length === 0) {
        this.addToHistory(aiMsg);
      }

      // Yield final complete message
      yield {
        ...aiMsg,
        isComplete: true,
      };

      console.log("Backend AI response completed. Length:", fullResponse.length);

    } catch (error) {
      console.error("Backend error in AI service:", error);
      
      // Handle different types of errors
      let errorMessage = "Sorry, I encountered an error. Please try again.";

      if (error.status === 401) {
        errorMessage = "API key is invalid. Please check your configuration.";
      } else if (error.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.status >= 500) {
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      } else if (error.message && error.message.includes("API key")) {
        errorMessage = "Please configure your Anthropic API key in the .env file.";
      }

      yield {
        id: Date.now().toString() + "-ai-error",
        type: "ai",
        text: errorMessage,
        isError: true,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Non-streaming response (fallback method)
  async generateResponse(userMessage, context = null, existingHistory = []) {
    const responses = [];

    for await (const chunk of this.streamResponse(userMessage, context, existingHistory)) {
      responses.push(chunk);
    }

    // Return the last complete response
    const completeResponse = responses.find((r) => r.isComplete) || responses[responses.length - 1];
    return completeResponse?.text || "No response generated";
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