/* eslint-disable no-console */
const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

// Streaming chat endpoint using Server-Sent Events (SSE)
router.post('/stream', async (req, res) => {
  const { message, context, action, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  console.log('Backend: Starting streaming chat for message:', message.substring(0, 100) + '...');
  console.log('Backend: Received history with', history.length, 'previous messages');

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  try {
    // Check if AI service is ready
    if (!aiService.isReady()) {
      const errorData = {
        type: 'error',
        message: 'AI service not configured. Please check your API key.',
        timestamp: new Date().toISOString()
      };
      res.write(`data: ${JSON.stringify(errorData)}\n\n`);
      res.end();
      return;
    }

    let messageId = null;
    let fullResponse = '';

    // Stream the AI response with conversation history
    for await (const chunk of aiService.streamResponse(message, context, history)) {
      if (chunk.isChunk) {
        // Send streaming chunk
        messageId = chunk.id;
        fullResponse += chunk.text;
        
        const chunkData = {
          type: 'chunk',
          id: chunk.id,
          text: chunk.text,
          fullText: fullResponse,
          timestamp: chunk.timestamp
        };
        
        res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
        
      } else if (chunk.isComplete) {
        // Send completion signal
        const completeData = {
          type: 'complete',
          id: chunk.id,
          text: chunk.text,
          timestamp: chunk.timestamp
        };
        
        res.write(`data: ${JSON.stringify(completeData)}\n\n`);
        break;
        
      } else if (chunk.isError) {
        // Send error
        const errorData = {
          type: 'error',
          message: chunk.text,
          timestamp: chunk.timestamp
        };
        
        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
        break;
      }
    }

  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    
    const errorData = {
      type: 'error',
      message: 'An unexpected error occurred while processing your request.',
      timestamp: new Date().toISOString()
    };
    
    res.write(`data: ${JSON.stringify(errorData)}\n\n`);
  }

  // Close the connection
  res.end();
});

// Get conversation history
router.get('/history', (req, res) => {
  try {
    const history = aiService.getConversationHistory();
    res.json({ 
      success: true,
      history,
      count: history.length 
    });
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve conversation history',
      message: error.message 
    });
  }
});

// Clear conversation history
router.delete('/history', (req, res) => {
  try {
    aiService.clearHistory();
    res.json({ 
      success: true,
      message: 'Conversation history cleared' 
    });
  } catch (error) {
    console.error('Error clearing conversation history:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation history',
      message: error.message 
    });
  }
});

// Simple SSE test endpoint
router.get('/test-sse', (req, res) => {
  console.log('SSE test endpoint called');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send test data
  res.write('data: Hello\n\n');
  res.write('data: World\n\n');
  res.write('data: This is a test\n\n');
  res.write('event: done\ndata: [DONE]\n\n');
  res.end();
});

// Test endpoint to validate streaming API connection
router.get('/test-ai-stream', async (req, res) => {
  try {
    console.log('Testing AI streaming connection...');
    const Anthropic = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY);
    
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say hello" }]
    });
    
    let fullResponse = "";
    
    for await (const event of stream) {
      console.log('Stream event type:', event.type);
      if (event.type === "content_block_delta" && event.delta.type === "text") {
        fullResponse += event.delta.text;
        console.log('Stream chunk:', event.delta.text);
      }
    }
    
    console.log('Full streamed response:', fullResponse);
    
    res.json({ 
      success: true, 
      response: fullResponse,
      method: "streaming"
    });
    
  } catch (error) {
    console.error('AI streaming test error:', error);
    res.status(500).json({ 
      error: error.message, 
      type: error.type,
      status: error.status
    });
  }
});

// Test endpoint to validate API connection
router.get('/test-ai', async (req, res) => {
  try {
    console.log('Testing AI connection...');
    const Anthropic = require("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key first 10 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 10));
    
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say hello" }]
    });
    
    console.log('AI test response:', response.content[0].text);
    res.json({ 
      success: true, 
      response: response.content[0].text,
      model: response.model
    });
    
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({ 
      error: error.message, 
      type: error.type,
      status: error.status
    });
  }
});

// Simple GET /chat endpoint for SSE streaming as per ai.spec.md
router.get('/chat', (req, res) => {
  const { prompt } = req.query;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt query parameter is required and must be a string' });
  }

  console.log('Simple GET /chat endpoint called with prompt:', prompt.substring(0, 100) + '...');

  // Set SSE headers as per ai.spec.md
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Async function to handle the streaming
  const streamResponse = async () => {
    try {
      // Create a simple message array directly for the AI API
      const messages = [{
        role: "user",
        content: prompt
      }];
      
      console.log('Simple GET /chat: Creating direct AI stream for prompt:', prompt.substring(0, 50) + '...');

      // Create direct streaming request to Anthropic API 
      const Anthropic = require("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      console.log('Creating streaming request with:', {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messagesLength: messages.length
      });
      
      const stream = client.messages.stream({
        model: "claude-sonnet-4-20250514", 
        max_tokens: 1024,
        temperature: 0,
        system: `You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message`,
        messages: messages
      });

      console.log('Stream created, starting to listen for events...');
      let chunkCount = 0;

      // Stream the response in simple format
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta && event.delta.text) {
          chunkCount++;
          const chunk = event.delta.text;
          res.write(`data: ${chunk}\n\n`);
        }
      }
      
      console.log(`AI streaming completed successfully. Total chunks: ${chunkCount}`);

    } catch (error) {
      console.error('Error in AI streaming:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        status: error.status
      });
      res.write('data: Sorry, I encountered an error. Please try again.\n\n');
    } finally {
      // Always send completion signal
      res.write('event: done\ndata: [DONE]\n\n');
      res.end();
    }
  };

  // Start the streaming
  streamResponse().catch((error) => {
    console.error('Unhandled error in streamResponse:', error);
    res.write('data: Unexpected error occurred.\n\n');
    res.write('event: done\ndata: [DONE]\n\n');
    res.end();
  });
});

// Non-streaming chat endpoint (fallback)
router.post('/', async (req, res) => {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    if (!aiService.isReady()) {
      return res.status(503).json({ 
        error: 'AI service not configured. Please check your API key.' 
      });
    }

    const response = await aiService.generateResponse(message, context);
    
    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

module.exports = router;