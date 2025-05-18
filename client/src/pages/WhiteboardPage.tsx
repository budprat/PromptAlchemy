import { useState } from "react";
import CollaborativeWhiteboard from "@/components/whiteboard/CollaborativeWhiteboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WhiteboardPage() {
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  
  // Mock user details - in a real app, this would come from authentication
  const userId = "user-1";
  const userName = "You";
  
  // Generate a unique session ID
  const generateSessionId = () => {
    return `session-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // Create a new session
  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setNewSessionName("");
  };
  
  // Join an existing session
  const handleJoinSession = () => {
    if (!sessionCode.trim()) return;
    setSessionId(sessionCode);
    setSessionCode("");
    setIsJoiningSession(false);
  };
  
  return (
    <div className="h-screen flex flex-col">
      {!sessionId ? (
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
                  <Button onClick={handleCreateSession}>Create</Button>
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsJoiningSession(true)}
                >
                  Enter Session Code
                </Button>
              </div>
            </div>
          </div>
          
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
                <Button onClick={handleJoinSession}>Join</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <CollaborativeWhiteboard
            sessionId={sessionId}
            userId={userId}
            userName={userName}
          />
        </div>
      )}
    </div>
  );
}