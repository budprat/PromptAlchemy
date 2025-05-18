import { useState, useEffect } from "react";
import CollaborativeWhiteboard from "@/components/whiteboard/CollaborativeWhiteboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  useWhiteboardConnection,
  type WhiteboardUser,
  type SessionInfo,
  type IdeaNode
} from "@/hooks/use-whiteboard-connection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Generate a random color for the user
const NODE_COLORS = [
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EF4444", // Red
  "#3B82F6", // Blue
];

export default function WhiteboardPage() {
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [availableSessions, setAvailableSessions] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const { toast } = useToast();
  
  // Mock user details - in a real app, this would come from authentication
  const userId = "user-1";
  const userName = "You";
  const userColor = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
  
  // Initialize the WebSocket connection for collaborative whiteboard
  const {
    status,
    session,
    error,
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
    createSession
  } = useWhiteboardConnection(userId);
  
  // Fetch available sessions when component mounts
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const sessions = await fetchAvailableSessions();
        setAvailableSessions(sessions);
      } catch (error) {
        toast({
          title: "Failed to load sessions",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSessions(false);
      }
    };
    
    loadSessions();
  }, [fetchAvailableSessions, toast]);
  
  // Show error toast if connection error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Create a new session
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for your brainstorming session",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newSession = await createSession(newSessionName);
      
      // Create user object
      const user: WhiteboardUser = {
        id: userId,
        name: userName,
        color: userColor,
        isActive: true,
        lastActive: new Date()
      };
      
      // Join the newly created session
      joinSession(newSession.id, user);
      
      setNewSessionName("");
      setIsCreatingSession(false);
      
      toast({
        title: "Session created",
        description: `You've created "${newSession.name}" session`
      });
    } catch (error) {
      toast({
        title: "Failed to create session",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Join an existing session
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Session code required",
        description: "Please enter a valid session code",
        variant: "destructive"
      });
      return;
    }
    
    // Create user object
    const user: WhiteboardUser = {
      id: userId,
      name: userName,
      color: userColor,
      isActive: true,
      lastActive: new Date()
    };
    
    // Join the session
    joinSession(sessionCode, user);
    
    setSessionCode("");
    setIsJoiningSession(false);
    
    toast({
      title: "Joining session",
      description: "Connecting to brainstorming session..."
    });
  };
  
  return (
    <div className="h-screen flex flex-col">
      {!session ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Prompt Brainstorming</h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Create a new session</h2>
                <div className="flex space-x-2">
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Session name"
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => setIsCreatingSession(true)}
                    disabled={status !== "connected"}
                  >
                    Create
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-sm text-slate-500">or</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Join an existing session</h2>
                
                {availableSessions.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-slate-500">Select a session:</p>
                    {availableSessions.map(session => (
                      <div 
                        key={session.id}
                        onClick={() => {
                          setSessionCode(session.id);
                          setIsJoiningSession(true);
                        }}
                        className="p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{session.name}</div>
                            <div className="text-xs text-slate-500">
                              {session.userCount} {session.userCount === 1 ? 'user' : 'users'} • {session.ideaCount} {session.ideaCount === 1 ? 'idea' : 'ideas'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionCode(session.id);
                              setIsJoiningSession(true);
                            }}
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mb-4">
                    {isLoadingSessions 
                      ? "Loading available sessions..."
                      : "No active sessions found. Create a new session to get started."}
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsJoiningSession(true)}
                  disabled={status !== "connected"}
                >
                  Enter Session Code
                </Button>
              </div>
              
              {status !== "connected" && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'
                    } mr-2`}></div>
                    <p className="text-sm text-yellow-800">
                      {status === 'connecting' 
                        ? 'Connecting to server...' 
                        : 'Not connected to server. Please wait while we try to reconnect...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Join Session Dialog */}
          <Dialog open={isJoiningSession} onOpenChange={setIsJoiningSession}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join a session</DialogTitle>
                <DialogDescription>
                  Enter the session code provided by the session creator
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  placeholder="Session code"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsJoiningSession(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleJoinSession}
                  disabled={status !== "connected"}
                >
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Create Session Dialog */}
          <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a new brainstorming session</DialogTitle>
                <DialogDescription>
                  Give your session a name so others can identify it
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Session name (e.g. Product Naming Ideas)"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingSession(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSession}>
                  Create Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <CollaborativeWhiteboard
            sessionId={session.id}
            userId={userId}
            userName={userName}
            session={session}
            status={status}
            onSendCursorPosition={sendCursorPosition}
            onAddIdea={(idea: Omit<IdeaNode, "id" | "createdAt" | "isSelected">) => addIdea(idea)}
            onDeleteIdea={deleteIdea}
            onUpdateIdea={updateIdea}
            onAddConnection={addConnection}
            onRemoveConnection={removeConnection}
            onVote={voteForIdea}
            onLeaveSession={leaveSession}
          />
        </div>
      )}
    </div>
  );
}