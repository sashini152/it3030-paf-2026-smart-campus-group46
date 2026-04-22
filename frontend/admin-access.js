// Admin Access Script - Run this in browser console
(function() {
    // Get current user from localStorage or use default
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = existingUser.email || 'sashini.unilocatelk@gmail.com';
    
    // Set admin role directly
    const currentUser = {
        ...existingUser,
        email: userEmail,
        role: 'ADMIN',
        name: existingUser.name || (userEmail === 'it23220492@my.sliit.lk' ? 'IT Student' : 'Sashini')
    };
    
    // Update all storage locations
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('userRole', 'ADMIN');
    localStorage.setItem('userEmail', currentUser.email);
    localStorage.setItem('userName', currentUser.name);
    
    // Update any existing user context
    if (window.user) {
        window.user.role = 'ADMIN';
        window.user.email = currentUser.email;
        window.user.name = currentUser.name;
    }
    
    console.log('Admin access granted for', currentUser.email, '! Redirecting to admin dashboard...');
    
    // Redirect to admin dashboard
    window.location.href = '/admin';
})();
