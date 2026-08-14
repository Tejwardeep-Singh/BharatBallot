import { useCallback, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Nav from './components/Nav';
import Copyright from './components/Copywright';

import Home from './components/pages/Home';
import HeadLogin from './components/pages/HeadLogin';
import AdminLogin from './components/pages/AdminLogin';
import HeadResults from './components/pages/HeadResults';
import AdminResults from './components/pages/AdminResults';
import HeadOverview from './components/pages/HeadOverview';
import Elections from './components/pages/Elections';
import Admins from './components/pages/Admins';
import AdminOverview from './components/pages/AdminOverview';
import Directory from './components/pages/Directory';
import SettingsPage from './components/pages/SettingsPage';
import Profile from './components/pages/Profile';

import Toast from './components/common/Toast';

import PortalShell from './components/layout/PortalShell';
import Guard from './components/auth/Guard';

import {
  ElectionProvider,
} from './context/ElectionContext';


function useNotify() {
  const [toast, setToast] = useState(null);

  const notify = useCallback(
    (message, type = 'success') => {
      setToast({
        message,
        type,
      });

      setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    []
  );

  const clear = () => {
    setToast(null);
  };

  return [toast, notify, clear];
}


export default function App() {
  const [toast, notify, clear] = useNotify();

  const shell = (role, element) => (
    <Guard role={role}>
      <PortalShell role={role}>
        {element}
      </PortalShell>
    </Guard>
  );

  return (
    <ElectionProvider>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Nav />
              <Home />
            </>
          }
        />

        {/* Head Authentication */}
        <Route
          path="/head"
          element={
            <>
              <Nav />
              <HeadLogin />
            </>
          }
        />

        {/* Admin Authentication */}
        <Route
          path="/admin"
          element={
            <>
              <Nav />
              <AdminLogin />
            </>
          }
        />

        {/* Head Portal */}
        <Route
          path="/head/dashboard"
          element={shell(
            'head',
            <HeadOverview notify={notify} />
          )}
        />

        <Route
          path="/head/election"
          element={shell(
            'head',
            <Elections notify={notify} />
          )}
        />

        <Route
          path="/head/viewAdmins"
          element={shell(
            'head',
            <Admins notify={notify} />
          )}
        />

        <Route
          path="/head/results"
          element={shell(
            'head',
            <HeadResults />
          )}
        />

        <Route
          path="/head/settings"
          element={shell(
            'head',
            <SettingsPage />
          )}
        />

        {/* Admin Portal */}
        <Route
          path="/admin/dashboard"
          element={shell(
            'admin',
            <AdminOverview notify={notify} />
          )}
        />

        <Route
          path="/admin/voters"
          element={shell(
            'admin',
            <Directory
              kind="voter"
              notify={notify}
            />
          )}
        />

        <Route
          path="/admin/candidate/view"
          element={shell(
            'admin',
            <Directory
              kind="candidate"
              notify={notify}
            />
          )}
        />

        <Route
          path="/admin/profile"
          element={shell(
            'admin',
            <Profile notify={notify} />
          )}
        />

        <Route
          path="/admin/results"
          element={shell(
            'admin',
            <AdminResults />
          )}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      <Copyright />

      <Toast
        toast={toast}
        clear={clear}
      />
    </ElectionProvider>
  );
}