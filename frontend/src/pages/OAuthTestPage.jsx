import { useEffect } from 'react'

export default function OAuthTestPage() {
  useEffect(() => {
    console.log("=== OAuth Test Page ===");
    console.log("Full URL:", window.location.href);
    console.log("Search string:", window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const role = urlParams.get('role')
    const name = urlParams.get('name')
    const email = urlParams.get('email')

    console.log("OAuth params:", { token, role, name, email });

    if (token && role && name) {
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, role, email }));
      
      alert(`Login successful! Welcome ${name} (${email})`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } else {
      alert('No OAuth parameters found');
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>OAuth Test Page</h1>
      <p>Processing OAuth callback...</p>
      <p>Check browser console for details.</p>
    </div>
  );
}
