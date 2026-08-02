import React from 'react'
import type { ServiceType } from '@/types'
import { SERVICE_METADATA, SERVICE_DISPLAY_ORDER } from '@/config/services'

interface ServiceCardGridProps {
  onSelectService: (serviceType: ServiceType) => void
}

/**
 * ServiceCardGrid Component
 *
 * Displays 8 service cards in a responsive grid layout
 * - 4 columns on desktop (1200px+)
 * - 2 columns on tablet (640-1024px)
 * - 1 column on mobile (<640px)
 *
 * Each card shows:
 * - Service icon (emoji from SERVICE_METADATA)
 * - Service title
 * - 1-line description (truncated)
 * - Price tag: "from AED 20"
 * - Turnaround time: "24-48h"
 * - "Popular" badge (red) for popular services
 *
 * Interactions:
 * - Hover: Lift effect (translateY -4px), gold border, brightness +10%
 * - Click: Calls onSelectService(service) callback
 */
const ServiceCardGrid: React.FC<ServiceCardGridProps> = ({ onSelectService }) => {
  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="grid gap-4 sm:gap-6 md:gap-6 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICE_DISPLAY_ORDER.map((serviceType) => {
          const service = SERVICE_METADATA[serviceType]

          if (!service) return null

          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              className="group relative h-full text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={`Select ${service.title}`}
            >
              {/* Card Container with Rounded Corners and Shadow */}
              <div className="relative h-full rounded-[12px] border-2 border-gray-200 bg-white p-5 shadow-md transition-all duration-300 group-hover:border-yellow-400 group-hover:shadow-lg">
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                      Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4 text-4xl transition-all duration-300 group-hover:brightness-110">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-semibold text-gray-900 leading-tight">
                  {service.title}
                </h3>

                {/* Description - Truncated to 1 line */}
                <p className="mb-4 text-sm text-gray-600 truncate">
                  {service.description}
                </p>

                {/* Price and Turnaround */}
                <div className="mb-4 space-y-2">
                  {/* Price Tag */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">from</span>
                    <span className="text-lg font-bold text-blue-600">
                      AED {service.priceRange.standard}
                    </span>
                  </div>

                  {/* Turnaround Time */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">⏱</span> {service.turnaround.standard}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-center text-sm font-medium text-blue-600 transition-all duration-300 group-hover:text-blue-700">
                    Get Started →
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceCardGrid
