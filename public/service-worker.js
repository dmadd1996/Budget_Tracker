const APP_PREFIX = 'budgetTracker-'
const VERSION = 'v1'
const CACHE_NAME = APP_PREFIX + VERSION
const DATA_CACHE_NAME = 'data-cache-' + VERSION
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
]

self.addEventListener('install', function(event){
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache){
            console.log("Installing cache -- " + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('fetch', function(event){
    if(event.request.url.includes('/api/')){
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(function(cache){
                return fetch(event.request)
                .then(function(response){
                    if(response.status === 200){
                        cache.put(event.request.url, response.clone())
                    }
                    return response
                })
                .catch(error =>(
                    console.log(error)
                ))
            })
            .catch(error =>(
                console.log(error)
            ))
        )
        return 
    }
    event.respondWith(
        fetch(event.request)
        .catch(function(){
            return caches.match(event.request)
            .then(function(response){
                if(response){
                    return response
                }
                else if(event.request.headers.get('accept').includes('text/html')){
                    return caches.match('/')
                }
            })
        })
    )
})

self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(keyList){
            let cacheKeepList = keyList.filter(function(key){
                return key.indexOf(APP_PREFIX)
            })
            cacheKeepList.push(CACHE_NAME)
            return Promise.all(keyList.map(function(key, i){
                if(cacheKeepList.indexOf(key)===-1){
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})