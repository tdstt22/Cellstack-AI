import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography } from "../styles/theme";

const useStyles = makeStyles({
  // Main container with floating card design
  inputCard: {
    margin: "0 16px 16px",
    background: colors.bgSecondary, // #F0EFED light-grey background
    border: `1px solid ${colors.border}`, // #E3E0D8 light border
    borderRadius: "8px",
    position: "relative",
    padding: "8px 12px",
    minHeight: "100px",
    // Removed maxHeight to allow dynamic growth
  },
  
  
  
  // Left group with "Add Context..." button and pills positioned at top left
  leftGroup: {
    position: "absolute",
    top: "8px",
    left: "12px",
    right: "12px", // Use full container width - right group will overlay if needed
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    zIndex: 10, // Ensure pills appear below right group controls
  },
  
  addContextButton: {
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
  },
  
  paperclipIcon: {
    width: spacing.iconSize.medium,
    height: spacing.iconSize.medium,
    stroke: colors.placeholder,
    fill: "none",
    strokeWidth: "1.5",
  },
  
  // Center text input area spanning full width 
  inputContainer: {
    position: "absolute",
    top: "32px",
    left: "12px", 
    right: "12px", // Use full container width
    bottom: "32px",
    display: "flex",
    alignItems: "center",
    // No right padding - let text use full width with right group overlaying
  },
  
  
  textInput: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
    background: "transparent",
    border: "none",
    outline: "none",
    flex: 1,
    resize: "none",
    minHeight: "20px",
    maxHeight: "300px", // Increased max height for better expansion
    overflowY: "auto", // Enable vertical scrolling when content exceeds max height
    lineHeight: "1.4", // Consistent line height for better text rendering
    "&::placeholder": {
      color: colors.placeholder,
    },
    // Custom scrollbar styling for better appearance
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.placeholder,
      borderRadius: "2px",
      "&:hover": {
        background: colors.textPrimary,
      },
    },
  },
  
  // Right group with dropdown and send button positioned at bottom right
  rightGroup: {
    position: "absolute",
    bottom: "8px", // Position in the natural bottom area
    right: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 20, // Ensure right group appears above text input and pills
    backgroundColor: colors.bgSecondary, // Match container background to hide overlapping content
    padding: "4px 8px", // Better padding for text overlay
    borderRadius: "6px",
    // Subtle shadow to distinguish from text content
    // boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  
  dropdown: {
    position: "relative",
  },
  
  dropdownButton: {
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 0",
    cursor: "pointer",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    transition: "background-color 0.2s ease",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
  },
  
  chevronIcon: {
    width: spacing.iconSize.small,
    height: spacing.iconSize.small,
    stroke: colors.textPrimary,
    fill: "none",
    strokeWidth: "2",
    transition: "transform 0.2s ease",
  },
  
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  
  dropdownMenu: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    marginBottom: "8px",
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    minWidth: "80px",
  },
  
  dropdownOption: {
    background: "transparent",
    border: "none",
    width: "100%",
    padding: "8px 12px",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "-2px",
    },
    "&:first-child": {
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
    },
    "&:last-child": {
      borderBottomLeftRadius: "8px",
      borderBottomRightRadius: "8px",
    },
  },
  
  sendButton: {
    background: "transparent",
    border: "none",
    padding: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  
  sendIcon: {
    width: spacing.iconSize.large,
    height: spacing.iconSize.large,
    fill: colors.textPrimary,
    stroke: "none",
  },
  
  // Context attachment pills
  attachedFilePill: {
    backgroundColor: colors.border,
    borderRadius: "12px",
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    maxWidth: "200px", // Prevent pills from taking too much horizontal space
    minWidth: "60px",   // Ensure pills have minimum readable width
    flexShrink: 0,      // Prevent pills from shrinking too much
  },
  
  fileName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1, // Allow filename to take available space in the pill
  },
  
  removeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `1px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
  },
  
  removeIcon: {
    width: "12px",
    height: "12px",
    stroke: colors.placeholder,
    fill: "none",
    strokeWidth: "2",
  },
});

// SVG Icons
const PaperclipIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a.498.498 0 0 1 0 .396l-2.843 7.627a.498.498 0 0 0 .683.627l16.999-8.5a.498.498 0 0 0 0-.904L3.714 3.048Z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const MessageInputArea = ({ 
  onSendMessage, 
  onActionChange,
  disabled = false, 
  placeholder = "Edit your spreadsheet in agent mode",
  defaultAction = "Ask" 
}) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");
  const [selectedAction, setSelectedAction] = useState(defaultAction);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [leftGroupHeight, setLeftGroupHeight] = useState(32); // Default height for button only
  const [containerHeight, setContainerHeight] = useState(100); // Dynamic container height
  const [textareaHeight, setTextareaHeight] = useState(20); // Track actual textarea height
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const leftGroupRef = useRef(null);
  const rightGroupRef = useRef(null);
  const containerRef = useRef(null);

  const actions = ["Ask", "Agent"];
  const canSend = inputValue.trim().length > 0 && !disabled;

  // Update selected action when defaultAction prop changes
  useEffect(() => {
    if (defaultAction && defaultAction !== selectedAction) {
      setSelectedAction(defaultAction);
    }
  }, [defaultAction, selectedAction]);

  // Dynamic input container style when context pills are present
  const inputContainerDynamic = {
    position: "absolute",
    top: `${leftGroupHeight}px`,
    left: "12px", 
    right: "12px",
    bottom: "32px",
    display: "flex",
    alignItems: "center",
    // No right padding - let text use full width with right group overlaying
  };

  // Dynamic container style to accommodate pills and text expansion
  const dynamicContainerStyle = {
    minHeight: `${containerHeight}px`,
    maxHeight: "400px", // Maximum container height to prevent excessive growth
  };

  // Auto-resize textarea with dynamic height limits and container coordination
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get accurate scroll height
      textareaRef.current.style.height = "auto";
      
      // Calculate desired height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 20;
      const maxExpandHeight = 200; // Max height before scrolling kicks in
      const maxAbsoluteHeight = 300; // Absolute max height with scrolling
      
      // Determine the appropriate height
      let newHeight;
      if (scrollHeight <= maxExpandHeight) {
        // Content fits within expansion limit - expand container
        newHeight = Math.max(minHeight, scrollHeight);
      } else {
        // Content exceeds expansion limit - use max expand height and enable scrolling
        newHeight = Math.min(maxExpandHeight, maxAbsoluteHeight);
      }
      
      // Apply the calculated height
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Update state to trigger container recalculation
      if (newHeight !== textareaHeight) {
        setTextareaHeight(newHeight);
      }
    }
  }, [inputValue, textareaHeight]);

  // Calculate dimensions using ResizeObserver for accurate real-time measurements
  useEffect(() => {
    const updateLayout = () => {
      requestAnimationFrame(() => {
        if (leftGroupRef.current) {
          // Get accurate measurements using getBoundingClientRect
          const leftGroupRect = leftGroupRef.current.getBoundingClientRect();
          
          // Calculate new dimensions
          const newLeftGroupHeight = leftGroupRect.height;
          
          // Calculate required container height: pill area + buffer + actual text input height + bottom controls
          const bufferSpace = 16;
          const bottomControlsHeight = 32;
          const newContainerHeight = Math.max(100, newLeftGroupHeight + bufferSpace + textareaHeight + bottomControlsHeight);
          
          // Update state
          setLeftGroupHeight(newLeftGroupHeight + bufferSpace);
          setContainerHeight(newContainerHeight);
        }
      });
    };

    // Setup ResizeObserver for accurate dimension tracking
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    if (leftGroupRef.current) {
      resizeObserver.observe(leftGroupRef.current);
    }

    // Initial layout calculation
    updateLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [attachments, textareaHeight]); // Re-run when attachments or textarea height change

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage && onSendMessage) {
      onSendMessage({
        message: trimmedMessage,
        // action: selectedAction,
        // attachments: attachments,
      });
      setInputValue("");
      setAttachments([]); // Clear context pills after sending message
      setTextareaHeight(20); // Reset textarea height to minimum
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "20px";
      }
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setIsDropdownOpen(false);
    
    // Notify parent component about action change
    if (onActionChange) {
      onActionChange(action);
    }
  };

  const handleAddContext = () => {
    // Mock adding a file for demonstration with varied names to test wrapping
    const mockFiles = [
      "Sheet1.xlsx",
      "LongDataAnalysisReport.xlsx", 
      "Data.csv",
      "QuarterlyFinancialReport.pdf",
      "Summary.docx",
      "ExtraLongFileNameForTesting.xlsx"
    ];
    const mockFile = {
      id: Date.now().toString(),
      name: mockFiles[attachments.length % mockFiles.length],
    };
    setAttachments(prev => [...prev, mockFile]);
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  return (
    <div 
      ref={containerRef}
      className={styles.inputCard} 
      style={dynamicContainerStyle}
      role="form" 
      aria-label="Send message"
    >
      {/* Left group - Add Context button and pills (positioned at top left) */}
      <div ref={leftGroupRef} className={styles.leftGroup}>
        <button
          className={styles.addContextButton}
          onClick={handleAddContext}
          aria-label="Add context or attach files"
          title="Add Context"
        >
          <PaperclipIcon className={styles.paperclipIcon} />
          <span>Add Context…</span>
        </button>
        
        {/* Context pills rendered inline with the button */}
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={styles.attachedFilePill}
            role="listitem"
            aria-label={`Attached file: ${attachment.name}`}
          >
            <span className={styles.fileName}>{attachment.name}</span>
            <button
              className={styles.removeButton}
              onClick={() => handleRemoveAttachment(attachment.id)}
              aria-label={`Remove ${attachment.name}`}
              title="Remove attachment"
            >
              <XIcon className={styles.removeIcon} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Center - Text input (positioned to span full width) */}
      <div 
        className={attachments.length === 0 ? styles.inputContainer : ""} 
        style={attachments.length > 0 ? inputContainerDynamic : {}}
      >
        <textarea
          ref={textareaRef}
          className={styles.textInput}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Type your message"
        />
      </div>
      
      {/* Right group - Dropdown and send button (positioned at bottom right) */}
      <div ref={rightGroupRef} className={styles.rightGroup}>
        <div ref={dropdownRef} className={styles.dropdown}>
          <button
            className={styles.dropdownButton}
            onClick={handleDropdownToggle}
            aria-label={`Current action: ${selectedAction}`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{selectedAction}</span>
            <ChevronDownIcon 
              className={`${styles.chevronIcon} ${isDropdownOpen ? styles.chevronOpen : ""}`} 
            />
          </button>
          
          {isDropdownOpen && (
            <div 
              className={styles.dropdownMenu}
              role="listbox"
              aria-label="Select action type"
            >
              {actions.map((action) => (
                <button
                  key={action}
                  className={styles.dropdownOption}
                  onClick={() => handleActionSelect(action)}
                  role="option"
                  aria-selected={action === selectedAction}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send message"
        >
          <SendIcon className={styles.sendIcon} />
        </button>
      </div>
    </div>
  );
};

export default MessageInputArea;