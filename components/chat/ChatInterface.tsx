'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { suggestedQuestions } from '@/lib/ai/prompts';

export function ChatInterface() {
  const [customerEmail, setCustomerEmail] = useState('');
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const [showEmailPrompt, setShowEmailPrompt] = useState(true);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { id, messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        conversationId,
        customerEmail,
      },
    }),
  });

  // Add welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && !showEmailPrompt) {
      // This will be shown in the UI through the render logic below
    }
  }, [messages.length, showEmailPrompt]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerEmail.trim()) {
      setShowEmailPrompt(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage({ text: question });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    
    sendMessage({ text: input });
    setInput('');
  };

  if (showEmailPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20 relative z-10 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto mb-6 shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 text-center mb-3">
            Welcome to TechCorp
          </h2>
          <p className="text-slate-600 text-center mb-8 text-sm leading-relaxed">
            Get instant support from our AI assistant.<br />Enter your email to begin.
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="relative group">
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:border-emerald-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Conversation
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Secure & private - We protect your information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">
                TechCorp Support
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI Assistant is online
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-xs text-emerald-700 font-medium">Secure Chat</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-4 justify-start animate-fadeIn">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="max-w-2xl px-5 py-4 rounded-3xl rounded-tl-md bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200/50 shadow-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  Hi there! 👋 I'm your TechCorp support assistant. How can I help you today?
                </p>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fadeIn`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl px-5 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-md'
                    : 'bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200/50 rounded-tl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.parts.map((part, index) => 
                    part.type === 'text' ? <span key={index}>{part.text}</span> : null
                  )}
                </p>
                {message.parts.some(part => part.type === 'tool-invocation') && (
                  <div className="mt-3 pt-3 border-t border-slate-200/30">
                    {message.parts
                      .filter(part => part.type === 'tool-invocation')
                      .map((part: any, i: number) => (
                        <div key={i} className={`text-xs flex items-center gap-2 ${
                          message.role === 'user' ? 'text-emerald-100' : 'text-slate-500'
                        }`}>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>
                            {part.toolName === 'search_knowledge_base' && 'Searching knowledge base...'}
                            {part.toolName === 'create_ticket' && 'Creating support ticket...'}
                            {part.toolName === 'get_order_status' && 'Looking up order...'}
                            {part.toolName === 'transfer_to_agent' && 'Connecting to human agent...'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}

          { status === 'streaming' && (
            <div className="flex gap-4 justify-start animate-fadeIn">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tl-md border border-slate-200/50 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl shadow-lg animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {error.message || 'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {messages.length === 0 && status === 'ready' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-sm text-slate-700 font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="group px-5 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/80 rounded-2xl text-sm text-slate-700 hover:text-emerald-700 transition-all duration-200 text-left shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-emerald-500 group-hover:scale-110 transition-transform">→</span>
                      {question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 px-4 py-5 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-slate-100 disabled:cursor-not-allowed group-hover:border-emerald-300"
                disabled={status === 'streaming'}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'streaming' || !input.trim()}
              className="px-7 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center gap-2 font-medium"
            >
              {status === 'streaming' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              End-to-end encrypted
            </span>
            <span className="text-slate-300">•</span>
            <span>Your conversation is private and secure</span>
          </p>
        </form>
      </div>
    </div>
  );
}