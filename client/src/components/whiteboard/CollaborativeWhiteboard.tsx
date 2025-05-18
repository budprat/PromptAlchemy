import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  type WhiteboardUser,
  type IdeaNode,
  type WhiteboardSession
} from "@/hooks/use-whiteboard-connection";
import { useToast } from "@/hooks/use-toast";
import { 
  CornerUpLeft, 
  Plus, 
  X, 
  Edit2, 
  ThumbsUp, 
  Trash2, 
  LogOut,
  Users
} from "lucide-react";

// Available colors for ideas
const NODE_COLORS = [
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EF4444", // Red
  "#3B82F6", // Blue
];

interface CollaborativeWhiteboardProps {
  sessionId: string;
  userId: string;
  userName: string;
  session: WhiteboardSession;
  status: "connecting" | "connected" | "disconnected";
  onSendCursorPosition: (x: number, y: number) => void;
  onAddIdea: (idea: Omit<IdeaNode, "id" | "createdAt" | "isSelected">) => void;
  onDeleteIdea: (ideaId: string) => void;
  onUpdateIdea: (ideaId: string, updates: Partial<IdeaNode>) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
  onRemoveConnection: (sourceId: string, targetId: string) => void;
  onVote: (ideaId: string) => void;
  onLeaveSession: () => void;
}

export default function CollaborativeWhiteboard({
  sessionId,
  userId,
  userName,
  session,
  status,
  onSendCursorPosition,
  onAddIdea,
  onDeleteIdea,
  onUpdateIdea,
  onAddConnection,
  onRemoveConnection,
  onVote,
  onLeaveSession
}: CollaborativeWhiteboardProps) {
  // State
  const [newIdeaText, setNewIdeaText] = useState("");
  const [addingIdea, setAddingIdea] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingIdeaText, setEditingIdeaText] = useState("");
  const [selectedColor, setSelectedColor] = useState(NODE_COLORS[0]);
  const [connectingIdea, setConnectingIdea] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  
  // References
  const boardRef = useRef<HTMLDivElement>(null);
  const lastCursorUpdate = useRef<number>(0);
  const cursorUpdateInterval = 100; // ms
  const { toast } = useToast();
  
  // Send cursor position on regular intervals
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!boardRef.current) return;
      
      const rect = boardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      
      setCursorPosition({ x, y });
      
      // Throttle cursor position updates
      const now = Date.now();
      if (now - lastCursorUpdate.current > cursorUpdateInterval) {
        onSendCursorPosition(x, y);
        lastCursorUpdate.current = now;
      }
    };
    
    const board = boardRef.current;
    if (board) {
      board.addEventListener("mousemove", handleMouseMove);
    }
    
    return () => {
      if (board) {
        board.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [scale, onSendCursorPosition]);
  
  // Board navigation controls
  const panBoard = useCallback((deltaX: number, deltaY: number) => {
    setBoardPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);
  
  const zoomBoard = useCallback((delta: number) => {
    setScale(prev => {
      const newScale = prev + delta;
      return Math.min(Math.max(0.5, newScale), 2); // Limit zoom between 0.5x and 2x
    });
  }, []);
  
  // Handle keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pan with arrow keys
      switch (e.key) {
        case "ArrowUp":
          panBoard(0, 20);
          break;
        case "ArrowDown":
          panBoard(0, -20);
          break;
        case "ArrowLeft":
          panBoard(20, 0);
          break;
        case "ArrowRight":
          panBoard(-20, 0);
          break;
        case "+":
        case "=":
          zoomBoard(0.1);
          break;
        case "-":
        case "_":
          zoomBoard(-0.1);
          break;
        case "Escape":
          // Cancel any in-progress actions
          setAddingIdea(false);
          setEditingIdeaId(null);
          setConnectingIdea(null);
          setSelectedIdea(null);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [panBoard, zoomBoard]);
  
  // Handle mouse wheel for zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        zoomBoard(delta);
      }
    };
    
    const board = boardRef.current;
    if (board) {
      board.addEventListener("wheel", handleWheel, { passive: false });
    }
    
    return () => {
      if (board) {
        board.removeEventListener("wheel", handleWheel);
      }
    };
  }, [zoomBoard]);
  
  // Handle adding a new idea
  const handleAddIdea = () => {
    if (!newIdeaText.trim()) {
      toast({
        title: "Empty idea",
        description: "Please enter some text for your idea",
        variant: "destructive"
      });
      return;
    }
    
    onAddIdea({
      text: newIdeaText.trim(),
      x: Math.max(100, cursorPosition.x),
      y: Math.max(100, cursorPosition.y),
      color: selectedColor,
      connections: [],
      createdBy: userId,
      votes: 0
    });
    
    setNewIdeaText("");
    setAddingIdea(false);
    
    toast({
      title: "Idea added",
      description: "Your idea has been added to the brainstorming session"
    });
  };
  
  // Handle updating an idea
  const handleUpdateIdea = () => {
    if (!editingIdeaId) return;
    
    if (!editingIdeaText.trim()) {
      toast({
        title: "Empty idea",
        description: "Please enter some text for your idea",
        variant: "destructive"
      });
      return;
    }
    
    onUpdateIdea(editingIdeaId, {
      text: editingIdeaText.trim()
    });
    
    setEditingIdeaId(null);
    setEditingIdeaText("");
    
    toast({
      title: "Idea updated",
      description: "Your changes have been saved"
    });
  };
  
  // Handle connecting ideas
  const handleStartConnecting = (ideaId: string) => {
    setConnectingIdea(ideaId);
    setSelectedIdea(ideaId);
    
    toast({
      title: "Creating connection",
      description: "Click on another idea to connect them",
    });
  };
  
  const handleFinishConnecting = (targetId: string) => {
    if (!connectingIdea || connectingIdea === targetId) {
      setConnectingIdea(null);
      return;
    }
    
    onAddConnection(connectingIdea, targetId);
    setConnectingIdea(null);
    setSelectedIdea(null);
    
    toast({
      title: "Connection created",
      description: "Ideas are now connected"
    });
  };
  
  // Calculate the position of connections between ideas
  const getConnectionPath = (sourceId: string, targetId: string) => {
    const sourceIdea = session.ideas.find(idea => idea.id === sourceId);
    const targetIdea = session.ideas.find(idea => idea.id === targetId);
    
    if (!sourceIdea || !targetIdea) return "";
    
    return `M ${sourceIdea.x} ${sourceIdea.y} L ${targetIdea.x} ${targetIdea.y}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Whiteboard header */}
      <div className="bg-white border-b p-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{session.name}</h1>
          <div className="text-sm text-slate-500">
            Session ID: <span className="font-mono">{sessionId}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUsersPanel(!showUsersPanel)}
            className="flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            <span>{Object.keys(session.users).length} Users</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveSession}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Session
          </Button>
        </div>
      </div>
      
      {/* Connection status */}
      {status !== "connected" && (
        <div className="bg-yellow-50 p-2 text-sm text-yellow-800 flex items-center">
          <div className={`w-2 h-2 rounded-full ${
            status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'
          } mr-2`}></div>
          <span>
            {status === 'connecting' 
              ? 'Reconnecting to session...' 
              : 'Connection lost. Trying to reconnect...'}
          </span>
        </div>
      )}
      
      {/* Main whiteboard area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Users panel */}
        {showUsersPanel && (
          <div className="absolute top-0 right-0 w-64 h-full bg-white border-l z-20 overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Connected Users</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUsersPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {Object.values(session.users).map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: user.color,
                        opacity: user.isActive ? 1 : 0.5
                      }}
                    />
                    <div className="text-sm">
                      {user.id === userId ? `${user.name} (You)` : user.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Whiteboard canvas */}
        <div 
          ref={boardRef}
          className="absolute inset-0 bg-slate-50"
          style={{ 
            backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${boardPosition.x % (20 * scale)}px ${boardPosition.y % (20 * scale)}px`
          }}
          onClick={() => {
            if (connectingIdea) {
              setConnectingIdea(null);
              setSelectedIdea(null);
              toast({
                title: "Connection cancelled",
                description: "Clicked on empty space"
              });
            } else if (selectedIdea) {
              setSelectedIdea(null);
            }
          }}
        >
          {/* Transformation container for zoom and pan */}
          <div
            className="absolute"
            style={{
              transform: `translate(${boardPosition.x}px, ${boardPosition.y}px) scale(${scale})`,
              transformOrigin: "top left"
            }}
          >
            {/* Connection lines between ideas */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <g>
                {session.ideas.flatMap(idea => 
                  idea.connections.map(targetId => {
                    // Only render each connection once
                    if (idea.id < targetId) {
                      return (
                        <path
                          key={`${idea.id}-${targetId}`}
                          d={getConnectionPath(idea.id, targetId)}
                          stroke={idea.color}
                          strokeWidth="2"
                          strokeOpacity="0.6"
                          strokeDasharray={connectingIdea ? "5,5" : "none"}
                        />
                      );
                    }
                    return null;
                  })
                )}
                
                {/* Active connection being created */}
                {connectingIdea && (
                  <path
                    d={`M ${session.ideas.find(idea => idea.id === connectingIdea)?.x || 0} 
                        ${session.ideas.find(idea => idea.id === connectingIdea)?.y || 0} 
                        L ${cursorPosition.x} ${cursorPosition.y}`}
                    stroke={session.ideas.find(idea => idea.id === connectingIdea)?.color || "#000"}
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    strokeDasharray="5,5"
                  />
                )}
              </g>
            </svg>
            
            {/* Ideas */}
            {session.ideas.map(idea => (
              <div
                key={idea.id}
                className={`absolute p-3 rounded-lg shadow-md max-w-xs cursor-pointer transition-all duration-200 ${
                  selectedIdea === idea.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                } ${
                  editingIdeaId === idea.id ? 'z-20 scale-105' : 'z-10 hover:scale-105'
                }`}
                style={{
                  left: idea.x - 75, // Center horizontally
                  top: idea.y - 40,  // Center vertically
                  backgroundColor: idea.color,
                  borderColor: idea.color
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  
                  if (connectingIdea) {
                    handleFinishConnecting(idea.id);
                  } else {
                    setSelectedIdea(idea.id === selectedIdea ? null : idea.id);
                  }
                }}
              >
                {editingIdeaId === idea.id ? (
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      value={editingIdeaText}
                      onChange={(e) => setEditingIdeaText(e.target.value)}
                      className="min-h-[80px] bg-white"
                      placeholder="Update your idea..."
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIdeaId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateIdea();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white font-medium break-words">{idea.text}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-white text-opacity-80 text-sm">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span>{idea.votes}</span>
                      </div>
                      
                      {selectedIdea === idea.id && (
                        <div className="flex space-x-1">
                          <button
                            className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVote(idea.id);
                            }}
                            title="Vote for this idea"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          
                          <button
                            className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartConnecting(idea.id);
                            }}
                            title="Connect to another idea"
                          >
                            <CornerUpLeft className="h-3 w-3" />
                          </button>
                          
                          <button
                            className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIdeaId(idea.id);
                              setEditingIdeaText(idea.text);
                            }}
                            title="Edit this idea"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          
                          <button
                            className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteIdea(idea.id);
                            }}
                            title="Delete this idea"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* User cursors */}
            {Object.values(session.users)
              .filter(user => user.id !== userId && user.cursor && user.isActive)
              .map(user => (
                <div 
                  key={user.id}
                  className="absolute pointer-events-none z-50"
                  style={{
                    left: user.cursor?.x,
                    top: user.cursor?.y,
                    transition: "transform 0.1s ease-out"
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 transform rotate-45"
                      style={{ backgroundColor: user.color }}
                    />
                    <div 
                      className="px-2 py-1 rounded text-xs text-white -mt-1"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Add idea panel - fixed to the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          {addingIdea ? (
            <div className="max-w-md mx-auto">
              <Textarea
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder="Type your idea here..."
                className="mb-2"
                autoFocus
              />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {NODE_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setAddingIdea(false);
                      setNewIdeaText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddIdea}>Add Idea</Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              className="mx-auto flex items-center"
              onClick={() => setAddingIdea(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Idea
            </Button>
          )}
        </div>
        
        {/* Navigation controls */}
        <div className="absolute bottom-24 right-4 flex flex-col bg-white rounded-lg shadow-md">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => zoomBoard(0.1)}
            className="rounded-b-none"
          >
            +
          </Button>
          <div className="px-3 py-1 text-xs text-center border-t border-b">
            {Math.round(scale * 100)}%
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => zoomBoard(-0.1)}
            className="rounded-t-none"
          >
            -
          </Button>
        </div>
      </div>
    </div>
  );
}