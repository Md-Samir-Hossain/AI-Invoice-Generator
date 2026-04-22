import { useAuth, useClerk } from '@clerk/react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'

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
      </Route>
    </Routes>
    </div>
  )
}

export default App