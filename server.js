const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
const databasePath = path.join(__dirname, "data", "site-records.db");

app.use(express.json());

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/data/excavations.json", (req, res) => {
  res.sendFile(path.join(__dirname, "data", "excavations.json"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const dbPromise = open({
  filename: databasePath,
  driver: sqlite3.Database,
});

async function initializeDatabase() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS site_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      county TEXT,
      local_name_field_number TEXT,
      shpo_site_number TEXT,
      section_land_grant TEXT,
      township TEXT,
      range TEXT,
      is_update TEXT,
      quad_name TEXT,
      topo_date TEXT,
      site_area_m2 TEXT,
      utm_zone TEXT,
      utm_northing TEXT,
      utm_easting TEXT,
      datum TEXT,
      nrhp_status TEXT,
      owner_address TEXT,
      tenant_address TEXT,
      information_current_as_of TEXT,
      recorder_name_address TEXT,
      recording_organization TEXT,
      site_description TEXT,
      cultural_affiliation TEXT,
      cultural_other_prehistoric TEXT,
      cultural_other_historic TEXT,
      site_type TEXT,
      site_type_other TEXT,
      water_source TEXT,
      water_source_other TEXT,
      water_source_name TEXT,
      water_source_distance TEXT,
      topographic_location TEXT,
      topographic_other TEXT,
      materials_reported TEXT,
      materials_other TEXT,
      collection_status TEXT,
      repository TEXT,
      remote_sensing TEXT,
      remote_other TEXT,
      sampling_techniques TEXT,
      sampling_other TEXT,
      soil_type TEXT,
      land_use TEXT,
      land_use_other TEXT,
      contour_elevation TEXT,
      literature_sources TEXT,
      features_prehistoric TEXT,
      features_prehistoric_other TEXT,
      features_historic TEXT,
      features_historic_other TEXT,
      floral_faunal_remains TEXT,
      human_remains TEXT,
      artifact_descriptions TEXT,
      artifact_illustrations_attached INTEGER,
      sketch_map_attached INTEGER,
      topo_map_section_attached INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database", error);
  process.exit(1);
});

function asStoredValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return value ?? null;
}

function parseArrayField(value) {
  if (!value) return [];
  try {
    if (Array.isArray(value)) {
      return value;
    }
    return JSON.parse(value);
  } catch (error) {
    return Array.isArray(value) ? value : [value];
  }
}

app.post("/api/site-records", async (req, res) => {
  const payload = req.body ?? {};
  const requiredFields = ["county", "informationCurrentAsOf", "recorderNameAddress"];

  const missingFields = requiredFields.filter(
    (field) => !payload[field] || !String(payload[field]).trim()
  );

  if (missingFields.length) {
    return res.status(400).json({
      error: "Missing required fields",
      details: missingFields,
    });
  }

  try {
    const db = await dbPromise;
    const stmt = await db.run(
      `INSERT INTO site_records (
        county,
        local_name_field_number,
        shpo_site_number,
        section_land_grant,
        township,
        range,
        is_update,
        quad_name,
        topo_date,
        site_area_m2,
        utm_zone,
        utm_northing,
        utm_easting,
        datum,
        nrhp_status,
        owner_address,
        tenant_address,
        information_current_as_of,
        recorder_name_address,
        recording_organization,
        site_description,
        cultural_affiliation,
        cultural_other_prehistoric,
        cultural_other_historic,
        site_type,
        site_type_other,
        water_source,
        water_source_other,
        water_source_name,
        water_source_distance,
        topographic_location,
        topographic_other,
        materials_reported,
        materials_other,
        collection_status,
        repository,
        remote_sensing,
        remote_other,
        sampling_techniques,
        sampling_other,
        soil_type,
        land_use,
        land_use_other,
        contour_elevation,
        literature_sources,
        features_prehistoric,
        features_prehistoric_other,
        features_historic,
        features_historic_other,
        floral_faunal_remains,
        human_remains,
        artifact_descriptions,
        artifact_illustrations_attached,
        sketch_map_attached,
        topo_map_section_attached
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        asStoredValue(payload.county),
        asStoredValue(payload.localNameFieldNumber),
        asStoredValue(payload.shpoSiteNumber),
        asStoredValue(payload.sectionLandGrant),
        asStoredValue(payload.township),
        asStoredValue(payload.range),
        asStoredValue(payload.isUpdate),
        asStoredValue(payload.quadName),
        asStoredValue(payload.topoDate),
        asStoredValue(payload.siteAreaM2),
        asStoredValue(payload.utmZone),
        asStoredValue(payload.utmNorthing),
        asStoredValue(payload.utmEasting),
        asStoredValue(payload.datum),
        asStoredValue(payload.nrhpStatus),
        asStoredValue(payload.ownerAddress),
        asStoredValue(payload.tenantAddress),
        asStoredValue(payload.informationCurrentAsOf),
        asStoredValue(payload.recorderNameAddress),
        asStoredValue(payload.recordingOrganization),
        asStoredValue(payload.siteDescription),
        asStoredValue(payload.culturalAffiliation),
        asStoredValue(payload.culturalOtherPrehistoric),
        asStoredValue(payload.culturalOtherHistoric),
        asStoredValue(payload.siteType),
        asStoredValue(payload.siteTypeOther),
        asStoredValue(payload.waterSource),
        asStoredValue(payload.waterSourceOther),
        asStoredValue(payload.waterSourceName),
        asStoredValue(payload.waterSourceDistance),
        asStoredValue(payload.topographicLocation),
        asStoredValue(payload.topographicOther),
        asStoredValue(payload.materialsReported),
        asStoredValue(payload.materialsOther),
        asStoredValue(payload.collectionStatus),
        asStoredValue(payload.repository),
        asStoredValue(payload.remoteSensing),
        asStoredValue(payload.remoteOther),
        asStoredValue(payload.samplingTechniques),
        asStoredValue(payload.samplingOther),
        asStoredValue(payload.soilType),
        asStoredValue(payload.landUse),
        asStoredValue(payload.landUseOther),
        asStoredValue(payload.contourElevation),
        asStoredValue(payload.literatureSources),
        asStoredValue(payload.featuresPrehistoric),
        asStoredValue(payload.featuresPrehistoricOther),
        asStoredValue(payload.featuresHistoric),
        asStoredValue(payload.featuresHistoricOther),
        asStoredValue(payload.floralFaunalRemains),
        asStoredValue(payload.humanRemains),
        asStoredValue(payload.artifactDescriptions),
        payload.artifactIllustrationsAttached ? 1 : 0,
        payload.sketchMapAttached ? 1 : 0,
        payload.topoMapSectionAttached ? 1 : 0,
      ]
    );

    res.status(201).json({ id: stmt.lastID });
  } catch (error) {
    console.error("Failed to store site record", error);
    res.status(500).json({ error: "Failed to store site record" });
  }
});

app.get("/api/site-records", async (req, res) => {
  try {
    const db = await dbPromise;
    const rows = await db.all(
      `SELECT * FROM site_records ORDER BY datetime(created_at) DESC`
    );

    const parsed = rows.map((row) => ({
      ...row,
      cultural_affiliation: parseArrayField(row.cultural_affiliation),
      site_type: parseArrayField(row.site_type),
      materials_reported: parseArrayField(row.materials_reported),
      remote_sensing: parseArrayField(row.remote_sensing),
      sampling_techniques: parseArrayField(row.sampling_techniques),
      features_prehistoric: parseArrayField(row.features_prehistoric),
      features_historic: parseArrayField(row.features_historic),
    }));

    res.json(parsed);
  } catch (error) {
    console.error("Failed to fetch site records", error);
    res.status(500).json({ error: "Failed to fetch site records" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
