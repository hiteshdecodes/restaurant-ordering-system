import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  Chip,
  Divider,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon, Note as NoteIcon, Edit as EditIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { List, ListItem } from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';
import NotificationCenter from './NotificationCenter';
import LoadingAnimation from './LoadingAnimation';
import { NotificationContext } from '../context/NotificationContext';

const TableOrders = () => {
  const [tables, setTables] = useState([]);
  const [tableCategories, setTableCategories] = useState([]);
  const [tableOrders, setTableOrders] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedOrderNote, setSelectedOrderNote] = useState('');
  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedAddItem, setSelectedAddItem] = useState(null);
  const [addItemQuantity, setAddItemQuantity] = useState(1);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    fetchTables();
    fetchAllOrders();

    // Connect to Socket.io (use current domain)
    const newSocket = io();
    setSocket(newSocket);

    // Listen for new orders
    newSocket.on('new-order', (newOrder) => {
      setTableOrders(prev => {
        const updated = { ...prev };
        const tableNum = newOrder.tableNumber;
        if (!updated[tableNum]) {
          updated[tableNum] = [];
        }
        updated[tableNum] = [newOrder, ...updated[tableNum]];
        return updated;
      });

      // Show toast notification
      const notification = {
        id: Date.now(),
        type: 'success',
        title: 'New Order Received!',
        message: `Order ${newOrder.orderNumber} from Table ${newOrder.tableNumber}`,
        order: newOrder
      };

      setCurrentNotification(notification);
      setNotificationOpen(true);
    });

    // Listen for order status updates
    newSocket.on('order-status-updated', (updatedOrder) => {
      setTableOrders(prev => {
        const updated = { ...prev };
        const tableNum = updatedOrder.tableNumber;
        if (updated[tableNum]) {
          updated[tableNum] = updated[tableNum].map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        }
        return updated;
      });
    });

    // Listen for order updates
    newSocket.on('order-updated', (updatedOrder) => {
      setTableOrders(prev => {
        const updated = { ...prev };
        const tableNum = updatedOrder.tableNumber;
        if (updated[tableNum]) {
          updated[tableNum] = updated[tableNum].map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        }
        return updated;
      });
    });

    // Listen for table orders cleared
    newSocket.on('table-orders-cleared', (data) => {
      setTableOrders(prev => ({
        ...prev,
        [data.tableNumber]: []
      }));
    });

    return () => newSocket.close();
  }, []);

  const fetchTables = async () => {
    try {
      const [tablesRes, categoriesRes, menuRes] = await Promise.all([
        axios.get('/api/tables'),
        axios.get('/api/table-categories'),
        axios.get('/api/menu-items')
      ]);
      setTables(tablesRes.data);
      setTableCategories(categoriesRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      const ordersGrouped = {};
      response.data.forEach(order => {
        if (!ordersGrouped[order.tableNumber]) {
          ordersGrouped[order.tableNumber] = [];
        }
        ordersGrouped[order.tableNumber].push(order);
      });
      setTableOrders(ordersGrouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setOrderDialogOpen(true);
  };

  const API_BASE = '/api';

  const handleClearOrderHistory = async (tableNumber) => {
    if (window.confirm(`Clear all orders for Table ${tableNumber}?`)) {
      try {
        await axios.delete(`${API_BASE}/orders/table/${tableNumber}`);
        setTableOrders(prev => ({
          ...prev,
          [tableNumber]: []
        }));
        setOrderDialogOpen(false);
      } catch (error) {
        console.error('Error clearing orders:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        { status: newStatus }
      );
      // Update local state
      setTableOrders(prev => {
        const updated = { ...prev };
        const tableNum = selectedTable.tableNumber;
        if (updated[tableNum]) {
          updated[tableNum] = updated[tableNum].map(order =>
            order._id === orderId ? response.data : order
          );
        }
        return updated;
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditOrderItems(order.items.map(item => ({
      ...item
    })));
    setSelectedAddItem(null);
    setAddItemQuantity(1);
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

      const response = await axios.put(`${API_BASE}/orders/${editingOrder._id}/edit-items`, {
        items: editOrderItems,
        totalAmount: newTotal
      });

      // Update local state
      setTableOrders(prev => {
        const updated = { ...prev };
        const tableNum = selectedTable.tableNumber;
        if (updated[tableNum]) {
          updated[tableNum] = updated[tableNum].map(order =>
            order._id === editingOrder._id ? response.data : order
          );
        }
        return updated;
      });

      setEditOrderDialog(false);
      setEditingOrder(null);
      setEditOrderItems([]);
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

    // Check if item already exists
    const existingItemIndex = editOrderItems.findIndex(
      item => (item.menuItem._id || item.menuItem) === selectedAddItem._id
    );

    if (existingItemIndex > -1) {
      // Item already exists, increase quantity
      const updated = [...editOrderItems];
      updated[existingItemIndex].quantity += addItemQuantity;
      setEditOrderItems(updated);
    } else {
      // Add new item
      setEditOrderItems([
        ...editOrderItems,
        {
          menuItem: selectedAddItem,
          name: selectedAddItem.name,
          price: selectedAddItem.price,
          quantity: addItemQuantity
        }
      ]);
    }

    setSelectedAddItem(null);
    setAddItemQuantity(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'success';
      case 'served':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, px: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#2d5016', mb: 0.5 }}>
              Table Orders
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#999' }}>
              Click on any table to view its order history
            </Typography>
          </Box>
          <NotificationCenter />
        </Box>

        {/* Loading Animation Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.2 }}>
          {[...Array(12)].map((_, i) => (
            <LoadingAnimation key={i} variant="table" height="120px" />
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#2d5016', mb: 0.5 }}>
            Table Orders
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#999' }}>
            Click on any table to view its order history
          </Typography>
        </Box>
        <NotificationCenter />
      </Box>

      {/* Tables Grid - Grouped by Category */}
      <Box>
        {/* Categorized Tables */}
        {tableCategories.map((category) => {
          const tablesInCategory = tables.filter(t => t.category?._id === category._id);
          if (tablesInCategory.length === 0) return null;

          return (
            <Box key={category._id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    bgcolor: category.color || '#ff6b35'
                  }}
                />
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#2d5016' }}>
                  {category.name}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  ({tablesInCategory.length} tables)
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.2 }}>
                {tablesInCategory.sort((a, b) => a.tableNumber - b.tableNumber).map((table) => {
                  const hasOrders = tableOrders[table.tableNumber]?.length > 0;
                  const hasPendingOrders = tableOrders[table.tableNumber]?.some(order =>
                    order.status === 'pending'
                  ) || false;
                  const hasProcessingOrders = tableOrders[table.tableNumber]?.some(order =>
                    order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
                  ) || false;
                  const orderCount = tableOrders[table.tableNumber]?.length || 0;

                  return (
                    <Box key={table._id}>
                      <Box
                        onClick={() => handleTableClick(table)}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: hasOrders ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(255, 107, 53, 0.04) 100%)' : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                          border: '1.5px solid',
                          borderColor: hasOrders ? '#ff6b35' : '#e8e8e8',
                          borderRadius: '8px',
                          boxShadow: hasOrders ? '0 4px 12px rgba(255, 107, 53, 0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
                          padding: '12px',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: hasOrders
                              ? '0 12px 24px rgba(255, 107, 53, 0.2)'
                              : '0 8px 16px rgba(0, 0, 0, 0.12)',
                            borderColor: hasOrders ? '#e55a24' : '#d0d0d0',
                          }
                        }}
                      >
                {/* Status Indicator Dot */}
                {/* Red dot for pending orders */}
                {hasPendingOrders && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 12,
                      height: 12,
                      bgcolor: '#c62828',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(198, 40, 40, 0.7)' },
                        '70%': { boxShadow: '0 0 0 8px rgba(198, 40, 40, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(198, 40, 40, 0)' }
                      }
                    }}
                  />
                )}
                {/* Orange dot for confirmed/preparing/ready orders (only if no pending) */}
                {!hasPendingOrders && hasProcessingOrders && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 12,
                      height: 12,
                      bgcolor: '#ff6b35',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.7)' },
                        '70%': { boxShadow: '0 0 0 8px rgba(255, 107, 53, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)' }
                      }
                    }}
                  />
                )}

                        {/* Main Content - Table Number */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                            minHeight: '40px'
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '32px',
                              color: hasOrders ? '#ff6b35' : '#2d5016',
                              lineHeight: 1
                            }}
                          >
                            {table.tableNumber}
                          </Typography>
                        </Box>

                        {/* Sub Content - Order Count */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '16px'
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: hasOrders ? '#ff6b35' : '#999',
                              fontWeight: 500,
                              textAlign: 'center'
                            }}
                          >
                            {hasOrders ? `${orderCount} order${orderCount > 1 ? 's' : ''}` : 'No orders'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    );
                  })}
              </Box>
            );
          })}

        {/* Uncategorized Tables */}
        {(() => {
          const uncategorizedTables = tables.filter(t => !t.category || !t.category._id);
          if (uncategorizedTables.length === 0) return null;

          return (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    bgcolor: '#999'
                  }}
                />
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#2d5016' }}>
                  Uncategorized
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#999' }}>
                  ({uncategorizedTables.length} tables)
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.2 }}>
                {uncategorizedTables.sort((a, b) => a.tableNumber - b.tableNumber).map((table) => {
                  const hasOrders = tableOrders[table.tableNumber]?.length > 0;
                  const hasPendingOrders = tableOrders[table.tableNumber]?.some(order =>
                    order.status === 'pending'
                  ) || false;
                  const hasProcessingOrders = tableOrders[table.tableNumber]?.some(order =>
                    order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
                  ) || false;
                  const orderCount = tableOrders[table.tableNumber]?.length || 0;

                  return (
                    <Box key={table._id}>
                      <Box
                        onClick={() => handleTableClick(table)}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: hasOrders ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(255, 107, 53, 0.04) 100%)' : 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                          border: '1.5px solid',
                          borderColor: hasOrders ? '#ff6b35' : '#e8e8e8',
                          borderRadius: '8px',
                          boxShadow: hasOrders ? '0 4px 12px rgba(255, 107, 53, 0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
                          padding: '12px',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: hasOrders
                              ? '0 12px 24px rgba(255, 107, 53, 0.2)'
                              : '0 8px 16px rgba(0, 0, 0, 0.12)',
                            borderColor: hasOrders ? '#e55a24' : '#d0d0d0',
                          }
                        }}
                      >
                        {/* Main Content - Table Number */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                            minHeight: '40px'
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '32px',
                              color: hasOrders ? '#ff6b35' : '#2d5016',
                              lineHeight: 1
                            }}
                          >
                            {table.tableNumber}
                          </Typography>
                        </Box>

                        {/* Sub Content - Order Count */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '16px'
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: hasOrders ? '#ff6b35' : '#999',
                              fontWeight: 500,
                              textAlign: 'center'
                            }}
                          >
                            {hasOrders ? `${orderCount} order${orderCount > 1 ? 's' : ''}` : 'No orders'}
                          </Typography>
                        </Box>

                        {hasPendingOrders && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              width: 12,
                              height: 12,
                              bgcolor: '#c62828',
                              borderRadius: '50%',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(198, 40, 40, 0.7)' },
                                '70%': { boxShadow: '0 0 0 8px rgba(198, 40, 40, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(198, 40, 40, 0)' }
                              }
                            }}
                          />
                        )}
                        {!hasPendingOrders && hasProcessingOrders && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              width: 12,
                              height: 12,
                              bgcolor: '#ff6b35',
                              borderRadius: '50%',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.7)' },
                                '70%': { boxShadow: '0 0 0 8px rgba(255, 107, 53, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)' }
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })()}
      </Box>

      {/* Order Details Dialog */}
      <>
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#2d5016',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          py: 0.8,
          px: 1.2
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: '13px' }}>
            Table {selectedTable?.tableNumber} - Order History
          </Typography>
          <IconButton onClick={() => setOrderDialogOpen(false)} size="small" sx={{ color: 'white', fontSize: '16px' }}>
            <CloseIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ maxHeight: '60vh', overflowY: 'auto', pt: 1, px: 1 }}>
          {tableOrders[selectedTable?.tableNumber]?.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '12px' }}>
              No orders for this table yet
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {tableOrders[selectedTable?.tableNumber]?.map((order, index) => (
                <Box
                  key={order._id}
                  sx={{
                    p: 0.8,
                    bgcolor: '#f9f9f9',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: '#e8e8e8',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#ff6b35',
                      boxShadow: '0 3px 8px rgba(255, 107, 53, 0.12)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '11px', color: '#ff6b35' }}>
                      Order #{order.orderNumber}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 600, fontSize: '9px', height: '18px' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6, gap: 0.5 }}>
                    <Typography sx={{ fontSize: '9px', color: '#999', fontWeight: 500 }}>
                      {formatDate(order.createdAt)}
                    </Typography>
                    <Typography sx={{ fontSize: '9px', color: '#999', fontWeight: 500 }}>
                      {formatTime(order.createdAt)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 0.8 }} />

                  {/* Order Items */}
                  <Box sx={{ mb: 0.8 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#666', mb: 0.4, display: 'block', fontSize: '9px' }}>
                      ITEMS
                    </Typography>
                    {order.items.map((item) => (
                      <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4, px: 0.6, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.8, mb: 0.3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '10px' }}>
                            {item.menuItem?.name || item.name}
                          </Typography>
                          <Typography sx={{ color: '#999', fontSize: '8px' }}>
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography fontWeight="bold" sx={{ color: '#ff6b35', ml: 0.5, fontSize: '10px' }}>
                          ₹{item.price * item.quantity}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 0.6 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.8, bgcolor: 'rgba(255, 107, 53, 0.08)', borderRadius: 1, mb: 0.8 }}>
                    <Typography fontWeight="bold" sx={{ fontSize: '10px' }}>
                      Total:
                    </Typography>
                    <Typography fontWeight="bold" sx={{ color: '#ff6b35', fontSize: '11px' }}>
                      ₹{order.totalAmount}
                    </Typography>
                  </Box>

                  {(order.customerName || order.customerPhone) && (
                    <Box sx={{ mb: 0.8 }}>
                      {order.customerName && (
                        <Typography sx={{ display: 'block', fontWeight: 500, fontSize: '9px', color: '#666' }}>
                          Customer: {order.customerName}
                        </Typography>
                      )}
                      {order.customerPhone && (
                        <Typography sx={{ display: 'block', fontWeight: 500, fontSize: '9px', color: '#666' }}>
                          Phone: {order.customerPhone}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Order Note */}
                  {order.specialRequests && (
                    <Box sx={{ mb: 0.8, p: 0.6, bgcolor: '#fff9e6', borderRadius: 1, border: '1px solid #ffe082' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '9px', color: '#666' }}>
                          Note:
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrderNote(order.specialRequests);
                            setNoteDialogOpen(true);
                          }}
                          sx={{ color: '#2d5016', p: 0.3 }}
                          title="View full note"
                        >
                          <NoteIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                      </Box>
                      <Typography sx={{ fontSize: '8px', color: '#666', mt: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.specialRequests.substring(0, 50)}...
                      </Typography>
                    </Box>
                  )}

                  {/* Status Change Dropdown and Edit Button */}
                  <Box sx={{ mb: 0 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#666', mb: 0.4, display: 'block', fontSize: '9px' }}>
                      STATUS & ACTIONS
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditOrder(order)}
                        sx={{ color: '#ff6b35', '&:hover': { bgcolor: '#fff3e0' }, flex: 0 }}
                        title="Edit order items"
                      >
                        <EditIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                      <Select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                          fontSize: '11px',
                          height: '28px',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#ff6b35'
                            },
                            '&:hover fieldset': {
                              borderColor: '#ff6b35'
                            }
                          }
                        }}
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
                          sx={{ fontSize: '9px', height: '20px', bgcolor: '#fff3e0', color: '#ff6b35', flex: 0 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 0.8 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleClearOrderHistory(selectedTable?.tableNumber)}
            disabled={tableOrders[selectedTable?.tableNumber]?.length === 0}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '11px',
              py: 0.5,
              px: 1,
              '&:hover': {
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
              }
            }}
          >
            Clear All
          </Button>
          <Button
            onClick={() => setOrderDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '11px',
              py: 0.5,
              px: 1,
              borderColor: '#ff6b35',
              color: '#ff6b35',
              '&:hover': {
                bgcolor: 'rgba(255, 107, 53, 0.05)',
                borderColor: '#667eea'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2d5016' }}>Order Note</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 600, color: '#2d5016' }}>
          Edit Order #{editingOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1.5 }}>
              Order Items:
            </Typography>
            <List sx={{ bgcolor: '#f9f9f9', borderRadius: '6px', mb: 2 }}>
              {editOrderItems.map((item, index) => (
                <Box key={index}>
                  <ListItem sx={{ py: 1, px: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                        {typeof item.menuItem === 'object' ? item.menuItem.name : item.name || 'Item'}
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
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1.5, fontWeight: 600 }}>
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
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
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
      </>
    </Container>
  );
};

export default TableOrders;

