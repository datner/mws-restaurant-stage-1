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

 if(event.request.method === 'GET'){
        event.respondWith(fromNetwork(event.request, 400).catch(function() {
            return fromCache(event.request)
        }));
    }
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            '/css/styles.css',
            '/js/dbhelper.js',
            '/js/main.js',
            '/index.html',
            '/restaurant.html',
            '/404.html'
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
        const timeoutId = setTimeout(reject, timeout);
        fetch(request).then(response => {
            clearTimeout(timeoutId);
            update(request, response.clone());
            fulfill(response);
        }, reject);
    });
}

function update(request, response) {
    return caches.open(CACHE).then(cache => cache.put(request, response))
}