import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import StampBookPage from './pages/StampBookPage';

function ProtectedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Routes>
        <Route path="/map"         element={<MapPage />} />
        <Route path="/stampbook"   element={<StampBookPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile"     element={<ProfilePage />} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/contact"     element={<ContactPage />} />
        <Route path="*"            element={<Navigate to="/map" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<ProtectedLayout />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
