# AI Module Specification

This document will explain the projects AI components in detail. This is an extension from the main project specification which is located in the `spec.md` file.

## Design

This project will be focused on using LLM integrations from Anthropic via [SDK for Typescript] (https://github.com/anthropics/anthropic-sdk-typescript). The AI agent in this project will be a ReACT style agent that has tools to interact with the MS Excel environment. We will start with a simple implementation without any tool calling functionality. Our base implementation will be a simple LLM call with a basic system prompt that allows users to chat with the LLM.

The base implementation is working, so we will now proceed to implement the first version of the AI agent.

### Functional Requirements

The following are the basic functional requirements we want completed in the base implementation

- USERs are able to chat with AI agent to complete simple Excel tasks such as "Update cell A1 to 3"
- Agent will be ReACT style agent that is able to make tool calls
- The two tools are functional and invocable via the AI agent
- Conversation history is display correctly between USER and AI in the Chat Interface for the current Active session. Users are also able to see tools getting called in the Chat Interface.
- LLM calls should be housed in a simple Express JS backend and streamed to the frontend
- Frontend is able to interact with the Backend without any errors
- The response from the LLM is **streamed** to the active conversation. This is to ensure that USERs don't have to wait for the full duration of the API call.
- In between the AI agent loop, USERs are able to see AI thoughts and tool invocations.
- Conversation history is managed locally and only for a single active session. DO NOT worry about implement conversation history across different sessions. Assume that there is only ONE active session.

### Frontend Connection

We establish a backend client, found under `src/taskpane/services/backendClient.js`, to help interact with the expressJS backend. For our base implementation, we use the `streamMessageSimple` method to help receive the message chunk from the backend and update the frontend ChatInterface accordingly.

### Backend Architecture

We will be building a simple Express JS backend that will provide all the LLM integration logic to the React frontend. The backend logic should be placed in `src/backend` directory.
We will be streaming the response from the backend to the frontend using Streamable HTTP.

##### API Design

GET `/chat` API is the endpoint responsible for streaming back the LLM response to the client (in this case the frontend). The USER's message should be passed as a query string in the GET request URL. The response is streamed back in chunks using Streamable HTTP.

GET `/history` API for fetching the conversation history

DELETE `/history` API for clearing the conversation history

POST `/chatAgent` API is the endpoint for the Rexcel AI agent. This endpont will support tool related parameters which will allow the AI agent to work. See details in `Agent Architecture` section.

#### API Key

We will be storing the ANTHROPIC_API_KEY and any important varialbes in an .env file for safety. Create a template file for the required Environment variables. These variables should be loaded when the Add-in server gets started.

#### LLM Integration

We will be using the [Anthropic SDK for Typescript] (https://github.com/anthropics/anthropic-sdk-typescript) to implement the LLM integration. Here are the LLM specifications we will using:

```
model: 'claude-sonnet-4-20250514'
max_tokens: 1024
temperature: 0
```

We will be using Anthropic SDK's streaming functionality to stream responses back to the USER during the conversation. Use the following example for as guideline on how to stream response

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // gets API Key from environment variable ANTHROPIC_API_KEY

async function main() {
  const stream = client.messages
    .stream({
      messages: [
        {
          role: "user",
          content: `Hey Claude! How can I recursively list all files in a directory in Rust?`,
        },
      ],
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
    })
    // Once a content block is fully streamed, this event will fire
    .on("contentBlock", (content) => console.log("contentBlock", content))
    // Once a message is fully streamed, this event will fire
    .on("message", (message) => console.log("message", message));

  for await (const event of stream) {
    console.log("event", event);
  }

  const message = await stream.finalMessage();
  console.log("finalMessage", message);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

We will be implementing a simple starter System Prompt for the LLM. Use the following prompt

```
You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message
```

Now, we will be implementing a complete AI agent with tool calling. The Rexcel AI agent will be a ReACT style agent, more information in the `Agent Architecture` section.

### Agent Architecture

The AI agent will follow a simple ReACT style architecture.

**Iterative Cycle**: ReAct agents operate in an iterative loop, alternating between reasoning (generating thoughts) and acting (executing actions using tools).

**Reasoning (Thought)**:
The agent first analyzes the input or problem and generates a "thought" or plan for how to address it. This involves using the Large Language Model's (LLM) reasoning abilities to break down the problem, identify necessary steps, and consider potential actions.
**Acting (Action)**: Based on its reasoning, the agent then selects and executes an action using available tools. These tools can include search engines, databases, APIs, or other external resources that allow the agent to interact with the environment or gather information.
**Observation**: After executing an action, the agent observes the outcome or feedback from the tool. This observation is then used to refine its reasoning and inform the next step in the cycle.
**Adaptability**: This continuous feedback loop allows ReAct agents to dynamically adapt to new information, adjust their plans, and handle multi-step tasks that require interaction with external systems.

In simple terms, the agent will keep using tools to progress towards acheiving the task. Only when the task is achieved will the agent stop using tools and return a response to the user.

Since our tools are based on MS office environment, the execution of the tools will need to happen in the frontend of the application while the LLM inference will happen in the backend.

The execution flow for an Agent with tool calling with be as follows:

- User sents a message --> frontend registers and sends `/chatAgent` call to backend
- Backend calls LLM provider via SDK --> Recieves response back form LLM provide which requires a tool --> Streams tool call details to frontend
- Frontend receives the tool call information --> Updates the Conversation History in the AIMessage section to inform the USER about the tool call --> Executes the tool and retrieves tool response --> Send the tool response back to the backend
- Backend receives tool response --> Appends to conversation history --> Makes subsequent LLM call --> Recieves response back form LLM provide which requires a tool --> Streams tool call details to frontend
- These steps repeat until the task is resolved thus the LLM response will not be a tool invocation
- Display the final response back to the USER
- Conclude agent interaction

### Tool specification

In the Anthropic SDK, we will start providing the `tools` parameter to allow for tool calls. Information about implementing tool call can be found [here](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#example-of-successful-tool-result)

```ts
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 1024,
    tools: [
      {
        name: "get_weather",
        description: "Get the current weather in a given location",
        input_schema: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
          },
          required: ["location"],
        },
      },
    ],
    messages: [
      {
        role: "user",
        content: "Tell me the weather in San Francisco.",
      },
    ],
  });

  console.log(response);
}

main().catch(console.error);
```

When building the `tool_result` into the messages. Follow the following format:

```
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "15 degrees"
    }
  ]
}
```

Our agent system prompt will be the following:

```
<role>
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

Answer the user's request using the relevant tool(s), if they are available. Check that all the required parameters for each tool call are provided or can reasonably be inferred from context. IF there are no relevant tools or there are missing values for required parameters, ask the user to supply these values; otherwise proceed with the tool calls. If the user provides a specific value for a parameter (for example provided in quotes), make sure to use that value EXACTLY. DO NOT make up values for or ask about optional parameters. Carefully analyze descriptive terms in the request as they may indicate required parameter values that should be included even if not explicitly quoted.
```

We will be only using two tools for this implementation. The tool code can be found in `src/taskpane/services/aiTools.js`. The tools are the following:

**1. ViewCells**: Allows agent to view a range of cells in the MS Excel sheets

**2. EditCells**: Allows agent to update the specified range of cells with data in the MS Excel sheets

Generate a simple JSON file that has tool specification. This will make setting up the Anthropic API call easier.

#### Simple Conversational History Storage

We will be implementing a simple local storage for the intial implementation. Assume this is ONE and only ONE active session. Store the conversation history as the USER and AI interaction progresses. You will need this information for the LLM invocation in the next turn. Be sure that the conversation history is able to be recalled correctly before calling the Anthropic Client.
