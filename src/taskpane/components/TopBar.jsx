import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography, commonStyles } from "../styles/theme";

const useStyles = makeStyles({
  topBar: {
    height: spacing.topBarHeight,
    backgroundColor: colors.bgPrimary,
    padding: `0 ${spacing.lg}`,
    borderBottom: `1px solid ${colors.border}`,
    ...commonStyles.flex.between,
  },
  
  leftSection: {
    ...commonStyles.flex.start,
  },
  
  title: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    margin: 0,
    letterSpacing: "0.5px",
  },
  
  rightSection: {
    ...commonStyles.flex.start,
    gap: spacing.md,
  },
  
  iconButton: {
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
  },
  
  icon: {
    width: spacing.iconSize.large,
    height: spacing.iconSize.large,
    stroke: colors.placeholder,
    fill: "none",
    strokeWidth: "1.5",
  },
  
  iconFilled: {
    fill: colors.placeholder,
    stroke: "none",
  },
});

// SVG Icons as React components
const UndoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M3 7v6h6" />
    <path d="m21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M21 7v6h-6" />
    <path d="m3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const EllipsisIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const TopBar = () => {
  const styles = useStyles();

  const handleIconClick = (iconName) => {
    console.log(`${iconName} clicked`);
    // TODO: Implement actual functionality for each icon
  };

  return (
    <header className={styles.topBar} role="banner">
      <div className={styles.leftSection}>
        <h1 className={styles.title}>CHAT</h1>
      </div>
      
      <div className={styles.rightSection} role="toolbar" aria-label="Chat actions">
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("undo")}
          aria-label="Undo last action"
          title="Undo"
        >
          <UndoIcon className={styles.icon} />
        </button>
        
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("redo")}
          aria-label="Redo last action"
          title="Redo"
        >
          <RedoIcon className={styles.icon} />
        </button>
        
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("refresh")}
          aria-label="Refresh chat"
          title="Refresh"
        >
          <RefreshIcon className={styles.icon} />
        </button>
        
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("add")}
          aria-label="Add new item"
          title="Add"
        >
          <PlusIcon className={styles.icon} />
        </button>
        
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("more")}
          aria-label="More options"
          title="More options"
        >
          <EllipsisIcon className={styles.iconFilled} />
        </button>
        
        <button
          className={styles.iconButton}
          onClick={() => handleIconClick("close")}
          aria-label="Close chat"
          title="Close"
        >
          <CloseIcon className={styles.icon} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;