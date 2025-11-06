import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalItems: 0,
    myItems: 0,
    overdueItems: 0,
    completedToday: 0
  })
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch items based on role
      let itemsResponse
      if (user?.role === 'pm') {
        // PMs see ALL tickets
        itemsResponse = await api.get('/items')
      } else if (user?.role === 'dev') {
        // Developers see only their assigned tickets
        itemsResponse = await api.get('/items?assignee_id=me')
      } else {
        // Requesters see items from their branch
        itemsResponse = await api.get('/items')
      }
      
      const items = itemsResponse.data

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const myItems = items.filter(item => item.assignee_id === user?.id)
      const overdueItems = items.filter(item => 
        item.due_at && new Date(item.due_at) < now && item.status !== 'done'
      )
      const completedToday = items.filter(item => 
        item.status === 'done' && new Date(item.updated_at) >= today
      )

      setStats({
        totalItems: items.length,
        myItems: myItems.length,
        overdueItems: overdueItems.length,
        completedToday: completedToday.length
      })

      // Get recent items (last 5)
      // For PM: show all recent items, For others: show their items
      const recentItems = user?.role === 'pm' ? items.slice(0, 5) : myItems.slice(0, 5)
      setRecentItems(recentItems)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'normal': return 'text-blue-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📊 Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">Work items overview</p>
            {user?.role !== 'pm' && user?.branch && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                📍 {user.branch.name} Branch
              </span>
            )}
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-900 text-xs font-medium rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
        <Link
          to="/create"
          className="btn btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <PlusIcon className="h-5 w-5" />
          Create Ticket
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">{stats.totalItems}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700">
                {user?.role === 'pm' ? 'All Tickets' : 'Total Items'}
              </p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">{stats.myItems}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-indigo-700">
                {user?.role === 'pm' ? 'Assigned to Me' : 'My Items'}
              </p>
              <p className="text-2xl font-bold text-indigo-900">{stats.myItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-700">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{stats.overdueItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-700">Done Today</p>
              <p className="text-2xl font-bold text-green-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'pm' ? 'Recent Tickets' : 'Recent Items'}
          </h2>
          <Link to="/board" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        
        {recentItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {user?.role === 'pm' ? 'No tickets in the system yet' : 'No items assigned to you'}
          </p>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {item.due_at ? new Date(item.due_at).toLocaleDateString() : 'No due date'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
