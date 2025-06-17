import React, { useEffect } from 'react';

const OrderNotification = () => {
  useEffect(() => {
    // Initialize socket connection
    const socket = io.connect('/');

    // Listen for new orders
    socket.on('newOrder', (order) => {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play();

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Order Received!', {
          body: `Order ID: ${order._id}\nPhone: ${order.phoneNumber}`,
          icon: '/icon.png'
        });
      }
    });

    // Clean up socket connection on unmount
    return () => socket.disconnect();
  }, []);

  return null; // This component doesn't render anything
};

export default OrderNotification;
