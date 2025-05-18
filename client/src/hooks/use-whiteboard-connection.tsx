import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Types for whiteboard messages and data (shared with server)
interface WhiteboardUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastActive: Date;
}

interface IdeaNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
  createdBy: string;
  createdAt: Date;
  votes: number;
  isSelected: boolean;
}

interface WhiteboardSession {
  id: string;
  name: string;
  ideas: IdeaNode[];
  users: Record<string, WhiteboardUser>;
  createdAt: Date;
  lastActive: Date;
}

// For listing available sessions
interface SessionInfo {
  id: string;
  name: string;
  userCount: number;
  ideaCount: number;
  createdAt: Date;
  lastActive: Date;
}

// WebSocket message types
type WebSocketIncomingMessage =
  | { type: "sessions-list"; sessions: SessionInfo[] }
  | { type: "session-state"; sessionId: string; state: WhiteboardSession }
  | { type: "user-joined"; sessionId: string; user: WhiteboardUser }
  | { type: "user-left"; sessionId: string; userId: string }
  | { type: "cursor-move"; sessionId: string; userId: string; x: number; y: number }
  | { type: "idea-added"; sessionId: string; idea: IdeaNode }
  | { type: "idea-deleted"; sessionId: string; ideaId: string }
  | { type: "idea-updated"; sessionId: string; ideaId: string; updates: Partial<IdeaNode> }
  | { type: "connection-added"; sessionId: string; sourceId: string; targetId: string }
  | { type: "connection-removed"; sessionId: string; sourceId: string; targetId: string }
  | { type: "idea-voted"; sessionId: string; ideaId: string; userId: string; newVoteCount: number }
  | { type: "error"; error: string };

type WebSocketOutgoingMessage =
  | { type: "join"; sessionId: string; user: WhiteboardUser }
  | { type: "leave"; sessionId: string; userId: string }
  | { type: "cursor-move"; sessionId: string; userId: string; x: number; y: number }
  | { type: "add-idea"; sessionId: string; idea: IdeaNode }
  | { type: "delete-idea"; sessionId: string; ideaId: string }
  | { type: "update-idea"; sessionId: string; ideaId: string; updates: Partial<IdeaNode> }
  | { type: "add-connection"; sessionId: string; sourceId: string; targetId: string }
  | { type: "remove-connection"; sessionId: string; sourceId: string; targetId: string }
  | { type: "vote"; sessionId: string; ideaId: string; userId: string };

// Hook state
interface UseWhiteboardConnectionState {
  status: "connecting" | "connected" | "disconnected";
  session: WhiteboardSession | null;
  availableSessions: SessionInfo[];
  error: string | null;
}

// Hook return type
interface UseWhiteboardConnectionReturn extends UseWhiteboardConnectionState {
  joinSession: (sessionId: string, user: WhiteboardUser) => void;
  leaveSession: () => void;
  sendCursorPosition: (x: number, y: number) => void;
  addIdea: (idea: Omit<IdeaNode, "id" | "createdAt" | "isSelected">) => void;
  deleteIdea: (ideaId: string) => void;
  updateIdea: (ideaId: string, updates: Partial<IdeaNode>) => void;
  addConnection: (sourceId: string, targetId: string) => void;
  removeConnection: (sourceId: string, targetId: string) => void;
  voteForIdea: (ideaId: string) => void;
  fetchAvailableSessions: () => Promise<SessionInfo[]>;
  createSession: (name: string) => Promise<SessionInfo>;
}

export function useWhiteboardConnection(
  userId: string
): UseWhiteboardConnectionReturn {
  // State
  const [state, setState] = useState<UseWhiteboardConnectionState>({
    status: "disconnected",
    session: null,
    availableSessions: [],
    error: null,
  });

  // WebSocket connection reference
  const wsRef = useRef<WebSocket | null>(null);
  const currentSessionId = useRef<string | null>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      setState(prev => ({ ...prev, status: "connecting", error: null }));

      // Determine the correct WebSocket URL based on the current protocol and host
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/whiteboard`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setState(prev => ({ ...prev, status: "connected" }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketIncomingMessage;
          handleIncomingMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setState(prev => ({
            ...prev,
            error: "Failed to parse server message"
          }));
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setState(prev => ({
          ...prev,
          status: "disconnected",
          error: "WebSocket connection error"
        }));
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setState(prev => ({ ...prev, status: "disconnected" }));
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (wsRef.current === ws) { // Only reconnect if this is still the current connection
            connectWebSocket();
          }
        }, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Handle incoming WebSocket messages
  const handleIncomingMessage = useCallback((message: WebSocketIncomingMessage) => {
    switch (message.type) {
      case "sessions-list":
        setState(prev => ({
          ...prev,
          availableSessions: message.sessions
        }));
        break;

      case "session-state":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => ({
            ...prev,
            session: message.state,
            status: "connected"
          }));
        }
        break;

      case "user-joined":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            return {
              ...prev,
              session: {
                ...prev.session,
                users: {
                  ...prev.session.users,
                  [message.user.id]: message.user
                }
              }
            };
          });
          
          toast({
            title: "User joined",
            description: `${message.user.name} has joined the session`,
          });
        }
        break;

      case "user-left":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            const updatedUsers = { ...prev.session.users };
            const userName = updatedUsers[message.userId]?.name || "A user";
            delete updatedUsers[message.userId];
            
            toast({
              title: "User left",
              description: `${userName} has left the session`,
            });
            
            return {
              ...prev,
              session: {
                ...prev.session,
                users: updatedUsers
              }
            };
          });
        }
        break;

      case "cursor-move":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session || !prev.session.users[message.userId]) return prev;
            
            const updatedUsers = { ...prev.session.users };
            updatedUsers[message.userId] = {
              ...updatedUsers[message.userId],
              cursor: { x: message.x, y: message.y },
              isActive: true,
              lastActive: new Date()
            };
            
            return {
              ...prev,
              session: {
                ...prev.session,
                users: updatedUsers
              }
            };
          });
        }
        break;

      case "idea-added":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: [...prev.session.ideas, message.idea]
              }
            };
          });
        }
        break;

      case "idea-deleted":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            // Remove the idea
            const updatedIdeas = prev.session.ideas.filter(
              idea => idea.id !== message.ideaId
            );
            
            // Remove any connections to this idea
            updatedIdeas.forEach(idea => {
              idea.connections = idea.connections.filter(
                conn => conn !== message.ideaId
              );
            });
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: updatedIdeas
              }
            };
          });
        }
        break;

      case "idea-updated":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            const updatedIdeas = prev.session.ideas.map(idea => 
              idea.id === message.ideaId
                ? { ...idea, ...message.updates }
                : idea
            );
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: updatedIdeas
              }
            };
          });
        }
        break;

      case "connection-added":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            const updatedIdeas = [...prev.session.ideas];
            const sourceIdea = updatedIdeas.find(idea => idea.id === message.sourceId);
            const targetIdea = updatedIdeas.find(idea => idea.id === message.targetId);
            
            if (sourceIdea && !sourceIdea.connections.includes(message.targetId)) {
              sourceIdea.connections.push(message.targetId);
            }
            
            if (targetIdea && !targetIdea.connections.includes(message.sourceId)) {
              targetIdea.connections.push(message.sourceId);
            }
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: updatedIdeas
              }
            };
          });
        }
        break;

      case "connection-removed":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            const updatedIdeas = prev.session.ideas.map(idea => {
              if (idea.id === message.sourceId) {
                return {
                  ...idea,
                  connections: idea.connections.filter(id => id !== message.targetId)
                };
              }
              if (idea.id === message.targetId) {
                return {
                  ...idea,
                  connections: idea.connections.filter(id => id !== message.sourceId)
                };
              }
              return idea;
            });
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: updatedIdeas
              }
            };
          });
        }
        break;

      case "idea-voted":
        if (message.sessionId === currentSessionId.current) {
          setState(prev => {
            if (!prev.session) return prev;
            
            const updatedIdeas = prev.session.ideas.map(idea => 
              idea.id === message.ideaId
                ? { ...idea, votes: message.newVoteCount }
                : idea
            );
            
            return {
              ...prev,
              session: {
                ...prev.session,
                ideas: updatedIdeas
              }
            };
          });
        }
        break;

      case "error":
        setState(prev => ({ ...prev, error: message.error }));
        toast({
          title: "Error",
          description: message.error,
          variant: "destructive"
        });
        break;
    }
  }, [toast]);

  // Send message to WebSocket server
  const sendMessage = useCallback((message: WebSocketOutgoingMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        error: "WebSocket connection is not open"
      }));
      return false;
    }
  }, []);

  // Join a whiteboard session
  const joinSession = useCallback((sessionId: string, user: WhiteboardUser) => {
    currentSessionId.current = sessionId;
    
    sendMessage({
      type: "join",
      sessionId,
      user
    });
  }, [sendMessage]);

  // Leave the current session
  const leaveSession = useCallback(() => {
    if (currentSessionId.current && userId) {
      sendMessage({
        type: "leave",
        sessionId: currentSessionId.current,
        userId
      });
      
      currentSessionId.current = null;
      setState(prev => ({ ...prev, session: null }));
    }
  }, [userId, sendMessage]);

  // Send cursor position update
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "cursor-move",
        sessionId: currentSessionId.current,
        userId,
        x,
        y
      });
    }
  }, [userId, sendMessage]);

  // Add a new idea
  const addIdea = useCallback((
    idea: Omit<IdeaNode, "id" | "createdAt" | "isSelected">
  ) => {
    if (currentSessionId.current) {
      const completeIdea: IdeaNode = {
        ...idea,
        id: `idea-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        isSelected: false
      };
      
      sendMessage({
        type: "add-idea",
        sessionId: currentSessionId.current,
        idea: completeIdea
      });
    }
  }, [sendMessage]);

  // Delete an idea
  const deleteIdea = useCallback((ideaId: string) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "delete-idea",
        sessionId: currentSessionId.current,
        ideaId
      });
    }
  }, [sendMessage]);

  // Update an idea
  const updateIdea = useCallback((ideaId: string, updates: Partial<IdeaNode>) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "update-idea",
        sessionId: currentSessionId.current,
        ideaId,
        updates
      });
    }
  }, [sendMessage]);

  // Add a connection between ideas
  const addConnection = useCallback((sourceId: string, targetId: string) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "add-connection",
        sessionId: currentSessionId.current,
        sourceId,
        targetId
      });
    }
  }, [sendMessage]);

  // Remove a connection between ideas
  const removeConnection = useCallback((sourceId: string, targetId: string) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "remove-connection",
        sessionId: currentSessionId.current,
        sourceId,
        targetId
      });
    }
  }, [sendMessage]);

  // Vote for an idea
  const voteForIdea = useCallback((ideaId: string) => {
    if (currentSessionId.current) {
      sendMessage({
        type: "vote",
        sessionId: currentSessionId.current,
        ideaId,
        userId
      });
    }
  }, [userId, sendMessage]);

  // Fetch available sessions from the API
  const fetchAvailableSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/whiteboard/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const sessions = await response.json();
      setState(prev => ({ ...prev, availableSessions: sessions }));
      return sessions;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return [];
    }
  }, []);

  // Create a new session via the API
  const createSession = useCallback(async (name: string) => {
    try {
      const response = await fetch('/api/whiteboard/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const session = await response.json();
      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      throw error;
    }
  }, []);

  return {
    status: state.status,
    session: state.session,
    availableSessions: state.availableSessions,
    error: state.error,
    joinSession,
    leaveSession,
    sendCursorPosition,
    addIdea,
    deleteIdea,
    updateIdea,
    addConnection,
    removeConnection,
    voteForIdea,
    fetchAvailableSessions,
    createSession,
  };
}

// Export the types for use in other components
export type {
  WhiteboardUser,
  IdeaNode,
  WhiteboardSession,
  SessionInfo
};