import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  isCurrentUser: boolean;
  imageUrl?: string;
}

interface ChatInterfaceProps {
  routeId: string;
}

export function ChatInterface({ routeId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [routeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const loadMessages = async () => {
  try {
    const response = await apiClient.getChatMessages(routeId);

    const backendMessages = response?.messages || response?.data || [];

    setMessages(
      backendMessages.map((msg: any) => ({
        ...msg,
        isCurrentUser: msg.userId === user?.id,
      }))
    );
  } catch (error) {
    console.error("Erro ao carregar mensagens:", error);
    setMessages([]);
  }
};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const message = {
        routeId,
        text: newMessage,
        userId: user?.id,
        userName: user?.name,
        timestamp: new Date().toISOString(),
      };

      await apiClient.sendChatMessage(message);
      
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Em produção, fazer upload da imagem para storage
    console.log('Upload file:', file);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma mensagem ainda</p>
            <p className="text-sm text-gray-400">Envie uma mensagem para começar</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.isCurrentUser
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {!message.isCurrentUser && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {message.userName}
                  </p>
                )}
                
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Attachment"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
                
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                
                <p
                  className={`text-xs mt-1 ${
                    message.isCurrentUser ? 'text-red-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="size-5 text-gray-600" />
          </button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sending}
          />
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-red-600 hover:bg-red-700 px-6"
          >
            <Send className="size-5" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
