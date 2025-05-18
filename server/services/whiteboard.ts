import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

// Types for whiteboard messages and data
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

// Message types for WebSocket communication
type WhiteboardMessage =
  | { type: "join"; sessionId: string; user: WhiteboardUser }
  | { type: "leave"; sessionId: string; userId: string }
  | { type: "cursor-move"; sessionId: string; userId: string; x: number; y: number }
  | { type: "add-idea"; sessionId: string; idea: IdeaNode }
  | { type: "delete-idea"; sessionId: string; ideaId: string }
  | { type: "update-idea"; sessionId: string; ideaId: string; updates: Partial<IdeaNode> }
  | { type: "add-connection"; sessionId: string; sourceId: string; targetId: string }
  | { type: "remove-connection"; sessionId: string; sourceId: string; targetId: string }
  | { type: "vote"; sessionId: string; ideaId: string; userId: string }
  | { type: "session-state"; sessionId: string; state: WhiteboardSession }
  | { type: "error"; error: string };

// Client-specific structure for tracking connections
interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  sessionId: string;
}

export class WhiteboardService {
  private wss: WebSocketServer;
  private sessions: Map<string, WhiteboardSession> = new Map();
  private clients: ConnectedClient[] = [];

  constructor(server: HttpServer) {
    // Create a WebSocket server with a distinct path to avoid conflicts
    this.wss = new WebSocketServer({ server, path: "/ws/whiteboard" });
    this.setupWebSocketServer();
    console.log("Whiteboard WebSocket server initialized");
    
    // Create an initial demo session
    this.createDemoSession();
  }

  private createDemoSession() {
    const sessionId = "demo-session";
    const session: WhiteboardSession = {
      id: sessionId,
      name: "Demo Brainstorming Session",
      ideas: [
        {
          id: "idea1",
          text: "Use concrete examples to make the prompt more specific",
          x: 200,
          y: 150,
          color: "#F97316",
          connections: ["idea2"],
          createdBy: "system",
          createdAt: new Date(),
          votes: 3,
          isSelected: false,
        },
        {
          id: "idea2",
          text: "Define the expected output format clearly",
          x: 400,
          y: 250,
          color: "#8B5CF6",
          connections: ["idea1"],
          createdBy: "system",
          createdAt: new Date(),
          votes: 2,
          isSelected: false,
        },
      ],
      users: {},
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    this.sessions.set(sessionId, session);
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected to whiteboard");
      
      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message) as WhiteboardMessage;
          this.handleMessage(ws, data);
        } catch (error) {
          console.error("Error parsing message:", error);
          ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
        }
      });
      
      ws.on("close", () => {
        const client = this.clients.find(client => client.ws === ws);
        if (client) {
          this.handleUserLeave(client);
        }
        this.clients = this.clients.filter(client => client.ws !== ws);
      });
      
      // Send available sessions list
      const sessionsList = Array.from(this.sessions.values()).map(session => ({
        id: session.id,
        name: session.name,
        userCount: Object.keys(session.users).length,
        ideaCount: session.ideas.length,
        createdAt: session.createdAt,
      }));
      
      ws.send(JSON.stringify({ 
        type: "sessions-list", 
        sessions: sessionsList 
      }));
    });
  }

  private handleMessage(ws: WebSocket, message: WhiteboardMessage) {
    switch (message.type) {
      case "join":
        this.handleJoin(ws, message);
        break;
      case "leave":
        const client = this.clients.find(
          client => client.userId === message.userId && client.sessionId === message.sessionId
        );
        if (client) {
          this.handleUserLeave(client);
        }
        break;
      case "cursor-move":
        this.handleCursorMove(message);
        break;
      case "add-idea":
        this.handleAddIdea(message);
        break;
      case "delete-idea":
        this.handleDeleteIdea(message);
        break;
      case "update-idea":
        this.handleUpdateIdea(message);
        break;
      case "add-connection":
        this.handleAddConnection(message);
        break;
      case "remove-connection":
        this.handleRemoveConnection(message);
        break;
      case "vote":
        this.handleVote(message);
        break;
      default:
        ws.send(JSON.stringify({ type: "error", error: "Unknown message type" }));
    }
  }

  private handleJoin(ws: WebSocket, message: { sessionId: string; user: WhiteboardUser }) {
    const { sessionId, user } = message;
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // Create new session if it doesn't exist
      session = {
        id: sessionId,
        name: `Session ${sessionId}`,
        ideas: [],
        users: {},
        createdAt: new Date(),
        lastActive: new Date(),
      };
      this.sessions.set(sessionId, session);
    }
    
    // Update user status
    user.isActive = true;
    user.lastActive = new Date();
    session.users[user.id] = user;
    
    // Track client connection
    this.clients.push({ ws, userId: user.id, sessionId });
    
    // Send current session state to the joining user
    ws.send(
      JSON.stringify({
        type: "session-state",
        sessionId,
        state: session,
      })
    );
    
    // Notify other users about the new user
    this.broadcastToSession(sessionId, {
      type: "user-joined",
      sessionId,
      user,
    }, [user.id]); // Exclude the joining user
    
    console.log(`User ${user.name} (${user.id}) joined session ${sessionId}`);
  }

  private handleUserLeave(client: ConnectedClient) {
    const { sessionId, userId } = client;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Remove user from the session
      if (session.users[userId]) {
        delete session.users[userId];
      }
      
      // Notify other users
      this.broadcastToSession(sessionId, {
        type: "user-left",
        sessionId,
        userId,
      });
      
      console.log(`User ${userId} left session ${sessionId}`);
      
      // If session is empty, keep it for a while then clean up (could implement later)
    }
  }

  private handleCursorMove(message: { sessionId: string; userId: string; x: number; y: number }) {
    const { sessionId, userId, x, y } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users[userId]) {
      // Update user's cursor position
      session.users[userId].cursor = { x, y };
      session.users[userId].lastActive = new Date();
      
      // Broadcast cursor position to other users
      this.broadcastToSession(sessionId, {
        type: "cursor-move",
        sessionId,
        userId,
        x,
        y,
      }, [userId]); // Don't send back to the user who moved
    }
  }

  private handleAddIdea(message: { sessionId: string; idea: IdeaNode }) {
    const { sessionId, idea } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Add the idea to the session
      session.ideas.push(idea);
      session.lastActive = new Date();
      
      // Broadcast to all users in the session
      this.broadcastToSession(sessionId, {
        type: "idea-added",
        sessionId,
        idea,
      });
    }
  }

  private handleDeleteIdea(message: { sessionId: string; ideaId: string }) {
    const { sessionId, ideaId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Remove the idea
      session.ideas = session.ideas.filter(idea => idea.id !== ideaId);
      
      // Remove any connections to this idea
      session.ideas.forEach(idea => {
        idea.connections = idea.connections.filter(conn => conn !== ideaId);
      });
      
      session.lastActive = new Date();
      
      // Broadcast to all users in the session
      this.broadcastToSession(sessionId, {
        type: "idea-deleted",
        sessionId,
        ideaId,
      });
    }
  }

  private handleUpdateIdea(message: { sessionId: string; ideaId: string; updates: Partial<IdeaNode> }) {
    const { sessionId, ideaId, updates } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      const ideaIndex = session.ideas.findIndex(idea => idea.id === ideaId);
      
      if (ideaIndex !== -1) {
        // Update the idea
        session.ideas[ideaIndex] = {
          ...session.ideas[ideaIndex],
          ...updates,
        };
        
        session.lastActive = new Date();
        
        // Broadcast to all users in the session
        this.broadcastToSession(sessionId, {
          type: "idea-updated",
          sessionId,
          ideaId,
          updates,
        });
      }
    }
  }

  private handleAddConnection(message: { sessionId: string; sourceId: string; targetId: string }) {
    const { sessionId, sourceId, targetId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      const sourceIdea = session.ideas.find(idea => idea.id === sourceId);
      const targetIdea = session.ideas.find(idea => idea.id === targetId);
      
      if (sourceIdea && targetIdea) {
        // Add connection if it doesn't already exist
        if (!sourceIdea.connections.includes(targetId)) {
          sourceIdea.connections.push(targetId);
        }
        
        // Add bidirectional connection
        if (!targetIdea.connections.includes(sourceId)) {
          targetIdea.connections.push(sourceId);
        }
        
        session.lastActive = new Date();
        
        // Broadcast to all users in the session
        this.broadcastToSession(sessionId, {
          type: "connection-added",
          sessionId,
          sourceId,
          targetId,
        });
      }
    }
  }

  private handleRemoveConnection(message: { sessionId: string; sourceId: string; targetId: string }) {
    const { sessionId, sourceId, targetId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      const sourceIdea = session.ideas.find(idea => idea.id === sourceId);
      const targetIdea = session.ideas.find(idea => idea.id === targetId);
      
      if (sourceIdea) {
        sourceIdea.connections = sourceIdea.connections.filter(id => id !== targetId);
      }
      
      if (targetIdea) {
        targetIdea.connections = targetIdea.connections.filter(id => id !== sourceId);
      }
      
      session.lastActive = new Date();
      
      // Broadcast to all users in the session
      this.broadcastToSession(sessionId, {
        type: "connection-removed",
        sessionId,
        sourceId,
        targetId,
      });
    }
  }

  private handleVote(message: { sessionId: string; ideaId: string; userId: string }) {
    const { sessionId, ideaId, userId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      const idea = session.ideas.find(idea => idea.id === ideaId);
      
      if (idea) {
        // Increment vote count
        idea.votes += 1;
        session.lastActive = new Date();
        
        // Broadcast to all users in the session
        this.broadcastToSession(sessionId, {
          type: "idea-voted",
          sessionId,
          ideaId,
          userId,
          newVoteCount: idea.votes,
        });
      }
    }
  }

  private broadcastToSession(sessionId: string, message: any, excludeUserIds: string[] = []) {
    const sessionClients = this.clients.filter(
      client => client.sessionId === sessionId && !excludeUserIds.includes(client.userId)
    );
    
    const messageString = JSON.stringify(message);
    
    sessionClients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageString);
      }
    });
  }

  // Public methods that can be exposed to the API if needed
  
  // Get all active sessions
  public getSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      name: session.name,
      userCount: Object.keys(session.users).length,
      ideaCount: session.ideas.length,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
    }));
  }
  
  // Get a specific session
  public getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }
  
  // Create a new session via API
  public createSession(name: string) {
    const sessionId = uuidv4();
    const session: WhiteboardSession = {
      id: sessionId,
      name,
      ideas: [],
      users: {},
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
}

let whiteboardService: WhiteboardService | null = null;

export function initializeWhiteboardService(server: HttpServer): WhiteboardService {
  if (!whiteboardService) {
    whiteboardService = new WhiteboardService(server);
  }
  return whiteboardService;
}

export function getWhiteboardService(): WhiteboardService | null {
  return whiteboardService;
}