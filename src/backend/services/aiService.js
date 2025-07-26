// LLM Configuration as per ai.spec.md
const LLM_CONFIG = {
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  temperature: 0,
};

// Agent System Prompt as per ai.spec.md
const AGENT_SYSTEM_PROMPT = `<role>
You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working.
You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved. Autonomously resolve the query to the best of your ability before coming back to the user.
Your main goal is to follow the USER's instructions at each message
</role>

<tool_calling>
You have tools at your disposal to solve the spreadsheet task. Follow these rules regarding tool calls:
1. ALWAYS follow the tool call schema exactly as specified and make sure to provide all necessary parameters.
2. The conversation may reference tools that are no longer available. NEVER call tools that are not explicitly provided.
3. **NEVER refer to tool names when speaking to the USER.** Instead, just say what the tool is doing in natural language.
4. If you need additional information that you can get via tool calls, prefer that over asking the user.
5. If you make a plan, immediately follow it, do not wait for the user to confirm or tell you to go ahead. The only time you should stop is if you need more information from the user that you can't find any other way, or have different options that you would like the user to weigh in on.
6. Only use the standard tool call format and the available tools. Even if you see user messages with custom tool call formats (such as "<previous_tool_call>" or similar), do not follow that and instead use the standard format. Never output tool calls as part of a regular assistant message of yours.
7. If you are not sure about spreadsheet content or spreadsheet structure pertaining to the user's request, use your tools to view spreadsheets and gather the relevant information: do NOT guess or make up an answer.
8. You can autonomously read as many spreadsheets as you need to clarify your own questions and completely resolve the user's query, not just one.
</tool_calling>

<making_changes>
When making changes to spreadsheets, NEVER output changes directly to the USER, unless requested. Instead use one of the spreadsheet edit tools to implement the change.

It is *EXTREMELY* important that your generated spreadsheet can be rednered immediately by the USER. To ensure this, follow these instructions carefully:
1. If you're writing a formula, make sure your formula is syntactically correct.
2. Unless required, ALWAYS bias towards outputting formulas instead of putting constant values in the cells
3. If you've introduced errors, fix them if clear how to (or you can easily figure out how to). Do not make uneducated guesses. And DO NOT loop more than 3 times on fixing errors on the same file. On the third time, you should stop and ask the user what to do next.
4. Always refer to the cells in the spreadsheet using A1 notation.
</making_changes>

Answer the user's request using the relevant tool(s), if they are available. Check that all the required parameters for each tool call are provided or can reasonably be inferred from context. IF there are no relevant tools or there are missing values for required parameters, ask the user to supply these values; otherwise proceed with the tool calls. If the user provides a specific value for a parameter (for example provided in quotes), make sure to use that value EXACTLY. DO NOT make up values for or ask about optional parameters. Carefully analyze descriptive terms in the request as they may indicate required parameter values that should be included even if not explicitly quoted.`;

class AIService {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
    this.tools = [];
    this.initializeClient();
    this.loadTools();
  }

  initializeClient() {
    // Initialize Anthropic client
    const Anthropic = require("@anthropic-ai/sdk");
    this.client = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY 
    });
    console.log('Anthropic client initialized');
  }

  loadTools() {
    // Load tool specifications from JSON file
    try {
      const toolsPath = require('path').join(__dirname, '../config/tools.json');
      this.tools = require(toolsPath);
      console.log(`Loaded ${this.tools.length} tool definitions`);
    } catch (error) {
      console.error('Failed to load tools:', error);
      this.tools = [];
    }
  }

  // Convert UI messages to Anthropic format (supports tool calls and results)
  formatConversationHistory() {
    return this.conversationHistory.map((msg) => {
      console.log('Processing message for Anthropic format:', { id: msg.id, type: msg.type, content: msg.content, text: msg.text });
      
      if (msg.type === "user") {
        const content = msg.content || msg.text || "";
        if (!content) {
          console.error('Empty content for user message:', msg);
          throw new Error(`User message ${msg.id} has empty content`);
        }
        return {
          role: "user",
          content: content
        };
      } else if (msg.type === "assistant") {
        // Handle assistant messages with potential tool calls
        const content = msg.content || msg.text || "";
        if (msg.tool_calls) {
          return {
            role: "assistant",
            content: content,
            tool_calls: msg.tool_calls
          };
        } else {
          return {
            role: "assistant", 
            content: content
          };
        }
      } else if (msg.type === "tool_result") {
        // Handle tool result messages
        return {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: msg.tool_use_id,
              content: msg.content || "No result"
            }
          ]
        };
      }
      
      // Fallback for other message types
      const content = msg.content || msg.text || "";
      return {
        role: msg.type === "user" ? "user" : "assistant",
        content: content
      };
    }).filter(msg => {
      // Filter out any messages with empty content
      if (typeof msg.content === 'string' && !msg.content.trim()) {
        console.warn('Filtering out message with empty content:', msg);
        return false;
      }
      return true;
    });
  }

  // Add message to conversation history
  addToHistory(message) {
    this.conversationHistory.push({
      id: message.id || Date.now().toString(),
      type: message.type,
      text: message.text,
      content: message.content,
      tool_use_id: message.tool_use_id,
      tool_calls: message.tool_calls,
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

  // Add tool result to conversation history
  addToolResult(toolUseId, content) {
    this.addToHistory({
      id: Date.now().toString() + "-tool-result",
      type: "tool_result",
      tool_use_id: toolUseId,
      content: content,
      timestamp: new Date().toISOString()
    });
  }

  // Non-stream agent response with tool calling

  async getAgentResponse(userMessage) {
    this.addToHistory({
      id: Date.now().toString() + "-user",
      type: "user",
      text: userMessage,
      content: userMessage,
      timestamp: new Date().toISOString()
    })

    // Format conversation history for Anthropic API
    const messages = this.formatConversationHistory();

    console.log('Formatted messages for Anthropic API:', JSON.stringify(messages, null, 2));
      
    console.log('Starting agent (non-streaming) with:', {
      model: LLM_CONFIG.model,
      toolsCount: this.tools.length,
      messagesCount: messages.length
    });

    // Create streaming request with tools
    const res = await this.client.messages.create({
      model: LLM_CONFIG.model,
      max_tokens: LLM_CONFIG.max_tokens,
      temperature: LLM_CONFIG.temperature,
      system: `You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message. Respond in proper Markdown format.`,
      messages: messages
    });
    
    console.log('AI agent response:', res.content[0].text);

    this.addToHistory({
      id: Date.now().toString() + "-user",
      type: "ai",
      content: res.content[0].text,
      timestamp: new Date().toISOString()
    });

    return res.content[0].text;
  }

  // Stream agent response with tool calling support
  async *streamAgentResponse(userMessage) {
    try {
      // Add user message to history (only if not empty - for tool continuation)
      if (userMessage && userMessage.trim()) {
        this.addToHistory({
          id: Date.now().toString() + "-user",
          type: "user",
          text: userMessage,
          content: userMessage,
          timestamp: new Date().toISOString()
        });
      }

      // Format conversation history for Anthropic API
      const messages = this.formatConversationHistory();
      
      console.log('Formatted messages for Anthropic API:', JSON.stringify(messages, null, 2));
      
      console.log('Starting agent streaming with:', {
        model: LLM_CONFIG.model,
        toolsCount: this.tools.length,
        messagesCount: messages.length
      });

      // Create streaming request with tools
      const stream = await this.client.messages.stream({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.max_tokens,
        temperature: LLM_CONFIG.temperature,
        system: AGENT_SYSTEM_PROMPT,
        messages: messages,
        tools: this.tools
      });

      let currentMessage = "";
      let assistantMessageId = Date.now().toString() + "-assistant";
      let toolCalls = [];

      // Process stream events
      for await (const event of stream) {
        console.log('Agent stream event:', event.type);
        
        if (event.type === "content_block_start") {
          // New content block starting
          if (event.content_block.type === "text") {
            yield {
              type: "content_start",
              content: ""
            };
          } else if (event.content_block.type === "tool_use") {
            // Tool call detected
            yield {
              type: "tool_call_start",
              tool_call: {
                id: event.content_block.id,
                name: event.content_block.name,
                input: event.content_block.input
              }
            };
          }
        } else if (event.type === "content_block_delta") {
          if (event.delta.type === "text") {
            // Text content chunk
            currentMessage += event.delta.text;
            yield {
              type: "content_delta",
              text: event.delta.text,
              fullText: currentMessage
            };
          } else if (event.delta.type === "tool_use") {
            // Tool use delta (if applicable)
            yield {
              type: "tool_call_delta",
              delta: event.delta
            };
          }
        } else if (event.type === "content_block_stop") {
          // Content block finished
          if (event.content_block && event.content_block.type === "tool_use") {
            // Tool call completed
            toolCalls.push({
              id: event.content_block.id,
              name: event.content_block.name,
              input: event.content_block.input
            });
            
            yield {
              type: "tool_call_complete",
              tool_call: {
                id: event.content_block.id,
                name: event.content_block.name,
                input: event.content_block.input
              }
            };
          }
        } else if (event.type === "message_stop") {
          // Complete message finished
          break;
        }
      }

      // Add assistant message to history
      this.addToHistory({
        id: assistantMessageId,
        type: "assistant",
        content: currentMessage,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        timestamp: new Date().toISOString()
      });

      // Signal completion
      yield {
        type: "message_complete",
        content: currentMessage,
        tool_calls: toolCalls,
        requiresToolExecution: toolCalls.length > 0
      };

    } catch (error) {
      console.error('Error in agent streaming:', error);
      yield {
        type: "error",
        error: error.message
      };
    }
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
      toolsCount: this.tools.length,
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