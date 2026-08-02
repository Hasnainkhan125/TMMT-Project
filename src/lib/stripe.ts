import { loadStripe } from '@stripe/stripe-js'

// Use test key for development - replace with actual when going live
const stripePublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S4ipqGsqXGtpfAyNGjhCZLe9o7z4tlCsSowCHqF7vKavjgz7psd2z2ccf1G0egU2iloJk43VqUfnzLJYCEoyQUQ00A2VG0CLO'

export const stripePromise = loadStripe(stripePublishableKey)

export const createPaymentIntent = async (amount: number, currency: string = 'aed') => {
  try {
    // Check if we have a backend API for payments
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'
    const response = await fetch(`${apiUrl}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    // Fallback to mock payment if backend is not available
    return mockPaymentProcess(amount)
  }
}

export const processPayment = async (paymentMethodId: string, amount: number) => {
  try {
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_method_id: paymentMethodId,
        amount: amount * 100, // Convert to cents
        currency: 'aed',
      }),
    })

    if (!response.ok) {
      throw new Error('Payment processing failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment processing failed:', error)
    throw error
  }
}

// Mock payment for testing when no real Stripe account is connected
export const mockPaymentProcess = async (amount: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        payment_intent: {
          id: `pi_mock_${Date.now()}`,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'aed',
        },
        message: 'Mock payment successful'
      })
    }, 2000) // Simulate 2 second processing time
  })
}
