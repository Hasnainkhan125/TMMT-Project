import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { 
  Building, 
  CreditCard, 
  BarChart3, 
  Rocket,
  ArrowRight,
  Bot,
  Zap
} from 'lucide-react';

const industries = [
  {
    icon: Building,
    title: 'Real Estate',
    description: 'Tokenize residential, commercial, and mixed-use properties with AI-powered property management and automated compliance.',
    image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    color: 'from-emerald-500 to-teal-600',
    aiFeatures: ['Property Valuation', 'Tenant Management', 'Maintenance Scheduling']
  },
  {
    icon: CreditCard,
    title: 'Private Credit',
    description: 'Open private credit markets with AI agents managing risk assessment, loan monitoring, and automated collections.',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    color: 'from-purple-500 to-indigo-600',
    aiFeatures: ['Risk Assessment', 'Credit Scoring', 'Portfolio Optimization']
  },
  {
    icon: BarChart3,
    title: 'Commodities',
    description: 'Digitize gold, oil, and commodities with AI-powered market analysis, price prediction, and automated trading.',
    image: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg',
    color: 'from-amber-500 to-orange-600',
    aiFeatures: ['Price Prediction', 'Market Analysis', 'Supply Chain Tracking']
  },
  {
    icon: Rocket,
    title: 'Venture Capital',
    description: 'Fractionalize VC funds with AI agents providing startup analysis, due diligence, and performance monitoring.',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    color: 'from-blue-500 to-cyan-600',
    aiFeatures: ['Startup Analysis', 'Due Diligence', 'Performance Tracking']
  }
];

export default function IndustriesSection() {
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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
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
    <section className="rounded-tl-[9rem] rounded-tr-[9rem] -mt-[7rem] z-[100] bg-[#101620]  py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_60%)]" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Industries We <span className="gradient-text">Tokenize</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Transform traditional assets across multiple sectors with AI-powered automation, 
            compliance monitoring, and intelligent operations management
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              variants={itemVariants as any}
            >
              <Card 
                className="group glass hover:glass-strong transition-all duration-500 overflow-hidden h-full"
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <motion.img 
                      src={industry.image} 
                      alt={industry.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${industry.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
                    
                    {/* Industry Icon */}
                    <div className="absolute top-4 left-4">
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 glass rounded-xl"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <industry.icon className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>

                    {/* AI Badge */}
                    <div className="absolute top-4 right-4">
                      <motion.div 
                        className="flex items-center gap-1 glass px-2 py-1 rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Bot className="h-3 w-3 text-teal-400" />
                        <span className="text-xs text-white">AI</span>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                      {industry.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1">
                      {industry.description}
                    </p>
                    
                    {/* AI Features */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-teal-400 text-xs font-medium">
                        <Zap className="h-3 w-3" />
                        <span>AI-Powered Features:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {industry.aiFeatures.map((feature, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-background/10 text-slate-300 px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <motion.div 
                      className="flex items-center text-teal-400 text-sm font-medium group-hover:text-teal-300 transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                    >
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Agents Showcase */}
        <motion.div 
          className="mt-20 glass-strong rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              AI Agents <span className="gradient-text">Ecosystem</span>
            </h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Our AWS Bedrock-powered AI agents work 24/7 to optimize your investments, 
              ensure compliance, and maximize returns across all asset classes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Marketing Agent",
                description: "Automated investor outreach, content creation, and market analysis",
                icon: "🎯"
              },
              {
                title: "Operations Agent", 
                description: "Asset management, maintenance scheduling, and performance optimization",
                icon: "⚙️"
              },
              {
                title: "Compliance Agent",
                description: "Regulatory monitoring, reporting, and automated compliance checks",
                icon: "🛡️"
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4 p-6 glass rounded-2xl"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">{agent.icon}</div>
                <h4 className="text-xl font-bold text-white">{agent.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{agent.description}</p>
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