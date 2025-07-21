import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography, commonStyles } from "../styles/theme";

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
    maxHeight: "180px",
  },
  
  // Context pills display area (when attachments exist)
  contextArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  
  
  // Left group with "Add Context..." button positioned at top left
  leftGroup: {
    position: "absolute",
    top: "8px",
    left: "12px",
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
    right: "12px",
    bottom: "32px",
    display: "flex",
    alignItems: "center",
    paddingRight: "100px", // Leave space for right group controls
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
    maxHeight: "140px",
    "&::placeholder": {
      color: colors.placeholder,
    },
  },
  
  // Right group with dropdown and send button positioned at bottom right
  rightGroup: {
    position: "absolute",
    bottom: "8px",
    right: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
  },
  
  fileName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
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
  disabled = false, 
  placeholder = "Ask Rexcel",
  defaultAction = "Ask" 
}) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");
  const [selectedAction, setSelectedAction] = useState(defaultAction);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  const actions = ["Ask", "Agent"];
  const canSend = inputValue.trim().length > 0 && !disabled;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputValue]);

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
        action: selectedAction,
        attachments: attachments,
      });
      setInputValue("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setIsDropdownOpen(false);
  };

  const handleAddContext = () => {
    // Mock adding a file for demonstration
    const mockFile = {
      id: Date.now().toString(),
      name: `Sheet${attachments.length + 1}.xlsx`,
    };
    setAttachments(prev => [...prev, mockFile]);
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  return (
    <div className={styles.inputCard} role="form" aria-label="Send message">
      {/* Context attachments area (only show if attachments exist) */}
      {attachments.length > 0 && (
        <div className={styles.contextArea} role="list" aria-label="Attached files">
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
      )}
      
      {/* Left group - Add Context button (positioned at top left) */}
      <div className={styles.leftGroup}>
        <button
          className={styles.addContextButton}
          onClick={handleAddContext}
          aria-label="Add context or attach files"
          title="Add Context"
        >
          <PaperclipIcon className={styles.paperclipIcon} />
          <span>Add Context…</span>
        </button>
      </div>
      
      {/* Center - Text input (positioned to span full width) */}
      <div className={styles.inputContainer}>
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
      <div className={styles.rightGroup}>
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