# TokenTalk - Chat History Storage with Azure Blob and Claude AI Integration

TokenTalk is a chat application that integrates with the Claude AI API to provide real-time responses and a robust chat history storage system using Azure Blob Storage. This project demonstrates how to build a scalable chat application with token tracking, syntax highlighting, and persistent chat storage for analysis and review.

## Features

- **Real-Time Chat with Claude AI**: Interact with Claude AI to get real-time responses and insights.
- **Token Tracking**: Monitor the number of tokens used for each message, helping to manage usage efficiently.
- **Code Syntax Highlighting**: Display code snippets with syntax highlighting for a better user experience.
- **Persistent Chat History Storage**: Save each chat conversation to Azure Blob Storage for long-term retention.
- **Chat History Retrieval**: Retrieve and review past conversations from Azure Blob Storage.
- **Configuration via Environment Variables**: Use environment variables to securely manage API keys and configuration settings.

## Project Structure
```
TokenTalk/
├── client/                     # Frontend application (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.js         # Main chat window
│   │   │   ├── ChatSidebar.js        # Sidebar with chat history
│   │   │   ├── TokenTicker.js        # Token usage display
│   │   │   └── CodeBlock.js          # Syntax highlighting for code snippets
│   │   ├── App.js                    # Main app component
│   │   └── index.js                  # Entry point for React
│   ├── webpack.config.js             # Webpack configuration for dev and prod
│   ├── package.json                  # Frontend dependencies
│   └── .env                          # Frontend environment variables
├── server/                    # Backend server (Node.js/Express)
│   ├── app.js                       # Main server app with API endpoints
│   ├── config.js                    # Configurations and helper functions
│   ├── database.js                  # SQLite database (optional for local storage)
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Backend environment variables
├── README.md                   # Project documentation
└── .gitignore                  # Files to be ignored by git
```
## Getting Started

### Prerequisites

- **Node.js** (>= 14.x)
- **Azure Account** with access to Blob Storage
- **Claude AI API Key** for connecting with Claude API
- **Azure Blob Storage Account and Container** for chat history

### Installation

1. **Clone the repository:**
 ```bash
 git clone https://github.com/yourusername/TokenTalk.git
 cd TokenTalk
 ```
2. **Install dependencies for the backend / frontend:**
 ```
 cd server
 npm install
 cd ../client
 npm install
 ```

3. **Set up environment variables:**

- In server/.env, add:
 ```
 AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
 CHAT_CONTAINER_NAME=chathistory
 ANTHROPIC_API_KEY=your_claude_api_key
 PORT=5001
 ```

- In server/.env, add:
 ```
 AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
 CHAT_CONTAINER_NAME=chathistory
 ANTHROPIC_API_KEY=your_claude_api_key
 PORT=5001
  ```

### Usage

1. **Start the Backend Server**
 ```
 cd server
 node app.js
 ```

2. **Start the Frontend Client:**
 ```
 cd client
 npm start
 ```

3. **Open the Application in Your Browser:**
 - **The client should open automatically in your default browser at http://localhost:3000.**
