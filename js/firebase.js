// /js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfAmdBLQtCcGr_X960uFjrdfHztk0o2Zg",
  authDomain: "health-check-e1d7f.firebaseapp.com",
  projectId: "health-check-e1d7f",
  storageBucket: "health-check-e1d7f.firebasestorage.app",
  messagingSenderId: "630517879928",
  appId: "1:630517879928:web:8158bddf46358977cf898d",
  measurementId: "G-LDNJFTF8XY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Use your actual VAPID key here
      const token = await getToken(messaging, { 
        vapidKey: 'YOUR_VAPID_KEY_HERE' 
      });
      console.log('FCM Token:', token);
      localStorage.setItem('fcmToken', token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return false;
  }
};

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  // Display the notification
  const notification = new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png'
  });
  
  notification.onclick = () => {
    window.focus();
  };
});