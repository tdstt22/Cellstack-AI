import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors } from "../styles/theme";
import TopBar from "./TopBar";
import EmptyState from "./EmptyState";
import ConversationHistory from "./ConversationHistory";
import MessageInputArea from "./MessageInputArea";
import backendClient from "../services/backendClient";
import { executeToolCalls, viewCellsTool, editCellsTool, copyCellsTool } from "../services/aiTools";
import llmClient from "../services/llmClient";

const useStyles = makeStyles({
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: colors.bgPrimary,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
});

const ChatInterface = () => {
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isAgentMode, setIsAgentMode] = useState(false); // Default to simple chat mode
  const [currentToolCalls, setCurrentToolCalls] = useState([]);
  
  // Generate unique IDs to avoid React key conflicts
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle action change from MessageInputArea dropdown
  const handleActionChange = (action) => {
    const newIsAgentMode = action === "Agent";
    setIsAgentMode(newIsAgentMode);
    console.log("Action changed to:", action, "Agent mode:", newIsAgentMode);
  };

  // Handle agent non-streaming
  const handleAgentV1 = async (message) => {
    // Original simple chat logic
    setIsLoading(true);

    try {
      // Check if backend is available
      // const isAvailable = await backendClient.isBackendAvailable();
      // if (!isAvailable) {
      //   const errorMessage = {
      //     id: generateUniqueId(),
      //     type: "ai",
      //     text: "Backend service is not available. Please ensure the backend server is running and your API key is configured.",
      //     timestamp: new Date().toISOString(),
      //   };
      //   setMessages(prevMessages => [...prevMessages, errorMessage]);
      //   return;
      // }

      // Create user message and add to conversation
      const userMessage = {
        id: generateUniqueId(),
        type: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };

      // Add user message to conversation
      setMessages(prevMessages => [...prevMessages, userMessage]);

      let currentAIMessage = null;
      const aiMessageId = generateUniqueId();
      let accumulatedText = "";

      // Create initial AI message for streaming
      currentAIMessage = {
        id: aiMessageId,
        type: "ai",
        text: "",
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      setStreamingMessageId(aiMessageId);
      setMessages(prevMessages => [...prevMessages, currentAIMessage]);

      // const aimessage = await backendClient.sendMessage(message);
      // const aimessage = await llmClient.chatClaude(message);
      const aimessage = await llmClient.chatAgent(message,
        // onMessage handler - receives each chunk of text
        (chunkText) => {
          accumulatedText = accumulatedText + "\n\n" + chunkText;
          
          // Update streaming message with accumulated text
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }
      );
      // viewCellsTool.invoke({ sheetName: "Assumption", cells: "A1:G3" });
      // editCellsTool.invoke({sheetName: "test", data: `{"K1":{"value":"hello world","format":{"fill":{"color":"#FF0000"},"font":{"color":"#000000","bold":true,"name":"Avenir","size":12}}}}`})
      // copyCellsTool.invoke({ sourceSheet: "Assumption", targetSheet: "scratchpad", sourceRange: "A5:G7", targetRange: "C3" });
      // const aimessage = "hello world";

      accumulatedText = accumulatedText + "\n\n" + "---" + "\n\n" + aimessage;

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: accumulatedText, isStreaming: false }
            : msg
        )
      )

      console.log("Non-streaming agent invoke complete.")

    } catch (error) {
        console.error("Error in handleSendMessage:", error);
        // Add error message as AI response
        const errorMessage = {
          id: generateUniqueId(),
          type: "ai",
          text: "Sorry, I encountered an unexpected error. Please try again.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle agent conversation with tool calling
  const handleAgentMessage = async (message) => {
    console.log("Sending agent message:", message);
    setIsLoading(true);

    try {
      // Check if backend is available
      const isAvailable = await backendClient.isBackendAvailable();
      if (!isAvailable) {
        const errorMessage = {
          id: generateUniqueId(),
          type: "ai",
          text: "Backend service is not available. Please ensure the backend server is running and your API key is configured.",
          timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        return;
      }

      // Add user message to conversation
      const userMessage = {
        id: generateUniqueId(),
        type: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Start agent conversation loop
      await runAgentConversation(message);

    } catch (error) {
      console.error("Error in agent message:", error);
      const errorMessage = {
        id: generateUniqueId(),
        type: "ai",
        text: "Sorry, I encountered an unexpected error. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run agent conversation loop with tool execution
  const runAgentConversation = async (initialMessage, toolResults = null) => {
    let currentAIMessage = null;
    let accumulatedText = "";
    const aiMessageId = generateUniqueId();
    
    // Create initial AI message for streaming
    currentAIMessage = {
      id: aiMessageId,
      type: "ai",
      text: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
      toolCalls: []
    };
    setStreamingMessageId(aiMessageId);
    setMessages(prevMessages => [...prevMessages, currentAIMessage]);

    try {
      const result = await backendClient.streamAgentMessage(
        initialMessage,
        toolResults,
        {
          onContentStart: () => {
            console.log("Agent content started");
          },
          
          onContentDelta: ({ text, fullText }) => {
            accumulatedText = fullText;
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, text: accumulatedText }
                  : msg
              )
            );
          },
          
          onToolCallStart: ({ toolCall }) => {
            console.log("Tool call started:", toolCall.name);
            // Add tool call notification to message
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId 
                  ? { 
                      ...msg, 
                      toolCalls: [...(msg.toolCalls || []), { 
                        ...toolCall, 
                        status: 'calling' 
                      }]
                    }
                  : msg
              )
            );
          },
          
          onToolCallComplete: ({ toolCall }) => {
            console.log("Tool call completed:", toolCall.name);
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId 
                  ? { 
                      ...msg, 
                      toolCalls: msg.toolCalls?.map(tc => 
                        tc.id === toolCall.id 
                          ? { ...tc, status: 'ready_to_execute' }
                          : tc
                      )
                    }
                  : msg
              )
            );
          },
          
          onMessageComplete: ({ content, toolCalls, requiresToolExecution }) => {
            console.log("Agent message completed, requires tools:", requiresToolExecution);
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, isStreaming: false, text: content }
                  : msg
              )
            );
            setStreamingMessageId(null);
          },
          
          onError: ({ error }) => {
            console.error("Agent stream error:", error);
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, isStreaming: false, text: "Error: " + error, isError: true }
                  : msg
              )
            );
            setStreamingMessageId(null);
          }
        }
      );

      // Handle tool execution if required
      if (!result.completed && result.toolCalls) {
        console.log("Executing tools:", result.toolCalls.length);
        
        // Update UI to show tool execution in progress
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  toolCalls: result.toolCalls.map(tc => ({ ...tc, status: 'executing' }))
                }
              : msg
          )
        );

        // Execute tools
        const toolResults = await executeToolCalls(result.toolCalls);
        console.log("Tool execution results:", toolResults);

        // Update UI to show tool execution completed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  toolCalls: result.toolCalls.map(tc => ({ ...tc, status: 'completed' }))
                }
              : msg
          )
        );

        // Continue agent conversation with tool results
        await runAgentConversation("", toolResults);
      }

    } catch (error) {
      console.error("Error in agent conversation:", error);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false, text: "Error: " + error.message, isError: true }
            : msg
        )
      );
      setStreamingMessageId(null);
    }
  };

  const handleSendMessage = async ({ message, action, attachments }) => {
    console.log("Sending message:", { message, action, attachments });
    
    // Choose between agent mode and simple chat mode
    if (isAgentMode) {
      await handleAgentV1(message);
      return;
    }
    
    // Original simple chat logic
    setIsLoading(true);

    try {
      // Check if backend is available
      const isAvailable = await backendClient.isBackendAvailable();
      if (!isAvailable) {
        const errorMessage = {
          id: generateUniqueId(),
          type: "ai",
          text: "Backend service is not available. Please ensure the backend server is running and your API key is configured.",
          timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        return;
      }

      // Create user message and add to conversation
      const userMessage = {
        id: generateUniqueId(),
        type: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };

      // Add user message to conversation
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Prepare context from attachments if any
      let context = null;
      if (attachments && attachments.length > 0) {
        context = {
          attachments: attachments,
          action: action
        };
      }

      // Handle streaming AI response using simplified EventSource
      let currentAIMessage = null;
      let accumulatedText = "";
      const aiMessageId = generateUniqueId();
      
      // Create initial AI message for streaming
      currentAIMessage = {
        id: aiMessageId,
        type: "ai",
        text: "",
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      setStreamingMessageId(aiMessageId);
      setMessages(prevMessages => [...prevMessages, currentAIMessage]);

      // Use simple EventSource streaming as per ai.spec.md
      await backendClient.streamMessageSimple(
        message,
        // onMessage handler - receives each chunk of text
        (chunkText) => {
          accumulatedText += chunkText;
          
          // Update streaming message with accumulated text
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        },
        // onDone handler - called when streaming completes
        () => {
          // Mark message as completed
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          setStreamingMessageId(null);
          console.log("Simple streaming completed");
        },
        // onError handler - called on errors
        (error) => {
          const errorMessage = {
            id: aiMessageId, // Use the same ID to replace the streaming message
            type: "ai",
            text: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date().toISOString(),
            isError: true
          };
          
          // Replace streaming message with error
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === aiMessageId ? errorMessage : msg
            )
          );
          setStreamingMessageId(null);
          console.error("Simple streaming error:", error);
        }
      );
      
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      
      // Add error message as AI response
      const errorMessage = {
        id: generateUniqueId(),
        type: "ai",
        text: "Sorry, I encountered an unexpected error. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Section 1: Top Bar */}
      <TopBar />
      
      {/* Section 2: Main Content Area */}
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <ConversationHistory messages={messages} />
      )}
      
      {/* Section 3: Message Input Area (floating card with integrated context) */}
      <MessageInputArea 
        onSendMessage={handleSendMessage}
        onActionChange={handleActionChange}
        disabled={isLoading}
        placeholder={isLoading ? (streamingMessageId ? "AI is responding..." : "AI is thinking...") : "Edit your spreadsheet in agent mode"}
        defaultAction={isAgentMode ? "Agent" : "Ask"}
      />
    </div>
  );
};

export default ChatInterface;