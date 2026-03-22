export default function LoginPage() {
  return (
    <div className="hub-page hub-page--narrow">
      <h1>Sign in</h1>
      <p className="hub-lead">
        Module E — OAuth 2.0 (e.g. Google). USER, ADMIN, and optional
        TECHNICIAN roles will gate API calls and front-end routes.
      </p>
      <div className="hub-placeholder">
        <p>
          Next: redirect to Spring Security OAuth2 login or use your token flow;
          then store session/JWT and drive role-based UI.
        </p>
        <button type="button" className="hub-btn hub-btn--primary" disabled>
          Continue with Google (configure backend)
        </button>
      </div>
    </div>
  )
}
