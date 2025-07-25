# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Excel Office Add-in project called **Rexcel** built with React and the Office JavaScript API. The add-in features a modern AI chat interface in the task pane that allows users to get Excel help, formula assistance, and data analysis guidance through natural language interactions.

## Development Commands

### Core Development

- `npm run dev-server` - Start the frontend development server on port 3000 with hot reloading
- `npm run backend` - Start the Express.js backend server on port 3001 with nodemon auto-restart
- `npm run dev:fullstack` - **Recommended**: Start both frontend and backend servers concurrently
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

### Backend Architecture

- `src/backend/server.js` - Express.js server with CORS, security middleware, and API routing
- `src/backend/routes/chatRoutes.js` - HTTP streaming endpoints and chat API routes
- `src/backend/services/aiService.js` - Anthropic Claude API integration with streaming support
- `src/backend/middleware/` - Custom middleware for logging, error handling, and security

### Office Integration

- `src/taskpane/servcies/aiTools.js` - Enhanced Excel API functions wrapped as tools to be used by AI agent
- `src/taskpane/services/backendClient.js` - HTTP client for backend API communication
- `manifest.xml` - Office add-in manifest defining capabilities and UI integration

### Build Configuration

- **Webpack**: Configured for React/JSX with Babel transpilation, HTTPS dev server
- **TypeScript**: Configured for React JSX compilation (tsconfig.json)
- **Development URL**: https://localhost:3000/
- **Production URL**: Update `urlProd` in webpack.config.js before deployment

## Technology Stack

- **Frontend**: React 18 with custom styling system (no Fluent UI dependency)
- **Backend**: Express.js with helmet security, CORS, and SSE streaming
- **AI Integration**: Anthropic Claude API with streaming responses via Server-Sent Events
- **Office Integration**: Office JavaScript API (Excel-specific) with enhanced functionality
- **Build Tools**: Webpack, Babel, TypeScript, dotenv for environment variables
- **Development**: Office Add-ins Development Kit, nodemon, concurrently for full-stack development
- **UI Framework**: Custom CSS-in-JS with makeStyles pattern

## Current Interface Design

The chat interface follows specifications in `chat-ui.spec.md`:

- **4-Section Layout**: TopBar → EmptyState → ContextBar → InputArea
- **Light Theme**: Creamy white background with subtle borders
- **Modern UX**: Single-input interface with context attachments
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Responsive**: Optimized for 350-450px task pane width

## Key Files

### Frontend

- `src/taskpane/components/ChatInterface.jsx` - Main chat UI with SSE streaming integration
- `src/taskpane/services/backendClient.js` - Backend API client with Server-Sent Events support
- `src/taskpane/taskpane.js` - Enhanced Excel API integration functions
- `src/taskpane/styles/theme.js` - Design system and color palette

### Backend

- `src/backend/server.js` - Express.js server with middleware and routing
- `src/backend/routes/chatRoutes.js` - Chat API endpoints including SSE streaming
- `src/backend/services/aiService.js` - Anthropic Claude API integration

### Configuration

- `manifest.xml` - Office add-in definition and capabilities
- `.env` / `.env.template` - Environment configuration for API keys and ports
- `webpack.config.js` - Build configuration with HTTPS, proxy, and environment variables
- `chat-ui.spec.md` - Detailed UI design specifications
- `ai.spec.md` - AI integration specifications and requirements

## Development Notes

### Architecture Overview

- **Full-Stack Setup**: Frontend (React) + Backend (Express.js) + AI Integration (Anthropic Claude)
- **Development Workflow**: Use `npm run dev:fullstack` to start both servers concurrently
- **Frontend (Port 3000)**: Webpack dev server with hot reloading and API proxy configuration
- **Backend (Port 3001)**: Express.js server with nodemon auto-restart for API changes

### AI Integration

- **Real-time Streaming**: Server-Sent Events (SSE) for live AI response streaming
- **Backend Processing**: All AI logic moved to Express.js backend for security and scalability
- **API Communication**: Frontend uses HTTP client with EventSource API for SSE consumption
- **Error Handling**: Comprehensive error handling for API failures, network issues, and streaming interruptions

### Configuration Requirements

- **Environment Setup**: Configure `.env` file (copy from `.env.template`)
- **API Key**: Set `ANTHROPIC_API_KEY` with your actual Anthropic API key
- **Port Configuration**: Frontend (3000), Backend (3001) - automatically proxied during development
- **CORS & Security**: Backend configured with helmet security middleware and CORS for cross-origin requests

### Development Features

- **Webpack Proxy**: API calls automatically proxied from frontend to backend during development
- **Hot Reloading**: Frontend changes reflect immediately, backend changes restart server automatically
- **Conversation History**: Managed server-side with endpoints for retrieval and clearing
- **Health Monitoring**: Backend health check endpoint for service status monitoring
- **Office.js Integration**: All Excel API functions enhanced and ready for production use
