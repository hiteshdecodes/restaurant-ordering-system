import React, { useState, useEffect, useRef } from 'react';
import CustomerAuth from './CustomerAuth';
import {
  Container,
  Typography,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  IconButton,
  Divider,
  Collapse,
  Drawer
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Whatshot as SpicyIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import LoadingAnimation from './LoadingAnimation';
import vegIcon from '../veg icon.png';
import nonVegIcon from '../non veg.png';

const CustomerMenu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Used in menu items rendering
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [clearCartConfirm, setClearCartConfirm] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const categoryRefs = useRef({});

  const API_BASE = '/api';

  // Auto-logout customer after 2 hours of inactivity (customer side only, not dashboard)
  useEffect(() => {
    let timeoutId;
    const CUSTOMER_SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

    const resetCustomerTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleCustomerLogout();
      }, CUSTOMER_SESSION_DURATION);
    };

    // Reset on user activity
    window.addEventListener('mousedown', resetCustomerTimeout);
    window.addEventListener('keydown', resetCustomerTimeout);
    window.addEventListener('scroll', resetCustomerTimeout);
    window.addEventListener('touchstart', resetCustomerTimeout);

    resetCustomerTimeout(); // Initial setup

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousedown', resetCustomerTimeout);
      window.removeEventListener('keydown', resetCustomerTimeout);
      window.removeEventListener('scroll', resetCustomerTimeout);
      window.removeEventListener('touchstart', resetCustomerTimeout);
    };
  }, []);

  // Validate table exists
  const validateTable = async (tableNum) => {
    try {
      const response = await axios.get(`${API_BASE}/tables`);
      const tables = response.data;
      const tableExists = tables.some(t => t.tableNumber === tableNum);

      if (!tableExists) {
        alert(`Table ${tableNum} does not exist. Please use a valid table number.`);
        window.location.href = '/';
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating table:', error);
      return true; // Allow access if validation fails
    }
  };

  useEffect(() => {
    // Get table number from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table') || '1';

    // Validate table exists
    validateTable(table).then(isValid => {
      if (isValid) {
        setTableNumber(table);
      }
    });

    // Check for existing customer authentication
    const savedCustomer = localStorage.getItem('customerData');
    if (savedCustomer) {
      const customer = JSON.parse(savedCustomer);
      setCustomerData(customer);
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
    } else {
      // Show authentication dialog for new customers
      setAuthOpen(true);
    }

    fetchCategories();
    fetchMenuItems();
  }, []);

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (searchQuery) return; // Don't update tab when searching

      const categoryElements = Object.entries(categoryRefs.current);
      for (let [categoryId, element] of categoryElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            const categoryIndex = categories.findIndex(c => c._id === categoryId);
            if (categoryIndex !== -1) {
              setSelectedCategory(categoryIndex);
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery, categories]);

  // Initialize expanded categories
  useEffect(() => {
    const initialExpanded = {};
    categories.forEach(cat => {
      initialExpanded[cat._id] = true; // All categories expanded by default
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

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
      const response = await axios.get(`${API_BASE}/menu-items`);
      setMenuItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const getCartItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem._id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem._id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem._id !== itemId));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleAuthenticated = (customer) => {
    setCustomerData(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setAuthOpen(false);
  };

  // Logout customer
  const handleCustomerLogout = () => {
    localStorage.removeItem('customerData');
    setCustomerData(null);
    setCustomerName('');
    setCustomerPhone('');
    setCart([]);
    // Don't open auth dialog - just clear the data
    // User will see the logout button disappear
  };

  // Get items grouped by category with search filter
  const getGroupedItems = () => {
    const filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = {};
    categories.forEach(cat => {
      const categoryItems = filtered.filter(item => item.category._id === cat._id);
      // Only include categories that have items
      if (categoryItems.length > 0) {
        grouped[cat._id] = {
          name: cat.name,
          items: categoryItems
        };
      }
    });
    return grouped;
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Scroll to category section
  const scrollToCategory = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Expand the category if collapsed
      if (!expandedCategories[categoryId]) {
        toggleCategory(categoryId);
      }
    }
  };

  // Clear cart with confirmation
  const handleClearCart = () => {
    setClearCartConfirm(true);
  };

  const confirmClearCart = () => {
    setCart([]);
    setOrderNote('');
    setClearCartConfirm(false);
    setCartOpen(false);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    // Check if customer is authenticated
    if (!customerData) {
      setAuthOpen(true);
      return;
    }

    try {
      const orderData = {
        tableNumber: String(tableNumber),
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || '',
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          specialInstructions: orderNote || ''
        })),
        totalAmount: parseFloat(getTotalAmount()),
        specialRequests: orderNote || ''
      };

      console.log('Sending order data:', orderData);
      const response = await axios.post(`${API_BASE}/orders`, orderData);
      console.log('Order created successfully:', response.data);
      setOrderSuccess(true);
      setCart([]);
      setOrderNote('');
      setCartOpen(false);
      // Close success modal after 5 seconds
      setTimeout(() => {
        setOrderSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error placing order:', error.response?.data || error.message);
      alert('Failed to place order: ' + (error.response?.data?.message || error.message));
    }
  };



    return (
      <Container maxWidth="lg" sx={{ mt: 1, mb: 10, px: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          <Box sx={{ textAlign: 'left', flex: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: '#2d5016', fontSize: '18px' }}>
              Restaurant Menu
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
              Table {tableNumber}
            </Typography>
          </Box>
          {customerData && (
            <Button
              variant="contained"
              onClick={handleCustomerLogout}
              size="small"
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                textTransform: 'none',
                fontSize: '12px',
                py: 0.5,
                px: 1.5,
                '&:hover': { bgcolor: '#e55a24' }
              }}
              startIcon={<LogoutIcon sx={{ fontSize: '16px' }} />}
            >
              Logout
            </Button>
          )}
        </Box>



        {/* Sticky Search Bar and Category Tabs */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 100, bgcolor: 'background.default', pb: 1 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 1, display: 'flex', gap: 0.5 }}>
            <TextField
              fullWidth
              placeholder="Search item"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.5, color: '#999', fontSize: '18px' }} />,
                endAdornment: searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0 }}
                  >
                    <ClearIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                ),
              }}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '13px',
                  height: '36px',
                  borderRadius: '6px'
                }
              }}
            />
          </Box>

          {/* Category Tabs */}
          <Box sx={{ borderBottom: '1px solid #eee' }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, newValue) => {
                setSelectedCategory(newValue);
                const categoryId = categories[newValue]?._id;
                if (categoryId) {
                  scrollToCategory(categoryId);
                }
              }}
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
                    fontWeight: 600
                  }
                }
              }}
            >
              {categories.map((category) => (
                <Tab key={category._id} label={category.name} />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Menu Items List - Grouped by Category */}
        <Box>
          {loading ? (
            <Box sx={{ mb: 2 }}>
              {[...Array(8)].map((_, i) => (
                <LoadingAnimation key={i} variant="menu-row" height="80px" width="100%" />
              ))}
            </Box>
          ) : Object.entries(getGroupedItems()).length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">No items found matching your search</Typography>
            </Box>
          ) : (
            Object.entries(getGroupedItems()).map(([categoryId, categoryData]) => (
            <Box key={categoryId} ref={el => categoryRefs.current[categoryId] = el} sx={{ mb: 1 }}>
              {/* Category Header with Expand/Collapse */}
              <Box
                onClick={() => toggleCategory(categoryId)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.2,
                  backgroundColor: '#2d5016',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#1f3810' },
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                  {categoryData.name}
                </Typography>
                {expandedCategories[categoryId] ? <ExpandLessIcon sx={{ fontSize: '20px' }} /> : <ExpandMoreIcon sx={{ fontSize: '20px' }} />}
              </Box>

              {/* Category Items */}
              <Collapse in={expandedCategories[categoryId]} timeout="auto" unmountOnExit>
                <Box>
                  {categoryData.items.length > 0 ? (
                    categoryData.items.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          p: 1.2,
                          borderBottom: '1px solid #f0f0f0',
                          gap: 1.2,
                          '&:hover': { backgroundColor: '#fafafa' },
                        }}
                      >
                        {/* Item Image */}
                        <Box
                          component="img"
                          src={item.image || '/api/placeholder/80/60'}
                          alt={item.name}
                          sx={{
                            width: 70,
                            height: 60,
                            borderRadius: '6px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />

                        {/* Item Info */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              {item.isVegetarian && (
                                <Box
                                  component="img"
                                  src={vegIcon}
                                  alt="Vegetarian"
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              {!item.isVegetarian && (
                                <Box
                                  component="img"
                                  src={nonVegIcon}
                                  alt="Non-Vegetarian"
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a' }}>
                                {item.name}
                              </Typography>
                            </Box>
                            {item.isSpicy && (
                              <Chip
                                icon={<SpicyIcon />}
                                label="Spicy"
                                size="small"
                                sx={{
                                  height: '20px',
                                  fontSize: '10px',
                                  bgcolor: '#ffebee',
                                  color: '#c62828'
                                }}
                              />
                            )}
                          </Box>

                          <Typography sx={{ fontSize: '11px', color: '#999', my: 0.3, lineHeight: 1.3, justifySelf: 'start' }}>
                            {item.description}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#ff6b35' }}>
                              ₹{item.price}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => removeFromCart(item._id)}
                                disabled={!getCartItemQuantity(item._id)}
                                sx={{
                                  minWidth: '24px',
                                  width: '24px',
                                  height: '24px',
                                  p: 0,
                                  borderColor: '#ff6b35',
                                  color: '#ff6b35',
                                  fontSize: '14px',
                                  '&:hover': { bgcolor: '#fff3e0' }
                                }}
                              >
                                <RemoveIcon sx={{ fontSize: '14px' }} />
                              </Button>
                              <Typography sx={{ minWidth: 18, textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>
                                {getCartItemQuantity(item._id) || 0}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => addToCart(item)}
                                disabled={!item.isAvailable}
                                sx={{
                                  minWidth: '24px',
                                  width: '24px',
                                  height: '24px',
                                  p: 0,
                                  borderColor: '#ff6b35',
                                  color: '#ff6b35',
                                  fontSize: '14px',
                                  '&:hover': { bgcolor: '#fff3e0' }
                                }}
                              >
                                <AddIcon sx={{ fontSize: '14px' }} />
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">No items found in this category</Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
            ))
          )}
        </Box>


        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <Fab
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: '#ff6b35',
              color: 'white',
              '&:hover': { bgcolor: '#e55a24' }
            }}
            onClick={() => setCartOpen(true)}
          >
            <Badge badgeContent={getTotalItems()} sx={{ '& .MuiBadge-badge': { bgcolor: '#c62828', color: 'white' } }}>
              <CartIcon />
            </Badge>
          </Fab>
        )}

        {/* Cart Drawer - Bottom Sheet */}
        <Drawer
          anchor="bottom"
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <Box sx={{ p: 1.2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>Your Order - Table {tableNumber}</Typography>
            {cart.length > 0 && (
              <IconButton
                size="small"
                onClick={handleClearCart}
                sx={{ color: '#ff6b35' }}
                title="Clear cart"
              >
                <DeleteIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            )}
          </Box>



          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.2 }}>
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: '#999' }}>
                <Typography sx={{ fontSize: '13px' }}>Your cart is empty</Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', p: 0 }}>
                {cart.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, py: 1, px: 0 }}>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</Typography>
                        <Typography sx={{ color: '#999', fontSize: '12px' }}>₹{item.price} each</Typography>
                      </Box>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => removeFromCart(item._id)} sx={{ p: 0.3 }}>
                            <RemoveIcon sx={{ fontSize: '14px', color: '#ff6b35' }} />
                          </IconButton>
                          <Typography sx={{ minWidth: 24, textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => addToCart(item)} sx={{ p: 0.3 }}>
                            <AddIcon sx={{ fontSize: '14px', color: '#ff6b35' }} />
                          </IconButton>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '12px', color: '#ff6b35' }}>₹{item.price * item.quantity}</Typography>
                      </Box>
                    </ListItem>
                    <Divider sx={{ my: 0.5 }} />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ p: 1.2, borderTop: '1px solid #eee', bgcolor: '#fafafa', overflowY: 'auto' }}>
            {/* Customer Info Card */}
            {customerData && (
              <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2d5016', mb: 0.8 }}>
                  Order Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>
                    Name: <strong>{customerData.name}</strong>
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>
                    Phone: <strong>{customerData.phone}</strong>
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>
                    Table: <strong>{tableNumber}</strong>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Shipping Card */}
            <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2d5016', mb: 0.8 }}>
                Delivery
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: '32px', height: '32px', bgcolor: '#f0f0f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '16px' }}>🚚</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>
                    Dine-in at Table {tableNumber}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', color: '#999' }}>
                    Ready in ~30 minutes
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Promo Code Card */}
            <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2d5016', mb: 0.8 }}>
                Promo Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.6 }}>
                <TextField
                  placeholder="Enter code"
                  size="small"
                  sx={{
                    flex: 1,
                    fontSize: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      height: '32px'
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    py: 0.5,
                    px: 1.2,
                    '&:hover': { bgcolor: '#fff3e0' }
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>

            {/* Special Instructions Card */}
            <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2d5016', mb: 0.8 }}>
                Special Instructions
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add special instructions or notes (optional)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value.slice(0, 150))}
                size="small"
                helperText={`${orderNote.length}/150 characters`}
                sx={{
                  fontSize: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    bgcolor: '#fafafa'
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '10px',
                    color: '#999'
                  }
                }}
              />
            </Box>

            {/* Payment Details Card */}
            <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2d5016', mb: 0.8 }}>
                Payment Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{getTotalAmount().toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                  <Typography>Taxes & Charges</Typography>
                  <Typography>₹0.00</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                  <Typography>Delivery Fee</Typography>
                  <Typography>₹0.00</Typography>
                </Box>
                <Box sx={{ borderTop: '1px solid #eee', pt: 0.6, mt: 0.6, display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#2d5016' }}>
                  <Typography>Total Amount</Typography>
                  <Typography sx={{ color: '#ff6b35', fontSize: '13px' }}>₹{getTotalAmount().toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setCartOpen(false)}
                sx={{
                  fontSize: '12px',
                  py: 0.8,
                  textTransform: 'none',
                  borderColor: '#ddd',
                  color: '#666',
                  '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' }
                }}
              >
                Continue Shopping
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                sx={{
                  fontSize: '12px',
                  py: 0.8,
                  textTransform: 'none',
                  bgcolor: '#ff6b35',
                  color: 'white',
                  '&:hover': { bgcolor: '#e55a24' }
                }}
              >
                Place Order
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Order Success Modal - Full Screen */}
        <Dialog
          open={orderSuccess}
          onClose={() => setOrderSuccess(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              bgcolor: '#f0f9ff',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={() => setOrderSuccess(false)}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
              }}
            >
              <ClearIcon />
            </IconButton>

            {/* Large Green Checkmark */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                animation: 'scaleIn 0.6s ease-out',
                '@keyframes scaleIn': {
                  '0%': { transform: 'scale(0)', opacity: 0 },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, color: 'white' }} />
            </Box>

            {/* Success Text */}
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1, color: '#1b5e20' }}
            >
              Order Placed Successfully!
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#558b2f', mb: 3 }}
            >
              Your order will be prepared shortly.
            </Typography>

            {/* Auto-close info */}
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              This will close automatically
            </Typography>
          </Box>
        </Dialog>

        {/* Clear Cart Confirmation Dialog */}
        <Dialog open={clearCartConfirm} onClose={() => setClearCartConfirm(false)}>
          <DialogTitle>Clear Cart?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearCartConfirm(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmClearCart}
            >
              Clear Cart
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customer Authentication */}
        <CustomerAuth
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      </Container>
    );
  };

  export default CustomerMenu;
