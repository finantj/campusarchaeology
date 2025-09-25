# Campus Archaeology Interactive Map

An interactive single-page website that showcases Saint Louis University's campus archaeology program. The site combines a Leaflet-powered map, excavation timeline, and artifact inventories to help visitors explore current and past research.

## Features

- **Interactive mapping** of excavation, survey, and laboratory locations across SLU's campus.
- **Project catalog** with quick filtering by era and research theme.
- **Artifact inventories** that summarize materials recovered from each investigation.
- **Timeline view** highlighting the sequence of campus archaeology projects.
- **Digital Missouri SHPO site recordation form** that mirrors the state paperwork and
  saves submissions into a local SQLite database for future reference.

## Getting Started

This project now includes a lightweight Node/Express server that serves the front end and
persists Missouri SHPO site records to a SQLite database.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to explore the map and submit site
   records. The SQLite database file is created automatically at `data/site-records.db`.

To clear stored submissions, stop the server and delete `data/site-records.db`.

### Submitting Missouri SHPO records

- The digital form reproduces the latest SHPO archaeological site recordation worksheet,
  including dropdown and checkbox options from the official instructions.
- Required fields (County, Information Current As Of, and Recorder Name/Address) must be
  completed before the record can be saved.
- Attachments (items 39–41) are tracked via checkboxes indicating whether supporting
  documents are included offline.
- Saved submissions appear in the **Stored Site Records** panel beneath the form and can be
  reviewed without leaving the page.

## Data Structure

Project data lives in [`data/excavations.json`](data/excavations.json). Each project entry includes coordinates, descriptive fields, and artifact inventory sections. Update this file to add new excavations or collections work.

## Acknowledgements

- Mapping powered by [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles.
- Typography from Playfair Display and Source Sans 3 via Google Fonts.
- Hero image courtesy of Unsplash (campus architecture by Matthew T Rader).
