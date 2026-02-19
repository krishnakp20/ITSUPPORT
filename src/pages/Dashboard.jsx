import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  TicketIcon,
  UserIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalItems: 0,
    myItems: 0,
    overdueItems: 0,
    totalDone: 0,
    last3DaysItems: 0,
    doneLast3Days: 0
  })
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      let itemsResponse
      if (user?.role === 'pm') {
        itemsResponse = await api.get('/items?limit=10000')
      } else if (user?.role === 'dev') {
        itemsResponse = await api.get('/items?assignee_id=me&limit=10000')
      } else {
        itemsResponse = await api.get('/items?limit=10000')
      }
      
      const items = itemsResponse.data
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
      
      const myItems = user?.role === 'requester' 
        ? items.filter(item => item.status === 'in_progress' || item.status === 'review')
        : items.filter(item => item.assignee_id === user?.id)
      const overdueItems = items.filter(item => {
        const deadline = item.end_date || item.due_at
        return deadline && new Date(deadline) < now && item.status !== 'done'
      })
      const totalDone = items.filter(item => item.status === 'done')
      const last3DaysItems = items.filter(item => 
        new Date(item.created_at) >= threeDaysAgo
      )
      const doneLast3Days = items.filter(item => 
        item.status === 'done' && item.completed_at && new Date(item.completed_at) >= threeDaysAgo
      )

      setStats({
        totalItems: items.length,
        myItems: myItems.length,
        overdueItems: overdueItems.length,
        totalDone: totalDone.length,
        last3DaysItems: last3DaysItems.length,
        doneLast3Days: doneLast3Days.length
      })

      let displayItems
      if (user?.role === 'pm') {
        displayItems = items.slice(0, 5)
      } else if (user?.role === 'requester') {
        displayItems = items.slice(0, 5)
      } else {
        displayItems = myItems.slice(0, 5)
      }
      setRecentItems(displayItems)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      backlog: 'bg-slate-100 text-slate-700 border-slate-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      review: 'bg-amber-100 text-amber-700 border-amber-200',
      done: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
    return styles[status] || styles.backlog
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      normal: 'text-blue-600 bg-blue-50',
      low: 'text-slate-600 bg-slate-50'
    }
    return styles[priority] || styles.normal
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="spinner h-12 w-12"></div>
          <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const mainStats = [
    {
      label: user?.role === 'pm' ? 'All Tickets' : user?.role === 'requester' ? 'My Tickets' : 'Total Items',
      value: stats.totalItems,
      icon: TicketIcon,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25'
    },
    {
      label: user?.role === 'pm' ? 'Assigned to Me' : user?.role === 'requester' ? 'In Progress' : 'My Items',
      value: stats.myItems,
      icon: UserIcon,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/25'
    },
    {
      label: 'Overdue',
      value: stats.overdueItems,
      icon: ExclamationTriangleIcon,
      gradient: 'bg-gradient-to-br from-rose-500 to-red-600',
      shadow: 'shadow-rose-500/25'
    },
    {
      label: 'Completed',
      value: stats.totalDone,
      icon: CheckCircleIcon,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/25'
    }
  ]

  const secondaryStats = [
    {
      label: 'Last 3 Days',
      value: stats.last3DaysItems,
      icon: CalendarDaysIcon,
      description: 'New tickets',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      label: 'Done (3 Days)',
      value: stats.doneLast3Days,
      icon: ArrowTrendingUpIcon,
      description: 'Completed',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200'
    }
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome Header */}
      <div className="page-header">
        <div className="page-header-content flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 text-yellow-400" />
            <div>
              <h1 className="page-header-title">Welcome, {user?.name}!</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="page-header-subtitle">Workspace overview</span>
                {user?.role !== 'pm' && user?.branch && (
                  <span className="px-2 py-0.5 bg-white/10 text-white text-xs rounded">
                    {user.branch.name}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-indigo-500/30 text-white text-xs font-semibold rounded uppercase">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <Link to="/create" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {mainStats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.gradient} shadow-md ${stat.shadow}`}>
            <div className="stat-card-content flex items-center justify-between">
              <div>
                <p className="stat-card-label">{stat.label}</p>
                <p className="stat-card-value">{stat.value}</p>
              </div>
              <div className="stat-card-icon">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3">
        {secondaryStats.map((stat, index) => (
          <div key={index} className={`card-flat flex items-center gap-3 border ${stat.border} ${stat.bg}`}>
            <div className={`p-2 rounded-lg ${stat.bg} border ${stat.border}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <span className="text-xs text-slate-500">{stat.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Items */}
      <div className="card">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="section-title">
                {user?.role === 'pm' ? 'Recent Tickets' : user?.role === 'requester' ? 'My Recent Tickets' : 'Recent Items'}
              </h2>
            </div>
          </div>
          <Link to="/board" className="btn-ghost text-xs">
            View all <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
        
        {recentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <TicketIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="empty-state-title">No tickets yet</p>
            <p className="empty-state-description">Create your first ticket to get started</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="list-item-bordered group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                    #{item.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-400 capitalize">{item.type}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getPriorityStyle(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge border ${getStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {item.due_at ? new Date(item.due_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
