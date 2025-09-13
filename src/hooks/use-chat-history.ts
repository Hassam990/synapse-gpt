import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@/app/actions';

export interface Chat {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

const CHAT_HISTORY_KEY = 'synapse_chat_history';

export function useChatHistory() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      }
    } catch (error) {
      console.error("Could not load chat history from localStorage", error);
    }
  }, []);

  const saveChats = useCallback((updatedChats: Chat[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedChats));
      setChats(updatedChats);
    } catch (error) {
      console.error("Could not save chat history to localStorage", error);
    }
  }, []);

  const getChat = useCallback((id: string): Chat | undefined => {
      const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
      if(!storedChats) return undefined;
      const allChats: Chat[] = JSON.parse(storedChats);
      return allChats.find(chat => chat.id === id);
  }, []);

  const getRecentChats = useCallback((): Chat[] => {
    try {
      const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedChats) {
        const allChats: Chat[] = JSON.parse(storedChats);
        return allChats.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (error) {
        console.error("Could not load chat history from localStorage", error);
    }
    return [];
  }, []);

  const createChat = useCallback((firstMessage: string): string => {
    const newChat: Chat = {
      id: uuidv4(),
      title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
      timestamp: Date.now(),
      messages: [],
    };
    
    const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
    const allChats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    
    const updatedChats = [newChat, ...allChats];
    saveChats(updatedChats);
    return newChat.id;
  }, [saveChats]);

  const addMessage = useCallback((chatId: string, message: Message) => {
    const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!storedChats) return;

    const allChats: Chat[] = JSON.parse(storedChats);
    const chatIndex = allChats.findIndex(c => c.id === chatId);

    if (chatIndex !== -1) {
      allChats[chatIndex].messages.push(message);
      saveChats(allChats);
    }
  }, [saveChats]);


  return { chats, getChat, getRecentChats, createChat, addMessage };
}
