import { LoginPage } from './pages/Login/Login';
import { DashboardPage } from './pages/Dashboard/Dashboard';
import { AppListPage } from './pages/Apps/AppList';
import { AppDetailPage } from './pages/Apps/AppDetail';
import { ProtectedRoute } from './components/ProtectedRoute';

function getRoute(): string {
  return window.location.pathname;
}

export function App() {
  const route = getRoute();

  if (route === '/login') {
    return <LoginPage />;
  }

  let page;
  if (route === '/apps') {
    page = <AppListPage />;
  } else if (route.startsWith('/apps/')) {
    page = <AppDetailPage />;
  } else {
    page = <DashboardPage />;
  }

  return <ProtectedRoute>{page}</ProtectedRoute>;
}
