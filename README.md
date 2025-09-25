# Saint Louis University Campus Archaeology

An interactive website that showcases Saint Louis University's campus archaeology program. The experience combines a Leaflet-powered map, timeline, and catalog to highlight excavations, surveys, and laboratory projects while surfacing artifact inventories from each investigation.

## Features

- **Interactive campus map** with custom markers for excavation, survey, and laboratory projects.
- **Filterable project catalog** that narrows results by era and research focus while keeping the map and timeline in sync.
- **Detailed project drawer** describing locations, goals, discoveries, and curated artifact inventories.
- **Chronological timeline** illustrating how campus archaeology work has evolved across the Midtown campus.

## Running the site locally

The repository includes a lightweight Node server that serves the static site without any external dependencies.

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) to explore the map. The server simply delivers the static assets so you can also use any alternative static file host if preferred.

## Project data

Project information lives in [`data/excavations.json`](data/excavations.json). Each entry includes:

- `title`, `type`, `era`, `focus`, `years`, and `location` metadata.
- `coordinates` for map placement (latitude, longitude).
- Narrative fields (`teaser`, `summary`, `timelineNote`).
- Arrays of `discoveries` and `artifacts` (each artifact group lists a category with bullet points).

Update or expand this file to add additional Saint Louis University excavations, surveys, or laboratory initiatives. The interface automatically reflects new entries on the map, timeline, and catalog once the data file is saved.

## Acknowledgements

- Mapping powered by [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles.
- Typography from Playfair Display and Source Sans 3 via Google Fonts.
- Hero imagery courtesy of [Unsplash](https://unsplash.com/).
