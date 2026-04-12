import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, useLocation } from "react-router-dom";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = user?.email || localStorage.getItem('userEmail');
      
      const response = await fetch(`http://localhost:8081/api/bookings/user/${userEmail}`, {
        credentials: 'include', // ✅ IMPORTANT for OAuth2 session
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user?.email]);

  // Check if we have a selected resource from navigation
  if (location.state?.selectedResource) {
    setSelectedResource(location.state.selectedResource);
    setShowBookingForm(true);
  }

  const handleDeleteBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:8081/api/bookings/delete/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include', // ✅ IMPORTANT for OAuth2 session
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUserBookings(); // Refresh the bookings list
      } else {
        console.error('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    // Prevent duplicate submissions
    if (submitting) {
      return;
    }

    const token = localStorage.getItem('token');
    const userEmail = user?.email || localStorage.getItem('userEmail');
    
    // Validate booking data
    if (!bookingData.startDateTime || !bookingData.endDateTime || !bookingData.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate time logic
    const startTime = new Date(bookingData.startDateTime);
    const endTime = new Date(bookingData.endDateTime);
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    if (startTime <= new Date()) {
      setError('Start time must be in the future');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8081/api/bookings/create', {
        method: 'POST',
        credentials: 'include', // IMPORTANT for OAuth2 session
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setShowBookingForm(false);
        setSelectedResource(null);
        fetchUserBookings(); // Refresh the bookings list
      } else {
        const errorText = await response.text();
        if (response.status === 409) {
          setError('Booking conflict: This time slot is already booked or conflicts with an existing reservation. Please choose a different time.');
        } else {
          setError(errorText || 'Failed to create booking. Please try again.');
        }
      }
    } catch (error) {
      setError(error.message || 'Error creating booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600';
      case 'APPROVED': return 'text-green-600';
      case 'REJECTED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Resources
        </button>
      </div>

      {showBookingForm && selectedResource && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Book {selectedResource.name}</h2>
          <p className="text-gray-600 mb-4">
            {selectedResource.type} • {selectedResource.location} • Capacity: {selectedResource.capacity}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const bookingData = {
              resourceId: selectedResource.id,
              requestedByUserId: user?.email || localStorage.getItem('userEmail'),
              startDateTime: new Date(formData.get('startDateTime')).toISOString(),
              endDateTime: new Date(formData.get('endDateTime')).toISOString(),
              purpose: formData.get('purpose'),
              expectedAttendees: parseInt(formData.get('expectedAttendees'))
            };
            handleCreateBooking(bookingData);
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                <textarea
                  name="purpose"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Creating Booking...' : 'Create Booking'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedResource(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{booking.purpose}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(booking.startDateTime)} - {formatDate(booking.endDateTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expected Attendees: {booking.expectedAttendees}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Resource: {booking.resourceName || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {booking.resourceLocation || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => handleDeleteBooking(booking.id)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete Booking
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

