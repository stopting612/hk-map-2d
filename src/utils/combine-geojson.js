const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = 'public/HK-2d-Map/150000_GEOJSON'; // Folder containing your individual GeoJSON files
const OUTPUT_FILE = './merged.json'; // Output file path

// Step 1: Read all GeoJSON files from the input directory
const files = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.json'));

if (files.length === 0) {
  console.error('No JSON files found in the directory!');
  process.exit(1);
}

// Step 2: Combine all features into a single FeatureCollection
const merged = {
  type: "FeatureCollection",
  name: "HK_Combined_Map", // Custom name
  crs: { 
    type: "name",
    properties: { name: "EPSG:2326" } // Preserve the CRS from the first file
  },
  features: []
};

// Step 3: Merge features from each file
files.forEach(file => {
  const filePath = path.join(INPUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.type === "FeatureCollection" && data.features) {
    merged.features.push(...data.features);
    console.log(`Added ${data.features.length} features from ${file}`);
  } else {
    console.warn(`Skipping ${file} (not a FeatureCollection)`);
  }
});

// Step 4: Save the merged GeoJSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2)); // Pretty-print
console.log(`✅ Saved ${merged.features.length} features to ${OUTPUT_FILE}`);