import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CustomerMenu from './components/CustomerMenu';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import TableOrders from './components/TableOrders';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

// Inner component that uses the theme context
function AppContent() {
  const { restaurantColors } = useTheme();

  // Create dynamic theme based on restaurant colors
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: {
          main: restaurantColors.primaryColor,
        },
        secondary: {
          main: restaurantColors.secondaryColor,
        },
        background: {
          default: '#f8f9fa',
        },
      },
      typography: {
        fontFamily: '"Montserrat Alternates", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 500,
        },
      },
    });
  }, [restaurantColors]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/table-orders" element={<TableOrders />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CustomThemeProvider>
          <AppContent />
        </CustomThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
