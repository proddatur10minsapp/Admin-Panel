// Add this script to your admin panel layout
const socket = io();
const audio = new Audio('/notification.mp3');

// Check for notification permission
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

socket.on('newOrder', function(order) {
  // Play sound
  audio.play();

  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification('New Order!', {
      body: `Order ID: ${order._id}\nPhone: ${order.phoneNumber}`,
    });
  }

  // You can also update the UI here if needed
  console.log('New order received:', order);
});
