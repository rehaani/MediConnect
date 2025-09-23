# Leaflet Mapping

### 1. Introduction
**Leaflet** is a leading open-source JavaScript library for creating mobile-friendly interactive maps. It is renowned for being lightweight (about 42 KB of JS) while still providing all the core mapping features most developers need. Leaflet is designed with simplicity, performance, and usability in mind.

### 2. Integration in MediConnect
Leaflet is integrated into the patient dashboard to provide location-based services, which are crucial for the emergency response feature and for providing context-aware services like language suggestions.

- **Dynamic Loading from CDN**: To keep the initial application bundle size small and improve performance, the Leaflet library and its required CSS are loaded dynamically from a CDN (`unpkg.com`). The `<link>` and `<script>` tags are placed in the head of the main `src/app/layout.tsx` file, making the `L` global object available throughout the application.
- **Map Component (`PatientDashboard.tsx`)**: The core integration happens within the `PatientDashboard` component (`src/components/dashboard/patient-dashboard.tsx`). A `useEffect` hook is used to safely initialize the map after the component has mounted and the `div` element for the map is present in the DOM.
- **Browser Geolocation API**: The component utilizes the browser's `navigator.geolocation` API to request the user's live location. If the user grants permission, the map uses the retrieved coordinates to center the view and place a marker indicating their position. An accuracy circle is also drawn.
- **Reverse Geocoding with Nominatim**: After successfully obtaining the user's location, the application makes a fetch request to the **Nominatim API**, a free, OpenStreetMap-based geocoding service. This service performs reverse geocoding, converting the user's latitude and longitude into a structured address, from which we extract the country code (e.g., 'IN' for India).
- **Language Suggestion**: The retrieved country code is then used to power the language suggestion feature. If the detected country's primary language is different from the app's current language, a toast notification appears, suggesting the user switch.
- **Graceful Fallback**: If the user denies location services or the API call fails, the map gracefully degrades. It shows a default, zoomed-out view (e.g., centered on India) and displays an informative error message to the user, explaining the issue and suggesting how to enable permissions.

### 3. Benefits
- **Lightweight & Performant**: Leaflet's small footprint ensures the dashboard loads quickly, without adding significant bloat to the application bundle.
- **Open Source**: Being open source means no licensing fees or vendor lock-in, and it benefits from a large community.
- **Interactive User Experience**: Provides a smooth, interactive map experience for the user.
- **Context-Aware Features**: Enables powerful features like the emergency map and intelligent language suggestions based on real-world location.

### 4. Flowchart
```mermaid
flowchart TD
  A[PatientDashboard component mounts] --> B{useEffect checks for window.L}
  B --> C[Request Geolocation Permission via navigator.geolocation]
  C -->|Permission Granted| D[Get coordinates]
  D --> E[Initialize Leaflet map on the 'map' div]
  E --> F[Set map view to user's location and add marker/circle]
  F --> G[Call Nominatim API for reverse geocoding]
  G --> H[Store country code & suggest language via toast if applicable]
  C -->|Permission Denied| I[handleLocationError is triggered]
  I --> J[Initialize Leaflet with a default view (e.g., India)]
  J --> K[Display user-friendly error message below the map]
```

### 5. Key Code Snippets
**Initializing the Map in a React `useEffect` hook (`patient-dashboard.tsx`):**
```javascript
// In src/components/dashboard/patient-dashboard.tsx
useEffect(() => {
  // Ensure window.L from CDN is available before initializing
  if (typeof window !== 'undefined' && window.L) {
    // mapInstanceRef is a useRef to hold the map object
    if (mapInstanceRef.current) return; // Avoid re-initialization

    const map = window.L.map('map'); // 'map' is the ID of the div
    mapInstanceRef.current = map;
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Set up event handlers
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    // Request the location
    map.locate({ setView: false, maxZoom: 16 });
  }
}, []);
```

### 6. Testing Instructions
1.  **Permission Grant**: Load the patient dashboard. When the browser prompts for location access, click "Allow." Verify the map correctly centers on your current location and displays a blue marker.
2.  **Permission Deny**: Reload the page or use a new incognito window. When prompted for location access, click "Block." Verify the map shows a default, zoomed-out view (centered on India) and a helpful error message is displayed below the map.
3.  **Language Suggestion**: Using a VPN or browser location spoofer, set your location to Germany. Load the dashboard and grant location permission. Verify that a toast notification appears suggesting you switch the language to German ("Deutsch").
