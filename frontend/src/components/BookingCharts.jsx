import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
} from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
)

const chartColors = {
  primary: '#B4182D',
  secondary: '#FDA481',
  accent: '#37415C',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#181A2F',
  light: '#f8fafc',
}

export default function BookingCharts({ bookings, resources }) {
  
  // Process data for charts
  const chartData = useMemo(() => {
    // Status distribution data
    const statusCounts = bookings.reduce((acc, booking) => {
      const status = booking.status || 'UNKNOWN'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Resource utilization data with detailed breakdown
    const resourceUtilization = bookings.reduce((acc, booking) => {
      const resourceName = resources.find(r => r.id === booking.resourceId)?.name || booking.resourceName || 'Unknown Resource'
      if (!acc[resourceName]) {
        acc[resourceName] = { total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 }
      }
      acc[resourceName].total += 1
      acc[resourceName][booking.status?.toLowerCase()] = (acc[resourceName][booking.status?.toLowerCase()] || 0) + 1
      return acc
    }, {})

    // Time-based data (bookings by date) - last 30 days
    const last30Days = bookings.reduce((acc, booking) => {
      if (booking.startDateTime) {
        const date = new Date(booking.startDateTime).toLocaleDateString()
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {})

    // Hourly distribution data with peak hours identification
    const hourlyDistribution = bookings.reduce((acc, booking) => {
      if (booking.startDateTime) {
        const hour = new Date(booking.startDateTime).getHours()
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`
        acc[timeSlot] = (acc[timeSlot] || 0) + 1
      }
      return acc
    }, {})

    // User activity data with booking patterns
    const userActivity = bookings.reduce((acc, booking) => {
      const user = booking.bookedBy || booking.requestedByUserId || 'Unknown User'
      if (!acc[user]) {
        acc[user] = { total: 0, approved: 0, pending: 0 }
      }
      acc[user].total += 1
      acc[user][booking.status?.toLowerCase()] = (acc[user][booking.status?.toLowerCase()] || 0) + 1
      return acc
    }, {})

    // Resource type utilization
    const resourceTypeUtilization = bookings.reduce((acc, booking) => {
      const resource = resources.find(r => r.id === booking.resourceId)
      const resourceType = resource?.type || 'Unknown'
      acc[resourceType] = (acc[resourceType] || 0) + 1
      return acc
    }, {})

    // Weekly pattern analysis
    const weeklyPattern = bookings.reduce((acc, booking) => {
      if (booking.startDateTime) {
        const dayOfWeek = new Date(booking.startDateTime).toLocaleDateString('en-US', { weekday: 'short' })
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1
      }
      return acc
    }, {})

    return {
      statusCounts,
      resourceUtilization,
      bookingsByDate: last30Days,
      hourlyDistribution,
      userActivity,
      resourceTypeUtilization,
      weeklyPattern
    }
  }, [bookings, resources])

  // Enhanced Chart configurations
  const statusPieData = {
    labels: Object.keys(chartData.statusCounts).map(status => status.replace('_', ' ')),
    datasets: [
      {
        label: 'Booking Status',
        data: Object.values(chartData.statusCounts),
        backgroundColor: [
          chartColors.warning,  // PENDING
          chartColors.success,  // APPROVED  
          chartColors.danger,  // REJECTED
          chartColors.accent,  // CANCELLED
          chartColors.info     // UNKNOWN
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }

  const resourceBarData = {
    labels: Object.entries(chartData.resourceUtilization)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 10)
      .map(([name]) => name),
    datasets: [
      {
        label: 'Total Bookings',
        data: Object.entries(chartData.resourceUtilization)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 10)
          .map(([,data]) => data.total),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.primary,
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Approved Bookings',
        data: Object.entries(chartData.resourceUtilization)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 10)
          .map(([,data]) => data.approved),
        backgroundColor: chartColors.success,
        borderColor: chartColors.success,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const timelineData = {
    labels: Object.keys(chartData.bookingsByDate).sort().slice(-14), // Last 14 days
    datasets: [
      {
        label: 'Daily Bookings',
        data: Object.keys(chartData.bookingsByDate).sort().slice(-14).map(date => chartData.bookingsByDate[date]),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const hourlyBarData = {
    labels: Object.keys(chartData.hourlyDistribution)
      .sort()
      .filter((_, index) => index % 2 === 0) // Show every other hour for clarity
      .slice(0, 12), // Show 6am-6pm
    datasets: [
      {
        label: 'Peak Hour Bookings',
        data: Object.keys(chartData.hourlyDistribution)
          .sort()
          .filter((_, index) => index % 2 === 0)
          .slice(0, 12)
          .map(hour => chartData.hourlyDistribution[hour] || 0),
        backgroundColor: chartColors.info,
        borderColor: chartColors.info,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const userActivityData = {
    labels: Object.entries(chartData.userActivity)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 8)
      .map(([name]) => name),
    datasets: [
      {
        label: 'User Bookings',
        data: Object.entries(chartData.userActivity)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 8)
          .map(([,data]) => data.total),
        backgroundColor: [
          chartColors.primary, chartColors.secondary, chartColors.success, chartColors.danger,
          chartColors.warning, chartColors.info, chartColors.accent, chartColors.dark
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }
    ]
  }

  const resourceTypeData = {
    labels: Object.keys(chartData.resourceTypeUtilization).map(type => type.replace('_', ' ')),
    datasets: [
      {
        label: 'Bookings by Resource Type',
        data: Object.values(chartData.resourceTypeUtilization),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.primary,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const weeklyPatternData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Pattern',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => chartData.weeklyPattern[day] || 0),
        backgroundColor: chartColors.info,
        borderColor: chartColors.info,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors.dark,
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: chartColors.dark,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: chartColors.primary,
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' bookings'
            } else if (context.parsed !== null) {
              label += context.parsed + ' bookings'
            }
            return label
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: chartColors.dark,
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: chartColors.dark,
          font: {
            size: 11
          },
          beginAtZero: true
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartColors.dark,
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: chartColors.dark,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: chartColors.primary,
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Total Bookings</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">{bookings.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#FDA481]/20 flex items-center justify-center">
              <span className="text-xl">{'\ud83d\udcc5'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Pending Requests</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">{chartData.statusCounts.PENDING || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-xl">{'\u23f3'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Approval Rate</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">
                {bookings.length > 0 
                  ? Math.round((chartData.statusCounts.APPROVED || 0) / bookings.length * 100) 
                  : 0}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl">{'\u2705'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Active Resources</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">{resources.filter(r => r.status === 'ACTIVE').length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">{'\ud83d\udce6'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Booking Status Distribution</h3>
          <div className="h-64">
            <Pie data={statusPieData} options={pieOptions} />
          </div>
        </div>

        {/* Resource Utilization Bar Chart */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Top Resources by Usage</h3>
          <div className="h-64">
            <Bar data={resourceBarData} options={chartOptions} />
          </div>
        </div>

        {/* Timeline Line Chart */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Booking Timeline (Last 14 Days)</h3>
          <div className="h-64">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Pattern Analysis */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Weekly Booking Pattern</h3>
          <div className="h-64">
            <Bar data={weeklyPatternData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peak Hours Analysis */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Peak Hours Analysis</h3>
          <div className="h-64">
            <Bar data={hourlyBarData} options={chartOptions} />
          </div>
        </div>

        {/* Resource Type Utilization */}
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Bookings by Resource Type</h3>
          <div className="h-64">
            <Bar data={resourceTypeData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* User Activity Chart - Full Width */}
      <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
        <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Top Users by Activity</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64">
            <Doughnut data={userActivityData} options={pieOptions} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[#181A2F] text-lg font-semibold">Activity Details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(chartData.userActivity)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 8)
                .map(([user, data]) => (
                  <div key={user} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-[#181A2F] font-medium">{user}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-green-600">{data.approved} approved</span>
                        <span className="text-xs text-yellow-600">{data.pending} pending</span>
                      </div>
                    </div>
                    <span className="text-[#B4182D] font-bold text-lg">{data.total}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}