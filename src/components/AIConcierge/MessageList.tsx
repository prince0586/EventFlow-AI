import React from 'react';
import { User, MessageSquare, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../../types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  user: { displayName?: string | null } | null;
}

/**
 * MessageList Component
 * 
 * Renders the chat history between the user and the AI engine.
 * Includes empty state handling and loading indicators.
 */
export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, user }) => {
  if (!user) {
    return (
      <div className="text-center py-10 space-y-4">
        <MessageSquare size={32} className="mx-auto text-text-sub opacity-20" />
        <p className="text-xs text-text-sub">Please sign in to chat with the concierge.</p>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="text-center space-y-4 mt-10 animate-in fade-in zoom-in duration-700">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto border border-border shadow-sm">
          <MessageSquare size={24} className="text-brand" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm text-text-main">
            How can I help you, {user.displayName?.split(' ')[0]}?
          </p>
          <p className="text-text-sub text-[11px] max-w-[180px] mx-auto">
            Ask about facilities, routing, or your current queue status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {messages.map((m, i) => (
        <div 
          key={i} 
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
        >
          <div className={`flex gap-2 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              m.role === 'user' ? 'bg-brand text-white' : 'bg-surface border border-border text-brand'
            }`}>
              {m.role === 'user' ? <User size={12} /> : <MessageSquare size={12} />}
            </div>
            <div className={`p-3 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-brand text-white rounded-tr-none' 
                : 'bg-surface border border-border rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
              <MessageSquare size={12} className="text-brand" />
            </div>
            <div className="bg-surface border border-border p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-brand/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
