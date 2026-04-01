import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getJson } from '../api/client'
import { subscribeToBookingUpdates } from '../mock/mockData'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function UserProfilePage() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])

  const handleLogout = () => {
    logout()
    // Navigation will be handled by the auth context
  }

  // Fetch data from database using API client
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        console.log('⚠️ No user email available for data fetch')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Starting email-based data fetch for:', user?.email)
        
        // 1. Fetch user details from database using email
        try {
          console.log('📧 Fetching user details for email:', user?.email)
          console.log('🔗 API endpoint:', `/api/users/email/${user?.email}`)
          
          const userData = await getJson(`/api/users/email/${user?.email}`)
          console.log('📥 Raw user data received:', userData)
          
          if (userData && userData.email === user?.email) {
            setUserDetails(userData)
            console.log('✅ User details loaded from DB:', {
              name: userData.name,
              email: userData.email,
              role: userData.role,
              department: userData.department,
              phone: userData.phone,
              studentId: userData.studentId
            })
          } else {
            console.log('❌ User data mismatch or not found')
            console.log('Expected email:', user?.email)
            console.log('Received data:', userData)
            throw new Error('User data mismatch or not found')
          }
        } catch (userError) {
          console.log('❌ User details not found in DB:', userError.message)
          console.log('Error details:', userError)
          // Fallback to auth context data
          setUserDetails(user)
          console.log('🔄 Using auth context fallback for user details:', user)
        }
        
        // 2. Fetch bookings from database and filter by email
        try {
          console.log('📅 Fetching all bookings from database')
          console.log('🔗 API endpoint: /api/bookings')
          
          const bookingsData = await getJson('/api/bookings')
          console.log('📥 Raw bookings data received:', bookingsData)
          console.log('📊 Bookings data type:', typeof bookingsData)
          console.log('📊 Is array:', Array.isArray(bookingsData))
          
          if (Array.isArray(bookingsData)) {
            console.log('🔍 Filtering bookings for email:', user?.email)
            console.log('📋 Sample booking structure:', bookingsData[0])
            
            const userBookings = bookingsData.filter(booking => {
              // Match by bookedEmail field
              const emailMatch = booking.bookedEmail === user?.email
              // Also check createdBy field if available
              const creatorMatch = booking.createdBy === user?.email
              // Also check email field if available
              const directEmailMatch = booking.email === user?.email
              
              console.log(`🔍 Booking check - Email: ${emailMatch}, Creator: ${creatorMatch}, Direct: ${directEmailMatch}`)
              console.log(`📋 Booking details:`, {
                bookedEmail: booking.bookedEmail,
                createdBy: booking.createdBy,
                email: booking.email,
                userLookingFor: user?.email
              })
              
              return emailMatch || creatorMatch || directEmailMatch
            })
            
            setBookings(userBookings)
            console.log('✅ Bookings filtered by email:', {
              totalBookings: bookingsData.length,
              userBookings: userBookings.length,
              userEmail: user?.email,
              matchingBookings: userBookings.map(b => ({
                id: b.id,
                bookedEmail: b.bookedEmail,
                createdBy: b.createdBy,
                email: b.email
              }))
            })
          } else {
            console.log('⚠️ Bookings data is not an array')
            console.log('📊 Actual bookings data:', bookingsData)
            setBookings([])
          }
        } catch (bookingError) {
          console.log('❌ Bookings not available from DB:', bookingError.message)
          console.log('� Please check MongoDB connection and API endpoints')
          setBookings([])
        }
        
        // 3. Fetch tickets from database and filter by email
        try {
          console.log('🎫 Fetching all tickets from database')
          console.log('🔗 API endpoint: /api/tickets')
          
          const ticketsData = await getJson('/api/tickets')
          console.log('📥 Raw tickets data received:', ticketsData)
          console.log('📊 Tickets data type:', typeof ticketsData)
          console.log('📊 Is array:', Array.isArray(ticketsData))
          
          if (Array.isArray(ticketsData)) {
            console.log('🔍 Filtering tickets for email:', user?.email)
            console.log('📋 Sample ticket structure:', ticketsData[0])
            
            const userTickets = ticketsData.filter(ticket => {
              // Match by createdBy field (primary)
              const creatorMatch = ticket.createdBy === user?.email
              // Also check email field if available
              const emailMatch = ticket.email === user?.email
              // Also check submittedBy field if available
              const submitterMatch = ticket.submittedBy === user?.email
              
              console.log(`🔍 Ticket check - Creator: ${creatorMatch}, Email: ${emailMatch}, Submitter: ${submitterMatch}`)
              console.log(`📋 Ticket details:`, {
                createdBy: ticket.createdBy,
                email: ticket.email,
                submittedBy: ticket.submittedBy,
                userLookingFor: user?.email
              })
              
              return creatorMatch || emailMatch || submitterMatch
            })
            
            setTickets(userTickets)
            console.log('✅ Tickets filtered by email:', {
              totalTickets: ticketsData.length,
              userTickets: userTickets.length,
              userEmail: user?.email,
              matchingTickets: userTickets.map(t => ({
                id: t.id,
                createdBy: t.createdBy,
                email: t.email,
                submittedBy: t.submittedBy,
                title: t.title
              }))
            })
          } else {
            console.log('⚠️ Tickets data is not an array')
            console.log('📊 Actual tickets data:', ticketsData)
            setTickets([])
          }
        } catch (ticketError) {
          console.log('❌ Tickets not available from DB:', ticketError.message)
          console.log('Error details:', ticketError)
          setTickets([])
        }
        
      } catch (err) {
        setError(`Failed to load profile data: ${err.message}`)
        console.error('🚨 Profile loading error:', err)
      } finally {
        setLoading(false)
        console.log('📊 Email-based profile data fetch completed for:', user?.email)
      }
    }
    
    loadUserData()
  }, [user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get recent activities

  // Get recent activities
  const recentBookings = useMemo(() => 
    [...bookings]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5),
  [bookings])

  // Calculate statistics
  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter(t => t.status === 'RESOLVED').length,
    openTickets: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
  }), [bookings, tickets])

  // Subscribe to real-time booking updates
  useEffect(() => {
    if (!user?.email) return

    const handleBookingUpdate = (updatedBooking) => {
      console.log('🔄 Real-time booking update received:', updatedBooking)
      
      // Check if this booking belongs to the current user
      const isUserBooking = 
        updatedBooking.bookedEmail === user?.email ||
        updatedBooking.createdBy === user?.email ||
        updatedBooking.email === user?.email

      if (isUserBooking) {
        // Update the bookings state with the new data
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === updatedBooking.id ? updatedBooking : booking
          )
        )
        console.log('✅ User booking updated in real-time:', updatedBooking.id, updatedBooking.status)
      }
    }

    // Subscribe to booking updates
    const unsubscribe = subscribeToBookingUpdates(handleBookingUpdate)
    
    console.log('👂 Subscribed to real-time booking updates for user:', user?.email)
    
    return () => {
      console.log('🔌 Unsubscribed from booking updates')
      unsubscribe()
    }
  }, [user?.email])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner label="Loading your profile..." tone="ticket" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <EmptyState
          title="Profile unavailable"
          description={error}
          tone="ticket"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal delay={30}>
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {(userDetails?.name || user?.name)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {userDetails?.name || user?.name || 'User'}
                </h1>
                <p className="text-xl text-purple-200 mb-2">
                  {userDetails?.email || user?.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                    {userDetails?.role || user?.role || 'USER'}
                  </span>
                  {userDetails?.department && (
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-200 rounded-full text-sm">
                      {userDetails.department}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Edit Profile
                </button>
                <button className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Reveal delay={80}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.totalBookings}</div>
              <div className="text-sm text-purple-200">Total Bookings</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.approvedBookings}</div>
              <div className="text-sm text-green-200">Approved</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.pendingBookings}</div>
              <div className="text-sm text-yellow-200">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.totalTickets}</div>
              <div className="text-sm text-blue-200">Total Tickets</div>
            </div>
            <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.resolvedTickets}</div>
              <div className="text-sm text-pink-200">Resolved</div>
            </div>
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <div className="text-3xl font-bold text-white mb-1">{stats.openTickets}</div>
              <div className="text-sm text-orange-200">Open</div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Details */}
          <div className="lg:col-span-1 space-y-6">
            <Reveal delay={130}>
              <SurfaceCard className="!bg-slate-800/50 !border-slate-700 !text-white backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">Personal Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">Full Name</span>
                    <span className="text-white">{userDetails?.name || user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">Email</span>
                    <span className="text-white">{userDetails?.email || user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">Role</span>
                    <span className="text-white">{userDetails?.role || user?.role || 'USER'}</span>
                  </div>
                  {userDetails?.department && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Department</span>
                      <span className="text-white">{userDetails.department}</span>
                    </div>
                  )}
                  {userDetails?.phone && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Phone</span>
                      <span className="text-white">{userDetails.phone}</span>
                    </div>
                  )}
                  {userDetails?.studentId && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400">Student ID</span>
                      <span className="text-white">{userDetails.studentId}</span>
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </Reveal>

            <Reveal delay={160}>
              <SurfaceCard className="!bg-slate-800/50 !border-slate-700 !text-white backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/user-bookings" className="block p-3 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition border border-purple-500/30">
                    <div className="font-medium text-purple-200">My Bookings</div>
                    <div className="text-sm text-slate-400">Manage your resource bookings</div>
                  </a>
                  <a href="/resources" className="block p-3 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition border border-blue-500/30">
                    <div className="font-medium text-blue-200">Browse Resources</div>
                    <div className="text-sm text-slate-400">Explore available campus resources</div>
                  </a>
                  <a href="/tickets" className="block p-3 bg-pink-600/20 rounded-lg hover:bg-pink-600/30 transition border border-pink-500/30">
                    <div className="font-medium text-pink-200">Support Tickets</div>
                    <div className="text-sm text-slate-400">View and manage support requests</div>
                  </a>
                </div>
              </SurfaceCard>
            </Reveal>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Reveal delay={130}>
              <SurfaceCard className="!bg-slate-800/50 !border-slate-700 !text-white backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-6 text-purple-300">Recent Activity</h3>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-slate-700">
                  <button className="pb-2 px-1 text-purple-300 border-b-2 border-purple-500 font-medium">
                    Bookings
                  </button>
                  <button className="pb-2 px-1 text-slate-400 hover:text-white transition">
                    Tickets
                  </button>
                </div>

                {/* Bookings Timeline */}
                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-400">No bookings yet</p>
                      <a href="/user-bookings" className="inline-block mt-2 text-purple-400 hover:text-purple-300">
                        Create your first booking
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentBookings.map((booking, index) => (
                        <div key={booking.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            {index < recentBookings.length - 1 && (
                              <div className="w-0.5 h-16 bg-slate-600"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white">{booking.resourceName || 'Resource'}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  booking.status === 'APPROVED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400">
                                {formatDate(booking.startDateTime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}
