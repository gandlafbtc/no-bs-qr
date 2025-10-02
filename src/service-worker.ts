// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files,  // everything in `static`
	'/offline.html' // offline fallback page
];

// Add additional URLs to cache
const additionalUrls = [
	'/',
	'/animated',
	'/scan'
];

// Combine all URLs to cache
const URLS_TO_CACHE = [...new Set([...ASSETS, ...additionalUrls])];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(URLS_TO_CACHE);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// URLs in our cache list can always be served from the cache
		if (URLS_TO_CACHE.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// If we're offline and the resource isn't in cache, serve the offline page
			// Only for HTML requests (navigation)
			const accept = event.request.headers.get('accept') || '';
			if (accept.includes('text/html')) {
				const offlineResponse = await cache.match('/offline.html');
				if (offlineResponse) {
					return offlineResponse;
				}
				// If offline page is not in cache, return a simple response
				return new Response('You are offline and the page is not cached.', {
					status: 503,
					headers: { 'Content-Type': 'text/plain' }
				});
			}

			// For other resources, we have to error out
			throw err;
		}
	}

	event.respondWith(respond());
});
