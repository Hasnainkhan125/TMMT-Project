"use client";

import { useState } from 'react';
import { SERVICES, type Service } from '@/lib/services';
import { ServiceCard } from './ServiceCard';
import { CheckFormSheet } from './CheckFormSheet';
import { motion } from 'framer-motion';
export function ServicesGrid() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section id="services" className="py-2 md:py-10">
      <div className="container mx-auto px-4">
        {/* Section Header */}

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleSelectService}
              index={index}
            />
          ))}
        </div>

        {/* Check Form Sheet */}
        {selectedService && (
          <CheckFormSheet
            service={selectedService}
            isOpen={isSheetOpen}
            onClose={handleCloseSheet}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
