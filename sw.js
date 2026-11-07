const CACHE_NAME = 'er-med-queue-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './tv_dashboard_2.html',
    './manifest.json',
    './logo_ER.ico',
    './logo_ER.jpg'
];

// ติดตั้ง Service Worker และบันทึกไฟล์แคช
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ล้างแคชเวอร์ชันเก่า
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// จัดการการดึงข้อมูล (Network First สำหรับ API, Cache First สำหรับไฟล์หน้าเว็บ)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // การเรียก Google Apps Script ให้วิ่งผ่าน Network เสมอ
    if (url.hostname.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});