import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 font-['Inter',sans-serif] antialiased">
      {/* Desktop Sidebar (w-[240px]) */}
      <Sidebar />

      {/* Main Container */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
