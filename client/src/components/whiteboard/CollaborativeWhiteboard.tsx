import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Types for the whiteboard
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

interface WhiteboardUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastActive: Date;
}

interface WhiteboardProps {
  sessionId: string;
  userId: string;
  userName: string;
}

// Color palette for nodes
const NODE_COLORS = [
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EF4444", // Red
  "#3B82F6", // Blue
];

// Dummy data for initial testing
const dummyUsers: WhiteboardUser[] = [
  { id: "1", name: "Alex", color: "#F97316", isActive: true, lastActive: new Date() },
  { id: "2", name: "Sam", color: "#8B5CF6", isActive: false, lastActive: new Date(Date.now() - 5 * 60 * 1000) },
];

const dummyIdeas: IdeaNode[] = [
  { 
    id: "idea1", 
    text: "Use concrete examples to make the prompt more specific", 
    x: 200, 
    y: 150, 
    color: "#F97316", 
    connections: ["idea2"], 
    createdBy: "1",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
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
    createdBy: "2",
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    votes: 2,
    isSelected: false,
  },
];

export default function CollaborativeWhiteboard({ 
  sessionId, 
  userId, 
  userName
}: WhiteboardProps) {
  // State for the whiteboard
  const [ideas, setIdeas] = useState<IdeaNode[]>(dummyIdeas);
  const [users, setUsers] = useState<WhiteboardUser[]>(dummyUsers);
  const [newIdeaText, setNewIdeaText] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [firstConnectionId, setFirstConnectionId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [sessionStatus, setSessionStatus] = useState<'active'|'connecting'|'disconnected'>('active');
  
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate a random color for the user
  const userColor = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];

  // Mock function to simulate WebSocket connection
  useEffect(() => {
    // In a real implementation, here we would:
    // 1. Connect to WebSocket
    // 2. Listen for events from other users
    // 3. Send position updates when this user moves
    console.log(`Connected to session ${sessionId} as ${userName} (${userId})`);

    return () => {
      // Disconnect from WebSocket
      console.log(`Disconnected from session ${sessionId}`);
    };
  }, [sessionId, userId, userName]);

  // Track cursor position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!whiteboardRef.current) return;
    
    const rect = whiteboardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPosition({ x, y });
    
    // In a real app, we would send this to the server
    // to update other users about our cursor position
  }, []);

  // Add a new idea
  const handleAddIdea = () => {
    if (!newIdeaText.trim()) {
      toast({
        title: "Please enter an idea",
        variant: "destructive",
      });
      return;
    }

    const newIdea: IdeaNode = {
      id: `idea-${Date.now()}`,
      text: newIdeaText,
      x: cursorPosition.x,
      y: cursorPosition.y,
      color: userColor,
      connections: [],
      createdBy: userId,
      createdAt: new Date(),
      votes: 0,
      isSelected: false,
    };

    setIdeas([...ideas, newIdea]);
    setNewIdeaText("");
    setIsCreatingIdea(false);

    toast({
      title: "Idea added",
      description: "Your idea has been added to the whiteboard",
    });
  };

  // Delete an idea
  const handleDeleteIdea = (id: string) => {
    // Remove the idea and any connections to it
    const updatedIdeas = ideas.filter(idea => idea.id !== id);
    
    // Update connections in other ideas
    const finalIdeas = updatedIdeas.map(idea => ({
      ...idea,
      connections: idea.connections.filter(connId => connId !== id)
    }));
    
    setIdeas(finalIdeas);
    
    if (selectedIdea === id) {
      setSelectedIdea(null);
    }
    
    toast({
      title: "Idea deleted",
      description: "The idea has been removed from the whiteboard",
    });
  };

  // Start connecting ideas
  const handleStartConnecting = (id: string) => {
    setIsConnecting(true);
    setFirstConnectionId(id);
    
    // Update ideas to show the first selected one
    setIdeas(ideas.map(idea => 
      idea.id === id 
        ? { ...idea, isSelected: true } 
        : idea
    ));
    
    toast({
      title: "Creating connection",
      description: "Click on another idea to create a connection",
    });
  };

  // Complete the connection
  const handleCompleteConnection = (id: string) => {
    // Don't connect to self
    if (id === firstConnectionId) {
      setIsConnecting(false);
      setFirstConnectionId(null);
      
      // Reset selection
      setIdeas(ideas.map(idea => ({ ...idea, isSelected: false })));
      
      toast({
        title: "Invalid connection",
        description: "Cannot connect an idea to itself",
        variant: "destructive",
      });
      return;
    }
    
    // Create bi-directional connection
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === firstConnectionId) {
        // Don't add duplicate connections
        return idea.connections.includes(id)
          ? { ...idea, isSelected: false }
          : { 
              ...idea, 
              connections: [...idea.connections, id],
              isSelected: false
            };
      }
      if (idea.id === id) {
        return idea.connections.includes(firstConnectionId!)
          ? { ...idea, isSelected: false }
          : { 
              ...idea, 
              connections: [...idea.connections, firstConnectionId!],
              isSelected: false
            };
      }
      return { ...idea, isSelected: false };
    });
    
    setIdeas(updatedIdeas);
    setIsConnecting(false);
    setFirstConnectionId(null);
    
    toast({
      title: "Connection created",
      description: "The ideas are now connected",
    });
  };

  // Handle clicking on a node
  const handleNodeClick = (id: string) => {
    if (isConnecting) {
      handleCompleteConnection(id);
    } else {
      // Toggle selection
      if (selectedIdea === id) {
        setSelectedIdea(null);
      } else {
        setSelectedIdea(id);
      }
    }
  };

  // Handle voting for an idea
  const handleVote = (id: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === id 
        ? { ...idea, votes: idea.votes + 1 } 
        : idea
    ));
  };

  // Render connections between ideas
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    ideas.forEach(idea => {
      idea.connections.forEach(targetId => {
        const target = ideas.find(i => i.id === targetId);
        
        if (target) {
          connections.push(
            <line
              key={`conn-${idea.id}-${targetId}`}
              x1={idea.x}
              y1={idea.y}
              x2={target.x}
              y2={target.y}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray={isConnecting ? "5,5" : "none"}
            />
          );
        }
      });
    });
    
    // If currently connecting, show line from first node to cursor
    if (isConnecting && firstConnectionId) {
      const sourceIdea = ideas.find(idea => idea.id === firstConnectionId);
      
      if (sourceIdea) {
        connections.push(
          <line
            key="connecting-line"
            x1={sourceIdea.x}
            y1={sourceIdea.y}
            x2={cursorPosition.x}
            y2={cursorPosition.y}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        );
      }
    }
    
    return connections;
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Collaborative Prompt Brainstorming</h2>
          <p className="text-sm text-slate-500">Session ID: {sessionId}</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              sessionStatus === 'active' ? 'bg-green-500' : 
              sessionStatus === 'connecting' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-slate-700">
              {sessionStatus === 'active' ? 'Connected' : 
               sessionStatus === 'connecting' ? 'Connecting...' : 
               'Disconnected'}
            </span>
          </div>
          
          {/* Active users */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-700 mr-1">Active:</span>
            <div className="flex -space-x-2">
              {users.filter(u => u.isActive).map(user => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white text-xs font-medium"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.substring(0, 1)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsCreatingIdea(true)}
            disabled={isCreatingIdea || isConnecting}
          >
            <i className="ri-add-line mr-1.5"></i> Add Idea
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsConnecting(prev => !prev)}
            disabled={isCreatingIdea}
            className={isConnecting ? "bg-slate-100" : ""}
          >
            <i className="ri-link-m mr-1.5"></i> {isConnecting ? "Cancel" : "Connect Ideas"}
          </Button>
        </div>
      </div>
      
      {/* Whiteboard area */}
      <div 
        ref={whiteboardRef}
        className="flex-1 bg-slate-50 relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {renderConnections()}
        </svg>
        
        {/* Idea nodes */}
        {ideas.map(idea => (
          <div
            key={idea.id}
            className={`absolute w-64 cursor-pointer transition-shadow ${
              idea.isSelected ? 'shadow-lg' : 'shadow'
            } ${
              selectedIdea === idea.id ? 'ring-2 ring-primary-500' : ''
            }`}
            style={{
              left: `${idea.x}px`,
              top: `${idea.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleNodeClick(idea.id)}
          >
            <Card className="bg-white border">
              <CardHeader className="p-3" style={{ backgroundColor: `${idea.color}20` }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: idea.color }}
                    ></div>
                    <CardTitle className="text-sm font-medium">
                      {users.find(u => u.id === idea.createdBy)?.name || 'Unknown'}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-xs text-slate-500">
                      {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIdea(idea.id);
                      }}
                    >
                      <i className="ri-delete-bin-line text-slate-500 hover:text-red-500"></i>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-slate-700">{idea.text}</p>
              </CardContent>
              <CardFooter className="p-2 flex justify-between items-center border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartConnecting(idea.id);
                  }}
                  disabled={isConnecting}
                >
                  <i className="ri-link-m mr-1.5"></i> Connect
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2.5 text-xs flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(idea.id);
                  }}
                >
                  <i className="ri-thumb-up-line"></i>
                  <span>{idea.votes}</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
        
        {/* Add idea dialog */}
        {isCreatingIdea && (
          <div 
            className="absolute bg-white rounded-lg shadow-lg p-4 w-80"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Add a new idea</h3>
              <Textarea
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder="Type your idea here..."
                className="w-full h-24"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCreatingIdea(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleAddIdea}
              >
                Add
              </Button>
            </div>
          </div>
        )}
        
        {/* Cursor indicators for other users */}
        {users.filter(u => u.isActive && u.id !== userId && u.cursor).map(user => (
          <div
            key={`cursor-${user.id}`}
            className="absolute pointer-events-none"
            style={{
              left: `${user.cursor?.x}px`,
              top: `${user.cursor?.y}px`,
              zIndex: 100,
            }}
          >
            <div className="relative">
              <div
                className="w-4 h-4 transform rotate-45"
                style={{ backgroundColor: user.color }}
              ></div>
              <div className="absolute top-5 left-0 text-xs bg-white shadow-sm px-1.5 py-0.5 rounded-md whitespace-nowrap">
                {user.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}