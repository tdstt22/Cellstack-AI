# AI Module Specification

This document will explain the projects AI components in detail. This is an extension from the main project specification which is located in the `spec.md` file.

## Design

This project will be focused on using LLM integrations from Anthropic via [SDK for Typescript] (https://github.com/anthropics/anthropic-sdk-typescript). The AI agent in this project will be a ReACT style agent that has tools to interact with the MS Excel environment. We will start with a simple implementation without any tool calling functionality. Our base implementation will be a simple LLM call with a basic system prompt that allows users to chat with the LLM. Our goal right now is NOT to interact with the MS Excel environment, but just for the USERs to be able to chat with the LLM.

### Functional Requirements

The following are the basic functional requirements we want completed in the base implementation

- USERs are able to chat with Anthropic LLMs via the ChatInterface. We are NO longer using Mocked AI response.
- Conversation history is display correctly between USER and AI in the Chat Interface for the current Active session.
- LLM calls should be housed in a simple Express JS backend and streamed to the frontend using SSE
- Frontend is able to interact with the Backend without any errors
- The response from the LLM is **streamed** to the active conversation. This is to ensure that USERs don't have to wait for the full duration of the API call.
- Conversation history is managed locally and only for a single active session. DO NOT worry about implement conversation history across different sessions. Assume that there is only ONE active session.

### Backend Architecture

We will be building a simple Express JS backend that will provide all the LLM integration logic to the React frontend. The backend logic should be placed in `src/backend` directory.
We will be streaming the response from the backend to the frontend using SSE. Here's a [documentation] (https://tpiros.dev/blog/streaming-llm-responses-a-deep-dive/) you can reference.

##### API Design

GET `/chat` API is the SSE endpoint streaming back the LLM response. The USER's message should be passed as a query string in the GET request URL. To stream back the response you could reference the following:

```
res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  for await (const chunk of response) {
    res.write(`data: ${chunk.text}\n\n`);
  }

  res.write('event: done\ndata: [DONE]\n\n');
  res.end();
```

GET `/history` API for fetching the conversation history

DELETE `/history` API for clearing the conversation history

### Frontend

Establish a BackendClient that helps connect to the Backend server. Use the `EventSource` API to handle the messages through the GET `/chat` API. You can follow the example below

```
// 1. Prepare for a new request
  const prompt = encodeURIComponent(document.getElementById('prompt').value);
  markdownBuffer = '';
  updateOutput();

  // 2. Create an EventSource instance
  const eventSource = new EventSource(`http://localhost:3000/sse?prompt=${prompt}`);

  // 3. Handle incoming messages
  eventSource.onmessage = (e) => {
    markdownBuffer += e.data;
    updateOutput();
  };

  // 4. Listen for the custom 'done' event
  eventSource.addEventListener('done', () => {
    eventSource.close();
  });

  // 5. Handle errors
  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
    eventSource.close();
  };
```

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

#### Conversational History Storage

We will be implementing a simple local storage for the intial implementation. Assume this is ONE and only ONE active session. Store the conversation history as the USER and AI interaction progresses. You will need this information for the LLM invocation in the next turn. Be sure that the conversation history is able to be recalled correctly before calling the Anthropic Client.
