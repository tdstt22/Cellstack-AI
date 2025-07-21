# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Excel Office Add-in project called **Rexcel** built with React and the Office JavaScript API. The add-in features a modern AI chat interface in the task pane that allows users to get Excel help, formula assistance, and data analysis guidance through natural language interactions.

## Development Commands

### Core Development
- `npm run dev-server` - Start the development server on port 3000 with hot reloading
- `npm start` - Start the add-in in Excel for debugging (uses Office Add-ins Development Kit)
- `npm stop` - Stop the add-in debugging session

### Build Commands
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run watch` - Development build with file watching

### Code Quality
- `npm run lint` - Check code with office-addin-lint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run prettier` - Format code with Prettier
- `npm run validate` - Validate the manifest.xml file

### Office 365 Authentication
- `npm run signin` - Sign in to Microsoft 365 account
- `npm run signout` - Sign out of Microsoft 365 account

## Architecture

### Entry Points
- **Task Pane**: `src/taskpane/index.jsx` - Main React application entry point
- **Commands**: `src/commands/commands.js` - Office add-in command functions

### Core Components
- `src/taskpane/components/App.jsx` - Root component that renders ChatInterface
- `src/taskpane/components/ChatInterface.jsx` - Main chat container with 4-section layout
- `src/taskpane/components/TopBar.jsx` - Header with "CHAT" title and action icons
- `src/taskpane/components/EmptyState.jsx` - Centered welcome screen with usage tips
- `src/taskpane/components/ContextBar.jsx` - Context attachment functionality
- `src/taskpane/components/InputArea.jsx` - Input field with Ask/Agent dropdown and send button

### Design System
- `src/taskpane/styles/theme.js` - Custom color palette and styling system
- **Color Scheme**: Light creamy theme (#FCF8F1 background, #333333 text)
- **Typography**: System-ui font family with consistent sizing
- **Spacing**: 8px base unit system

### Office Integration
- `src/taskpane/taskpane.js` - Enhanced Excel API functions (insertFormula, getSelectedRange, detectErrors, etc.)
- `src/taskpane/utils/mockAI.js` - Mock AI response system for development
- `manifest.xml` - Office add-in manifest defining capabilities and UI integration

### Build Configuration
- **Webpack**: Configured for React/JSX with Babel transpilation, HTTPS dev server
- **TypeScript**: Configured for React JSX compilation (tsconfig.json)
- **Development URL**: https://localhost:3000/
- **Production URL**: Update `urlProd` in webpack.config.js before deployment

## Technology Stack
- **Frontend**: React 18 with custom styling system (no Fluent UI dependency)
- **Office Integration**: Office JavaScript API (Excel-specific) with enhanced functionality
- **Build Tools**: Webpack, Babel, TypeScript
- **Development**: Office Add-ins Development Kit for debugging
- **UI Framework**: Custom CSS-in-JS with makeStyles pattern

## Current Interface Design
The chat interface follows specifications in `chat-ui.spec.md`:
- **4-Section Layout**: TopBar → EmptyState → ContextBar → InputArea
- **Light Theme**: Creamy white background with subtle borders
- **Modern UX**: Single-input interface with context attachments
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Responsive**: Optimized for 350-450px task pane width

## Key Files
- `manifest.xml` - Add-in definition and capabilities
- `src/taskpane/taskpane.js` - Enhanced Excel API integration functions
- `src/taskpane/styles/theme.js` - Design system and color palette
- `src/taskpane/utils/mockAI.js` - Mock AI response system
- `chat-ui.spec.md` - Detailed UI design specifications
- `webpack.config.js` - Build configuration with HTTPS setup for Office development

## Development Notes
- The interface currently shows an empty state optimized for initial user interaction
- Mock AI responses are implemented for development and testing
- Context attachment system is ready for file upload implementation
- All Office.js integration functions are enhanced and ready for production use