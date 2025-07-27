import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { viewCellsTool, editCellsTool } from "./aiTools";
import { generateAgentPrompt } from "./promptService";

// Polyfill for Promise.allSettled for IE11 compatibility
if (!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(promises.map(p => Promise.resolve(p).then(
      value => ({ status: 'fulfilled', value }),
      reason => ({ status: 'rejected', reason })
    )));
  };
}

class LLMClient {
  constructor() {
    this.claudeClient = null;
    this.model = null;
    this.tools = null;
    this.initAnthropic();
    this.initLangchain();
  }

  initLangchain(){
    this.model = new ChatAnthropic({
      model: 'claude-sonnet-4-20250514',
      maxTokens: 1024,
      temperature: 0,
      maxRetries: 3,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.tools = this.createTools();
  }
  initAnthropic() {
    // Initialize Anthropic client
    const Anthropic = require("@anthropic-ai/sdk");
    this.claudeClient = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY ,
      dangerouslyAllowBrowser: true, // Enable direct browser access
    });
    console.log('Anthropic client initialized');
  }

  createTools() {
    return [viewCellsTool, editCellsTool]
  }

  async chatClaude(message) {
    // Create streaming request with tools
    const res = await this.claudeClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0,
      system: `You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message. Respond in proper Markdown format.`,
      messages: [{ 
        role: "user", 
        content: message
      }]
    });
    console.log("Returning Response from LLMClient frontend...")
    return res.content[0].text;
  }

  async chatAgent(message) {
    console.log("Calling Langchain ChatAnthropic");

    const prompt = await generateAgentPrompt();

    const agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
      // checkpointSaver: agentCheckpointer,
      stateModifier: prompt,
    });

    // Now it's time to use!
    const agentFinalState = await agent.invoke(
      { messages: [{ role: "user", content: message }] },
      {
        recursionLimit: 50,
      },
      // { configurable: { thread_id: "42", recursion_limit: 50} },
    );

    console.log("Returning response from LangChain: ", agentFinalState.messages[agentFinalState.messages.length - 1].content);
    return agentFinalState.messages[agentFinalState.messages.length - 1].content;
  }
}

// Create singleton instance
const llmClient = new LLMClient();

export default llmClient;