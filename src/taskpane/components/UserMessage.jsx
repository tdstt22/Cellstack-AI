import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography } from "../styles/theme";

const useStyles = makeStyles({
  // User message container with same style as MessageInputArea
  messageContainer: {
    margin: "0 16px 16px", // 16px gap on left, right, and bottom
    background: colors.bgSecondary, // #F0EFED light-grey background
    border: `1px solid ${colors.border}`, // #E3E0D8 light border
    borderRadius: "8px", // softly rounded corners
    display: "flex",
    alignItems: "flex-start", // align-items: left interpreted as flex-start
    padding: "8px 6px", // reduced left/right padding by half
    minHeight: "20px",
  },
  
  // Text display styling
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base, // 13px system-UI
    fontWeight: typography.fontWeight.normal, // weight 400
    color: colors.textPrimary, // #333333
    background: "transparent",
    border: "none",
    flex: 1,
    margin: "0 6px",
    lineHeight: typography.lineHeight.normal,
    whiteSpace: "pre-wrap", // Preserve line breaks and spaces
    wordBreak: "break-word", // Break long words if needed
  },
});

const UserMessage = ({ message, timestamp }) => {
  const styles = useStyles();

  return (
    <div 
      className={styles.messageContainer}
      role="article"
      aria-label="User message"
    >
      <div className={styles.messageText}>
        {message}
      </div>
    </div>
  );
};

export default UserMessage;