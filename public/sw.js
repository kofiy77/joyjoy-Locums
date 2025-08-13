// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('SW: Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received', event);
  
  let notificationData = {};
  
  try {
    notificationData = event.data ? event.data.json() : {
      title: 'JoyJoy Care',
      body: 'You have a new notification',
      icon: '/icons/joyjoy-icon.png'
    };
  } catch (error) {
    console.error('SW: Error parsing push data:', error);
    notificationData = {
      title: 'JoyJoy Care',
      body: 'You have a new notification',
      icon: '/icons/joyjoy-icon.png'
    };
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/joyjoy-icon.png',
    badge: notificationData.badge || '/icons/joyjoy-badge.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    tag: notificationData.tag || 'joyjoy-notification',
    renotify: true,
    requireInteraction: notificationData.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

  // Handle different notification types
  if (data.type) {
    switch (data.type) {
      case 'new_shift':
        url = '/staff/book-shift';
        break;
      case 'shift_cancelled':
      case 'shift_reminder':
        url = '/staff/my-shifts';
        break;
      case 'timesheet_submitted':
        url = '/care-home/timesheets';
        break;
      case 'staff_cancelled':
      case 'urgent_cover':
        url = '/care-home/shifts';
        break;
      default:
        url = '/';
    }
  }

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Use the data URL or default URL
        break;
      case 'accept':
        url = `/staff/book-shift?shift=${data.shiftId}&action=accept`;
        break;
      case 'review':
        url = `/care-home/timesheets/${data.timesheetId}`;
        break;
      case 'find_cover':
      case 'assign':
        url = `/care-home/shifts?shift=${data.shiftId}`;
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('SW: Notification closed', event);
  
  // Track notification dismissal
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Could send analytics data here
    console.log('SW: Notification dismissed:', data.type);
  }
});

// Handle background sync (for offline scenarios)
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks like syncing data
      console.log('SW: Performing background sync...')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('SW: Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_NOTIFICATION_DATA') {
    // Store notification data for offline access
    const data = event.data.payload;
    // Could implement caching logic here
    console.log('SW: Caching notification data:', data);
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('SW: Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
});