const CACHE = 'restaurant-cache-1';
const CACHE_VERSION = '1';

self.addEventListener('install', function (event) {
    console.log('installing SW');

    event.waitUntil(precache());

    console.log('finished installing SW');

});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key, i) {
                if (!key.endsWith(CACHE_VERSION)) {
                    return caches.delete(keys[i]);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log('SW serving asset');
    const URL = event.request.url;

    event.respondWith(fromNetwork(event.request, 400).catch(function() {
        return fromCache(event.request)
    }));
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            '/css/styles.css',
            '/js/dbhelper.js',
            '/js/main.js',
            '/js/restaurant_info.js',
            '/index.html',
            '/restaurant.html',
            '/img/1.jpg',
            '/img/2.jpg',
            '/img/3.jpg',
            '/img/4.jpg',
            '/img/5.jpg',
            '/img/6.jpg',
            '/img/7.jpg',
            '/img/8.jpg',
            '/img/9.jpg',
            '/img/10.jpg'
        ]);
    });
}

function fromCache(request) {
    //console.log('loading from cache');
    const hasQuery = request.url.indexOf('?') !== -1;

    return caches.open(CACHE).then(function (cache) {
        return cache.match(request, {ignoreSearch: hasQuery}).then(function (matching) {
            console.log('serving from cache');
            return matching || Promise.reject('no-match');
        });
    });
}

function fromNetwork(request, timeout) {


    return new Promise((fulfill, reject) => {
        fetch(request).then(function (response) {

            const timeoutId = setTimeout(reject, timeout);
            const clone = response.clone();
            fetch(request).then(response => {
                clearTimeout(timeoutId);
                update(request, clone);
                fulfill(response);
            });
        }, reject);
    });
}

function update(request, response) {
    return caches.open(CACHE).then(function (cache) {
        return cache.put(request, response);
    });
}