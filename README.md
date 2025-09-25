# Saint Louis University Campus Archaeology

An interactive website that showcases Saint Louis University's campus archaeology program. The experience combines a Leaflet-powered map, timeline, and catalog to highlight excavations, surveys, and laboratory projects while surfacing artifact inventories from each investigation.

## Features

- **Interactive campus map** with custom markers for excavation, survey, and laboratory projects.
- **Filterable project catalog** that narrows results by era and research focus while keeping the map and timeline in sync.
- **Detailed project drawer** describing locations, goals, discoveries, and curated artifact inventories.
- **Chronological timeline** illustrating how campus archaeology work has evolved across the Midtown campus.

## Running the site locally

Install dependencies once to set up the local SQLite-backed server, then start the app:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to explore the map or access the data entry workflow.

### Recording new site data

- Visit [`/site-recordation.html`](http://localhost:3000/site-recordation.html) to complete the Missouri SHPO archaeological site recordation form. All dropdown values and checklists mirror the MO 780-1927 (10-10) specification.
- Submissions are saved to `data/site-records.db`. Each multi-select field is stored as a JSON array so records can be exported or transformed later.
- Existing entries can be retrieved from `GET /api/site-records` if you would like to audit or export data.

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
