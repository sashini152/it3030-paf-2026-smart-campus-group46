import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import TicketsPage from './pages/TicketsPage'
import TicketList from './pages/TicketList'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="ticket-list" element={<TicketList />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
