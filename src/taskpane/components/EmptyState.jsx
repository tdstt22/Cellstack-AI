import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { colors, spacing, typography, commonStyles } from "../styles/theme";

const useStyles = makeStyles({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    padding: `${spacing.xl} ${spacing.lg}`,
    ...commonStyles.flex.columnCenter,
    overflowY: "auto",
  },
  
  content: {
    maxWidth: "300px",
    textAlign: "center",
    ...commonStyles.flex.columnCenter,
  },
  
  headline: {
    ...commonStyles.text.headline,
    marginBottom: spacing.sm,
  },
  
  subtext: {
    ...commonStyles.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.xl,
  },
  
  tipsList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    alignItems: "flex-start",
    width: "100%",
  },
  
  tipItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  
  tipIcon: {
    width: spacing.iconSize.medium,
    height: spacing.iconSize.medium,
    flexShrink: 0,
    stroke: colors.placeholder,
    fill: "none",
    strokeWidth: "1.5",
  },
  
  tipIconFilled: {
    fill: colors.placeholder,
    stroke: "none",
  },
  
  tipText: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
});

// SVG Icons for usage tips
const PaperclipIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const HashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </svg>
);

const AtSignIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path d="m12 8-3 3 3 3" />
    <path d="M16 12h5a9 9 0 1 1-5.5-8" />
  </svg>
);

const SlashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M8.5 8.5 15.5 15.5" />
    <path d="M15.5 8.5 8.5 15.5" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const EmptyState = () => {
  const styles = useStyles();

  const usageTips = [
    {
      icon: PaperclipIcon,
      text: "Attach files or context",
      iconFilled: false,
    },
    {
      icon: HashIcon,
      text: "Type # to attach context",
      iconFilled: false,
    },
    {
      icon: AtSignIcon,
      text: "Use @ to mention specific data",
      iconFilled: false,
    },
    {
      icon: SlashIcon,
      text: "Type / for quick commands",
      iconFilled: false,
    },
  ];

  return (
    <main className={styles.container} role="main">
      <div className={styles.content}>
        <h1 className={styles.headline}>Ask AI Copilot</h1>
        
        <p className={styles.subtext}>
          Rexcel is powered by AI, so mistakes are possible. Review output carefully before use.
        </p>
        
        <ul className={styles.tipsList} role="list" aria-label="Usage tips">
          {usageTips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <li key={index} className={styles.tipItem} role="listitem">
                <IconComponent 
                  className={tip.iconFilled ? styles.tipIconFilled : styles.tipIcon} 
                />
                <span className={styles.tipText}>{tip.text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
};

export default EmptyState;