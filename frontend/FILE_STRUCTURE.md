# Atlas Admin - File Structure

```
atlas-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   ├── data/
│   │   ├── buildings.ts          # Hardcoded buildings + NIT data
│   │   ├── floors.ts             # Floors per building
│   │   ├── rooms.ts              # Rooms/units with building+floor refs
│   │   ├── geojson.ts            # GeoJSON outlines, paths, POIs
│   │   └── logs.ts               # Admin action logs
│   ├── context/
│   │   └── AppContext.tsx        # Global state (buildings, floors, rooms, logs)
│   ├── components/
│   │   ├── Layout.tsx            # Sidebar + topbar shell
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── MapViewer.tsx         # Leaflet map component
│   │   ├── JsonEditor.tsx        # GeoJSON textarea editor
│   │   ├── Modal.tsx             # Reusable modal
│   │   └── Badge.tsx             # Status/category badges
│   ├── pages/
│   │   ├── Login.tsx             # Admin login page
│   │   ├── Dashboard.tsx         # Overview stats + quick actions
│   │   ├── Buildings.tsx         # List/add/edit/delete buildings
│   │   ├── Floors.tsx            # Floor management per building
│   │   ├── Rooms.tsx             # Room assignment + details
│   │   └── Logs.tsx              # Admin activity logs
│   └── hooks/
│       └── useLogs.ts            # Hook to add log entries
```
