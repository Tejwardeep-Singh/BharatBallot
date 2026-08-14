function Guard({ role, children }) { return localStorage.getItem(`${role}Token`) ? children : <Navigate to={role === 'head' ? '/head' : '/admin'} replace />; }
export default Guard