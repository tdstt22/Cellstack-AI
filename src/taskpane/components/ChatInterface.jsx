import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors } from "../styles/theme";
import TopBar from "./TopBar";
import EmptyState from "./EmptyState";
import ConversationHistory from "./ConversationHistory";
import MessageInputArea from "./MessageInputArea";
import backendClient from "../services/backendClient";

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
  
  // Generate unique IDs to avoid React key conflicts
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async ({ message, action, attachments }) => {
    console.log("Sending message:", { message, action, attachments });
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
        disabled={isLoading}
        placeholder={isLoading ? (streamingMessageId ? "AI is responding..." : "AI is thinking...") : "Ask Rexcel"}
      />
    </div>
  );
};

export default ChatInterface;