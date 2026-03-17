import type { Location } from "../data/locations";

export function searchLocations(query: string, locations: Location[]): Location[] {
    const q = query.toLowerCase();
  
    return locations.filter((loc) => {
      const nameMatch = loc.name.toLowerCase().includes(q);
  
      const roomMatch =
        loc.room && loc.room.toLowerCase().includes(q);
  
      const tagMatch =
        loc.tag && loc.tag.some(tag => tag.toLowerCase().includes(q));
  
      return nameMatch || roomMatch || tagMatch;
    });
  }