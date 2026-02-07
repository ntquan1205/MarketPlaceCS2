import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CS2 Marketplace
          </Typography>
          
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/marketplace">Marketplace</Button>
          
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
              <Typography variant="body2" sx={{ mx: 2 }}>
                Welcome, {user.username}!
              </Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/inventory" element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;