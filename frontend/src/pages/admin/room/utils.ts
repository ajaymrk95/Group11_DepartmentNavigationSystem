/**
 * Reads a File and validates its JSON contents.
 *
 * @param file       - The File object to read
 * @param isGeoJson  - true  → validates as GeoJSON (must have a `type` field)
 *                     false → validates as an entry-points array ([[lng, lat], ...])
 * @returns Resolves with the parsed value, or rejects with a descriptive Error.
 */
export const readAndValidateJson = (file: File, isGeoJson: boolean): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target!.result as string);
  
          if (isGeoJson) {
            if (!parsed.type) {
              reject(new Error("Invalid GeoJSON — missing 'type' field."));
              return;
            }
          } else {
            if (!Array.isArray(parsed)) {
              reject(new Error("Invalid format — must be a JSON array."));
              return;
            }
            const allPairs = parsed.every(
              (p: any) =>
                Array.isArray(p) &&
                p.length === 2 &&
                typeof p[0] === "number" &&
                typeof p[1] === "number"
            );
            if (!allPairs) {
              reject(new Error("Each entry must be [longitude, latitude] number pair."));
              return;
            }
          }
  
          resolve(parsed);
        } catch {
          reject(new Error("Invalid JSON — could not parse file."));
        }
      };
  
      reader.onerror = () => reject(new Error("File read error."));
      reader.readAsText(file);
    });