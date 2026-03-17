# Atlas Admin - File Structure

```
atlas-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   │
│   ├── data/
│   │   └── hardcoded.ts          # Hardcoded buildings, floors, rooms, GeoJSON
│   │
│   ├── store/
│   │   └── useStore.ts           # Zustand global state store
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # Main navigation sidebar
│   │   │   └── TopBar.tsx        # Top navigation bar
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Table.tsx
│   │   └── map/
│   │       └── FloorMapEditor.tsx # GeoJSON map editor with Leaflet
│   │
│   └── pages/
│       ├── Login.tsx             # Admin login page
│       ├── Dashboard.tsx         # Overview stats
│       ├── Buildings.tsx         # Buildings list + add/edit/delete
│       ├── Floors.tsx            # Floor management per building
│       ├── Rooms.tsx             # Room assignment and details
│       ├── FloorLayout.tsx       # Floor map editor (poi/path/units JSON)
│       └── Logs.tsx              # Admin activity logs
```
