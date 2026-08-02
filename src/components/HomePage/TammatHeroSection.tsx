import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Shield, Clock, Users, CheckCircle } from 'lucide-react';
import { FAMILY_VISA_PROMPTS } from '@/config/services';

interface TammatHeroSectionProps {
  onPromptSelect?: (prompt: any) => void;
  onChatSubmit?: (message: string) => void;
}

const TammatHeroSection: React.FC<TammatHeroSectionProps> = ({
  onPromptSelect,
  onChatSubmit
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const handlePromptClick = (prompt: any) => {
    setSelectedPrompt(prompt.text);
    setChatInput(prompt.text);
    onPromptSelect?.(prompt);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    setIsTyping(true);
    onChatSubmit?.(chatInput);
    
    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-lg" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Main Content */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Visa Sponsorship Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Sponsor Your Family to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              UAE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Get expert guidance and complete your visa sponsorship application with our advanced AI-powered platform. 
            Simple, secure, and streamlined for UAE residents.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {[
              { icon: Users, value: '10K+', label: 'Successful Applications' },
              { icon: Shield, value: '99.8%', label: 'Approval Rate' },
              { icon: Clock, value: '15-20', label: 'Days Processing' },
              { icon: CheckCircle, value: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/20">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Predefined Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Quick Start - Choose Your Service:
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {FAMILY_VISA_PROMPTS.map((prompt, index) => (
              <motion.button
                key={prompt.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePromptClick(prompt)}
                className={`group relative px-6 py-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  selectedPrompt === prompt.text
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-white/20 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prompt.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                      {prompt.text}
                    </div>
                    <div className="text-sm text-slate-500">{prompt.description}</div>
                  </div>
                </div>
                {selectedPrompt === prompt.text && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ask Our AI Assistant
              </h3>
              <p className="text-text-secondary">
                Get personalized guidance for your visa sponsorship journey
              </p>
            </div>

            <div className="relative">
              <div className="relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about visa sponsorship, document requirements, or application process..."
                  className="w-full px-6 py-4 text-lg border-2 border-border rounded-2xl focus:border-blue-500 focus:outline-none shadow-lg resize-none"
                  rows={3}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-3 bottom-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isTyping ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-text-secondary"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </motion.div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                💡 Try asking: "What documents do I need for spouse visa?" or "How long does the process take?"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm">UAE Government Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm">10,000+ Happy Families</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TammatHeroSection; 