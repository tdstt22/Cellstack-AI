/* global console */

// API configuration
// In development with webpack dev server, use relative paths (proxied)
// In production, use the full API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_BASE_URL || 'https://localhost:8081')
  : ''; // Empty string for relative paths in development

class BackendClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Health check endpoint
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversationHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/history`);
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.status}`);
      }
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  // Clear conversation history
  async clearConversationHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/history`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Failed to clear history: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
      throw error;
    }
  }

  // Non-streaming chat request (fallback)
  async sendMessage(message, context = null, action = null) {
    try {
      console.log('Sending POST request with message: ', message);
      const response_obj = await fetch(`${this.baseUrl}/agentv1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response_obj.ok) {
        throw new Error(`Chat request failed: ${response_obj.status}`);
      }
      const { success, response, model } = await response_obj.json();
      console.log("Received msg: ", response);
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // // Streaming chat using Server-Sent Events
  // streamMessage(message, context = null, action = null, history = [], handlers = {}) {
  //   return new Promise((resolve, reject) => {
  //     // Use POST request for EventSource with body data
  //     const requestBody = JSON.stringify({
  //       message,
  //       context,
  //       action,
  //       history
  //     });

  //     console.log('Starting SSE stream to backend:', `${this.baseUrl}/api/chat/stream`);

  //     // Create a custom fetch-based SSE implementation since EventSource doesn't support POST with body
  //     fetch(`${this.baseUrl}/api/chat/stream`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'text/event-stream'
  //       },
  //       body: requestBody
  //     })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error(`Stream request failed: ${response.status}`);
  //       }

  //       const reader = response.body.getReader();
  //       const decoder = new TextDecoder();
        
  //       let buffer = '';

  //       // Extract handlers with default no-op functions
  //       const {
  //         onChunk = () => {},
  //         onComplete = () => {},
  //         onError = () => {},
  //         onConnected = () => {}
  //       } = handlers;

  //       const processChunk = ({ done, value }) => {
  //         if (done) {
  //           console.log('SSE stream completed');
  //           return;
  //         }

  //         // Decode the chunk and add to buffer
  //         buffer += decoder.decode(value, { stream: true });
          
  //         // Process complete SSE messages in buffer
  //         const lines = buffer.split('\n');
  //         buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
  //         for (const line of lines) {
  //           if (line.startsWith('data: ')) {
  //             try {
  //               const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
                
  //               switch (data.type) {
  //                 case 'connected':
  //                   console.log('SSE connection established');
  //                   onConnected();
  //                   break;
                    
  //                 case 'chunk':
  //                   onChunk({
  //                     id: data.id,
  //                     text: data.text,
  //                     fullText: data.fullText,
  //                     timestamp: data.timestamp
  //                   });
  //                   break;
                    
  //                 case 'complete':
  //                   console.log('SSE stream message completed');
  //                   onComplete({
  //                     id: data.id,
  //                     text: data.text,
  //                     timestamp: data.timestamp
  //                   });
  //                   resolve(); // Resolve the promise when streaming completes
  //                   return;
                    
  //                 case 'error':
  //                   console.error('SSE stream error:', data.message);
  //                   onError({
  //                     message: data.message,
  //                     timestamp: data.timestamp
  //                   });
  //                   resolve(); // Resolve even on error to prevent hanging
  //                   return;
  //               }
  //             } catch (parseError) {
  //               console.error('Failed to parse SSE data:', parseError, 'Line:', line);
  //             }
  //           }
  //         }
          
  //         // Continue reading
  //         reader.read().then(processChunk).catch(error => {
  //           console.error('Error reading SSE stream:', error);
  //           onError({ message: 'Stream reading error', error });
  //           reject(error);
  //         });
  //       };

  //       // Start reading the stream
  //       reader.read().then(processChunk).catch(error => {
  //         console.error('Error starting SSE stream:', error);
  //         reject(error);
  //       });

  //       // Stream processing has started successfully
        
  //     })
  //     .catch(error => {
  //       console.error('Failed to start SSE stream:', error);
  //       reject(error);
  //     });
  //   });
  // }

  // // Simple EventSource-based streaming as per ai.spec.md
  // streamMessageSimple(message, onMessage, onDone, onError) {
  //   return new Promise((resolve, reject) => {
  //     // 1. Prepare for a new request
  //     const prompt = encodeURIComponent(message);

  //     // // Use direct backend URL for simple streaming endpoint (not proxied)
  //     // const backendUrl = process.env.NODE_ENV === 'production'
  //     //   ? (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001')
  //     //   : 'https://localhost:8081';
  //     const streamUrl = `${this.baseUrl}/chat?prompt=${prompt}`;
      
  //     console.log('Starting simple EventSource stream:', streamUrl);

  //     // 2. Create an EventSource instance
  //     const eventSource = new EventSource(streamUrl);

  //     // 3. Handle incoming messages
  //     eventSource.onmessage = (e) => {
  //       console.log('EventSource message received:', e.data);
  //       if (onMessage) {
  //         onMessage(e.data);
  //       }
  //     };

  //     // 4. Listen for the custom 'done' event
  //     eventSource.addEventListener('done', (e) => {
  //       console.log('EventSource done event received:', e.data);
  //       eventSource.close();
  //       if (onDone) {
  //         onDone();
  //       }
  //       resolve();
  //     });

  //     // 5. Handle errors
  //     eventSource.onerror = (err) => {
  //       console.error('EventSource error:', err);
  //       eventSource.close();
  //       if (onError) {
  //         onError(err);
  //       }
  //       reject(err);
  //     };
  //   });
  // }
  
  // Simple EventSource-based streaming as per ai.spec.md
  streamMessageSimple(message, onMessage, onDone, onError) {
    return new Promise((resolve, reject) => {
      const runFetch = async () => {
        // 1. Prepare for a new request
        const prompt = encodeURIComponent(message);

        // // Use direct backend URL for simple streaming endpoint (not proxied)
        // const backendUrl = process.env.NODE_ENV === 'production' 
        //   ? (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001')
        //   : 'https://localhost:8081';     
        const streamUrl = `${this.baseUrl}/chat?prompt=${prompt}`;
        
        console.log('Starting simple EventSource stream:', streamUrl);
      
        // 2. Make the fetch request and get the reader
        const res = await fetch(streamUrl);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        // 3. Read the stream in a loop
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            onDone();
            resolve();
            break; // Exit loop when stream is finished
          }
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log('Chunk message received:', chunk);
            onMessage(chunk);
          }
        }
      }
      runFetch().catch(error => {
        console.log('RunFetch error', error);
        reject(error);
      })
    });
  }

  // Stream agent message with tool calling support
  async streamAgentMessage(message, toolResults = null, handlers = {}) {
    return new Promise((resolve, reject) => {
      const runFetch = async () => {
        console.log('Starting agent stream to:', `${this.baseUrl}/chatAgent`);
        
        // Prepare request body
        const requestBody = {
          message,
          ...(toolResults && { toolResults })
        };

        // Make POST request to agent endpoint
        const response = await fetch(`${this.baseUrl}/chatAgent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Agent request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        // Extract handlers with default no-op functions
        const {
          onContentStart = () => {},
          onContentDelta = () => {},
          onToolCallStart = () => {},
          onToolCallComplete = () => {},
          onMessageComplete = () => {},
          onError = () => {}
        } = handlers;

        // Read the stream
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const event = JSON.parse(line);
                console.log('Agent stream event received:', event.type);

                switch (event.type) {
                  case 'content_start':
                    onContentStart();
                    break;
                    
                  case 'content_delta':
                    onContentDelta({
                      text: event.text,
                      fullText: event.fullText
                    });
                    break;
                    
                  case 'tool_call_start':
                    onToolCallStart({
                      toolCall: event.tool_call
                    });
                    break;
                    
                  case 'tool_call_complete':
                    onToolCallComplete({
                      toolCall: event.tool_call
                    });
                    break;
                    
                  case 'message_complete':
                    onMessageComplete({
                      content: event.content,
                      toolCalls: event.tool_calls,
                      requiresToolExecution: event.requiresToolExecution
                    });
                    
                    // If tool execution is required, resolve with tool calls for frontend to handle
                    if (event.requiresToolExecution) {
                      resolve({
                        completed: false,
                        toolCalls: event.tool_calls,
                        content: event.content
                      });
                    } else {
                      resolve({
                        completed: true,
                        content: event.content
                      });
                    }
                    return;
                    
                  case 'error':
                    onError({ error: event.error });
                    reject(new Error(event.error));
                    return;
                }
              } catch (parseError) {
                console.error('Failed to parse agent stream event:', parseError, 'Line:', line);
              }
            }
          }
        }
      };

      runFetch().catch(error => {
        console.error('Agent stream error:', error);
        reject(error);
      });
    });
  }

  // Execute tool and continue agent conversation
  async continueAgentConversation(toolResults, handlers = {}) {
    // Use empty message since we're just sending tool results
    return this.streamAgentMessage("", toolResults, handlers);
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }

  // Get backend status information
  async getBackendStatus() {
    try {
      const health = await this.checkHealth();
      return {
        available: true,
        ...health
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const backendClient = new BackendClient();

export default backendClient;