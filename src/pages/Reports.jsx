import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']

export default function Reports() {
  const { user } = useAuth()
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [allTimeStats, setAllTimeStats] = useState(null)
  const [slaAlerts, setSlaAlerts] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // For developers, fetch their personal stats
      if (user?.role === 'dev') {
        const [myItemsResponse, slaResponse] = await Promise.all([
          api.get('/items?assignee_id=me'),
          api.get('/reports/sla-alerts')
        ])
        
        const myItems = myItemsResponse.data
        
        // Calculate personal stats
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const myWeekItems = myItems.filter(item => new Date(item.created_at) >= weekAgo)
        const completedThisWeek = myItems.filter(item => 
          item.status === 'done' && new Date(item.updated_at) >= weekAgo
        )
        const inProgress = myItems.filter(item => item.status === 'in_progress').length
        const inReview = myItems.filter(item => item.status === 'review').length
        
        setMyStats({
          totalAssigned: myItems.length,
          completed: myItems.filter(item => item.status === 'done').length,
          inProgress: inProgress,
          inReview: inReview,
          completedThisWeek: completedThisWeek.length
        })
        
        // Filter SLA alerts to only show developer's own tickets
        setSlaAlerts(slaResponse.data.filter(alert => 
          myItems.some(item => item.id === alert.item_id)
        ))
      } else {
        // For PMs and requesters, show full reports
        const [weeklyResponse, slaResponse, allItemsResponse] = await Promise.all([
          api.get('/reports/weekly'),
          api.get('/reports/sla-alerts'),
          api.get('/items')
        ])
        
        setWeeklyReport(weeklyResponse.data)
        setSlaAlerts(slaResponse.data)
        
        // Calculate all-time stats from all items
        const allItems = allItemsResponse.data
        const supportTickets = allItems.filter(item => item.type === 'support')
        const features = allItems.filter(item => item.type === 'feature')
        const completedSupport = supportTickets.filter(item => item.status === 'done')
        const completedFeatures = features.filter(item => item.status === 'done')
        
        setAllTimeStats({
          totalTickets: allItems.length,
          supportTickets: supportTickets.length,
          features: features.length,
          completed: allItems.filter(item => item.status === 'done').length,
          inProgress: allItems.filter(item => item.status === 'in_progress').length,
          inReview: allItems.filter(item => item.status === 'review').length,
          backlog: allItems.filter(item => item.status === 'backlog').length
        })
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatHours = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    if (hours < 24) return `${hours.toFixed(1)}h`
    return `${Math.round(hours / 24)}d`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'normal': return 'text-blue-600 bg-blue-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.role === 'dev' ? '📈 My Performance' : '📊 Reports & Analytics'}
          </h1>
          <p className="text-sm text-gray-600">
            {user?.role === 'dev' ? 'Personal stats and metrics' : 'Team metrics and SLA monitoring'}
          </p>
        </div>
        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 capitalize">{user?.role} View</p>
        </div>
      </div>

      {/* Developer Stats */}
      {user?.role === 'dev' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{myStats?.totalAssigned || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-700">Total Assigned</p>
                <p className="text-2xl font-bold text-blue-900">{myStats?.totalAssigned || 0}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{myStats?.inProgress || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-orange-700">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{myStats?.inProgress || 0}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{myStats?.inReview || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-yellow-700">In Review</p>
                <p className="text-2xl font-bold text-yellow-900">{myStats?.inReview || 0}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{myStats?.completed || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">{myStats?.completed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PM/Requester All-Time Summary */}
      {user?.role !== 'dev' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{allTimeStats?.totalTickets || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-700">Total Tickets</p>
                <p className="text-2xl font-bold text-blue-900">{allTimeStats?.totalTickets || 0}</p>
                <p className="text-xs text-blue-600 mt-0.5">All time</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{allTimeStats?.inProgress || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-orange-700">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{allTimeStats?.inProgress || 0}</p>
                <p className="text-xs text-orange-600 mt-0.5">Active now</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{allTimeStats?.inReview || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-yellow-700">In Review</p>
                <p className="text-2xl font-bold text-yellow-900">{allTimeStats?.inReview || 0}</p>
                <p className="text-xs text-yellow-600 mt-0.5">Awaiting review</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">{allTimeStats?.completed || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">{allTimeStats?.completed || 0}</p>
                <p className="text-xs text-green-600 mt-0.5">All time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Stats Section - Only for PM */}
      {user?.role === 'pm' && weeklyReport && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h3 className="text-lg font-semibold text-gray-900">This Week's Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-600">Opened</p>
              <p className="text-2xl font-bold text-indigo-900">{weeklyReport.tickets_opened || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-green-900">{weeklyReport.tickets_closed || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-600">Features Done</p>
              <p className="text-2xl font-bold text-purple-900">{weeklyReport.features_completed || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-600">Avg MTTR</p>
              <p className="text-2xl font-bold text-yellow-900">{formatHours(weeklyReport.support_mttr_hours || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts - Only for PM */}
      {user?.role === 'pm' && allTimeStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ticket Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Backlog', value: allTimeStats.backlog || 0, fill: '#6B7280' },
                  { name: 'In Progress', value: allTimeStats.inProgress || 0, fill: '#F97316' },
                  { name: 'In Review', value: allTimeStats.inReview || 0, fill: '#EAB308' },
                  { name: 'Completed', value: allTimeStats.completed || 0, fill: '#10B981' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6">
                    {[
                      { name: 'Backlog', value: allTimeStats.backlog || 0, fill: '#6B7280' },
                      { name: 'In Progress', value: allTimeStats.inProgress || 0, fill: '#F97316' },
                      { name: 'In Review', value: allTimeStats.inReview || 0, fill: '#EAB308' },
                      { name: 'Completed', value: allTimeStats.completed || 0, fill: '#10B981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Support vs Features */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support vs Features</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Support Tickets', value: allTimeStats.supportTickets || 0 },
                      { name: 'Features', value: allTimeStats.features || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SLA Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.role === 'dev' ? 'My SLA Alerts' : 'SLA Alerts'}
          </h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
            {slaAlerts.length} {slaAlerts.length === 1 ? 'alert' : 'alerts'}
          </span>
        </div>
        
        {slaAlerts.length === 0 ? (
          <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-green-800 font-medium text-lg">All tickets are on track!</p>
            <p className="text-green-600 text-sm mt-1">No SLA alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slaAlerts.map((alert) => (
              <div key={alert.item_id} className={`border-2 rounded-lg p-4 ${
                alert.is_overdue 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-orange-50 border-orange-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{alert.is_overdue ? '🚨' : '⚠️'}</span>
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    </div>
                    {user?.role !== 'dev' && (
                      <p className="text-sm text-gray-600 ml-8">Assigned to: {alert.assignee}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                      alert.is_overdue 
                        ? 'bg-red-600 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {alert.is_overdue ? 'OVERDUE' : 'DUE SOON'}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {formatHours(alert.hours_remaining)} {alert.is_overdue ? 'overdue' : 'remaining'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
