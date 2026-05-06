import { LoginPage } from './pages/Login/Login';
import { DashboardPage } from './pages/Dashboard/Dashboard';
import { AppListPage } from './pages/Apps/AppList';
import { AppViewPage } from './pages/AppView/AppView';
import { CreateAppPage } from './pages/CreateApp/CreateApp';
import { ProtectedRoute } from './components/ProtectedRoute';

function getRoute(): string {
  return window.location.pathname;
}

export function App() {
  const route = getRoute();

  if (route === '/login') {
    return <LoginPage />;
  }

  if (route === '/create') {
    return <ProtectedRoute><CreateAppPage /></ProtectedRoute>;
  }

  let page;
  if (route === '/apps') {
    page = <AppListPage />;
  } else if (route.startsWith('/apps/')) {
    page = <AppViewPage />;
  } else {
    page = <DashboardPage />;
  }

  return <ProtectedRoute>{page}</ProtectedRoute>;
}
