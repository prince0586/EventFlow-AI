import { useState, useCallback, useEffect } from 'react';
import { FrontendAIService } from '../lib/ai';
import { ChatContext, ChatHistoryItem } from '../types';

/**
 * useAI Hook
 * 
 * Custom React hook for managing AI Concierge state and interactions.
 * Encapsulates message processing, history management, and loading states.
 * 
 * @param context - The venue and user context for the AI engine.
 * @returns An object containing the chat history, loading state, and the sendMessage function.
 */
export function useAI(context: ChatContext) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Dispatches a message to the AI engine and updates the local conversation history.
   * 
   * @param message - User input message.
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatHistoryItem = { role: 'user', content: message };
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await FrontendAIService.processChat(message, context, history);
      const aiMessage: ChatHistoryItem = { role: 'model', content: response };
      setHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('[useAI] Interaction failed:', error);
      const errorMessage: ChatHistoryItem = { 
        role: 'model', 
        content: "I'm currently experiencing high latency in my neural processing. Please try again or visit our help desk in Section 102." 
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [context, history]);

  /**
   * Resets the conversation history.
   */
  const resetConversation = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoading,
    sendMessage,
    resetConversation
  };
}
