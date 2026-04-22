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
  LineElement
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

export default function ResourceCharts({ resources, bookings = [] }) {
  // Resource type distribution chart
  const resourceTypeData = useMemo(() => {
    const typeCounts = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1
      return acc
    }, {})

    const labels = Object.keys(typeCounts)
    const data = Object.values(typeCounts)

    return {
      labels: labels.map(label => label.replace('_', ' ')),
      datasets: [
        {
          label: 'Resources by Type',
          data,
          backgroundColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.accent,
            chartColors.success,
            chartColors.warning,
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }
  }, [resources])

  // Resource status distribution
  const resourceStatusData = useMemo(() => {
    const statusCounts = resources.reduce((acc, resource) => {
      acc[resource.status] = (acc[resource.status] || 0) + 1
      return acc
    }, {})

    const labels = Object.keys(statusCounts)
    const data = Object.values(statusCounts)

    return {
      labels: labels.map(label => label.replace('_', ' ')),
      datasets: [
        {
          label: 'Resources by Status',
          data,
          backgroundColor: [
            chartColors.success,
            chartColors.danger,
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }
  }, [resources])

  // Capacity distribution by type
  const capacityByTypeData = useMemo(() => {
    const capacityByType = resources.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = { total: 0, count: 0 }
      }
      acc[resource.type].total += resource.capacity || 0
      acc[resource.type].count += 1
      return acc
    }, {})

    const labels = Object.keys(capacityByType)
    const avgCapacity = labels.map(type => 
      capacityByType[type].count > 0 ? Math.round(capacityByType[type].total / capacityByType[type].count) : 0
    )

    return {
      labels: labels.map(label => label.replace('_', ' ')),
      datasets: [
        {
          label: 'Average Capacity',
          data: avgCapacity,
          backgroundColor: chartColors.info,
          borderColor: chartColors.info,
          borderWidth: 1,
        },
      ],
    }
  }, [resources])

  // Resource utilization (if bookings data is available)
  const utilizationData = useMemo(() => {
    if (!bookings.length) return null

    const utilization = resources.map(resource => {
      const resourceBookings = bookings.filter(booking => 
        booking.resourceId === resource.id || booking.resourceName === resource.name
      )
      const approvedBookings = resourceBookings.filter(booking => booking.status === 'APPROVED')
      
      return {
        name: resource.name,
        utilization: approvedBookings.length,
        totalBookings: resourceBookings.length,
      }
    }).sort((a, b) => b.utilization - a.utilization).slice(0, 10)

    return {
      labels: utilization.map(item => item.name),
      datasets: [
        {
          label: 'Approved Bookings',
          data: utilization.map(item => item.utilization),
          backgroundColor: chartColors.success,
          borderColor: chartColors.success,
          borderWidth: 1,
        },
        {
          label: 'Total Bookings',
          data: utilization.map(item => item.totalBookings),
          backgroundColor: chartColors.secondary,
          borderColor: chartColors.secondary,
          borderWidth: 1,
        },
      ],
    }
  }, [resources, bookings])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors.dark,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        color: chartColors.dark,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.dark,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: chartColors.dark,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartColors.dark,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        color: chartColors.dark,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Resource Type Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Resource Types</h3>
          <div className="h-64">
            <Pie 
              data={resourceTypeData} 
              options={pieChartOptions}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Resource Status</h3>
          <div className="h-64">
            <Doughnut 
              data={resourceStatusData} 
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Capacity Analysis */}
      <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
        <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Average Capacity by Type</h3>
        <div className="h-64">
          <Bar 
            data={capacityByTypeData} 
            options={chartOptions}
          />
        </div>
      </div>

      {/* Resource Utilization */}
      {utilizationData && (
        <div className="rounded-[24px] border border-[#37415C] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#181A2F] mb-4">Top Resource Utilization</h3>
          <div className="h-64">
            <Bar 
              data={utilizationData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Booking Count by Resource (Top 10)',
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Total Resources</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">{resources.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#FDA481]/20 flex items-center justify-center">
              <span className="text-xl">{'\ud83d\udce6'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Active Resources</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">
                {resources.filter(r => r.status === 'ACTIVE').length}
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
              <p className="text-sm font-medium text-[#37415C]">Total Capacity</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">
                {resources.reduce((sum, r) => sum + (r.capacity || 0), 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">{'\ud83d\udc65'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#37415C] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#37415C]">Avg Capacity</p>
              <p className="mt-1 text-2xl font-semibold text-[#181A2F]">
                {resources.length > 0 ? Math.round(resources.reduce((sum, r) => sum + (r.capacity || 0), 0) / resources.length) : 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xl">{'\ud83d\udcca'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
