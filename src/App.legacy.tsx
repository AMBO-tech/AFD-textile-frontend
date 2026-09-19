import AppRoutes from '@/routes/appRoutes'
import { Toaster } from '@/components/ui/sonner'

export const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App