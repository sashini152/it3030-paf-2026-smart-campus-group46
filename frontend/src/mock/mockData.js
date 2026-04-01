// Shared mock data for testing
let mockBookings = [
  {
    id: 1,
    purpose: 'Study Session',
    notes: 'Group study for final exam preparation',
    resourceName: 'Computer Lab A',
    resourceType: 'LAB',
    bookedBy: 'John Doe',
    bookedEmail: 'john.doe@example.com',
    startDateTime: '2026-04-02T10:00:00',
    endDateTime: '2026-04-02T12:00:00',
    status: 'PENDING',
    createdAt: '2026-04-01T09:00:00'
  },
  {
    id: 2,
    purpose: 'Project Meeting',
    notes: 'Team project discussion',
    resourceName: 'Meeting Room 101',
    resourceType: 'MEETING_ROOM',
    bookedBy: 'Jane Smith',
    bookedEmail: 'jane.smith@example.com',
    startDateTime: '2026-04-02T14:00:00',
    endDateTime: '2026-04-02T16:00:00',
    status: 'APPROVED',
    createdAt: '2026-04-01T10:00:00'
  },
  {
    id: 3,
    purpose: 'Workshop',
    notes: 'Technical workshop for students',
    resourceName: 'Lecture Hall B',
    resourceType: 'LECTURE_HALL',
    bookedBy: 'Mike Johnson',
    bookedEmail: 'mike.johnson@example.com',
    startDateTime: '2026-04-03T09:00:00',
    endDateTime: '2026-04-03T11:00:00',
    status: 'PENDING',
    createdAt: '2026-04-01T11:00:00'
  },
  {
    id: 4,
    purpose: 'Presentation Practice',
    notes: 'Practice for upcoming presentation',
    resourceName: 'Conference Room C',
    resourceType: 'MEETING_ROOM',
    bookedBy: 'Sarah Wilson',
    bookedEmail: 'sarah.wilson@example.com',
    startDateTime: '2026-04-02T16:00:00',
    endDateTime: '2026-04-02T18:00:00',
    status: 'REJECTED',
    createdAt: '2026-04-01T12:00:00'
  },
  {
    id: '69cca8e443f5a60b62ad7106',
    purpose: 'Resource Booking Request',
    notes: 'Booking request from user',
    resourceName: 'Study Room',
    resourceType: 'ROOM',
    bookedBy: 'Test User',
    bookedEmail: 'sashini.unilocatelk@gmail.com',
    startDateTime: '2026-04-02T15:00:00',
    endDateTime: '2026-04-02T17:00:00',
    status: 'REJECTED',
    createdAt: '2026-04-01T13:00:00'
  },
  {
    id: '69cc7e83df5f7205c3eabcd8',
    purpose: 'Meeting Room Booking',
    notes: 'Team meeting for project discussion',
    resourceName: 'Meeting Room 202',
    resourceType: 'MEETING_ROOM',
    bookedBy: 'Another User',
    bookedEmail: 'another.user@example.com',
    startDateTime: '2026-04-02T16:00:00',
    endDateTime: '2026-04-02T18:00:00',
    status: 'PENDING',
    createdAt: '2026-04-01T14:00:00'
  },
  {
    id: '69cca79b43f5a60b62ad7105',
    purpose: 'Conference Hall Booking',
    notes: 'Large conference for presentation',
    resourceName: 'Main Conference Hall',
    resourceType: 'CONFERENCE_HALL',
    bookedBy: 'Conference User',
    bookedEmail: 'conference.user@example.com',
    startDateTime: '2026-04-03T10:00:00',
    endDateTime: '2026-04-03T14:00:00',
    status: 'PENDING',
    createdAt: '2026-04-01T15:00:00'
  }
]

// Shared functions to manage mock data
export const getMockBookings = () => {
  return [...mockBookings]
}

export const updateMockBookingStatus = (bookingId, newStatus, reason = null) => {
  console.log('🔍 Looking for booking ID:', bookingId, 'to update to:', newStatus)
  console.log('📋 Available booking IDs:', mockBookings.map(b => b.id))
  
  const bookingIndex = mockBookings.findIndex(b => b.id === bookingId)
  if (bookingIndex !== -1) {
    const oldStatus = mockBookings[bookingIndex].status
    mockBookings[bookingIndex] = {
      ...mockBookings[bookingIndex],
      status: newStatus,
      ...(reason && { rejectionReason: reason })
    }
    console.log(`✅ Mock booking ${bookingId} updated from ${oldStatus} to ${newStatus}:`, mockBookings[bookingIndex])
    
    // Notify all subscribers about the update
    notifyBookingUpdate(mockBookings[bookingIndex])
    
    return mockBookings[bookingIndex]
  } else {
    console.error(`❌ Booking with ID ${bookingId} not found in mock data`)
    console.error('Available IDs:', mockBookings.map(b => b.id))
    return null
  }
}

export const addMockBooking = (booking) => {
  const newBooking = {
    ...booking,
    id: Math.max(...mockBookings.map(b => b.id)) + 1,
    createdAt: new Date().toISOString()
  }
  mockBookings.push(newBooking)
  console.log('✅ New mock booking added:', newBooking)
  return newBooking
}

// Event system for real-time updates
const subscribers = new Set()

export const subscribeToBookingUpdates = (callback) => {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

export const notifyBookingUpdate = (booking) => {
  subscribers.forEach(callback => {
    try {
      callback(booking)
    } catch (error) {
      console.error('Error notifying subscriber:', error)
    }
  })
}
