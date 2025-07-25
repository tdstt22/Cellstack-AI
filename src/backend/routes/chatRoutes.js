/* eslint-disable no-console */
const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

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
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
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


router.get('/chat', (req, res) => {
  const { prompt } = req.query;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt query parameter is required and must be a string' });
  }

  console.log('Simple GET /chat endpoint called with prompt:', prompt.substring(0, 100) + '...');

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
  });

  // Async function to handle the streaming
  const streamResponse = async () => {
    try {
      const userMsg = {
        id: Date.now().toString() + "-user",
        type: "user",
        text: prompt,
        timestamp: new Date().toISOString(),
      };
      aiService.addToHistory(userMsg);
      messages = aiService.formatConversationHistory()

      console.log('Simple GET /chat: Creating direct AI stream for prompt:', prompt.substring(0, 50) + '...');

      // Create direct streaming request to Anthropic API 
      const Anthropic = require("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      console.log('Creating streaming request with:', {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messagesLength: messages.length
      });
      
      const stream = await client.messages.stream({
        model: "claude-sonnet-4-20250514", 
        max_tokens: 1024,
        temperature: 0,
        system: `You are an AI co-pilot who assist users to solve their spreadsheet tasks. You live in the world'd best AI spreadsheet, Rexcel. You are powered by Claude 4 Sonnet.
You are pair collaborating with the USER to solve their tasks on the spreadsheet. Each time the USER sends a message, we may automatically attach some information about their current state, such as what cell they are working on, recently viewed sheets, edit history in their session so far, and more. This information may or may not be relevant to the task, it is up for you to decide.
You will be provided with information about the spreadsheets the USER is working on via JSON format under <spreadsheet> tags.
Your main goal is to follow the USER's instructions at each message. Respond in proper Markdown format.`,
        messages: messages
      });

      console.log('Stream created, starting to listen for events...');
      let chunkCount = 0;
      res_buffer = '';

      // Stream the response in simple format
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta && event.delta.text) {
          chunkCount++;
          const chunk = event.delta.text;
          res_buffer += chunk;
          res.write(chunk)
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
      res.write('Sorry, I encountered an error. Please try again.');
    } finally {
      // Always send completion signal
      console.log("LLM Reponse: ", res_buffer);

      const aiMsg = {
        id: Date.now().toString() + "-ai", // Change to UUID
        type: "ai",
        text: res_buffer,
        timestamp: new Date().toISOString(),
      };
      aiService.addToHistory(aiMsg);
      res.end();
    }
  };
    // Start the streaming
  streamResponse().catch((error) => {
    console.error('Unhandled error in streamResponse:', error);
    res.end();
  });
});

module.exports = router;