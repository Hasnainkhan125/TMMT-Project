import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Rocket, 
  Bot,
  Shield,
  Globe,
  Zap,
  Network,
  Brain,
  Target
} from 'lucide-react';

const roadmapItems = [
  {
    quarter: "Q1 2024",
    status: "completed",
    title: "Foundation & Core Infrastructure",
    description: "ERC3643 implementation, SPV structure setup, and AWS Bedrock integration",
    icon: Shield,
    achievements: [
      "ERC3643 compliant smart contracts deployed",
      "SPV legal framework established", 
      "AWS Bedrock AI infrastructure setup",
      "Core tokenization engine built"
    ]
  },
  {
    quarter: "Q2 2024", 
    status: "completed",
    title: "AI Agents Development",
    description: "Marketing, Operations, and Compliance AI agents with automated workflows",
    icon: Bot,
    achievements: [
      "Marketing AI agent for investor outreach",
      "Operations AI for asset management",
      "Compliance monitoring automation",
      "P2P transfer mechanisms"
    ]
  },
  {
    quarter: "Q3 2024",
    status: "in-progress", 
    title: "Multi-Asset Tokenization",
    description: "Real estate, private credit, commodities, and VC fund tokenization",
    icon: Globe,
    achievements: [
      "Real estate tokenization platform",
      "Private credit marketplace",
      "Commodities trading integration",
      "VC fund fractionalization"
    ]
  },
  {
    quarter: "Q4 2024",
    status: "upcoming",
    title: "Advanced AI & Analytics",
    description: "Predictive analytics, risk assessment, and autonomous portfolio management",
    icon: Brain,
    achievements: [
      "Predictive market analysis AI",
      "Automated risk assessment",
      "Portfolio optimization algorithms",
      "Advanced compliance monitoring"
    ]
  },
  {
    quarter: "Q1 2025",
    status: "upcoming", 
    title: "Global Expansion",
    description: "Multi-jurisdiction compliance, institutional partnerships, and scaling",
    icon: Network,
    achievements: [
      "Multi-jurisdiction regulatory compliance",
      "Institutional investor onboarding",
      "Cross-border asset tokenization",
      "Enterprise partnership program"
    ]
  },
  {
    quarter: "Q2 2025",
    status: "upcoming",
    title: "Next-Gen Features",
    description: "DeFi integration, yield farming, and advanced trading mechanisms",
    icon: Rocket,
    achievements: [
      "DeFi protocol integrations",
      "Automated yield farming",
      "Advanced trading algorithms",
      "Cross-chain asset bridges"
    ]
  }
];

export default function RoadmapSection() {
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
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'upcoming': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-surface-light0/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Zap;
      case 'upcoming': return Clock;
      default: return Target;
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(20,184,166,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(139,92,246,0.1),transparent_60%)]" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Platform <span className="gradient-text">Roadmap</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our journey to revolutionize asset tokenization with AI-powered automation, 
            regulatory compliance, and institutional-grade infrastructure
          </p>
        </motion.div>

        <motion.div 
          className="relative"
          variants={containerVariants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-blue-500 to-purple-500 transform md:-translate-x-0.5" />

          <div className="space-y-12">
            {roadmapItems.map((item, index) => {
              const StatusIcon = getStatusIcon(item.status);
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  variants={itemVariants as any}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transform -translate-x-2 md:-translate-x-2 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-ping opacity-75" />
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ml-16 md:ml-0 ${isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="glass-strong hover:glass transition-all duration-500">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl">
                                <item.icon className="h-6 w-6 text-teal-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className={getStatusColor(item.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {item.quarter}
                                </Badge>
                                <Badge variant="outline" className="text-slate-400 border-slate-600">
                                  {item.status.replace('-', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">
                                {item.title}
                              </h3>
                              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Achievements */}
                          <div className="space-y-2">
                            {item.achievements.map((achievement, idx) => (
                              <motion.div
                                key={idx}
                                className="flex items-center gap-3 text-sm"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  item.status === 'completed' ? 'bg-green-400' :
                                  item.status === 'in-progress' ? 'bg-blue-400' : 'bg-purple-400'
                                }`} />
                                <span className="text-slate-300">{achievement}</span>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Stats */}
        <motion.div 
          className="mt-20 glass-strong rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Development Progress</h3>
            <p className="text-slate-300">Real-time progress across all platform components</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Core Infrastructure", progress: 100, color: "from-green-500 to-emerald-500" },
              { label: "AI Agents", progress: 85, color: "from-blue-500 to-cyan-500" },
              { label: "Asset Tokenization", progress: 70, color: "from-purple-500 to-pink-500" },
              { label: "Global Expansion", progress: 25, color: "from-orange-500 to-red-500" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <motion.path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${item.progress}, 100`}
                      initial={{ strokeDasharray: "0, 100" }}
                      whileInView={{ strokeDasharray: `${item.progress}, 100` }}
                      transition={{ duration: 2, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{item.progress}%</span>
                  </div>
                </div>
                <h4 className="text-white font-semibold text-sm">{item.label}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}