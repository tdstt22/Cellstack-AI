// Theme system for the redesigned chat interface
// Based on chat-ui.spec.md specifications

export const colors = {
  // Background colors
  bgPrimary: "#FCF8F1",     // Main background (creamy white)
  bgSecondary: "#F0EFED",   // Secondary background (light grey)
  
  // Border colors
  border: "#E3E0D8",        // Border color (very light grey)
  
  // Text colors
  textPrimary: "#333333",   // Primary text color
  textSecondary: "#555555", // Secondary text color
  placeholder: "#888888",   // Placeholder text and icons
  
  // Interactive states
  hoverOverlay: "rgba(51,51,51,0.05)", // Icon hover overlay
  focusOutline: "#CCC",     // Focus outline color
};

export const typography = {
  // Font family
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  
  // Font sizes
  fontSize: {
    small: "12px",
    base: "13px",
    medium: "14px",
    large: "24px",
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
  },
};

export const spacing = {
  // Base spacing unit: 8px
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "40px",
  
  // Specific measurements from spec
  topBarHeight: "48px",
  messageInputMinHeight: "100px", // Updated for new floating card design per spec
  iconSize: {
    small: "8px",
    medium: "16px",
    large: "20px",
  },
};

export const createStyles = (styleObj) => {
  // Helper function to create styles with theme values
  const processedStyles = {};
  
  for (const [className, styles] of Object.entries(styleObj)) {
    processedStyles[className] = {};
    for (const [property, value] of Object.entries(styles)) {
      // Replace theme tokens with actual values
      if (typeof value === "string") {
        processedStyles[className][property] = value
          .replace(/var\(--bg-primary\)/g, colors.bgPrimary)
          .replace(/var\(--bg-secondary\)/g, colors.bgSecondary)
          .replace(/var\(--border\)/g, colors.border)
          .replace(/var\(--text-primary\)/g, colors.textPrimary)
          .replace(/var\(--text-secondary\)/g, colors.textSecondary)
          .replace(/var\(--placeholder\)/g, colors.placeholder)
          .replace(/var\(--hover-overlay\)/g, colors.hoverOverlay)
          .replace(/var\(--focus-outline\)/g, colors.focusOutline)
          .replace(/var\(--font-family\)/g, typography.fontFamily);
      } else {
        processedStyles[className][property] = value;
      }
    }
  }
  
  return processedStyles;
};

// CSS-in-JS style generator using Fluent UI's makeStyles
export const makeThemeStyles = (styleDefinition) => {
  return createStyles(styleDefinition);
};

// Global CSS variables (for potential future use)
export const cssVariables = `
  :root {
    --bg-primary: ${colors.bgPrimary};
    --bg-secondary: ${colors.bgSecondary};
    --border: ${colors.border};
    --text-primary: ${colors.textPrimary};
    --text-secondary: ${colors.textSecondary};
    --placeholder: ${colors.placeholder};
    --hover-overlay: ${colors.hoverOverlay};
    --focus-outline: ${colors.focusOutline};
    --font-family: ${typography.fontFamily};
  }
`;

// Common style patterns
export const commonStyles = {
  // Flexbox patterns
  flex: {
    center: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    between: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    start: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    column: {
      display: "flex",
      flexDirection: "column",
    },
    columnCenter: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  
  // Interactive states
  interactive: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: colors.hoverOverlay,
    },
    "&:focus": {
      outline: `2px solid ${colors.focusOutline}`,
      outlineOffset: "1px",
    },
  },
  
  // Typography presets
  text: {
    headline: {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
      color: colors.textPrimary,
    },
    body: {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: colors.textPrimary,
    },
    secondary: {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: colors.textSecondary,
    },
    input: {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.normal,
      color: colors.textPrimary,
      "&::placeholder": {
        color: colors.placeholder,
      },
    },
  },
};