import React, { useState } from 'react'
import { FormProvider, useForm } from '@/contexts/FormContext'
import { ApplicationsProvider } from '@/contexts/ApplicationsContext'
import ServiceCardGrid from '@/components/Dashboard/ServiceCardGrid'
import ApplicationsList from '@/components/Dashboard/ApplicationsList'
import ServiceCheckSheet from '@/components/Dashboard/ServiceCheckSheet'
import { ServiceType } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const DashboardContent: React.FC = () => {
  const { user } = useAuth()
  const { selectService } = useForm()
  const [showCheckSheet, setShowCheckSheet] = useState(false)

  const handleSelectService = (serviceType: ServiceType) => {
    selectService(serviceType)
    setShowCheckSheet(true)
  }

  const handleCloseCheckSheet = () => {
    setShowCheckSheet(false)
  }

  const userFirstName = user?.name || 'Guest'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="w-full h-96 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          {/* Welcome Message */}
          <p className="text-blue-100 text-lg mb-2">Welcome back, {userFirstName}!</p>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight max-w-3xl">
            Check Your UAE Immigration & Labour Status in Minutes
          </h1>

          {/* Subheading with Stats */}
          <p className="text-blue-100 text-lg mb-8 max-w-2xl">
            2,847 checks processed · 99.2% accuracy · ICP-authorized
          </p>

          {/* CTA Button */}
          <button
            onClick={() => handleSelectService(ServiceType.OVERSTAY_FINE)}
            className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-bold text-lg rounded-lg hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Your First Check
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Trust Badges */}
          <div className="absolute top-8 right-8 flex flex-col gap-3 text-white text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 11-1.414 1.414l-4-4z" clipRule="evenodd" />
              </svg>
              Stripe Secure
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Encrypted
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Services</h2>
            <p className="text-gray-600 text-lg">
              Choose the service you need to check your status
            </p>
          </div>

          {/* Service Cards Grid */}
          <ServiceCardGrid onSelectService={handleSelectService} />
        </div>
      </section>

      {/* Applications List Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <ApplicationsList />
        </div>
      </section>

      {/* Service Check Sheet Modal */}
      {showCheckSheet && (
        <ServiceCheckSheet
          isOpen={showCheckSheet}
          onClose={handleCloseCheckSheet}
        />
      )}
    </div>
  )
}

const DashboardPage: React.FC = () => {
  return (
    <FormProvider>
      <ApplicationsProvider>
        <DashboardContent />
      </ApplicationsProvider>
    </FormProvider>
  )
}

export default DashboardPage
