import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography } from "../styles/theme";

const useStyles = makeStyles({
  // AI message text styling - right-aligned without container
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small, // 12px system-UI-sans
    fontWeight: typography.fontWeight.normal, // weight 400
    color: colors.textSecondary, // #555555
    textAlign: "left",
    lineHeight: typography.lineHeight.normal, // 1.4
    marginBottom: spacing.xl, // 24px
    whiteSpace: "pre-wrap", // Preserve line breaks and spaces
    wordBreak: "break-word", // Break long words if needed
    padding: "0 16px 0 28px", // Align text start with UserMessage text (16+6+6=28px from left)
  },
});

const AIMessage = ({ message, timestamp }) => {
  const styles = useStyles();

  return (
    <div 
      className={styles.messageText}
      role="article"
      aria-label="AI response"
    >
      {message}
    </div>
  );
};

export default AIMessage;