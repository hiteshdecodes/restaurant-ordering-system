import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { format, startOfDay, isSameDay } from 'date-fns';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Badge,
  Switch,
  FormControlLabel,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Checkbox
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as OrderIcon,
  TableChart as TableIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Whatshot as SpicyIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import NotificationCenter from './NotificationCenter';
import CustomCheckbox from './CustomCheckbox';
import LoadingAnimation from './LoadingAnimation';
import vegIcon from '../veg icon.png';
import nonVegIcon from '../non veg.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState('confirmed');
  const [menuFilter, setMenuFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [tableCategories, setTableCategories] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedOrderNote, setSelectedOrderNote] = useState('');

  // Logout handler
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  // Dialog states
  const [menuItemDialog, setMenuItemDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [tableCategoryDialog, setTableCategoryDialog] = useState(false);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [selectedAddItem, setSelectedAddItem] = useState(null);
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [editingTableCategory, setEditingTableCategory] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [restaurantDialog, setRestaurantDialog] = useState(false);
  const [restaurantLogoFile, setRestaurantLogoFile] = useState(null);
  const [restaurantLogoPreview, setRestaurantLogoPreview] = useState(null);
  const [updatingRestaurant, setUpdatingRestaurant] = useState(false);

  // Form states
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isVegetarian: false,
    isSpicy: false
  });

  const [menuItemImageFile, setMenuItemImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: '',
    location: '',
    category: ''
  });

  const [newTableCategory, setNewTableCategory] = useState({
    name: '',
    description: '',
    color: '#ff6b35',
    icon: 'category'
  });

  const API_BASE = '/api';

  // Enhanced notification sound function
  const playNotificationSound = () => {
    try {
      // Method 1: Web Audio API with oscillator (most reliable)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create a sequence of beeps
      const playBeep = (frequency, duration, delay = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Play notification sequence: high-low-high beeps
      playBeep(800, 0.2, 0);     // First beep
      playBeep(600, 0.2, 300);   // Second beep
      playBeep(800, 0.3, 600);   // Third beep

    } catch (error) {
      console.log('Web Audio API not supported, trying fallback');

      // Method 2: Fallback with simple audio
      try {
        // Create a simple notification sound using data URI
        const audio = new Audio();
        audio.volume = 0.5;

        // Simple beep sound data URI
        const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.src = beepSound;
        audio.play().catch(e => {
          console.log('Audio playback failed:', e);
          // Method 3: Visual notification as final fallback
          document.title = 'New Order! - Restaurant Dashboard';
          setTimeout(() => {
            document.title = 'Restaurant Dashboard';
          }, 3000);
        });
      } catch (fallbackError) {
        console.log('All audio methods failed, using visual notification');
        document.title = 'New Order! - Restaurant Dashboard';
        setTimeout(() => {
          document.title = 'Restaurant Dashboard';
        }, 3000);
      }
    }
  };

  useEffect(() => {
    // Initialize socket connection (use current domain)
    const newSocket = io();
    setSocket(newSocket);

    // Join dashboard room for real-time updates
    newSocket.emit('join-dashboard');

    // Listen for real-time order updates
    newSocket.on('new-order', (order) => {
      setOrders(prev => [order, ...prev]);

      // Show toast notification
      const notification = {
        id: Date.now(),
        type: 'success',
        title: 'New Order Received!',
        message: `Order ${order.orderNumber} from Table ${order.tableNumber}`,
        order: order
      };

      setCurrentNotification(notification);
      setNotificationOpen(true);
      setNewOrderAlert(true);

      // Play notification sound
      playNotificationSound();

      // Auto-hide notification after 8 seconds
      setTimeout(() => {
        setNewOrderAlert(false);
        setNotificationOpen(false);
      }, 8000);

      // Recalculate stats when new order arrives
      calculateStats();
    });

    newSocket.on('order-status-updated', (updatedOrder) => {
      setOrders(prev => prev.map(order =>
        order._id === updatedOrder._id ? updatedOrder : order
      ));

      // Recalculate stats when order status changes
      calculateStats();
    });

    // Fetch initial data
    fetchOrders(true);
    fetchCategories();
    fetchMenuItems();
    fetchTables();
    fetchTableCategories();
    fetchRestaurantData();
    calculateStats();

    return () => newSocket.close();
  }, []);

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) {
        setOrdersLoading(true);
      }
      const response = await axios.get(`${API_BASE}/orders`);
      setOrders(response.data);
      if (isInitial) {
        setOrdersLoading(false);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (isInitial) {
        setOrdersLoading(false);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/menu-items?includeUnavailable=true`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/restaurant`);
      setRestaurantData(response.data);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  const fetchTableCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/table-categories`);
      setTableCategories(response.data);
    } catch (error) {
      console.error('Error fetching table categories:', error);
    }
  };

  const calculateStats = async () => {
    try {
      setStatsLoading(true);
      const ordersResponse = await axios.get(`${API_BASE}/orders`);
      const orders = ordersResponse.data;

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
      });
      setStatsLoading(false);
    } catch (error) {
      console.error('Error calculating stats:', error);
      setStatsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    // Keep the full menuItem object for display
    setEditOrderItems(order.items.map(item => ({
      ...item
    })));
    setEditOrderDialog(true);
  };

  const handleSaveEditOrder = async () => {
    try {
      if (editOrderItems.length === 0) {
        alert('Order must contain at least one item');
        return;
      }

      // Calculate new total
      const newTotal = editOrderItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      await axios.put(`${API_BASE}/orders/${editingOrder._id}/edit-items`, {
        items: editOrderItems,
        totalAmount: newTotal
      });

      setEditOrderDialog(false);
      setEditingOrder(null);
      setEditOrderItems([]);
      fetchOrders();
    } catch (error) {
      console.error('Error editing order:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveEditItem = (index) => {
    setEditOrderItems(editOrderItems.filter((_, i) => i !== index));
  };

  const handleUpdateEditItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...editOrderItems];
    updated[index].quantity = newQuantity;
    setEditOrderItems(updated);
  };

  const handleAddItemToOrder = () => {
    if (!selectedAddItem) {
      alert('Please select an item');
      return;
    }

    // Check if item already exists in order
    const existingItemIndex = editOrderItems.findIndex(
      item => (item.menuItem._id || item.menuItem) === (selectedAddItem._id || selectedAddItem)
    );

    if (existingItemIndex >= 0) {
      // Item already exists, just increase quantity
      const updated = [...editOrderItems];
      updated[existingItemIndex].quantity += addItemQuantity;
      setEditOrderItems(updated);
    } else {
      // Add new item
      setEditOrderItems([
        ...editOrderItems,
        {
          menuItem: selectedAddItem,
          price: selectedAddItem.price,
          quantity: addItemQuantity
        }
      ]);
    }

    // Reset form
    setSelectedAddItem(null);
    setAddItemQuantity(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      ready: 'success',
      served: 'default',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const handleCreateMenuItem = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('description', newMenuItem.description);
      formData.append('price', parseFloat(newMenuItem.price));
      formData.append('category', newMenuItem.category);
      formData.append('isVegetarian', newMenuItem.isVegetarian);
      formData.append('isSpicy', newMenuItem.isSpicy);

      // Add image file if selected, otherwise add URL
      if (menuItemImageFile) {
        formData.append('imageFile', menuItemImageFile);
      } else if (newMenuItem.image) {
        formData.append('image', newMenuItem.image);
      }

      if (editingItem) {
        // Update existing item
        await axios.put(`${API_BASE}/menu-items/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new item
        await axios.post(`${API_BASE}/menu-items`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setMenuItemDialog(false);
      setEditingItem(null);
      setMenuItemImageFile(null);
      setImagePreview(null);
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isVegetarian: false,
        isSpicy: false
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error creating menu item:', error);
    }
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setNewMenuItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category._id,
      isVegetarian: item.isVegetarian,
      isSpicy: item.isSpicy
    });
    setMenuItemImageFile(null);
    // Set image preview to the existing image URL
    if (item.image) {
      setImagePreview(item.image.startsWith('http') ? item.image : item.image);
    } else {
      setImagePreview(null);
    }
    setMenuItemDialog(true);
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`${API_BASE}/menu-items/${itemId}`);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const handleToggleAvailability = async (itemId, isAvailable) => {
    try {
      await axios.put(`${API_BASE}/menu-items/${itemId}`, { isAvailable });
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description
    });
    setCategoryDialog(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_BASE}/categories/${categoryId}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleCreateCategory = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(`${API_BASE}/categories/${editingCategory._id}`, newCategory);
      } else {
        // Create new category
        await axios.post(`${API_BASE}/categories`, newCategory);
      }
      setCategoryDialog(false);
      setEditingCategory(null);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleClearAllOrders = async () => {
    try {
      await axios.delete(`${API_BASE}/orders/clear-all/all`);
      setClearAllDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Error clearing all orders:', error);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      await Promise.all(
        selectedOrders.map(orderId =>
          axios.put(`${API_BASE}/orders/${orderId}/status`, { status: bulkNewStatus })
        )
      );
      setSelectedOrders([]);
      setBulkStatusDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating orders:', error);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`${API_BASE}/tables/${tableId}`);
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
  };

  const handleDownloadQRCode = (table) => {
    const link = document.createElement('a');
    link.href = table.qrCode;
    link.download = `Table-${table.tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTable = async () => {
    try {
      // Validation
      if (!newTable.tableNumber || newTable.tableNumber.trim() === '') {
        alert('Please enter a table number');
        return;
      }
      if (!newTable.capacity || newTable.capacity === '') {
        alert('Please enter table capacity');
        return;
      }
      if (parseInt(newTable.capacity) < 1) {
        alert('Capacity must be at least 1');
        return;
      }

      if (editingTable) {
        // Update existing table
        await axios.put(`${API_BASE}/tables/${editingTable._id}`, {
          ...newTable,
          capacity: parseInt(newTable.capacity)
        });
      } else {
        // Create new table
        await axios.post(`${API_BASE}/tables`, {
          ...newTable,
          capacity: parseInt(newTable.capacity)
        });
      }
      setTableDialog(false);
      setEditingTable(null);
      setNewTable({ tableNumber: '', capacity: '', location: '', category: '' });
      fetchTables();
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setNewTable({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      category: table.category?._id || ''
    });
    setTableDialog(true);
  };

  const handleCreateTableCategory = async () => {
    try {
      if (!newTableCategory.name || newTableCategory.name.trim() === '') {
        alert('Please enter a category name');
        return;
      }

      if (editingTableCategory) {
        // Update existing category
        await axios.put(`${API_BASE}/table-categories/${editingTableCategory._id}`, newTableCategory);
      } else {
        // Create new category
        await axios.post(`${API_BASE}/table-categories`, newTableCategory);
      }

      setTableCategoryDialog(false);
      setEditingTableCategory(null);
      setNewTableCategory({ name: '', description: '', color: '#ff6b35', icon: 'category' });
      fetchTableCategories();
    } catch (error) {
      console.error('Error creating table category:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTableCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_BASE}/table-categories/${categoryId}`);
        fetchTableCategories();
        fetchTables();
      } catch (error) {
        console.error('Error deleting table category:', error);
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditTableCategory = (category) => {
    setEditingTableCategory(category);
    setNewTableCategory({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon
    });
    setTableCategoryDialog(true);
  };

  const groupOrdersByDate = (ordersToGroup) => {
    const grouped = {};
    ordersToGroup.forEach(order => {
      const dateKey = format(new Date(order.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });
    return grouped;
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 1.5, mb: 3, px: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ fontSize: 28, color: '#2d5016', mr: 1.5 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#2d5016' }}>
            Restaurant Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <NotificationCenter />
          <Button
            variant="outlined"
            startIcon={<NotificationIcon sx={{ fontSize: '16px' }} />}
            onClick={playNotificationSound}
            size="small"
            sx={{
              fontSize: '12px',
              py: 0.5,
              px: 1.2,
              textTransform: 'none',
              borderColor: '#ff6b35',
              color: '#ff6b35',
              '&:hover': { borderColor: '#e55a24', bgcolor: '#fff3e0' }
            }}
          >
            Test Sound
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon sx={{ fontSize: '16px' }} />}
            onClick={handleLogout}
            size="small"
            sx={{
              fontSize: '12px',
              py: 0.5,
              px: 1.2,
              textTransform: 'none',
              bgcolor: '#ff6b35',
              color: 'white',
              '&:hover': { bgcolor: '#e55a24' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* New Order Alert */}
      {newOrderAlert && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '6px', fontSize: '13px' }}>
          New order received! Check the orders tab.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          {statsLoading ? (
            <LoadingAnimation variant="stats" />
          ) : (
            <Card sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                <OrderIcon sx={{ fontSize: 28, color: '#ff6b35', mb: 0.5 }} />
                <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#ff6b35' }}>
                  {stats.totalOrders}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          {statsLoading ? (
            <LoadingAnimation variant="stats" />
          ) : (
            <Card sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                <NotificationIcon sx={{ fontSize: 28, color: '#ff9800', mb: 0.5 }} />
                <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#ff9800' }}>
                  {stats.pendingOrders}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  Pending Orders
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          {statsLoading ? (
            <LoadingAnimation variant="stats" />
          ) : (
            <Card sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                <RestaurantIcon sx={{ fontSize: 28, color: '#2d5016', mb: 0.5 }} />
                <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#2d5016' }}>
                  {menuItems.length}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  Menu Items
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          {statsLoading ? (
            <LoadingAnimation variant="stats" />
          ) : (
            <Card sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1.5 }}>
                <TableIcon sx={{ fontSize: 28, color: '#1976d2', mb: 0.5 }} />
                <Typography sx={{ fontWeight: 500, fontSize: '20px', color: '#1976d2' }}>
                  ₹{stats.totalRevenue}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #eee', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: '48px',
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff6b35',
              height: '3px'
            },
            '& .MuiTab-root': {
              fontSize: '12px',
              textTransform: 'none',
              minHeight: '48px',
              py: 1,
              px: 1.5,
              color: '#666',
              '&.Mui-selected': {
                color: '#ff6b35',
                fontWeight: 500
              }
            }
          }}
        >
          <Tab label="Orders" />
          <Tab label="Table Orders" />
          <Tab label="Menu Items" />
          <Tab label="Categories" />
          <Tab label="Table Categories" />
          <Tab label="Tables" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Orders Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'].map((status) => {
                const statusCounts = {
                  all: orders.length,
                  pending: orders.filter(o => o.status === 'pending').length,
                  confirmed: orders.filter(o => o.status === 'confirmed').length,
                  preparing: orders.filter(o => o.status === 'preparing').length,
                  ready: orders.filter(o => o.status === 'ready').length,
                  served: orders.filter(o => o.status === 'served').length,
                  cancelled: orders.filter(o => o.status === 'cancelled').length
                };

                return (
                  <Button
                    key={status}
                    variant={orderFilter === status ? 'contained' : 'outlined'}
                    onClick={() => setOrderFilter(status)}
                    sx={{
                      fontSize: '11px',
                      py: 0.5,
                      px: 1,
                      textTransform: 'capitalize',
                      bgcolor: orderFilter === status ? '#ff6b35' : 'transparent',
                      color: orderFilter === status ? 'white' : '#ff6b35',
                      border: '1px solid #ff6b35',
                      '&:hover': {
                        bgcolor: orderFilter === status ? '#e55a24' : '#fff5f0'
                      }
                    }}
                  >
                    {status} ({statusCounts[status]})
                  </Button>
                );
              })}
            </Box>
            <Button
              variant="contained"
              onClick={() => setClearAllDialog(true)}
              sx={{
                bgcolor: '#c62828',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#b71c1c' }
              }}
            >
              Clear All Orders
            </Button>
          </Box>

          {selectedOrders.length > 0 && (
            <Box sx={{ mb: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '12px', color: '#666' }}>
                {selectedOrders.length} order(s) selected
              </Typography>
              <Button
                variant="contained"
                onClick={() => setBulkStatusDialog(true)}
                sx={{
                  bgcolor: '#ff6b35',
                  color: 'white',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#e55a24' }
                }}
              >
                Update Status
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedOrders([])}
                sx={{
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.2,
                  textTransform: 'none',
                  borderColor: '#999',
                  color: '#999'
                }}
              >
                Clear Selection
              </Button>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2d5016' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 0.8, width: '40px' }}>
                    <CustomCheckbox
                      id="select-all-orders"
                      checked={selectedOrders.length === (orderFilter === 'all' ? orders.length : orders.filter(o => o.status === orderFilter).length) && orders.length > 0}
                      onChange={handleSelectAllOrders}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Order #</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Table</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Items</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Note</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersLoading ? (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <TableRow key={`loading-${i}`} sx={{ '&:hover': { backgroundColor: 'transparent' } }}>
                        <TableCell colSpan={9} sx={{ p: 0, border: 'none' }}>
                          <LoadingAnimation variant="table-row" height="50px" width="100%" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {(() => {
                      const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
                      const groupedOrders = groupOrdersByDate(filteredOrders);
                      const sortedDates = Object.keys(groupedOrders).sort().reverse();

                return sortedDates.flatMap((dateKey, dateIndex) => {
                  const dateOrders = groupedOrders[dateKey];
                  const allDateOrdersSelected = dateOrders.every(order => selectedOrders.includes(order._id));
                  const someDateOrdersSelected = dateOrders.some(order => selectedOrders.includes(order._id));

                  const handleSelectAllForDate = () => {
                    if (allDateOrdersSelected) {
                      // Deselect all orders for this date
                      setSelectedOrders(selectedOrders.filter(id => !dateOrders.find(o => o._id === id)));
                    } else {
                      // Select all orders for this date
                      const dateOrderIds = dateOrders.map(o => o._id);
                      setSelectedOrders([...new Set([...selectedOrders, ...dateOrderIds])]);
                    }
                  };

                  return [
                    <TableRow key={`date-${dateKey}`} sx={{ backgroundColor: '#f0f0f0', '& td': { backgroundColor: '#f0f0f0' } }}>
                      <TableCell sx={{ py: 1, px: 0.8, width: '40px', backgroundColor: '#f0f0f0' }}>
                        <CustomCheckbox
                          id={`select-date-${dateKey}`}
                          checked={allDateOrdersSelected}
                          onChange={handleSelectAllForDate}
                        />
                      </TableCell>
                      <TableCell colSpan={8} sx={{ py: 1, px: 1.2, fontWeight: 500, color: '#2d5016', fontSize: '12px', backgroundColor: '#f0f0f0' }}>
                        {getDateLabel(dateKey)}
                      </TableCell>
                    </TableRow>,
                  ...groupedOrders[dateKey].map((order) => (
                    <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, borderBottom: '1px solid #eee', backgroundColor: selectedOrders.includes(order._id) ? '#fff3e0' : 'transparent' }}>
                      <TableCell sx={{ fontSize: '12px', py: 0.8, px: 0.8, width: '40px' }}>
                        <CustomCheckbox
                          id={`order-${order._id}`}
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#1a1a1a' }}>
                        <Box>
                          <div>{order.orderNumber}</div>
                          <Typography sx={{ fontSize: '10px', color: '#999', mt: 0.3 }}>
                            {order.customerName && `${order.customerName}`}
                            {order.customerPhone && ` • ${order.customerPhone}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#1a1a1a' }}>{order.tableNumber}</TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.8, px: 1.2, color: '#666' }}>
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.menuItem ? `${item.menuItem.name} x${item.quantity}` : `Deleted Item x${item.quantity}`}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#ff6b35', fontWeight: 500 }}>₹{order.totalAmount}</TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.8, px: 1.2 }}>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontSize: '10px', height: '22px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.8, px: 1.2, color: '#999' }}>{formatTime(order.createdAt)}</TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.8, px: 1.2 }}>
                        {order.specialRequests && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrderNote(order.specialRequests);
                              setNoteDialogOpen(true);
                            }}
                            sx={{ color: '#2d5016' }}
                            title="View note"
                          >
                            <NoteIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        )}
                      </TableCell>
                  <TableCell sx={{ fontSize: '11px', py: 0.8, px: 1.2, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditOrder(order)}
                      sx={{ color: '#ff6b35', '&:hover': { bgcolor: '#fff3e0' } }}
                      title="Edit order items"
                    >
                      <EditIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                    <Select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      size="small"
                      sx={{ fontSize: '11px', height: '28px', flex: 1 }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="preparing">Preparing</MenuItem>
                      <MenuItem value="ready">Ready</MenuItem>
                      <MenuItem value="served">Served</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                    {order.isEdited && (
                      <Chip
                        label="Edited"
                        size="small"
                        sx={{ fontSize: '9px', height: '20px', bgcolor: '#fff3e0', color: '#ff6b35' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
                      ))
                    ];
                    });
                  })()}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Table Orders Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            View all table orders by clicking on the table cards below
          </Typography>
          <Button
            variant="contained"
            href="/table-orders"
            target="_blank"
            sx={{ mb: 3 }}
          >
            Open Table Orders View
          </Button>
        </Box>
      )}

      {/* Menu Items Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => setMenuItemDialog(true)}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
            >
              Add Menu Item
            </Button>
          </Box>

          {/* Menu Filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#2d5016' }}>Filter:</Typography>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: '11px' }}>Category</InputLabel>
              <Select
                value={menuCategoryFilter}
                onChange={(e) => setMenuCategoryFilter(e.target.value)}
                label="Category"
                sx={{ fontSize: '12px', height: '32px' }}
              >
                <MenuItem value="all" sx={{ fontSize: '12px' }}>All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id} sx={{ fontSize: '12px' }}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Veg/Non-Veg Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: '11px' }}>Type</InputLabel>
              <Select
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                label="Type"
                sx={{ fontSize: '12px', height: '32px' }}
              >
                <MenuItem value="all" sx={{ fontSize: '12px' }}>All Items</MenuItem>
                <MenuItem value="veg" sx={{ fontSize: '12px' }}>Vegetarian</MenuItem>
                <MenuItem value="non-veg" sx={{ fontSize: '12px' }}>Non-Vegetarian</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Filters Button */}
            {(menuFilter !== 'all' || menuCategoryFilter !== 'all') && (
              <Button
                size="small"
                onClick={() => {
                  setMenuFilter('all');
                  setMenuCategoryFilter('all');
                }}
                sx={{
                  fontSize: '11px',
                  textTransform: 'none',
                  color: '#ff6b35',
                  '&:hover': { bgcolor: '#fff5f0' }
                }}
              >
                Reset Filters
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2d5016' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Available</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Veg</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Spicy</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '12px', py: 1, px: 1.2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...menuItems]
                  .filter((item) => {
                    // Apply veg/non-veg filter
                    if (menuFilter === 'veg' && !item.isVegetarian) return false;
                    if (menuFilter === 'non-veg' && item.isVegetarian) return false;
                    // Apply category filter
                    if (menuCategoryFilter !== 'all' && item.category._id !== menuCategoryFilter) return false;
                    return true;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                  <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, borderBottom: '1px solid #eee' }}>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#1a1a1a' }}>{item.name}</TableCell>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#666' }}>{item.category.name}</TableCell>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2, color: '#ff6b35', fontWeight: 500 }}>₹{item.price}</TableCell>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2 }}>
                      <Switch
                        checked={item.isAvailable}
                        onChange={(e) => handleToggleAvailability(item._id, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2 }}>
                      {item.isVegetarian ? (
                        <Box
                          component="img"
                          src={vegIcon}
                          alt="Vegetarian"
                          sx={{
                            width: 20,
                            height: 20
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={nonVegIcon}
                          alt="Non-Vegetarian"
                          sx={{
                            width: 20,
                            height: 20
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', py: 0.8, px: 1.2 }}>
                      {item.isSpicy ? (
                        <SpicyIcon sx={{ color: '#ff6b35', fontSize: '18px' }} />
                      ) : (
                        <span style={{ color: '#ccc' }}>✗</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditMenuItem(item)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteMenuItem(item._id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Categories Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => setCategoryDialog(true)}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
            >
              Add Category
            </Button>
          </Box>
          <Grid container spacing={1.2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1.5px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15)',
                      transform: 'translateY(-4px)',
                      borderColor: '#ff6b35'
                    }
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          fontSize: '16px',
                          color: '#2d5016',
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#999',
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '32px'
                        }}
                      >
                        {category.description || 'No description'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', pt: 1, borderTop: '1px solid #f0f0f0' }}>
                      <IconButton
                        onClick={() => handleEditCategory(category)}
                        size="small"
                        sx={{
                          color: '#ff6b35',
                          fontSize: '16px',
                          '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' }
                        }}
                      >
                        <EditIcon sx={{ fontSize: '18px' }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteCategory(category._id)}
                        size="small"
                        sx={{
                          color: '#c62828',
                          fontSize: '16px',
                          '&:hover': { bgcolor: 'rgba(198, 40, 40, 0.1)' }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '18px' }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Table Categories Tab */}
      {activeTab === 4 && (
        <Box>
          <Box sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTableCategory(null);
                setNewTableCategory({ name: '', description: '', color: '#ff6b35', icon: 'category' });
                setTableCategoryDialog(true);
              }}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
            >
              Add Category
            </Button>
          </Box>
          <Grid container spacing={1.2}>
            {tableCategories.sort((a, b) => a.order - b.order).map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: `2px solid ${category.color}`,
                    background: `linear-gradient(135deg, ${category.color}08 0%, #ffffff 100%)`,
                    '&:hover': {
                      boxShadow: `0 8px 24px ${category.color}30`,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box
                          sx={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            bgcolor: category.color,
                            flexShrink: 0
                          }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: '16px',
                            color: '#2d5016',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#999',
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '32px'
                        }}
                      >
                        {category.description || 'No description'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f0f0f0' }}>
                      <Chip
                        label={`${tables.filter(t => t.category?._id === category._id).length} tables`}
                        size="small"
                        sx={{
                          fontSize: '11px',
                          height: '24px',
                          bgcolor: `${category.color}20`,
                          color: category.color,
                          fontWeight: 500
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => handleEditTableCategory(category)}
                          size="small"
                          sx={{
                            color: '#ff6b35',
                            fontSize: '16px',
                            '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteTableCategory(category._id)}
                          size="small"
                          sx={{
                            color: '#c62828',
                            fontSize: '16px',
                            '&:hover': { bgcolor: 'rgba(198, 40, 40, 0.1)' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tables Tab */}
      {activeTab === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTable(null);
                setNewTable({ tableNumber: '', capacity: '', location: '', category: '' });
                setTableDialog(true);
              }}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
            >
              Add Table
            </Button>
          </Box>

          <Box sx={{ overflowY: 'auto', overflowX: 'auto', flex: 1, pr: 1 }}>
            {/* Tables grouped by category */}
            {tableCategories.length > 0 ? (
              <>
                {tableCategories.sort((a, b) => a.order - b.order).map((category) => {
                  const categoryTables = tables.filter(t => t.category?._id === category._id).sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber));
                  return (
                    <Box key={category._id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: `2px solid ${category.color}` }}>
                        <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', bgcolor: category.color }} />
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#2d5016' }}>
                          {category.name} ({categoryTables.length})
                        </Typography>
                      </Box>
                      <Grid container spacing={1.2}>
                      {categoryTables.map((table) => (
                        <Grid item xs={12} sm={6} md={4} key={table._id}>
                          <Card
                            sx={{
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: `1.5px solid ${category.color}40`,
                              background: `linear-gradient(135deg, ${category.color}08 0%, #ffffff 100%)`,
                              '&:hover': {
                                boxShadow: `0 8px 24px ${category.color}25`,
                                transform: 'translateY(-4px)',
                                borderColor: category.color
                              }
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#2d5016', mb: 0.5 }}>
                                  Table {table.tableNumber}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#999', mb: 1.5 }}>
                                  Capacity: {table.capacity} | {table.location}
                                </Typography>
                                {table.qrCode && (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                                    <img
                                      src={table.qrCode}
                                      alt={`QR Code for Table ${table.tableNumber}`}
                                      style={{ width: 100, height: 100, borderRadius: '8px', border: '2px solid #f0f0f0' }}
                                    />
                                  </Box>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', pt: 1, borderTop: '1px solid #f0f0f0' }}>
                                {table.qrCode && (
                                  <IconButton
                                    onClick={() => handleDownloadQRCode(table)}
                                    size="small"
                                    sx={{
                                      color: '#2d5016',
                                      fontSize: '16px',
                                      '&:hover': { bgcolor: 'rgba(45, 80, 22, 0.1)' }
                                    }}
                                    title="Download QR Code"
                                  >
                                    <DownloadIcon sx={{ fontSize: '18px' }} />
                                  </IconButton>
                                )}
                                <IconButton
                                  onClick={() => handleEditTable(table)}
                                  size="small"
                                  sx={{
                                    color: '#ff6b35',
                                    fontSize: '16px',
                                    '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' }
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: '18px' }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDeleteTable(table._id)}
                                  size="small"
                                  sx={{
                                    color: '#c62828',
                                    fontSize: '16px',
                                    '&:hover': { bgcolor: 'rgba(198, 40, 40, 0.1)' }
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: '18px' }} />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}

              {/* Uncategorized tables */}
              {tables.filter(t => !t.category).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: '2px solid #ccc' }}>
                    <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', bgcolor: '#ccc' }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#2d5016' }}>
                      Uncategorized ({tables.filter(t => !t.category).length})
                    </Typography>
                  </Box>
                  <Grid container spacing={1.2}>
                    {tables.filter(t => !t.category).sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber)).map((table) => (
                      <Grid item xs={12} sm={6} md={4} key={table._id}>
                        <Card
                          sx={{
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1.5px solid #e8e8e8',
                            background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              transform: 'translateY(-4px)',
                              borderColor: '#d0d0d0'
                            }
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <Typography sx={{ fontWeight: 500, fontSize: '18px', color: '#2d5016', mb: 0.5 }}>
                                Table {table.tableNumber}
                              </Typography>
                              <Typography sx={{ fontSize: '12px', color: '#999', mb: 1.5 }}>
                                Capacity: {table.capacity} | {table.location}
                              </Typography>
                              {table.qrCode && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                                  <img
                                    src={table.qrCode}
                                    alt={`QR Code for Table ${table.tableNumber}`}
                                    style={{ width: 100, height: 100, borderRadius: '8px', border: '2px solid #f0f0f0' }}
                                  />
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', pt: 1, borderTop: '1px solid #f0f0f0' }}>
                              {table.qrCode && (
                                <IconButton
                                  onClick={() => handleDownloadQRCode(table)}
                                  size="small"
                                  sx={{
                                    color: '#2d5016',
                                    fontSize: '16px',
                                    '&:hover': { bgcolor: 'rgba(45, 80, 22, 0.1)' }
                                  }}
                                  title="Download QR Code"
                                >
                                  <DownloadIcon sx={{ fontSize: '18px' }} />
                                </IconButton>
                              )}
                              <IconButton
                                onClick={() => handleEditTable(table)}
                                size="small"
                                sx={{
                                  color: '#ff6b35',
                                  fontSize: '16px',
                                  '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' }
                                }}
                              >
                                <EditIcon sx={{ fontSize: '18px' }} />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteTable(table._id)}
                                size="small"
                                sx={{
                                  color: '#c62828',
                                  fontSize: '16px',
                                  '&:hover': { bgcolor: 'rgba(198, 40, 40, 0.1)' }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: '18px' }} />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ color: '#999', mb: 1 }}>No categories created yet</Typography>
                <Typography sx={{ fontSize: '12px', color: '#bbb' }}>Create a category in the "Table Categories" tab first</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 6 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setRestaurantDialog(true)}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                fontSize: '12px',
                py: 0.6,
                px: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<EditIcon sx={{ fontSize: '16px' }} />}
            >
              Edit Restaurant Info
            </Button>
          </Box>

          {restaurantData && (
            <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 2, color: '#2d5016' }}>
                  Restaurant Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {restaurantData.logo && (
                    <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 1 }}>
                        Logo
                      </Typography>
                      <Box
                        component="img"
                        src={restaurantData.logo}
                        alt="Restaurant Logo"
                        sx={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Name
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.name || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.email || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Phone
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.phone || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Address
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.address || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      City
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.city || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Postal Code
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.postalCode || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Country
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.country || 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 0.5 }}>
                      Cuisine Type
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#333' }}>
                      {restaurantData.cuisineType || 'Not set'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={menuItemDialog} onClose={() => {
        setMenuItemDialog(false);
        setEditingItem(null);
        setMenuItemImageFile(null);
        setImagePreview(null);
        setNewMenuItem({
          name: '',
          description: '',
          price: '',
          category: '',
          image: '',
          isVegetarian: false,
          isSpicy: false
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newMenuItem.name}
            onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newMenuItem.description}
            onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={newMenuItem.price}
            onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Category</InputLabel>
            <Select
              value={newMenuItem.category}
              onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#2d5016', mb: 1 }}>Image</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Button
                variant={!menuItemImageFile ? 'contained' : 'outlined'}
                onClick={() => {
                  setMenuItemImageFile(null);
                  setImagePreview(null);
                }}
                sx={{
                  flex: 1,
                  bgcolor: !menuItemImageFile ? '#ff6b35' : 'transparent',
                  color: !menuItemImageFile ? 'white' : '#ff6b35',
                  fontSize: '11px',
                  py: 0.6,
                  textTransform: 'none',
                  border: '1px solid #ff6b35',
                  '&:hover': { bgcolor: !menuItemImageFile ? '#e55a24' : '#fff5f0' }
                }}
              >
                URL
              </Button>
              <Button
                variant={menuItemImageFile ? 'contained' : 'outlined'}
                onClick={() => document.getElementById('imageFileInput').click()}
                sx={{
                  flex: 1,
                  bgcolor: menuItemImageFile ? '#ff6b35' : 'transparent',
                  color: menuItemImageFile ? 'white' : '#ff6b35',
                  fontSize: '11px',
                  py: 0.6,
                  textTransform: 'none',
                  border: '1px solid #ff6b35',
                  '&:hover': { bgcolor: menuItemImageFile ? '#e55a24' : '#fff5f0' }
                }}
              >
                Upload
              </Button>
              <input
                id="imageFileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setMenuItemImageFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Box>

            {menuItemImageFile ? (
              <Box>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      mb: 1
                    }}
                  />
                )}
                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                  File: {menuItemImageFile.name}
                </Typography>
              </Box>
            ) : (
              <Box>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Current"
                    sx={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      mb: 1
                    }}
                  />
                )}
                <TextField
                  fullWidth
                  label="Image URL"
                  value={newMenuItem.image}
                  onChange={(e) => setNewMenuItem({...newMenuItem, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  inputProps={{ className: 'custom-input' }}
                  sx={{ mb: 0 }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={newMenuItem.isVegetarian}
                  onChange={(e) => setNewMenuItem({...newMenuItem, isVegetarian: e.target.checked})}
                />
              }
              label="Vegetarian"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newMenuItem.isSpicy}
                  onChange={(e) => setNewMenuItem({...newMenuItem, isSpicy: e.target.checked})}
                />
              }
              label="Spicy"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMenuItemDialog(false);
            setEditingItem(null);
            setMenuItemImageFile(null);
            setImagePreview(null);
            setNewMenuItem({
              name: '',
              description: '',
              price: '',
              category: '',
              image: '',
              isVegetarian: false,
              isSpicy: false
            });
          }}>Cancel</Button>
          <Button onClick={handleCreateMenuItem} variant="contained">
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => {
        setCategoryDialog(false);
        setEditingCategory(null);
        setNewCategory({ name: '', description: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newCategory.description}
            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            inputProps={{ className: 'custom-input' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained">
            {editingCategory ? 'Update Category' : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Table Dialog */}
      <Dialog open={tableDialog} onClose={() => {
        setTableDialog(false);
        setEditingTable(null);
        setNewTable({ tableNumber: '', capacity: '', location: '', category: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Table Number"
            value={newTable.tableNumber}
            onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={newTable.capacity}
            onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            value={newTable.location}
            onChange={(e) => setNewTable({...newTable, location: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Category (Optional)</InputLabel>
            <Select
              value={newTable.category}
              onChange={(e) => setNewTable({...newTable, category: e.target.value})}
              label="Category (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {tableCategories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTable} variant="contained">
            {editingTable ? 'Update Table' : 'Add Table'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Table Category Dialog */}
      <Dialog open={tableCategoryDialog} onClose={() => {
        setTableCategoryDialog(false);
        setEditingTableCategory(null);
        setNewTableCategory({ name: '', description: '', color: '#ff6b35', icon: 'category' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTableCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={newTableCategory.name}
            onChange={(e) => setNewTableCategory({...newTableCategory, name: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newTableCategory.description}
            onChange={(e) => setNewTableCategory({...newTableCategory, description: e.target.value})}
            inputProps={{ className: 'custom-input' }}
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1 }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <input
                type="color"
                value={newTableCategory.color}
                onChange={(e) => setNewTableCategory({...newTableCategory, color: e.target.value})}
                style={{ width: '50px', height: '40px', cursor: 'pointer', borderRadius: '4px', border: 'none' }}
              />
              <Typography sx={{ fontSize: '12px', color: '#999' }}>{newTableCategory.color}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTableCategory} variant="contained">
            {editingTableCategory ? 'Update Category' : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Update Dialog */}
      <Dialog open={bulkStatusDialog} onClose={() => setBulkStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, color: '#2d5016' }}>Update Status for {selectedOrders.length} Order(s)</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1.5, fontSize: '13px', color: '#666' }}>
              Select new status for selected orders:
            </Typography>
            <Select
              fullWidth
              value={bulkNewStatus}
              onChange={(e) => setBulkNewStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="served">Served</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBulkStatusUpdate}
            variant="contained"
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a24' } }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Orders Dialog */}
      <Dialog open={clearAllDialog} onClose={() => setClearAllDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, color: '#2d5016' }}>Clear All Orders</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 2, fontSize: '14px', color: '#1a1a1a' }}>
              Are you sure you want to delete all {orders.length} orders?
            </Typography>

            {orders.some(order => order.status === 'pending') && (
              <Alert severity="warning" sx={{ mb: 2, fontSize: '12px' }}>
                <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Pending Orders Found:</Typography>
                <Box sx={{ pl: 1 }}>
                  {orders.filter(order => order.status === 'pending').map(order => (
                    <Typography key={order._id} sx={{ fontSize: '12px' }}>
                      • Order #{order.orderNumber} (Table {order.tableNumber})
                    </Typography>
                  ))}
                </Box>
              </Alert>
            )}

            <Typography sx={{ fontSize: '12px', color: '#666' }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialog(false)}>Cancel</Button>
          <Button
            onClick={handleClearAllOrders}
            variant="contained"
            sx={{ bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, color: '#2d5016' }}>Order Note</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: '6px', minHeight: '100px' }}>
            <Typography sx={{ fontSize: '14px', color: '#1a1a1a', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selectedOrderNote}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)} sx={{ color: '#2d5016' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editOrderDialog} onClose={() => setEditOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, color: '#2d5016' }}>
          Edit Order #{editingOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1.5, fontWeight: 500 }}>
              Current Items:
            </Typography>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: '6px', mb: 2 }}>
              {editOrderItems.map((item, index) => (
                <Box key={index}>
                  <ListItem sx={{ py: 1, px: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                        {typeof item.menuItem === 'object' ? item.menuItem.name : 'Item'}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#999' }}>
                        ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateEditItemQuantity(index, item.quantity - 1)}
                        sx={{ color: '#ff6b35' }}
                      >
                        <RemoveIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                      <Typography sx={{ fontSize: '12px', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateEditItemQuantity(index, item.quantity + 1)}
                        sx={{ color: '#ff6b35' }}
                      >
                        <AddIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveEditItem(index)}
                        sx={{ color: '#c62828' }}
                      >
                        <DeleteIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < editOrderItems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>

            {/* Add New Item Section */}
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1.5, fontWeight: 500 }}>
              Add New Item:
            </Typography>
            <Box sx={{ bgcolor: '#f9f9f9', p: 1.5, borderRadius: '6px', mb: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Select Item</InputLabel>
                <Select
                  value={selectedAddItem ? selectedAddItem._id : ''}
                  onChange={(e) => {
                    const item = menuItems.find(m => m._id === e.target.value);
                    setSelectedAddItem(item);
                  }}
                  label="Select Item"
                >
                  {menuItems.map(item => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name} - ₹{item.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="number"
                  label="Qty"
                  size="small"
                  value={addItemQuantity}
                  onChange={(e) => setAddItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, className: 'custom-input' }}
                  sx={{ width: '80px' }}
                />
                <Button
                  onClick={handleAddItemToOrder}
                  variant="contained"
                  size="small"
                  sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a24' }, flex: 1 }}
                >
                  Add Item
                </Button>
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#f0f0f0', p: 1.5, borderRadius: '6px', mb: 2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                New Total: ₹{editOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOrderDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveEditOrder}
            variant="contained"
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a24' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={8000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity={currentNotification?.type || 'info'}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-message': {
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {currentNotification?.title}
          </Typography>
          <Typography variant="body2">
            {currentNotification?.message}
          </Typography>
          {currentNotification?.order && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block">
                Customer: {currentNotification.order.customerName}
              </Typography>
              <Typography variant="caption" display="block">
                Items: {currentNotification.order.items?.length || 0} items
              </Typography>
              <Typography variant="caption" display="block">
                Total: ₹{currentNotification.order.totalAmount}
              </Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>

      {/* Restaurant Settings Dialog */}
      <Dialog open={restaurantDialog} onClose={() => setRestaurantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, color: '#2d5016' }}>Edit Restaurant Information</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Logo Upload */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 1 }}>
                Restaurant Logo
              </Typography>
              {restaurantLogoPreview && (
                <Box
                  component="img"
                  src={restaurantLogoPreview}
                  alt="Logo Preview"
                  sx={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', mb: 1 }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setRestaurantLogoFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRestaurantLogoPreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'block', marginBottom: '16px' }}
              />
            </Box>

            {/* Restaurant Name */}
            <TextField
              fullWidth
              label="Restaurant Name"
              value={restaurantData?.name || ''}
              onChange={(e) => setRestaurantData({...restaurantData, name: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={restaurantData?.email || ''}
              onChange={(e) => setRestaurantData({...restaurantData, email: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Phone */}
            <TextField
              fullWidth
              label="Phone"
              value={restaurantData?.phone || ''}
              onChange={(e) => setRestaurantData({...restaurantData, phone: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Address */}
            <TextField
              fullWidth
              label="Address"
              value={restaurantData?.address || ''}
              onChange={(e) => setRestaurantData({...restaurantData, address: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* City */}
            <TextField
              fullWidth
              label="City"
              value={restaurantData?.city || ''}
              onChange={(e) => setRestaurantData({...restaurantData, city: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Postal Code */}
            <TextField
              fullWidth
              label="Postal Code"
              value={restaurantData?.postalCode || ''}
              onChange={(e) => setRestaurantData({...restaurantData, postalCode: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Country */}
            <TextField
              fullWidth
              label="Country"
              value={restaurantData?.country || ''}
              onChange={(e) => setRestaurantData({...restaurantData, country: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Cuisine Type */}
            <TextField
              fullWidth
              label="Cuisine Type"
              value={restaurantData?.cuisineType || ''}
              onChange={(e) => setRestaurantData({...restaurantData, cuisineType: e.target.value})}
              sx={{ mb: 2 }}
            />

            {/* Color Theme Section */}
            <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#2d5016', mb: 2, mt: 3 }}>
              Theme Colors
            </Typography>

            {/* Primary Color */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 1 }}>
                Primary Color (Buttons, Accents)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="color"
                  value={restaurantData?.primaryColor || '#ff6b35'}
                  onChange={(e) => setRestaurantData({...restaurantData, primaryColor: e.target.value})}
                  style={{
                    width: '50px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <TextField
                  size="small"
                  value={restaurantData?.primaryColor || '#ff6b35'}
                  onChange={(e) => setRestaurantData({...restaurantData, primaryColor: e.target.value})}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Secondary Color */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666', mb: 1 }}>
                Secondary Color (Headings, Text)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="color"
                  value={restaurantData?.secondaryColor || '#2d5016'}
                  onChange={(e) => setRestaurantData({...restaurantData, secondaryColor: e.target.value})}
                  style={{
                    width: '50px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <TextField
                  size="small"
                  value={restaurantData?.secondaryColor || '#2d5016'}
                  onChange={(e) => setRestaurantData({...restaurantData, secondaryColor: e.target.value})}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestaurantDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                setUpdatingRestaurant(true);
                const formData = new FormData();
                formData.append('name', restaurantData?.name || '');
                formData.append('email', restaurantData?.email || '');
                formData.append('phone', restaurantData?.phone || '');
                formData.append('address', restaurantData?.address || '');
                formData.append('city', restaurantData?.city || '');
                formData.append('postalCode', restaurantData?.postalCode || '');
                formData.append('country', restaurantData?.country || '');
                formData.append('cuisineType', restaurantData?.cuisineType || '');
                formData.append('primaryColor', restaurantData?.primaryColor || '#ff6b35');
                formData.append('secondaryColor', restaurantData?.secondaryColor || '#2d5016');

                if (restaurantLogoFile) {
                  formData.append('logo', restaurantLogoFile);
                }

                await axios.put(`${API_BASE}/restaurant`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                setRestaurantDialog(false);
                setRestaurantLogoFile(null);
                setRestaurantLogoPreview(null);
                fetchRestaurantData();

                // Emit socket event to update all connected clients (customer menu)
                if (socket) {
                  socket.emit('restaurant-updated', restaurantData);
                }
              } catch (error) {
                console.error('Error updating restaurant:', error);
                alert('Error: ' + (error.response?.data?.message || error.message));
              } finally {
                setUpdatingRestaurant(false);
              }
            }}
            variant="contained"
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a24' } }}
            disabled={updatingRestaurant}
          >
            {updatingRestaurant ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
