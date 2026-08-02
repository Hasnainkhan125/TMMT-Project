

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()


export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
    