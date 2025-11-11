import { apiClient } from '../lib/api-client';
import { API_ENDPOINTS } from '../lib/config';
import type { ChatMessage, ChatMessageInput } from '../types/api';

// Get all chats (grouped by chatflow_id)
export const getAllChats = async (): Promise<Record<string, ChatMessage[]>> => {
  return apiClient.get(API_ENDPOINTS.CHAT.LIST);
};

// Start new chat
export const startNewChat = async (content: string, workflow_id?: string): Promise<ChatMessage[]> => {
  const payload = workflow_id ? { content, workflow_id } : { content };
  return apiClient.post(API_ENDPOINTS.CHAT.CREATE, payload);
};

// Get messages for a specific chat
export const getChatMessages = async (chatflow_id: string): Promise<ChatMessage[]> => {
  return apiClient.get(API_ENDPOINTS.CHAT.GET(chatflow_id));
};

// Send message to chat (interact)
export const interactWithChat = async (chatflow_id: string, content: string, workflow_id?: string): Promise<ChatMessage[]> => {
  const payload = workflow_id ? { content, workflow_id } : { content };
  return apiClient.post(API_ENDPOINTS.CHAT.INTERACT(chatflow_id), payload);
};

// Update message
export const updateChatMessage = async (chat_message_id: string, content: string): Promise<ChatMessage[]> => {
  return apiClient.put(API_ENDPOINTS.CHAT.UPDATE(chat_message_id), { content });
};

// Delete message
export const deleteChatMessage = async (chat_message_id: string): Promise<{ detail: string }> => {
  return apiClient.delete(API_ENDPOINTS.CHAT.DELETE(chat_message_id));
};

// Delete chatflow (all messages)
export const deleteChatflow = async (chatflow_id: string): Promise<{ detail: string }> => {
  return apiClient.delete(API_ENDPOINTS.CHAT.DELETE_CHATFLOW(chatflow_id));
};

// Get workflow-specific chat history
export const getWorkflowChats = async (workflow_id: string): Promise<Record<string, ChatMessage[]>> => {
  return apiClient.get(API_ENDPOINTS.CHAT.GET_WORKFLOW_CHATS(workflow_id));
}; 