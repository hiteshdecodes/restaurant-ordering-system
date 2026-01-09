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
  Drawer,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Whatshot as SpicyIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import LoadingAnimation from './LoadingAnimation';
import vegIcon from '../veg icon.png';
import nonVegIcon from '../non veg.png';
import { useTheme } from '../context/ThemeContext';

const CustomerMenu = () => {
  const { updateColors, restaurantColors } = useTheme();
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
  const [clearCartConfirm, setClearCartConfirm] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [restaurantData, setRestaurantData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const categoryRefs = useRef({});

  // Use theme colors from context
  const primaryColor = restaurantColors.primaryColor;
  const secondaryColor = restaurantColors.secondaryColor;

  const API_BASE = 'https://restaurant-ordering-system-5jxm.onrender.com/api';

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
    fetchRestaurantData();
  }, []);

  // Fetch restaurant data
  const fetchRestaurantData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/restaurant`);
      setRestaurantData(response.data);
      // Apply theme colors from restaurant data
      if (response.data.primaryColor && response.data.secondaryColor) {
        updateColors(response.data.primaryColor, response.data.secondaryColor);
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  // Setup socket connection for real-time restaurant updates
  useEffect(() => {
    console.log('🔌 CustomerMenu: Setting up socket connection...');
    const newSocket = io('https://restaurant-ordering-system-5jxm.onrender.com');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ CustomerMenu: Socket connected with ID:', newSocket.id);
    });

    // Listen for restaurant updates from dashboard
    newSocket.on('restaurant-updated', (updatedData) => {
      console.log('📡 CustomerMenu: Received restaurant-updated event:', updatedData);
      setRestaurantData(updatedData);
      // Update theme colors when restaurant data changes
      if (updatedData.primaryColor && updatedData.secondaryColor) {
        console.log('🎨 CustomerMenu: Updating colors to:', updatedData.primaryColor, updatedData.secondaryColor);
        updateColors(updatedData.primaryColor, updatedData.secondaryColor);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ CustomerMenu: Socket disconnected');
    });

    return () => {
      console.log('🔌 CustomerMenu: Closing socket connection');
      newSocket.close();
    };
  }, [updateColors]);

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

  // Initialize expanded categories
  useEffect(() => {
    const initialExpanded = {};
    categories.forEach(cat => {
      initialExpanded[cat._id] = true; // All categories expanded by default
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

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

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
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
        {/* Header with Logo and Restaurant Name */}
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, gap: 1.5 }}>
          {/* Logo Section */}
          {restaurantData?.logo && (
            <Box
              component="img"
              src={restaurantData.logo}
              alt="Restaurant Logo"
              sx={{
                width: 60,
                height: 60,
                borderRadius: '8px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
          )}

          {/* Restaurant Name and Table Info */}
          <Box sx={{ textAlign: 'left', flex: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 500, color: secondaryColor, fontSize: '18px' }}>
              {restaurantData?.name || 'Restaurant Menu'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '12px', fontWeight: 400 }}>
              Table {tableNumber}
            </Typography>
          </Box>

          {/* Logout Button */}
          {customerData && (
            <Button
              variant="contained"
              onClick={handleCustomerLogout}
              size="small"
              sx={{
                bgcolor: primaryColor,
                color: 'white',
                textTransform: 'none',
                fontSize: '12px',
                py: 0.5,
                px: 1.5,
                '&:hover': { bgcolor: `${primaryColor}dd` }
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
                  borderRadius: '6px',
                  fontWeight: 400
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
                  backgroundColor: primaryColor,
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
                    color: primaryColor,
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
                  backgroundColor: secondaryColor,
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                  {categoryData.name}
                </Typography>
                {expandedCategories[categoryId] ? <ExpandLessIcon sx={{ fontSize: '20px' }} /> : <ExpandMoreIcon sx={{ fontSize: '20px' }} />}
              </Box>

              {/* Category Items */}
              <Collapse in={expandedCategories[categoryId]} timeout="auto" unmountOnExit>
              <Box>
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
                              <Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#1a1a1a' }}>
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
                                  color: '#c62828',
                                  fontWeight: 400
                                }}
                              />
                            )}
                          </Box>

                          <Typography sx={{ fontSize: '11px', color: '#999', my: 0.3, lineHeight: 1.3, justifySelf: 'start', fontWeight: 400 }}>
                            {item.description}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '13px', color: primaryColor }}>
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
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  fontSize: '14px',
                                  '&:hover': { bgcolor: `${primaryColor}15` }
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
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  fontSize: '14px',
                                  '&:hover': { bgcolor: `${primaryColor}15` }
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
              bgcolor: primaryColor,
              color: 'white',
              '&:hover': { bgcolor: `${primaryColor}dd` }
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
          <Box sx={{ p: 1.2, borderBottom: `2px solid ${secondaryColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: secondaryColor }}>Your Order - Table {tableNumber}</Typography>
            {cart.length > 0 && (
              <IconButton
                size="small"
                onClick={handleClearCart}
                sx={{ color: primaryColor }}
                title="Clear cart"
              >
                <DeleteIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            )}
          </Box>

          {/* Main scrollable content - merged into one */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.2, pb: 0 }}>
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: '#999' }}>
                <Typography sx={{ fontSize: '13px' }}>Your cart is empty</Typography>
              </Box>
            ) : (
              <>
                {/* Cart Items */}
                <List sx={{ width: '100%', p: 0, mb: 1.2 }}>
                  {cart.map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, py: 1, px: 0 }}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{item.name}</Typography>
                          <Typography sx={{ color: '#999', fontSize: '12px', fontWeight: 400 }}>₹{item.price} each</Typography>
                        </Box>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => removeFromCart(item._id)} sx={{ p: 0.3 }}>
                              <RemoveIcon sx={{ fontSize: '14px', color: primaryColor }} />
                            </IconButton>
                            <Typography sx={{ minWidth: 24, textAlign: 'center', fontSize: '12px', fontWeight: 500 }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => addToCart(item)} sx={{ p: 0.3 }}>
                              <AddIcon sx={{ fontSize: '14px', color: primaryColor }} />
                            </IconButton>
                          </Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '12px', color: primaryColor }}>₹{item.price * item.quantity}</Typography>
                        </Box>
                      </ListItem>
                      <Divider sx={{ my: 0.5 }} />
                    </React.Fragment>
                  ))}
                </List>

                {/* Customer Info Card */}
                {customerData && (
                  <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: secondaryColor, mb: 0.8 }}>
                      Order Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>
                        Name: <span style={{ fontWeight: 500 }}>{customerData.name}</span>
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>
                        Phone: <span style={{ fontWeight: 500 }}>{customerData.phone}</span>
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>
                        Table: <span style={{ fontWeight: 500 }}>{tableNumber}</span>
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Payment Details Card */}
                <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: secondaryColor, mb: 0.8 }}>
                    Payment Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                      <Typography sx={{ fontWeight: 400 }}>Subtotal</Typography>
                      <Typography sx={{ fontWeight: 400 }}>₹{getTotalAmount().toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                      <Typography sx={{ fontWeight: 400 }}>Taxes & Charges</Typography>
                      <Typography sx={{ fontWeight: 400 }}>Included</Typography>
                    </Box>
                    <Box sx={{ borderTop: '1px solid #eee', pt: 0.6, mt: 0.6, display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: secondaryColor }}>
                      <Typography sx={{ fontWeight: 500 }}>Total Amount</Typography>
                      <Typography sx={{ color: primaryColor, fontSize: '13px', fontWeight: 500 }}>₹{getTotalAmount().toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Fixed bottom section - Special Instructions and Action Button */}
          <Box sx={{ p: 1.2, borderTop: '1px solid #eee', bgcolor: '#fafafa', flexShrink: 0 }}>
            {/* Special Instructions - One liner */}
            <Box sx={{ mb: 1.2, p: 1.2, bgcolor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: secondaryColor, mb: 0.8 }}>
                Special Instructions
              </Typography>
              <TextField
                fullWidth
                placeholder="Add special instructions (optional)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value.slice(0, 150))}
                size="small"
                helperText={`${orderNote.length}/150 characters`}
                sx={{
                  fontSize: '12px',
                  fontWeight: 400,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    bgcolor: '#fafafa',
                    fontWeight: 400
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '10px',
                    color: '#999',
                    fontWeight: 400
                  }
                }}
              />
            </Box>

            {/* Action Button - Total Amount + Place Order */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ flex: 0.4, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 400, mb: 0.3 }}>Total</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 500, color: primaryColor }}>
                  ₹{getTotalAmount().toFixed(2)}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                sx={{
                  fontSize: '13px',
                  py: 1,
                  textTransform: 'none',
                  bgcolor: primaryColor,
                  color: 'white',
                  fontWeight: 500,
                  '&:hover': { bgcolor: `${primaryColor}dd` }
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
