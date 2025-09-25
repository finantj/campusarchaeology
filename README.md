# Campus Archaeology Interactive Map

An interactive single-page website that showcases Saint Louis University's campus archaeology program. The site combines a Leaflet-powered map, excavation timeline, and artifact inventories to help visitors explore current and past research.

## Features

- **Interactive mapping** of excavation, survey, and laboratory locations across SLU's campus.
- **Project catalog** with quick filtering by era and research theme.
- **Artifact inventories** that summarize materials recovered from each investigation.
- **Timeline view** highlighting the sequence of campus archaeology projects.

## Getting Started

This site is built with static HTML, CSS, and JavaScript. No build step is required.

1. Install any simple static web server (for example Python's built-in module).
2. Start the server from the repository root:

   ```bash
   python -m http.server 8000
   ```

3. Open your browser to [http://localhost:8000](http://localhost:8000) and navigate to `index.html`.

## Data Structure

Project data lives in [`data/excavations.json`](data/excavations.json). Each project entry includes coordinates, descriptive fields, and artifact inventory sections. Update this file to add new excavations or collections work.

## Acknowledgements

- Mapping powered by [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles.
- Typography from Playfair Display and Source Sans 3 via Google Fonts.
- Hero image courtesy of Unsplash (campus architecture by Matthew T Rader).
