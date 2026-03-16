# Atlas 🗺️
### Campus Navigation System

> ⚠️ **Work in progress** — Atlas is actively being developed. Features and APIs may change.

Atlas is a full campus navigation system built for students, staff, and first-time visitors. It provides seamless outdoor-to-indoor navigation — guiding a person from anywhere on campus all the way to a specific room inside a building, with no login or app install required.

---

## What Atlas Does

```
User opens Atlas
  → Sees the campus map with their live GPS location
  → Searches for a building or destination
  → Gets a walking route across campus
  → Approaches a building → "Switch to Indoor?" prompt appears
  → Confirms → Indoor floor plan loads
  → Selects destination room or scans a QR code for their current location
  → Gets a room-level route to their destination
```

---

## Features

### 🌍 Outdoor Navigation
- **Campus map** with all buildings marked and labelled
- **Real-time GPS location** — the user's position is shown live on the map
- **Building and place search** — find any building or point of interest by name
- **Walking routes** — turn-by-turn path between any two outdoor locations
- **Proximity detection** — as a user approaches a building, a dialog prompts them to switch to indoor navigation

### 🏢 Indoor Navigation
- **Room-level routing** using Dijkstra's algorithm on a GeoJSON path graph
- **QR code scanning** — scan a code placed at a physical location to set it as your start point automatically
- **Multi-floor support** — switch floors using a control embedded inside the map
- **Floor plan layers** — building outline, rooms, navigation paths, and POIs rendered as stacked GeoJSON layers
- **Room labels** — centroid labels on every room, colour-coded by category
- **Interactive popups** — tap any room, path, or POI for details

### 🔁 Outdoor ↔ Indoor Handoff
- Proximity to a building triggers a **"Switch to Indoor Navigation"** dialog
- Confirming loads the building's floor plan without leaving the app
- Users can return to outdoor navigation at any time

### 🔐 Admin Panel
- Admins log in through a **separate login page**
- Full control over all map data:
  - Edit room details (name, number, category, level)
  - Edit path details (type, navigability)
  - Manage building information
  - Add and update points of interest
- Edit mode is accessible directly on the map — click any feature to edit it inline

### 👤 No Login for Visitors
Regular users never need to create an account or sign in. Atlas is designed to work immediately for anyone who opens it.

---

## Tech Stack

| Technology | Role |
|---|---|
| React | UI framework |
| TypeScript | Type safety throughout |
| Leaflet / React-Leaflet | Map rendering, GeoJSON layers, routing display, custom controls |
| Tailwind CSS | Styling |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Roadmap

- [ ] Backend API for persisting admin edits
- [ ] QR code generation for physical placement inside buildings
- [ ] Cross-floor stairwell routing
- [ ] Offline support / PWA
- [ ] More buildings and floors

---

## Team

| Name | Role | GitHub |
|---|---|---|
| Ajay Mahesh Ramakrishnan | Outdoor Navigation |[@ajaymrk95](https://github.com/ajaymrk95) |
| Niranjan V | QR Code & Search |[@niranjanv2k4](https://github.com/niranjanv2k4) |
| Lishin V S | Indoor Navigation |[@ellvius](https://github.com/ellvius) |
| Tarun Nambiar | Designer & Admin Login |[@tarunpradeep](https://github.com/tarunpradeep) |
| Muhammad Jasil | Admin Functionalities |[@JasiJasil00](https://github.com/JasiJasil00) |

---