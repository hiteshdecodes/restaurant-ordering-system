import React, { createContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';

export const NotificationContext = createContext();

// Function to play notification sound
const playNotificationSound = () => {
  try {
    // Create a sequence of beeps using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
    console.log('Sound notification failed:', error);
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on initial load
    try {
      const saved = localStorage.getItem('notifications');
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      return [];
    }
  });
  const [socket, setSocket] = useState(null);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);

  useEffect(() => {
    // Connect to Socket.io (use current domain)
    const newSocket = io();
    setSocket(newSocket);

    // Listen for new orders
    newSocket.on('new-order', (order) => {
      const notification = {
        id: Date.now(),
        type: 'new-order',
        title: '🆕 New Order Received!',
        message: `Order ${order.orderNumber} from Table ${order.tableNumber}`,
        order: order,
        seen: false,
        timestamp: new Date()
      };

      setNotifications(prev => [notification, ...prev]);

      // Play notification sound
      playNotificationSound();

      // Don't auto-mark as seen - only mark as seen when user clicks bell icon
    });

    return () => newSocket.close();
  }, []);

  const markNotificationAsSeen = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, seen: true } : notif
      )
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.seen).length;
  }, [notifications]);

  const value = {
    notifications,
    markNotificationAsSeen,
    clearNotification,
    clearAllNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

