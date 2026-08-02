import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Shield, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { getAllServices } from '@/config/services';
import { Service } from '@/types/tammat.types';

interface ServiceGridProps {
  onServiceSelect?: (service: Service) => void;
  showAllServices?: boolean;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  onServiceSelect,
  showAllServices = true
}) => {
  const navigate = useNavigate();
  const services = getAllServices();

  const handleServiceSelect = (service: Service) => {
    onServiceSelect?.(service);
    navigate(`/service/${service.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Most Popular':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Fast Track':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      case 'Premium':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      default:
        return 'bg-slate-100 text-text-secondary';
    }
  };

  const getServiceStatus = (service: Service) => {
    if (service.id === 'family-visa-spouse') return 'Most Popular';
    if (service.id === 'family-visa-parents') return 'Premium';
    if (service.id === 'family-visa-children') return 'Fast Track';
    return '';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Family Visa Service
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            We offer comprehensive family visa sponsorship services with expert guidance, 
            fast processing, and guaranteed support throughout your journey.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Status Badge */}
              {getServiceStatus(service) && (
                <div className="absolute -top-3 left-6 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getServiceStatus(service))}`}>
                    {getServiceStatus(service)}
                  </span>
                </div>
              )}

              {/* Service Card */}
              <div
                onClick={() => handleServiceSelect(service)}
                className="relative bg-background rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-border hover:border-blue-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-8 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl">
                      {service.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        AED {service.cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">Total Cost</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-8 pb-6">
                  {/* Process Steps */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span>Process Steps</span>
                      <span className="font-medium">{service.process.length} steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.process.map((step, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx === 0 ? 'bg-blue-500' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{service.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>99.8% Success</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-background rounded-3xl shadow-lg border border-border p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-foreground">
                Need Custom Assistance?
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              Our visa experts are available 24/7 to help you with any questions or special requirements.
            </p>
            <button className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-200">
              Contact Expert
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceGrid; 