import * as React from "react";
import { useEffect } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography } from "../styles/theme";

// Define keyframes CSS
const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const useStyles = makeStyles({
  toolCallContainer: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    padding: spacing.md, // 12px
    margin: `${spacing.sm} 0`, // 8px top/bottom
    fontSize: typography.fontSize.small, // 12px
    fontFamily: typography.fontFamily,
  },
  
  toolCallHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: spacing.xs, // 4px
    fontWeight: typography.fontWeight.medium, // 500
    color: colors.textPrimary,
  },
  
  toolCallStatus: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    marginLeft: "auto",
  },
  
  statusIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginRight: spacing.xs, // 4px
  },
  
  statusCalling: {
    backgroundColor: "#ffc107", // Yellow for calling
    animation: "pulse 2s infinite",
  },
  
  statusExecuting: {
    backgroundColor: "#007bff", // Blue for executing
    animation: "pulse 1.5s infinite",
  },
  
  statusCompleted: {
    backgroundColor: "#28a745", // Green for completed
  },
  
  statusError: {
    backgroundColor: "#dc3545", // Red for error
  },
  
  toolCallDetails: {
    color: colors.textSecondary,
    fontSize: "11px",
    marginTop: spacing.xs, // 4px
  },
  
  parameterList: {
    margin: 0,
    paddingLeft: "16px",
    fontSize: "10px",
    "& li": {
      marginBottom: "2px",
    },
  },
});

const ToolCallIndicator = ({ toolCall }) => {
  const styles = useStyles();
  
  // Inject keyframes CSS
  useEffect(() => {
    const styleSheet = document.styleSheets[0];
    if (styleSheet && !document.querySelector('style[data-pulse-keyframes]')) {
      const style = document.createElement('style');
      style.setAttribute('data-pulse-keyframes', 'true');
      style.textContent = pulseKeyframes;
      document.head.appendChild(style);
    }
  }, []);
  
  const getStatusText = (status) => {
    switch (status) {
      case 'calling':
        return 'Preparing...';
      case 'ready_to_execute':
        return 'Ready';
      case 'executing':
        return 'Executing...';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'calling':
        return styles.statusCalling;
      case 'ready_to_execute':
        return styles.statusCalling;
      case 'executing':
        return styles.statusExecuting;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusError;
    }
  };
  
  const getToolDisplayName = (toolName) => {
    switch (toolName) {
      case 'viewCells':
        return 'Reading spreadsheet cells';
      case 'editCells':
        return 'Updating spreadsheet cells';
      default:
        return toolName;
    }
  };
  
  const renderParameters = (input) => {
    if (!input || typeof input !== 'object') return null;
    
    return (
      <div className={styles.toolCallDetails}>
        <strong>Parameters:</strong>
        <ul className={styles.parameterList}>
          {Object.entries(input).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.toolCallContainer}>
      <div className={styles.toolCallHeader}>
        <span>{getToolDisplayName(toolCall.name)}</span>
        <div className={styles.toolCallStatus}>
          <div className={`${styles.statusIndicator} ${getStatusClass(toolCall.status)}`} />
          <span>{getStatusText(toolCall.status)}</span>
        </div>
      </div>
      {toolCall.input && renderParameters(toolCall.input)}
    </div>
  );
};

export default ToolCallIndicator;