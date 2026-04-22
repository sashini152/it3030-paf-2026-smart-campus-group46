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

export default function BookingCharts({ bookings, resources }) {
  
  // Process data for charts
  const chartData = useMemo(() => {
    // Status distribution data
    const statusCounts = bookings.reduce((acc, booking) => {
      const status = booking.status || 'UNKNOWN'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Resource utilization data
    const resourceCounts = bookings.reduce((acc, booking) => {
      const resourceName = resources.find(r => r.id === booking.resourceId)?.name || booking.resourceId
      acc[resourceName] = (acc[resourceName] || 0) + 1
      return acc
    }, {})

    // Time-based data (bookings by date)
    const bookingsByDate = bookings.reduce((acc, booking) => {
      if (booking.startDateTime) {
        const date = new Date(booking.startDateTime).toLocaleDateString()
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {})

    // Hourly distribution data
    const hourlyData = bookings.reduce((acc, booking) => {
      if (booking.startDateTime) {
        const hour = new Date(booking.startDateTime).getHours()
        const timeSlot = `${hour}:00-${hour + 1}:00`
        acc[timeSlot] = (acc[timeSlot] || 0) + 1
      }
      return acc
    }, {})

    // User activity data
    const userActivity = bookings.reduce((acc, booking) => {
      const user = booking.requestedByUserId || 'Unknown'
      acc[user] = (acc[user] || 0) + 1
      return acc
    }, {})

    return {
      statusCounts,
      resourceCounts,
      bookingsByDate,
      hourlyData,
      userActivity
    }
  }, [bookings, resources])

  // Chart configurations
  const statusPieData = {
    labels: Object.keys(chartData.statusCounts),
    datasets: [
      {
        data: Object.values(chartData.statusCounts),
        backgroundColor: [
          '#FDA481', // PENDING - peach
          '#16a34a', // APPROVED - green  
          '#dc2626', // REJECTED - red
          '#6b7280', // CANCELLED - gray
          '#37415c'  // UNKNOWN - navy
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const resourceBarData = {
    labels: Object.keys(chartData.resourceCounts).slice(0, 10), // Top 10 resources
    datasets: [
      {
        label: 'Number of Bookings',
        data: Object.values(chartData.resourceCounts).slice(0, 10),
        backgroundColor: '#FDA481',
        borderColor: '#f97316',
        borderWidth: 1
      }
    ]
  }

  const timelineData = {
    labels: Object.keys(chartData.bookingsByDate).sort(),
    datasets: [
      {
        label: 'Bookings per Day',
        data: Object.keys(chartData.bookingsByDate).sort().map(date => chartData.bookingsByDate[date]),
        borderColor: '#FDA481',
        backgroundColor: 'rgba(253, 164, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const hourlyBarData = {
    labels: Object.keys(chartData.hourlyData).sort(),
    datasets: [
      {
        label: 'Bookings by Hour',
        data: Object.keys(chartData.hourlyData).sort().map(hour => chartData.hourlyData[hour]),
        backgroundColor: '#37415c',
        borderColor: '#242e49',
        borderWidth: 1
      }
    ]
  }

  const userActivityData = {
    labels: Object.keys(chartData.userActivity).slice(0, 8), // Top 8 users
    datasets: [
      {
        data: Object.values(chartData.userActivity).slice(0, 8),
        backgroundColor: [
          '#FDA481', '#37415c', '#16a34a', '#dc2626',
          '#6b7280', '#f97316', '#242e49', '#54162b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#181a2f',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#FDA481',
        borderWidth: 1
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
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
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
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          },
          padding: 15,
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        backgroundColor: '#181a2f',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#FDA481',
        borderWidth: 1
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
    <div className="w-full space-y-8">
      {/* Chart Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Total Bookings</h3>
          <p className="text-4xl font-bold text-[#FDA481]">{bookings.length}</p>
        </div>
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Active Resources</h3>
          <p className="text-4xl font-bold text-[#16a34a]">{resources.filter(r => r.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Pending Requests</h3>
          <p className="text-4xl font-bold text-[#FDA481]">{chartData.statusCounts.PENDING || 0}</p>
        </div>
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Approval Rate</h3>
          <p className="text-4xl font-bold text-[#16a34a]">
            {bookings.length > 0 
              ? Math.round((chartData.statusCounts.APPROVED || 0) / bookings.length * 100) 
              : 0}%
          </p>
        </div>
      </div>

      {/* Main Charts Grid - Larger */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-8 overflow-hidden">
          <h3 className="text-xl font-semibold text-white mb-6">Booking Status Distribution</h3>
          <div className="w-full" style={{ height: '400px', position: 'relative' }}>
            <Pie data={statusPieData} options={pieOptions} />
          </div>
        </div>

        {/* Resource Utilization Bar Chart */}
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-8 overflow-hidden">
          <h3 className="text-xl font-semibold text-white mb-6">Top Resources by Usage</h3>
          <div className="w-full" style={{ height: '400px', position: 'relative' }}>
            <Bar data={resourceBarData} options={chartOptions} />
          </div>
        </div>

        {/* Timeline Line Chart */}
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-8 overflow-hidden">
          <h3 className="text-xl font-semibold text-white mb-6">Booking Timeline</h3>
          <div className="w-full" style={{ height: '400px', position: 'relative' }}>
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        {/* Hourly Distribution Bar Chart */}
        <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-8 overflow-hidden">
          <h3 className="text-xl font-semibold text-white mb-6">Peak Hours Analysis</h3>
          <div className="w-full" style={{ height: '400px', position: 'relative' }}>
            <Bar data={hourlyBarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* User Activity Chart - Full Width */}
      <div className="bg-[#242E49] border border-[#37415C] rounded-xl p-8 overflow-hidden">
        <h3 className="text-xl font-semibold text-white mb-6">Top Users by Activity</h3>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 overflow-hidden" style={{ height: '400px', position: 'relative' }}>
            <Doughnut data={userActivityData} options={pieOptions} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-white text-lg font-semibold">Activity Details</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(chartData.userActivity)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([user, count]) => (
                  <div key={user} className="flex justify-between items-center p-4 bg-[#242e49] rounded-lg">
                    <span className="text-white font-medium">{user}</span>
                    <span className="text-[#FDA481] font-bold text-lg">{count} bookings</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
