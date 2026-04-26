import { LoginPage } from './pages/Login/Login';
import { DashboardPage } from './pages/Dashboard/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function getRoute(): string {
  return window.location.pathname;
}

export function App() {
  const route = getRoute();

  if (route === '/login') {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
