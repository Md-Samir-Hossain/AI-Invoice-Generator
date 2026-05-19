import { useAuth, useClerk } from '@clerk/react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import CreateInvoice from './pages/CreateInvoice'
import Invoices from './pages/Invoices'
import InvoicePreview from './components/InvoicePreview'

const ClerkProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()
  const clerk = useClerk()

  if (!isLoaded) {
    return null // Or a loading spinner
  }

  if (!isSignedIn) {
    // Open Clerk sign-in modal and redirect to home
    clerk.openSignIn()
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <div className='min-h-screen max-w-full overflow-x-hidden'>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route
        path='/app'
        element={<ClerkProtectedRoute>
          <AppShell />
        </ClerkProtectedRoute>}
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-invoice" element={<CreateInvoice />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoice/:id" element={<InvoicePreview />} />
        <Route path="invoice/:id/edit" element={<CreateInvoice />} />
      </Route>
    </Routes>
    </div>
  )
}

export default App