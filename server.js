const path = require('path');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'site-records.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS site_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      county TEXT,
      local_name TEXT,
      shpo_site_number TEXT,
      section_land_grant TEXT,
      township TEXT,
      range_designation TEXT,
      update_status TEXT,
      quad_name TEXT,
      topo_date TEXT,
      site_area TEXT,
      utm_zone TEXT,
      utm_northing TEXT,
      utm_easting TEXT,
      datum TEXT,
      nrhp_status TEXT,
      owner_address TEXT,
      tenant_address TEXT,
      info_current_as_of TEXT,
      recorder_name_address TEXT,
      recording_organization TEXT,
      site_description TEXT,
      cultural_prehistoric TEXT,
      cultural_historic TEXT,
      cultural_other TEXT,
      site_types TEXT,
      site_type_other TEXT,
      water_source TEXT,
      water_source_other TEXT,
      water_source_name TEXT,
      water_source_distance TEXT,
      topo_location TEXT,
      topo_location_other TEXT,
      materials_reported TEXT,
      materials_other TEXT,
      collection_status TEXT,
      repository TEXT,
      remote_sensing TEXT,
      remote_sensing_other TEXT,
      sampling_techniques TEXT,
      sampling_other TEXT,
      soil_type TEXT,
      land_use TEXT,
      land_use_other TEXT,
      contour_elevation TEXT,
      literature_sources TEXT,
      features_prehistoric TEXT,
      features_historic TEXT,
      features_other TEXT,
      floral_faunal_remains TEXT,
      human_remains TEXT,
      artifact_descriptions TEXT,
      artifact_illustrations TEXT,
      sketch_map TEXT,
      usgs_topo_map_section TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

app.post('/api/site-records', (req, res) => {
  const data = req.body;

  const stmt = db.prepare(
    `INSERT INTO site_records (
      county,
      local_name,
      shpo_site_number,
      section_land_grant,
      township,
      range_designation,
      update_status,
      quad_name,
      topo_date,
      site_area,
      utm_zone,
      utm_northing,
      utm_easting,
      datum,
      nrhp_status,
      owner_address,
      tenant_address,
      info_current_as_of,
      recorder_name_address,
      recording_organization,
      site_description,
      cultural_prehistoric,
      cultural_historic,
      cultural_other,
      site_types,
      site_type_other,
      water_source,
      water_source_other,
      water_source_name,
      water_source_distance,
      topo_location,
      topo_location_other,
      materials_reported,
      materials_other,
      collection_status,
      repository,
      remote_sensing,
      remote_sensing_other,
      sampling_techniques,
      sampling_other,
      soil_type,
      land_use,
      land_use_other,
      contour_elevation,
      literature_sources,
      features_prehistoric,
      features_historic,
      features_other,
      floral_faunal_remains,
      human_remains,
      artifact_descriptions,
      artifact_illustrations,
      sketch_map,
      usgs_topo_map_section
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const values = [
    data.county || '',
    data.localName || '',
    data.shpoSiteNumber || '',
    data.sectionLandGrant || '',
    data.township || '',
    data.range || '',
    data.updateStatus || '',
    data.quadName || '',
    data.topoDate || '',
    data.siteArea || '',
    data.utmZone || '',
    data.utmNorthing || '',
    data.utmEasting || '',
    data.datum || '',
    data.nrhpStatus || '',
    data.ownerAddress || '',
    data.tenantAddress || '',
    data.infoCurrentAsOf || '',
    data.recorderNameAddress || '',
    data.recordingOrganization || '',
    data.siteDescription || '',
    JSON.stringify(data.culturalPrehistoric || []),
    JSON.stringify(data.culturalHistoric || []),
    data.culturalOther || '',
    JSON.stringify(data.siteTypes || []),
    data.siteTypeOther || '',
    data.waterSource || '',
    data.waterSourceOther || '',
    data.waterSourceName || '',
    data.waterSourceDistance || '',
    JSON.stringify(data.topographicLocation || []),
    data.topographicLocationOther || '',
    JSON.stringify(data.materialReported || []),
    data.materialOther || '',
    data.collection || '',
    data.repository || '',
    JSON.stringify(data.remoteSensing || []),
    data.remoteSensingOther || '',
    JSON.stringify(data.samplingTechniques || []),
    data.samplingOther || '',
    data.soilType || '',
    data.landUse || '',
    data.landUseOther || '',
    data.contourElevation || '',
    data.literatureSources || '',
    JSON.stringify(data.featuresPrehistoric || []),
    JSON.stringify(data.featuresHistoric || []),
    data.featuresOther || '',
    data.floralFaunalRemains || '',
    data.humanRemains || '',
    data.artifactDescriptions || '',
    data.artifactIllustrations || '',
    data.sketchMap || '',
    data.usgsTopoMapSection || ''
  ];

  stmt.run(values, function runCallback(err) {
    if (err) {
      console.error('Failed to save record', err);
      res.status(500).json({ message: 'Unable to save site record.' });
      return;
    }

    res.status(201).json({ message: 'Site record saved successfully.', id: this.lastID });
  });
});

app.get('/api/site-records', (_req, res) => {
  db.all(
    `SELECT * FROM site_records ORDER BY datetime(created_at) DESC`,
    (err, rows) => {
      if (err) {
        console.error('Failed to load records', err);
        res.status(500).json({ message: 'Unable to load site records.' });
        return;
      }

      const parsedRows = rows.map((row) => ({
        ...row,
        cultural_prehistoric: safeParse(row.cultural_prehistoric),
        cultural_historic: safeParse(row.cultural_historic),
        site_types: safeParse(row.site_types),
        topo_location: safeParse(row.topo_location),
        materials_reported: safeParse(row.materials_reported),
        remote_sensing: safeParse(row.remote_sensing),
        sampling_techniques: safeParse(row.sampling_techniques),
        features_prehistoric: safeParse(row.features_prehistoric),
        features_historic: safeParse(row.features_historic)
      }));

      res.json(parsedRows);
    }
  );
});

function safeParse(value) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Unable to parse stored array value', value, error);
    return [];
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Campus Archaeology site running at http://localhost:${port}`);
});
