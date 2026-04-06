import { getJson } from '../api/client'

// Fetch user details by email
export const fetchUserByEmail = async (email) => {
  try {
    const userData = await getJson(`/api/users/email/${email}`)
    return userData
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

// Fetch user's bookings
export const fetchUserBookings = async (email) => {
  try {
    const bookingsData = await getJson('/api/bookings')
    return Array.isArray(bookingsData) 
      ? bookingsData.filter(booking => booking.bookedEmail === email)
      : []
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    throw error
  }
}

// Fetch user's tickets
export const fetchUserTickets = async (email) => {
  try {
    const ticketsData = await getJson('/api/tickets')
    return Array.isArray(ticketsData)
      ? ticketsData.filter(ticket => ticket.createdBy === email)
      : []
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    throw error
  }
}

// Fetch all user data in one call
export const fetchUserData = async (email) => {
  try {
    const [userDetails, bookings, tickets] = await Promise.all([
      fetchUserByEmail(email),
      fetchUserBookings(email),
      fetchUserTickets(email)
    ])
    
    return {
      userDetails,
      bookings,
      tickets
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}
