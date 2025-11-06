import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ViewColumnsIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Board', href: '/board', icon: ViewColumnsIcon },
  { name: 'Create Ticket', href: '/create', icon: PlusIcon },
  { name: 'Activity Log', href: '/activity-log', icon: ClockIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Time Reports', href: '/time-reports', icon: ClockIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">IT Support Tool</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user?.name}</p>
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {user?.role}
                  {user?.branch && user?.role !== 'pm' && (
                    <span className="ml-1 text-xs text-blue-600">• {user.branch.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">IT Support Tool</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role}
                  {user?.branch && user?.role !== 'pm' && (
                    <span className="ml-1 text-blue-600">• {user.branch.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden -ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Logo/Title - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900">IT Support Tool</h2>
            </div>

            {/* Right side - User info and Notification Bell */}
            <div className="flex items-center gap-4 ml-auto">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    {user?.branch && user?.role !== 'pm' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {user.branch.name}
                      </span>
                    )}
                  </div>
                </div>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>

              {/* Notification Bell - Prominent */}
              <NotificationBell />

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-gray-50">
          <div className="py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
