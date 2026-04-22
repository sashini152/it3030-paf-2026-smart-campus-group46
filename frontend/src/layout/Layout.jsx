import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import sliitLogo from "../assets/sliit-logo.png";
import { useAuth } from "../hooks/useAuth";
import { isAdminRole } from "../utils/session";

const signedInNavigationItems = [
  { to: "/resources", label: "Resources" },
  { to: "/tickets", label: "Tickets" },
  { to: "/notifications", label: "Notifications" },
];

const authenticatedNavigationItems = [{ to: "/profile", label: "Profile" }];

const guestNavigationItems = [
  { to: "/login", label: "Sign in" },
  { to: "/signup", label: "Sign up" },
];

const adminNavigationItems = [
  { to: "/admin", label: "Dashboard" }
];

const linkClass = ({ isActive }) =>
  `hub-nav__link${isActive ? " hub-nav__link--active" : ""}`;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = isAdminRole(user?.role);
  const bookingPageRoute = isAdmin
    ? "/admin-bookings"
    : user
      ? "/user-bookings"
      : "/bookings";
  const bookingPageLabel = isAdmin ? "Booking Approvals" : "Bookings";

  // Determine page-specific CSS class based on current route
  const getPageClass = () => {
    const path = location.pathname;
    if (path === '/bookings' || path === '/user-bookings' || path === '/admin-bookings' || path === '/admin-bookings-dashboard') {
      return 'hub-app--bookings';
    }
    if (path === '/resources' || path === '/admin-resources') {
      return 'hub-app--resources';
    }
    if (path === '/tickets' || path === '/admin-tickets' || path === '/ticket-list' || path === '/ticket-details') {
      return 'hub-app--tickets';
    }
    if (path === '/notifications') {
      return 'hub-app--notifications';
    }
    if (path === '/profile') {
      return 'hub-app--profile';
    }
    if (path === '/login' || path === '/signup') {
      return 'hub-app--auth';
    }
    return 'hub-app--home'; // default
  };

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // Remove admin route bypass to show consistent header for all pages

  return (
    <div className={`hub-app ${getPageClass()}`}>
      <header className="hub-header">
        <div className="hub-header__inner">
          <NavLink to="/" className="hub-brand" end>
            <img src={sliitLogo} alt="SLIIT logo" className="hub-brand__mark" />
            <span className="hub-brand__text">Smart Campus Hub</span>
          </NavLink>
          <nav className="hub-nav" aria-label="Main">
            {user &&
              signedInNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {user && (
              <NavLink to={bookingPageRoute} className={linkClass}>
                {bookingPageLabel}
              </NavLink>
            )}
            {user &&
              authenticatedNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {!user &&
              guestNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {isAdmin &&
              adminNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {user?.role === 'SUPER_ADMIN' && (
              <NavLink key="/super-admin" to="/super-admin" className={linkClass}>
                Super Admin
              </NavLink>
            )}
            {user && (
              <button
                type="button"
                className="hub-nav__button"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="hub-main">
        <Outlet />
      </main>
    </div>
  );
}
