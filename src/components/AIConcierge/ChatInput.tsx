import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isUserSignedIn: boolean;
}

/**
 * ChatInput Component
 * 
 * Provides the interactive text field and send button for the AI Concierge.
 * Ensures accessibility and proper disabled states during loading or unauthenticated sessions.
 * 
 * @component
 */
export const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  isUserSignedIn 
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex gap-2 relative" 
      role="search" 
      aria-label="AI Concierge Input"
    >
      <input
        id="concierge-input"
        name="query"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isUserSignedIn ? "Ask the concierge..." : "Sign in to chat"}
        disabled={!isUserSignedIn || isLoading}
        className="flex-1 bg-surface border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm disabled:opacity-50"
        aria-label="Ask the concierge"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading || !isUserSignedIn}
        className="bg-brand text-white p-3.5 rounded-xl hover:bg-brand-dark transition-all shadow-sm disabled:opacity-50 disabled:hover:bg-brand focus:ring-2 focus:ring-brand focus:ring-offset-2 outline-none"
        aria-label="Send message"
      >
        <Send size={18} aria-hidden="true" />
      </button>
    </form>
  );
};
