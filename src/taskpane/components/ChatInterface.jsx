import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors } from "../styles/theme";
import TopBar from "./TopBar";
import EmptyState from "./EmptyState";
import ConversationHistory from "./ConversationHistory";
import MessageInputArea from "./MessageInputArea";
import { generateAIResponse } from "../utils/mockAI";

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

  const handleSendMessage = async ({ message, action, attachments }) => {
    console.log("Sending message:", { message, action, attachments });
    setIsLoading(true);

    try {
      // Create user message and add to conversation
      const userMessage = {
        id: Date.now().toString() + "-user",
        type: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };

      // Add user message to conversation
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Get AI response using existing mock system
      const aiResponse = await generateAIResponse(message);
      console.log("AI Response:", aiResponse);
      
      // Create AI message and add to conversation
      const aiMessage = {
        id: Date.now().toString() + "-ai",
        type: "ai", 
        text: aiResponse,
        timestamp: new Date().toISOString(),
      };

      // Add AI message to conversation
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message as AI response
      const errorMessage = {
        id: Date.now().toString() + "-ai-error",
        type: "ai",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
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
        placeholder={isLoading ? "AI is thinking..." : "Ask Rexcel"}
      />
    </div>
  );
};

export default ChatInterface;