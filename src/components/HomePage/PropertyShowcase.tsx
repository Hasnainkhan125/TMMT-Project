import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, TrendingUp, Building, Bot, Zap, Eye } from 'lucide-react';

const properties = [
  {
    id: 1,
    title: 'One Bedroom Apartment in Kensington Waters by Ellington',
    location: 'MRT City, Dubai',
    image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    roi: '15.62%',
    yield: '8.06%',
    type: 'Residential',
    aiStatus: 'Active Monitoring',
    compliance: 'ERC3643'
  },
  {
    id: 2,
    title: 'Luxury Penthouse in Downtown District',
    location: 'Business Bay, Dubai',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    roi: '18.24%',
    yield: '9.12%',
    type: 'Premium',
    aiStatus: 'Optimizing',
    compliance: 'ERC3643'
  },
  {
    id: 3,
    title: 'Commercial Office Space',
    location: 'DIFC, Dubai',
    image: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg',
    roi: '12.45%',
    yield: '7.30%',
    type: 'Commercial',
    aiStatus: 'Analyzing',
    compliance: 'ERC3643'
  }
];

export default function PropertyShowcase() {
  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div 
      className="fixed right-4 top-20 bottom-4 w-80 hidden xl:block z-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="h-full overflow-y-auto space-y-4 scrollbar-hide">
        <motion.div 
          className="glass-strong rounded-xl p-4"
          variants={itemVariants as any}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-teal-400" />
              Featured Assets
            </h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Eye className="h-4 w-4 text-blue-400" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                variants={itemVariants as any}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group glass hover:glass-strong transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-32 overflow-hidden">
                      <motion.img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                          {property.compliance}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {property.type}
                        </Badge>
                      </div>

                      {/* AI Status */}
                      <div className="absolute bottom-2 left-2">
                        <motion.div 
                          className="flex items-center gap-1 glass px-2 py-1 rounded-full"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Bot className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-white">{property.aiStatus}</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-teal-300 text-xs font-medium">{property.location}</p>
                          <h4 className="text-white text-sm font-medium leading-tight line-clamp-2">
                            {property.title}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-teal-400 font-bold text-sm">{property.roi}</div>
                          <div className="text-xs text-slate-400">Projected ROI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold text-sm">{property.yield}</div>
                          <div className="text-xs text-slate-400">Gross yield</div>
                        </div>
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <TrendingUp className="h-4 w-4 text-green-400 mx-auto" />
                          </motion.div>
                          <div className="text-xs text-slate-400">Active</div>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <motion.div 
                        className="glass p-2 rounded-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">AI Insights</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Market conditions favorable. Rental demand increasing by 12% this quarter.
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* AI Performance Summary */}
          <motion.div 
            className="mt-6 glass p-4 rounded-xl"
            variants={itemVariants as any}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-white font-medium">AI Performance</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Portfolio Optimization</span>
                <span className="text-xs text-green-400">+12.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Risk Reduction</span>
                <span className="text-xs text-blue-400">-8.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Compliance Score</span>
                <span className="text-xs text-teal-400">98.5%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}