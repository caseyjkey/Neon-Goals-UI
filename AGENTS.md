# AGENTS.md - Agent Integration Guide

This document explains how the Neon Goals UI integrates with AI agents and the backend service.

---

## Table of Contents

- [Agent Communication Architecture](#agent-communication-architecture)
- [Frontend Integration Points](#frontend-integration-points)
- [Proposal System](#proposal-system)
- [Streaming Responses](#streaming-responses)
- [Best Practices](#best-practices)

---

## Agent Communication Architecture

The UI is a **client** that facilitates communication between users and AI agents. It does not host agents itself — it connects to the backend service where agents live.

### Communication Flow

```
User → UI (React) → Backend API (NestJS) → AI Agents (OpenAI/GPT)
```

1. **User** interacts with UI components (chat input, goal forms)
2. **UI** sends HTTP requests to backend with user's JWT token
3. **Backend** forwards messages to AI agents with goal context
4. **Agent** processes and returns response (possibly with commands)
5. **UI** parses response and renders appropriate UI (text, buttons, confirmations)

### Authentication

The UI uses **JWT authentication** exclusively — it never uses API keys (those are for server-side agents).

```typescript
// apiClient automatically adds Authorization header
const response = await apiClient.post('/ai/overview/chat', {
  message: 'What should I work on today?'
});
```

---

## Frontend Integration Points

### Chat Components

The UI has multiple chat interfaces for different agent types:

| Component | Agent | Context | Location |
|-----------|-------|---------|----------|
| `OverviewChat` | Overview Agent | All user goals | `/overview` |
| `CategoryChat` | Category Specialist | Single category (items/finances/actions) | `/category/:id` |
| `GoalViewChat` | Goal View Agent | Single goal details | `/goal/:id` |

### State Management

**Prefer Zustand store subscriptions over `useMemo`:**

```typescript
// ❌ Avoid: useMemo with version hack
const { goals, goalsVersion } = useAppStore();
const goal = useMemo(() => goals.find(g => g.id === id), [goals, id, goalsVersion]);

// ✅ Prefer: Direct store subscription
const goal = useAppStore(state => state.goals.find(g => g.id === id));
```

This ensures automatic reactivity — the component only re-renders when the specific data changes.

### Sending Messages to Agents

```typescript
import { useApi } from '@/hooks/use-api';

function OverviewChat() {
  const { apiClient } = useApi();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    // Add user message locally
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    // Send to backend (forwards to agent)
    const response = await apiClient.post('/ai/overview/chat', {
      message: input
    });

    // Add agent response
    setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);

    setInput('');
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

---

## Proposal System

Agents can propose goal changes through embedded commands. The UI parses these commands and renders action buttons.

### Parsing Agent Responses

```typescript
function parseAgentCommand(response: string): { command: string, data: any } | null {
  const commandMatch = response.match(/^([A-Z_]+):\s*(\{.*\})$/m);

  if (!commandMatch) return null;

  const [, command, jsonStr] = commandMatch;
  try {
    const data = JSON.parse(jsonStr);
    return { command, data };
  } catch {
    return null;
  }
}

// Example usage
const response = `
  I can help you create that goal!

  CREATE_GOAL: {"type":"item","title":"2023 GMC Sierra","budget":100000,"proposalType":"confirm_edit_cancel","awaitingConfirmation":true}
`;

const command = parseAgentCommand(response);
// command = { command: "CREATE_GOAL", data: {...} }
```

### Rendering Proposal Buttons

```typescript
function AgentMessage({ message }: { message: ChatMessage }) {
  const command = parseAgentCommand(message.content);
  const { confirmProposal, cancelProposal, editProposal } = useProposalStore();

  if (!command || !command.data.awaitingConfirmation) {
    return <div>{message.content}</div>;
  }

  const proposalType = command.data.proposalType;

  return (
    <div>
      <div>{message.content}</div>
      <div className="proposal-buttons">
        <button onClick={() => confirmProposal(command)}>
          Confirm
        </button>
        {proposalType === 'confirm_edit_cancel' && (
          <button onClick={() => editProposal(command)}>
            Edit
          </button>
        )}
        <button onClick={() => cancelProposal(command)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### Executing Proposals

```typescript
function useProposalStore() {
  const { apiClient } = useApi();
  const refreshGoals = useGoalsStore(state => state.fetchGoals);

  const confirmProposal = async (command: ParsedCommand) => {
    await apiClient.post('/ai/command/confirm', {
      pendingCommand: `${command.command}: ${JSON.stringify(command.data)}`
    });
    refreshGoals(); // Update UI with new/modified goals
  };

  const cancelProposal = async (command: ParsedCommand) => {
    await apiClient.post('/ai/command/cancel', {
      pendingCommand: `${command.command}: ${JSON.stringify(command.data)}`
    });
  };

  const editProposal = async (command: ParsedCommand) => {
    const response = await apiClient.post('/ai/command/edit', {
      pendingCommand: `${command.command}: ${JSON.stringify(command.data)}`
    });
    // Show edit modal with current values
    return response.data;
  };

  return { confirmProposal, cancelProposal, editProposal };
}
```

---

## Streaming Responses

For long-running AI tasks, the UI uses Server-Sent Events (SSE) to stream responses in real-time.

### Streaming Chat Messages

```typescript
function useStreamingChat(endpoint: string) {
  const { apiClient } = useApi();

  const streamMessage = async (message: string, onChunk: (chunk: string) => void) => {
    const response = await fetch(
      `${apiClient.defaults.baseURL}${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getJwtToken()}`
        },
        body: JSON.stringify({ message })
      }
    );

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Parse SSE format: data: {...}\n\n
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onChunk(data.content || data.delta || '');
        }
      }
    }
  };

  return { streamMessage };
}
```

### Streaming Component

```typescript
function StreamingChat() {
  const [messages, setMessages] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { streamMessage } = useStreamingChat('/ai/overview/chat/stream');

  const sendMessage = async (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsStreaming(true);
    setCurrentResponse('');

    await streamMessage(content, (chunk) => {
      setCurrentResponse(prev => prev + chunk);
    });

    setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }]);
    setCurrentResponse('');
    setIsStreaming(false);
  };

  return (
    <div>
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      {isStreaming && (
        <MessageBubble message={{ role: 'assistant', content: currentResponse }} />
      )}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
```

### Stopping a Stream

```typescript
const stopStream = async () => {
  await apiClient.post('/ai/overview/chat/stop');
  setIsStreaming(false);
};
```

---

## Best Practices

### 1. Always Parse Commands Before Displaying

```typescript
// ✅ Good: Parse commands and render UI appropriately
const command = parseAgentCommand(message.content);
if (command && command.data.awaitingConfirmation) {
  return <ProposalButtons command={command} />;
}

// ❌ Bad: Display raw command text to user
return <div>{message.content}</div>;
```

### 2. Handle Loading States Gracefully

```typescript
const [isLoading, setIsLoading] = useState(false);
const [streamingResponse, setStreamingResponse] = useState('');

// Show typing indicator for streaming
{isLoading && !streamingResponse && <TypingIndicator />}
{streamingResponse && <StreamingText content={streamingResponse} />}
```

### 3. Refresh Data After Proposal Confirmation

```typescript
const confirmProposal = async (command) => {
  await apiClient.post('/ai/command/confirm', { pendingCommand: ... });
  // Always refresh to show latest goal state
  await fetchGoals();
  await fetchChats();
};
```

### 4. Use Direct Store Subscriptions for Reactivity

```typescript
// ✅ Good: Only re-renders when this specific goal changes
const goal = useGoalsStore(state => state.goals.find(g => g.id === goalId));

// ❌ Bad: Re-renders on ANY goal change
const goals = useGoalsStore(state => state.goals);
const goal = goals.find(g => g.id === goalId);
```

### 5. Preserve Agent Context Across Messages

```typescript
// Store chat history for context window
const [chatHistory, setChatHistory] = useState([]);

const sendMessage = async (newMessage) => {
  const response = await apiClient.post('/ai/overview/chat', {
    message: newMessage,
    // Backend maintains context, but sending history helps with retries
    history: chatHistory.slice(-10) // Last 10 messages
  });

  setChatHistory(prev => [...prev, { role: 'user', content: newMessage }]);
  setChatHistory(prev => [...prev, { role: 'assistant', content: response.reply }]);
};
```

### 6. Handle Errors Gracefully

```typescript
const sendMessage = async () => {
  try {
    const response = await apiClient.post('/ai/overview/chat', { message });
    setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limited
      setMessages(prev => [...prev, { role: 'system', content: 'Please wait before sending another message.' }]);
    } else if (error.response?.status === 401) {
      // Expired token
      await reauthenticate();
    } else {
      setMessages(prev => [...prev, { role: 'system', content: 'Something went wrong. Please try again.' }]);
    }
  }
};
```

---

## Example: Full Goal Creation Flow

### User Flow

1. User opens overview chat
2. User types: "I want to buy a 2023 GMC Sierra under $100,000"
3. Agent responds with: `CREATE_GOAL: {...}`
4. UI shows Confirm/Edit/Cancel buttons
5. User clicks Confirm
6. Backend creates goal, UI refreshes goal list
7. Agent offers to trigger scrape: `REFRESH_CANDIDATES: {...}`
8. User clicks Accept
9. Backend triggers worker, UI shows loading state
10. Candidates appear, user can browse results

### Code Flow

```typescript
// 1. Send message
const response = await apiClient.post('/ai/overview/chat', {
  message: 'I want to buy a 2023 GMC Sierra under $100,000'
});

// 2. Parse response
const command = parseAgentCommand(response.reply);
// command = { command: "CREATE_GOAL", data: { type: "item", title: "2023 GMC Sierra", ... } }

// 3. Show UI
if (command?.data.awaitingConfirmation) {
  showProposalUI(command);
}

// 4. User clicks Confirm
await apiClient.post('/ai/command/confirm', {
  pendingCommand: `${command.command}: ${JSON.stringify(command.data)}`
});

// 5. Refresh goals
await fetchGoals(); // UI updates with new goal

// 6. Agent sends follow-up
const followUp = await apiClient.post('/ai/overview/chat', {
  message: 'OK, what next?'
});
// Follow-up contains: REFRESH_CANDIDATES: {...}

// 7. User clicks Accept
await apiClient.post('/ai/command/confirm', { pendingCommand: ... });

// 8. Poll for scrape results
const pollInterval = setInterval(async () => {
  const status = await apiClient.get(`/goals/${goalId}/scrape-status`);
  if (status.data.status === 'completed') {
    clearInterval(pollInterval);
    await fetchCandidates(goalId); // Show results
  }
}, 2000);
```

---

## Troubleshooting

### Proposal Buttons Not Appearing

**Problem:** Agent sends command but UI shows no buttons

**Checklist:**
- Is `proposalType` included in command JSON?
- Is `awaitingConfirmation: true` set?
- Does regex pattern match command format?
- Is the response being parsed before rendering?

### Streaming Stops Mid-Response

**Problem:** SSE connection drops or stops sending chunks

**Solutions:**
- Implement exponential backoff retry
- Check network connection
- Verify backend is still running
- Add timeout handler

### Chat Context Lost

**Problem:** Agent doesn't remember previous messages

**Solutions:**
- Ensure chatId is consistent across requests
- Check backend session storage
- Verify JWT token hasn't expired
- Send last 10 messages for context

### State Not Updating After Confirmation

**Problem:** Goal list doesn't refresh after confirming proposal

**Solutions:**
- Call `fetchGoals()` after confirmation
- Use direct store subscriptions (not useMemo)
- Check if API call succeeded before refresh
- Verify goal ID is correct

---

## Summary

| Aspect | UI Role |
|--------|---------|
| **Authentication** | JWT only (no API keys) |
| **Agent Hosting** | None — connects to backend agents |
| **Command Parsing** | Required for proposal UI |
| **Streaming** | SSE for real-time responses |
| **State Management** | Zustand with direct subscriptions |
| **Data Refresh** | After every proposal confirmation |

The UI is the **presentation layer** — it renders agent responses, handles user interactions with proposals, and keeps the UI in sync with backend state.

For backend agent communication details, see the service repo's [AGENTS.md](../neon-goals-service/AGENTS.md).
