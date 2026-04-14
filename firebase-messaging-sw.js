// QR Collections — Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA_nJVzzbNsTLwNGwxZaf8RpaniXDMETFM",
  authDomain: "dsm-qr-notifications.firebaseapp.com",
  projectId: "dsm-qr-notifications",
  storageBucket: "dsm-qr-notifications.firebasestorage.app",
  messagingSenderId: "522523299808",
  appId: "1:522523299808:web:9f86a2eafa2fe054446585"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed/minimized)
messaging.onBackgroundMessage(payload => {
  console.log('[FCM] Background message:', payload);
  const { title, body, icon, link } = payload.data || {};
  self.registration.showNotification(title || 'QR Collections', {
    body: body || 'New entry saved',
    icon: icon || '/qr-collections/qr-icon-192.png',
    badge: '/qr-collections/qr-icon-192.png',
    tag: 'qr-notification',
    data: payload.data || {}
  });
});

// Keep existing cache logic
const CACHE_NAME = 'qr-collections-v2';
const ASSETS = [
  '/qr-collections/index.html',
  '/qr-collections/qr-manifest.json',
  '/qr-collections/qr-icon-192.png',
  '/qr-collections/qr-icon-512.png',
  '/qr-collections/firebase-messaging-sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
