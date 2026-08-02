import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { 
  Bot, 
  Shield, 
  ArrowUpDown, 
  Globe2,
  Sparkles,
  Lock,
  Network,
  Zap,
  Brain,
  Eye
} from 'lucide-react';

const infoCards = [
  {
    icon: Bot,
    title: 'AI Agents for Asset Management',
    description: 'AWS Bedrock-powered AI agents automate onboarding, reporting, compliance, and asset performance—maximizing returns and minimizing operational overhead.',
    color: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-500/30',
    features: ['Automated Onboarding', 'Performance Analytics', 'Risk Management']
  },
  {
    icon: Shield,
    title: 'ERC3643 & Regulatory Compliance',
    description: 'Built on ERC3643 standard with proper SPV structures. Compliant with Dubai VARA and global standards for institutional-grade security.',
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    features: ['ERC3643 Standard', 'SPV Structure', 'VARA Compliant']
  },
  {
    icon: ArrowUpDown,
    title: 'P2P Securities Transfer',
    description: 'Seamless peer-to-peer token transfers with automated compliance checks, instant settlement, and full transparency.',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    features: ['Instant Settlement', 'Compliance Checks', 'Transfer History']
  },
  {
    icon: Globe2,
    title: 'Global Access & Lower Fees',
    description: 'Access global investors with just 2% DLD fees—half the industry standard. AI-powered marketing reaches qualified investors worldwide.',
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
    features: ['2% DLD Fees', 'Global Reach', 'AI Marketing']
  }
];

export default function InfoSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="rounded-tl-[9rem] rounded-tr-[9rem] -mt-[2rem] py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose <span className="gradient-text">Mobius RWA</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Revolutionary AI-powered platform combining regulatory compliance, 
            institutional-grade security, and automated asset management
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-20"
          variants={containerVariants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {infoCards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants as any}
            >
              <Card 
                className={`group bg-gradient-to-br ${card.color} glass-strong border ${card.borderColor} hover:scale-105 transition-all duration-500 h-full`}
              >
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 bg-background/10 rounded-xl group-hover:bg-background/20 transition-colors"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <card.icon className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-200 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {card.features.map((feature, idx) => (
                        <motion.span
                          key={idx}
                          className="text-xs bg-background/10 text-slate-300 px-3 py-1 rounded-full"
                          whileHover={{ scale: 1.05 }}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* SPV & ERC3643 Deep Dive */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold gradient-text">ERC3643 & SPV Benefits</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              Our platform leverages the ERC3643 standard for compliant security token transfers, 
              combined with proper Special Purpose Vehicle (SPV) structures to ensure regulatory 
              compliance and investor protection across all jurisdictions.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Asset Isolation",
                  description: "SPVs provide legal separation between assets and parent company liabilities"
                },
                {
                  title: "Regulatory Compliance", 
                  description: "ERC3643 ensures all token transfers meet regulatory requirements"
                },
                {
                  title: "Investor Protection",
                  description: "Structured ownership provides enhanced security for token holders"
                },
                {
                  title: "Tax Optimization",
                  description: "SPV structures enable efficient tax planning and reporting"
                }
              ].map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="glass p-4 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-teal-400 font-semibold mb-2">{benefit.title}</h4>
                  <p className="text-slate-300 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-strong rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-teal-400 font-semibold text-lg">SPV Architecture</span>
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              
              {/* SPV Diagram */}
              <div className="space-y-4">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-white font-semibold mb-2">Parent Company</div>
                  <div className="text-xs text-slate-400">Mobius RWA Platform</div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gradient-to-b from-teal-500 to-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-sm text-white font-medium mb-1">SPV 1</div>
                    <div className="text-xs text-slate-400">Real Estate Assets</div>
                  </div>
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-sm text-white font-medium mb-1">SPV 2</div>
                    <div className="text-xs text-slate-400">Private Credit</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gradient-to-b from-blue-500 to-purple-500" />
                </div>
                
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-white font-semibold mb-2">ERC3643 Tokens</div>
                  <div className="text-xs text-slate-400">Compliant Security Tokens</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* AI Agents Ecosystem */}
        <motion.div 
          className="glass-strong rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-teal-400" />
              <h3 className="text-3xl font-bold text-white">
                AWS Bedrock <span className="gradient-text">AI Ecosystem</span>
              </h3>
            </div>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Our AI agents leverage AWS Bedrock's advanced machine learning capabilities 
              to provide intelligent automation across all aspects of asset tokenization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Marketing Agent",
                description: "Automated investor outreach and content creation",
                icon: "🎯",
                capabilities: ["Lead Generation", "Content Creation", "Market Analysis"]
              },
              {
                title: "Operations Agent", 
                description: "Asset management and performance optimization",
                icon: "⚙️",
                capabilities: ["Asset Monitoring", "Maintenance", "Performance Tracking"]
              },
              {
                title: "Compliance Agent",
                description: "Regulatory monitoring and automated reporting",
                icon: "🛡️",
                capabilities: ["Regulatory Checks", "Automated Reports", "Risk Assessment"]
              },
              {
                title: "Analytics Agent",
                description: "Predictive analytics and market insights",
                icon: "📊",
                capabilities: ["Market Prediction", "Risk Analysis", "Portfolio Optimization"]
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4 p-6 glass rounded-2xl"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{agent.icon}</div>
                <h4 className="text-xl font-bold text-white">{agent.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{agent.description}</p>
                
                <div className="space-y-2">
                  {agent.capabilities.map((capability, idx) => (
                    <div key={idx} className="text-xs bg-background/10 text-slate-300 px-2 py-1 rounded-full">
                      {capability}
                    </div>
                  ))}
                </div>
                
                <motion.div 
                  className="w-full h-2 bg-background/10 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}