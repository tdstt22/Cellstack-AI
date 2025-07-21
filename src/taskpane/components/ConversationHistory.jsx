import * as React from "react";
import { useEffect, useRef } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing } from "../styles/theme";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";

const useStyles = makeStyles({
  // Main conversation container
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary, // #FCF8F1
    padding: `${spacing.xl} ${spacing.lg}`, // 24px 16px
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  
  // Individual message wrapper for proper spacing
  messageWrapper: {
    width: "100%",
  },
});

const ConversationHistory = ({ messages = [] }) => {
  const styles = useStyles();
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main 
      ref={containerRef}
      className={styles.container} 
      role="main"
      aria-label="Conversation history"
    >
      {messages.map((message) => (
        <div key={message.id} className={styles.messageWrapper}>
          {message.type === "user" ? (
            <UserMessage 
              message={message.text}
              timestamp={message.timestamp}
            />
          ) : (
            <AIMessage 
              message={message.text}
              timestamp={message.timestamp}
            />
          )}
        </div>
      ))}
    </main>
  );
};

export default ConversationHistory;