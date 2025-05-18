import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PromptCard from "@/components/prompts/PromptCard";
import { Prompt } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function PromptVault() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: prompts = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  const filteredPrompts = searchTerm
    ? prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : prompts;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Prompt Vault</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search prompts..."
              className="pl-8 pr-3 py-1.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <i className="ri-search-line text-slate-400"></i>
            </div>
          </div>
          <Button>
            <i className="ri-add-line mr-1"></i> New
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 animate-pulse">
              <div className="flex items-start justify-between mb-2">
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="flex space-x-1">
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                </div>
              </div>
              
              <div className="h-8 bg-slate-200 rounded mb-3"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-5 w-10 bg-slate-200 rounded-full"></div>
                  <div className="ml-2 h-4 w-20 bg-slate-200 rounded"></div>
                </div>
                
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full bg-slate-200"></div>
                  <div className="h-5 w-5 rounded-full bg-slate-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <i className="ri-inbox-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No prompts found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {searchTerm ? `No prompts match "${searchTerm}"` : "Start by creating your first prompt"}
          </p>
          <Button>
            <i className="ri-add-line mr-1"></i> Create New Prompt
          </Button>
        </div>
      )}
    </div>
  );
}
