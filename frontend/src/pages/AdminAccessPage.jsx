import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminAccessPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    // Grant admin access immediately
    const adminUser = {
      ...currentUser,
      role: 'ADMIN',
      name: currentUser.name || (currentUser.email === 'it23220492@my.sliit.lk' ? 'IT Student' : 'Sashini')
    }
    
    // Update all storage
    localStorage.setItem('user', JSON.stringify(adminUser))
    localStorage.setItem('userRole', 'ADMIN')
    localStorage.setItem('userEmail', adminUser.email)
    localStorage.setItem('userName', adminUser.name)
    
    // Redirect to admin dashboard
    setTimeout(() => {
      navigate('/admin', { replace: true })
    }, 1000)
  }, [navigate])

  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      backgroundColor: '#f0fdf4', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#166534', fontSize: '32px', marginBottom: '20px' }}>
        Granting Admin Access...
      </h1>
      <p style={{ color: '#15803d', fontSize: '18px', marginBottom: '30px' }}>
        Setting up admin permissions for sashini.unilocatelk@gmail.com
      </p>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        border: '6px solid #050b07', 
        borderTop: '6px solid #16a34a', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <p style={{ color: '#166534', marginTop: '30px', fontSize: '14px' }}>
        Redirecting to admin dashboard...
      </p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
