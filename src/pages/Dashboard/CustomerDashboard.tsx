import React, { useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { useAuth } from '@/contexts/AuthContext';
import ServiceCardGrid from '@/components/Dashboard/ServiceCardGrid';
import ApplicationsList from '@/components/Dashboard/ApplicationsList';
import ServiceCheckSheet from '@/components/Dashboard/ServiceCheckSheet';

export default function CustomerDashboard() {
  const { state, selectService } = useForm();
  const { user } = useAuth();
  const [showCheckSheet, setShowCheckSheet] = useState(false);
  const userName = user?.name || 'Guest';

  const handleSelectService = (service: ServiceType) => {
    selectService(service);
    setShowCheckSheet(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary to-primary-dark overflow-hidden">
        {/* Background image placeholder */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-primary-dark" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-3">
              Welcome, {userName}!
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Check Your UAE Immigration & Labour Status in Minutes
            </p>
            <p className="text-sm text-white/70 mb-8">
              2,847 checks processed · 99.2% accuracy · ICP-authorized
            </p>
            <button
              onClick={() => setShowCheckSheet(true)}
              className="bg-accent hover:bg-accent-dark text-primary font-bold py-3 px-8 rounded-lg transition inline-block"
            >
              Start Your First Check
            </button>
          </div>

          {/* Trust badges */}
          <div className="absolute top-6 right-6 space-y-2 text-xs text-white/70">
            <div>🔒 Stripe Secure</div>
            <div>🔐 Encrypted</div>
            <div>💬 24/7 Support</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Service Cards Section */}
        <div className="mb-24">
          <ServiceCardGrid onSelectService={handleSelectService} />
        </div>

        {/* Applications Section */}
        <div>
          <ApplicationsList />
        </div>
      </div>

      {/* Service Check Sheet Modal */}
      {showCheckSheet && state.selectedService && (
        <ServiceCheckSheet
          isOpen={showCheckSheet}
          onClose={() => setShowCheckSheet(false)}
        />
      )}
    </div>
  );
}
