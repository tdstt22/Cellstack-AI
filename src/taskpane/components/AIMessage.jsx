import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography } from "../styles/theme";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolCallIndicator from "./ToolCallIndicator";

const useStyles = makeStyles({
  // AI message container
  messageContainer: {
    marginBottom: spacing.xl, // 24px
    padding: "0 16px 0 28px", // Align text start with UserMessage text (16+6+6=28px from left)
  },
  
  // AI message text styling - right-aligned without container
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small, // 12px system-UI-sans
    fontWeight: typography.fontWeight.normal, // weight 400
    color: colors.textSecondary, // #555555
    textAlign: "left",
    lineHeight: typography.lineHeight.normal, // 1.4
    wordBreak: "break-word", // Break long words if needed
    
    // Markdown-specific styling
    "& p": {
      margin: "0 0 8px 0",
      "&:last-child": {
        marginBottom: 0,
      },
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      margin: "16px 0 8px 0",
      "&:first-child": {
        marginTop: 0,
      },
    },
    "& ul, & ol": {
      margin: "8px 0",
      paddingLeft: "20px",
    },
    "& li": {
      marginBottom: "4px",
    },
    "& code": {
      backgroundColor: "#f5f5f5",
      padding: "2px 4px",
      borderRadius: "3px",
      fontFamily: "Monaco, Consolas, 'Courier New', monospace",
      fontSize: "11px",
    },
    "& pre": {
      backgroundColor: "#f5f5f5",
      padding: "12px",
      borderRadius: "6px",
      overflow: "auto",
      margin: "8px 0",
      "& code": {
        backgroundColor: "transparent",
        padding: 0,
      },
    },
    "& blockquote": {
      borderLeft: "3px solid #ddd",
      paddingLeft: "12px",
      margin: "8px 0",
      fontStyle: "italic",
    },
  },
  
  // Tool calls section
  toolCallsSection: {
    marginTop: spacing.md, // 12px
    marginBottom: spacing.md, // 12px
  },
  
  // Streaming indicator
  streamingIndicator: {
    color: colors.textSecondary,
    fontSize: "11px",
    fontStyle: "italic",
    marginTop: spacing.xs, // 4px
    opacity: 0.7,
  },
});

const AIMessage = ({ message, timestamp, toolCalls, isStreaming }) => {
  const styles = useStyles();

  return (
    <div 
      className={styles.messageContainer}
      role="article"
      aria-label="AI response"
    >
      {/* Tool calls section - show if there are any tool calls */}
      {toolCalls && toolCalls.length > 0 && (
        <div className={styles.toolCallsSection}>
          {toolCalls.map((toolCall) => (
            <ToolCallIndicator 
              key={toolCall.id} 
              toolCall={toolCall} 
            />
          ))}
        </div>
      )}
      
      {/* AI response text */}
      {message && (
        <div className={styles.messageText}>
          <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
          {isStreaming && (
            <div className={styles.streamingIndicator}>
              AI is thinking...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMessage;