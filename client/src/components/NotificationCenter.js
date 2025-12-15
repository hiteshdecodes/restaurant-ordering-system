import React, { useContext, useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { NotificationContext } from '../context/NotificationContext';

const NotificationCenter = () => {
  const { notifications, markNotificationAsSeen, clearNotification, getUnreadCount } = useContext(NotificationContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = getUnreadCount();

  // Mark all unread notifications as seen when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      notifications.forEach(notif => {
        if (!notif.seen) {
          markNotificationAsSeen(notif.id);
        }
      });
    }
  }, [drawerOpen, notifications, markNotificationAsSeen]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleCheckNow = (notification) => {
    markNotificationAsSeen(notification.id);
    // You can add navigation logic here if needed
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <IconButton
        onClick={handleDrawerOpen}
        sx={{
          position: 'relative',
          color: unreadCount > 0 ? '#ff6b35' : '#666',
          fontSize: '20px'
        }}
      >
        <Badge badgeContent={unreadCount} sx={{ '& .MuiBadge-badge': { backgroundColor: '#c62828', color: 'white', fontWeight: 600, fontSize: '10px' } }}>
          <NotificationIcon sx={{ fontSize: '20px' }} />
        </Badge>
      </IconButton>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            maxWidth: '90vw',
            borderRadius: '8px 0 0 8px'
          }
        }}
      >
        <Box sx={{ p: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8', bgcolor: '#2d5016' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
            Notifications
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: 'white', fontSize: '16px' }}>
            <CloseIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>

        {/* Notifications List */}
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '12px', color: '#999' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {/* Unread Notifications */}
              {notifications.filter(n => !n.seen).length > 0 && (
                <>
                  <Box sx={{ p: 1, px: 1.5, bgcolor: '#f9f9f9' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      UNREAD
                    </Typography>
                  </Box>
                  {notifications.filter(n => !n.seen).map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        bgcolor: 'rgba(255, 107, 53, 0.06)',
                        borderLeft: '3px solid #ff6b35',
                        mb: 0.8,
                        mx: 0.8,
                        borderRadius: '4px',
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '12px', color: '#1a1a1a' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '11px', color: '#666', lineHeight: 1.3 }}>
                              {notification.message}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: '#999', display: 'block', mt: 0.3 }}>
                              {formatTime(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          mt: 0.6,
                          bgcolor: '#ff6b35',
                          color: 'white',
                          fontSize: '10px',
                          py: 0.3,
                          px: 1,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#e55a24' },
                          alignSelf: 'flex-end'
                        }}
                        onClick={() => handleCheckNow(notification)}
                      >
                        Check
                      </Button>
                    </ListItem>
                  ))}
                </>
              )}

              {/* Seen Notifications */}
              {notifications.filter(n => n.seen).length > 0 && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ p: 1, px: 1.5, bgcolor: '#f9f9f9' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      SEEN
                    </Typography>
                  </Box>
                  {notifications.filter(n => n.seen).map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        bgcolor: '#fafafa',
                        opacity: 0.8,
                        mb: 0.8,
                        mx: 0.8,
                        borderRadius: '4px',
                        p: 1,
                        borderLeft: '3px solid #ddd',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '12px', color: '#999' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '11px', color: '#bbb', lineHeight: 1.3 }}>
                              {notification.message}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: '#ccc', display: 'block', mt: 0.3 }}>
                              {formatTime(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => clearNotification(notification.id)}
                        sx={{ mt: 0.5, color: '#ccc', fontSize: '14px', alignSelf: 'flex-end' }}
                      >
                        <CloseIcon sx={{ fontSize: '14px' }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter;

