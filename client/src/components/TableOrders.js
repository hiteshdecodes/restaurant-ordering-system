import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon, Note as NoteIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import NotificationCenter from './NotificationCenter';

const TableOrders = () => {
  const [tables, setTables] = useState([]);
  const [tableOrders, setTableOrders] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedOrderNote, setSelectedOrderNote] = useState('');

  useEffect(() => {
    fetchTables();
    fetchAllOrders();

    // Connect to Socket.io
    const socketUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl);
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
      const response = await axios.get('/api/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
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

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setOrderDialogOpen(true);
  };

  const handleClearOrderHistory = async (tableNumber) => {
    if (window.confirm(`Clear all orders for Table ${tableNumber}?`)) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        await axios.delete(`${apiUrl}/orders/table/${tableNumber}`);
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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.put(
        `${apiUrl}/orders/${orderId}/status`,
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading tables...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Tables Grid */}
      <Grid container spacing={1.2}>
        {tables.sort((a, b) => a.tableNumber - b.tableNumber).map((table) => {
          const hasOrders = tableOrders[table.tableNumber]?.length > 0;
          const hasPendingOrders = tableOrders[table.tableNumber]?.some(order =>
            order.status === 'pending'
          ) || false;
          const hasProcessingOrders = tableOrders[table.tableNumber]?.some(order =>
            order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
          ) || false;
          const orderCount = tableOrders[table.tableNumber]?.length || 0;

          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={table._id}>
              <Box
                onClick={() => handleTableClick(table)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: hasOrders ? 'rgba(255, 107, 53, 0.08)' : '#fafafa',
                  border: '1.5px solid',
                  borderColor: hasOrders ? '#ff6b35' : '#e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: hasOrders
                      ? '0 8px 16px rgba(255, 107, 53, 0.2)'
                      : '0 6px 12px rgba(0, 0, 0, 0.12)',
                    borderColor: hasOrders ? '#e55a24' : '#bdbdbd',
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

                <CardContent sx={{ textAlign: 'center', p: 1.2, width: '100%' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '24px',
                      color: hasOrders ? '#ff6b35' : '#2d5016',
                      mb: 0.5
                    }}
                  >
                    {table.tableNumber}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: hasOrders ? '#ff6b35' : '#999',
                      fontWeight: 500
                    }}
                  >
                    {hasOrders ? `${orderCount} order${orderCount > 1 ? 's' : ''}` : 'No orders'}
                  </Typography>
                </CardContent>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Order Details Dialog */}
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

                  {/* Status Change Dropdown */}
                  <Box sx={{ mb: 0 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#666', mb: 0.4, display: 'block', fontSize: '9px' }}>
                      STATUS
                    </Typography>
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
    </Container>
  );
};

export default TableOrders;

