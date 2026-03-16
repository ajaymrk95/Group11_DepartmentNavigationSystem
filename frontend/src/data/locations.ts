export type Location = {
  id: number;
  name: string;
  room: string;
  coords: [number, number];
  type: "building" | "lab" | "connection" | "custom" | "room";
  category?: "indoor" | "outdoor";
  tag? : string[];
  floor? : number;
  description?: string;
  parentLocationId?: number; 
}

export const locations: Location[] = [

  { 
    id: 1, 
    name: "Rajpath", 
    room: "RP001",
    coords: [11.320713, 75.933313], 
    type: "connection", 
    category: "outdoor",
    tag: ["walkway", "central-path", "Outdoor"],
    description: "The main central walkway of the campus connecting major blocks." 
  },

  { 
    id: 2, 
    name: "CSED", 
    room: "CSED001",
    coords: [11.3222231, 75.9339917], 
    type: "building", 
    category: "outdoor",
    tag: ["department", "computer-science", "Faculty", "Outdoor"],
    description: "Computer Science & Engineering Department building." 
  },

  { 
    id: 3, 
    name: "ELHC", 
    room: "ELHC001",
    coords: [11.3225979, 75.9337476], 
    type: "building", 
    category: "outdoor",
    tag: ["lecture-hall", "electronics", "Classrooms", "Outdoor"],
    description: "Electrical Lecture Hall Complex, primarily for power systems and electronics classes." 
  },

  { 
    id: 4, 
    name: "NLHC", 
    room: "NLHC001",
    coords: [11.3217918, 75.9327887], 
    type: "building", 
    category: "outdoor",
    tag: ["lecture-hall", "multi-disciplinary", "Classrooms", "Outdoor"],
    description: "New Lecture Hall Complex - the primary hub for multi-disciplinary lectures." 
  },

  { 
    id: 5, 
    name: "Main Building", 
    room: "MB001",
    coords: [11.3215577, 75.9342156], 
    type: "building", 
    category: "outdoor",
    tag: ["administration", "auditorium", "Faculty", "Outdoor"],
    description: "Administrative headquarters housing the Director's office and main auditorium." 
  },

  { 
    id: 6, 
    name: "Central Computer Centre", 
    room: "CCC001",
    coords: [11.3215840, 75.9334955], 
    type: "building", 
    category: "outdoor",
    tag: ["computing", "lab", "Labs", "Outdoor"],
    description: "The 24/7 computing hub for all students, housing T1 and T2 terminals." 
  },

  { 
    id: 7, 
    name: "IT Lab Complex", 
    room: "IT001",
    coords: [11.3229687, 75.9343269], 
    type: "lab", 
    category: "outdoor",
    tag: ["research", "it", "Labs", "Outdoor"],
    description: "Specialized laboratory complex for Information Technology and advanced research." 
  },

  { 
    id: 8, 
    name: "CCC T1", 
    room: "CCC101",
    coords: [11.3215840, 75.9334955], 
    type: "room", 
    category: "indoor", 
    floor: 1,
    tag: ["terminal", "lab", "Labs", "Indoor"],
    parentLocationId: 6,
    description: "Terminal 1 located on the ground floor of CCC, used for general labs." 
  },

  { 
    id: 9, 
    name: "CCC T2", 
    room: "CCC201",
    coords: [11.3215840, 75.9334955], 
    type: "room", 
    category: "indoor", 
    floor: 2,
    tag: ["terminal", "projects", "Labs", "Indoor"],
    parentLocationId: 6,
    description: "Terminal 2 located on the first floor of CCC, reserved for senior projects." 
  },

  { 
    id: 10, 
    name: "Software Systems Lab", 
    room: "IT201",
    coords: [11.3229687, 75.9343269], 
    type: "room", 
    category: "indoor", 
    floor: 2,
    tag: ["software", "development", "SSL", "Labs", "Indoor"],
    parentLocationId: 7,
    description: "Specialized lab for software engineering, design patterns, and application development." 
  },

  { 
    id: 11, 
    name: "Network Systems Lab", 
    room: "IT301",
    coords: [11.3229687, 75.9343269], 
    type: "room", 
    category: "indoor", 
    floor: 3,
    tag: ["networking", "security", "NSL", "Labs", "Indoor"],
    parentLocationId: 7,
    description: "Advanced lab for network security, routing, and switching protocols." 
  }

];