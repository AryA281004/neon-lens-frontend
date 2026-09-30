import React from 'react'
import NavbarInLandingPage from '../components/NavbarInLandingPage.jsx'

const LandingLayout = ({ children }) => {
  return (
    <div className='w-full min-h-screen text-white flex items-center justify-between gap-8'>
      {/* Navbar - renders ONCE for all pages */}
      <NavbarInLandingPage />
      
      {/* Main content area - pages render here */}
      <div className='flex-1 p-6 mt-10'>
        {children}
      </div>
    </div>
  )
}

export default LandingLayout