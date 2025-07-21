import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, commonStyles } from "../styles/theme";
import TopBar from "./TopBar";
import EmptyState from "./EmptyState";
import MessageInputArea from "./MessageInputArea";
import { generateAIResponse } from "../utils/mockAI";
import { insertFormula } from "../taskpane";

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

  const handleSendMessage = async ({ message, action, attachments }) => {
    console.log("Sending message:", { message, action, attachments });
    setIsLoading(true);

    try {
      // Get AI response using existing mock system
      const aiResponse = await generateAIResponse(message);
      console.log("AI Response:", aiResponse);
      
      // TODO: Handle the response appropriately
      // For now, just log it since we're showing empty state
      
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertFormula = async (formula) => {
    try {
      const result = await insertFormula(formula);
      console.log("Formula inserted successfully:", result);
      return result;
    } catch (error) {
      console.error("Error inserting formula:", error);
      throw error;
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Section 1: Top Bar */}
      <TopBar />
      
      {/* Section 2: Main Content Area */}
      <EmptyState />
      
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