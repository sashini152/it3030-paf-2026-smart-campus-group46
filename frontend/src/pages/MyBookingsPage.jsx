import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

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
    const token = localStorage.getItem('token');
    const userEmail = user?.email || localStorage.getItem('userEmail');
    
    try {
      const response = await fetch('http://localhost:8081/api/bookings/create', {
        method: 'POST',
        credentials: 'include', // ✅ IMPORTANT for OAuth2 session
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
        console.error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
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
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Create Booking
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
