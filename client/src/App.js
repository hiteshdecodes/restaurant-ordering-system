import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CustomerMenu from './components/CustomerMenu';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import TableOrders from './components/TableOrders';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#2c3e50',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
