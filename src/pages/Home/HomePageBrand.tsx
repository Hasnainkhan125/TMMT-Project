import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HomePage/HeroSection';
import FeatureHighlights from '@/components/HomePage/FeatureHighlights';
import IndustriesSection from '@/components/HomePage/IndustriesSection';
import InfoSection from '@/components/HomePage/InfoSection';
import RoadmapSection from '@/components/HomePage/RoadmapSection';
import PropertyShowcase from '@/components/HomePage/PropertyShowcase';
import '@/index.css';
import spaceHero from '@/assets/space-hero.jpg';
import Partners from '@/components/HomePage/Partners';
function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">

      <div className="fixed inset-0 animated-gradient" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <motion.div 
        className="fixed top-20 left-10 w-32 h-32 border border-teal-500/10 rounded-full"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      <motion.div 
        className="fixed bottom-20 right-20 w-24 h-24 border border-blue-500/10 rotate-45"
        animate={{ 
          rotate: [45, 405],
          y: [-10, 10, -10]
        }}
        transition={{ 
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      <motion.div 
        className="fixed top-1/2 left-20 w-16 h-16 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg"
        animate={{ 
          y: [-20, 20, -20],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" }
        }}
      />
      
      {/* <PropertyShowcase /> */}
      
      <main className="relative z-10">
        <HeroSection />
        <FeatureHighlights />
        <Partners />
        <IndustriesSection />
        <InfoSection />
        <RoadmapSection />
        
        <motion.footer 
          className="py-16 px-4 border-t border-white/10 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
              className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>256-bit SSL encryption • VARA regulated • ERC3643 compliant • AWS Bedrock powered</span>
            </motion.div>
            <p className="text-xs text-slate-500 mb-8">
              Your assets are protected by institutional-grade security measures and AI-powered monitoring
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {[
                { label: "Assets Under Management", value: "$2.4B+" },
                { label: "AI Agents Active", value: "1,200+" },
                { label: "Compliance Score", value: "99.8%" },
                { label: "Global Investors", value: "150K+" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-xs text-slate-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              © 2024 Mobius RWA. Revolutionizing asset tokenization with AI-powered automation.
            </motion.div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}

export default HomePage; 