import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Share2, 
  Shield, 
  ArrowUpDown, 
  Search,
  Bot,
  Zap,
  Network,
  Eye,
  Lock,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Low minimum investment',
    description: 'Start investing with as little as $100',
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    icon: TrendingUp,
    title: '8-16% Projected ROI',
    description: 'Competitive returns on tokenized assets',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Share2,
    title: 'Fractional ownership',
    description: 'Own portions of high-value assets',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: Shield,
    title: 'ERC3643 Standard',
    description: 'Compliant tokenization with proper SPVs',
    color: 'from-orange-500/20 to-red-500/20'
  },
  {
    icon: Bot,
    title: 'AI Agent Management',
    description: 'Automated operations & monitoring',
    color: 'from-teal-500/20 to-green-500/20'
  },
  {
    icon: ArrowUpDown,
    title: 'P2P Securities Transfer',
    description: 'Direct peer-to-peer token transfers',
    color: 'from-indigo-500/20 to-blue-500/20'
  },
  {
    icon: Network,
    title: 'AWS Bedrock Powered',
    description: 'Enterprise-grade AI infrastructure',
    color: 'from-yellow-500/20 to-orange-500/20'
  },
  {
    icon: Eye,
    title: 'Full transparency',
    description: 'Complete visibility into all transactions',
    color: 'from-pink-500/20 to-purple-500/20'
  }
];

export default function FeatureHighlights() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.05),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            AI-Powered Platform Features
          </h2>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Revolutionary technology stack combining ERC3643 compliance, proper SPV structures, 
            and AWS Bedrock AI agents for seamless asset tokenization
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6"
          variants={containerVariants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={`group text-center space-y-4 p-6 rounded-2xl glass hover:glass-strong transition-all duration-500 relative overflow-hidden`}
              variants={itemVariants as any}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-35 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <motion.div 
                  className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-xl group-hover:from-teal-500/30 group-hover:to-blue-500/30 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-6 w-6 text-teal-600 group-hover:text-teal-300" />
                </motion.div>
                <div>
                  <h3 className="text-black font-semibold text-sm mb-1 group-hover:text-teal-900 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground text-xs leading-relaxed group-hover:text-foreground transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ERC3643 & SPV Benefits Section */}
        <motion.div 
          className="mt-20 glass-strong rounded-3xl bg-[#f1f1f1] p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          style={{
            backgroundColor: '#f1f1f1'
          }}
          whileHover={{ scale: 1.02 }}
          // transition={{ duration: 0.3 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text">ERC3643 Standard</h3>
              </div>
              <p className="text-foreground text-lg leading-relaxed">
                Built on the ERC3643 standard for compliant security token transfers with proper 
                Special Purpose Vehicles (SPVs) ensuring regulatory compliance and investor protection.
              </p>
              <div className="space-y-4">
                {[
                  "Regulatory compliant token transfers",
                  "Proper SPV structure for asset isolation",
                  "Automated compliance monitoring",
                  "Institutional-grade security measures"
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-2 h-2 bg-teal-700 rounded-full" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-teal-700 font-semibold">SPV Structure</span>
                  <Lock className="h-5 w-5 text-green-700" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/5 rounded-lg">
                    <span className="text-sm text-foreground">Asset Isolation</span>
                    <span className="text-green-700 text-sm">✓ Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/5 rounded-lg">
                    <span className="text-sm text-foreground">Compliance Layer</span>
                    <span className="text-green-700 text-sm">✓ ERC3643</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/5 rounded-lg">
                    <span className="text-sm text-foreground">Transfer Restrictions</span>
                    <span className="text-blue-700 text-sm">✓ Automated</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}