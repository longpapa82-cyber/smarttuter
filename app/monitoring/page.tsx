'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Zap, Database, Users } from 'lucide-react'

interface DashboardData {
  timeRange: string
  metrics: {
    api: {
      totalRequests: number
      averageLatency: number
      p95Latency: number
      p99Latency: number
      errorRate: number
    }
    cache: {
      totalOperations: number
      hitRate: number
      missRate: number
    }
    learning: {
      totalEvents: number
      mathEvents: number
      englishEvents: number
      uniqueUsers: number
    }
    errors: {
      totalErrors: number
      criticalErrors: number
      highErrors: number
      errorsByType: Record<string, number>
    }
  }
  health: {
    status: 'healthy' | 'degraded' | 'down'
    lastChecked: number
  }
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [timeRange, setTimeRange] = useState('1h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/monitoring/dashboard?range=${timeRange}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'down':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5" />
      case 'down':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600">Real-time performance and health metrics</p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getHealthColor(data.health.status)}`}>
                {getHealthIcon(data.health.status)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {data.health.status}
                </h2>
                <p className="text-sm text-gray-600">
                  Last checked: {new Date(data.health.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* API Metrics */}
          <MetricCard
            title="API Requests"
            value={data.metrics.api.totalRequests.toLocaleString()}
            subtitle={`${data.metrics.api.errorRate.toFixed(2)}% error rate`}
            icon={<Zap className="w-5 h-5" />}
            trend={data.metrics.api.errorRate < 5 ? 'up' : 'down'}
            color="purple"
          />

          {/* Cache Hit Rate */}
          <MetricCard
            title="Cache Hit Rate"
            value={`${data.metrics.cache.hitRate.toFixed(1)}%`}
            subtitle={`${data.metrics.cache.totalOperations} operations`}
            icon={<Database className="w-5 h-5" />}
            trend={data.metrics.cache.hitRate > 80 ? 'up' : 'down'}
            color="blue"
          />

          {/* Learning Events */}
          <MetricCard
            title="Learning Events"
            value={data.metrics.learning.totalEvents.toLocaleString()}
            subtitle={`${data.metrics.learning.uniqueUsers} unique users`}
            icon={<Users className="w-5 h-5" />}
            trend="up"
            color="green"
          />

          {/* Errors */}
          <MetricCard
            title="Total Errors"
            value={data.metrics.errors.totalErrors.toLocaleString()}
            subtitle={`${data.metrics.errors.criticalErrors} critical`}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={data.metrics.errors.criticalErrors === 0 ? 'up' : 'down'}
            color="red"
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">API Performance</h3>
            <div className="space-y-3">
              <MetricRow
                label="Average Latency"
                value={`${data.metrics.api.averageLatency.toFixed(0)}ms`}
              />
              <MetricRow
                label="P95 Latency"
                value={`${data.metrics.api.p95Latency.toFixed(0)}ms`}
              />
              <MetricRow
                label="P99 Latency"
                value={`${data.metrics.api.p99Latency.toFixed(0)}ms`}
              />
            </div>
          </div>

          {/* Learning Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Events</h3>
            <div className="space-y-3">
              <MetricRow
                label="Math Events"
                value={data.metrics.learning.mathEvents.toLocaleString()}
              />
              <MetricRow
                label="English Events"
                value={data.metrics.learning.englishEvents.toLocaleString()}
              />
              <MetricRow
                label="Unique Users"
                value={data.metrics.learning.uniqueUsers.toLocaleString()}
              />
            </div>
          </div>

          {/* Error Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Errors by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.metrics.errors.errorsByType).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">{type}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: 'up' | 'down'
  color: 'purple' | 'blue' | 'green' | 'red'
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {trend === 'up' ? (
          <TrendingUp className="w-5 h-5 text-green-600" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-600" />
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}
