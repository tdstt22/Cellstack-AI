# Cellstack - Excel Office Add-in with AI Chat

An Excel Office Add-in featuring a modern AI chat interface that provides Excel help, formula assistance, and data analysis guidance through natural language interactions.

## Prerequisites

- **Node.js** (v16 or higher) - Visit the [Node.js site](https://nodejs.org/) to download and install
- **npm** (comes with Node.js) - Verify installation with `node -v` and `npm -v`
- **Microsoft 365 account** with Excel access - You might qualify for a [Microsoft 365 E5 developer subscription](https://developer.microsoft.com/microsoft-365/dev-program)
- **Anthropic API key** for AI functionality

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd rex-demo
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.template .env
   ```

   Edit `.env` and add your Anthropic API key:

   ```
   ANTHROPIC_API_KEY=your_api_key_here
   FRONTEND_PORT=3000
   BACKEND_PORT=3001
   ```

3. **Sign in to Microsoft 365 (optional but recommended):**
   ```bash
   npm run signin
   ```

## Running Locally

## Using Office Add-ins Development Kit Extension (Recommended)

If you prefer using VS Code with the Office Add-ins Development Kit extension:

1. **Open the Office Add-ins Development Kit**
   - In VS Code's Activity Bar, select the Office Add-ins Development Kit icon

2. **Preview Your Office Add-in (F5)**
   - Select "Preview Your Office Add-in(F5)" and choose "Excel Desktop (Edge Chromium)"
   - This launches Excel and sideloads the add-in

3. **Stop Previewing**
   - Select "Stop Previewing Your Office Add-in" when finished

### Full Development Environment (Alternative)

Start both frontend and backend servers concurrently:

```bash
npm run dev:fullstack
```

This will:

- Start the React frontend on https://localhost:3000 with hot reloading
- Start the Express.js backend on http://localhost:3001 with auto-restart
- Automatically proxy API calls from frontend to backend

### Individual Services

**Frontend only:**

```bash
npm run dev-server
```

**Backend only:**

```bash
npm run backend
```

### Testing in Excel

1. Start the development servers (using `npm run dev:fullstack`)
2. Launch the add-in in Excel:
   ```bash
   npm start
   ```
3. Excel will open with the add-in loaded in the task pane

To stop the add-in:

```bash
npm stop
```

## Development Commands

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

- **Frontend**: React 18 app served on port 3000
- **Backend**: Express.js API server on port 3001
- **AI Integration**: Anthropic Claude API with Server-Sent Events streaming
- **Office Integration**: Office JavaScript API for Excel functionality

## Project Structure

```
src/
├── taskpane/              # React frontend
│   ├── components/        # UI components
│   ├── services/          # Backend client & Excel API
│   └── styles/           # Theme and styling
├── backend/              # Express.js backend
│   ├── routes/           # API endpoints
│   ├── services/         # AI service integration
│   └── middleware/       # Custom middleware
└── commands/             # Office add-in commands
```

## Troubleshooting

### Common Issues

**Port conflicts:**

- Change ports in `.env` file if 3000 or 3001 are in use

**SSL certificate warnings:**

- Accept the self-signed certificate warning in your browser for https://localhost:3000

**Add-in not loading:**

```bash
npm run validate  # Check manifest.xml
npm stop && npm start  # Restart the add-in
```

**AI responses not working:**

- Verify your `ANTHROPIC_API_KEY` is set correctly in `.env`
- Check backend logs for API errors

### Development Tips

- Use browser dev tools on the task pane for debugging
- Backend logs show AI API interactions and errors
- The add-in automatically reloads when frontend code changes
- Backend restarts automatically when server code changes

## Production Deployment

1. Update `urlProd` in `webpack.config.js` with your production domain
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to your web server
4. Update the manifest.xml with production URLs
5. Publish the add-in through Microsoft AppSource or deploy privately

## Key Files

- `./manifest.xml` - Add-in settings and capabilities
- `./src/taskpane/components/` - React UI components
- `./src/backend/` - Express.js API server
- `./CLAUDE.md` - Project documentation and development guidance

## Copyright

Copyright (c) 2024 Microsoft Corporation. All rights reserved.

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**
