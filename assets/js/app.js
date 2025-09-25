const map = L.map("map", {
  center: [38.6355, -90.2345],
  zoom: 15,
  scrollWheelZoom: false,
  tap: false,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  maxZoom: 20,
}).addTo(map);

const eraFilter = document.getElementById("era-filter");
const themeFilter = document.getElementById("theme-filter");
const timelineTrack = document.getElementById("timeline-track");
const projectGrid = document.getElementById("project-grid");
const siteTitle = document.getElementById("site-title");
const siteDescription = document.getElementById("site-description");
const siteMeta = document.getElementById("site-meta");
const artifactInventory = document.getElementById("artifact-inventory");
const siteRecordForm = document.getElementById("site-record-form");
const siteRecordStatus = document.getElementById("site-record-status");
const siteRecordList = document.getElementById("site-record-list");

const layerGroup = L.layerGroup().addTo(map);
let projects = [];
let currentMarker;

async function loadProjects() {
  try {
    const response = await fetch("data/excavations.json");
    projects = await response.json();
    if (!Array.isArray(projects) || !projects.length) {
      throw new Error("Dataset is empty");
    }

    populateFilters();
    renderProjects(projects);
    renderTimeline(projects);
    addMarkers(projects);
    updateDetails(projects[0]);
  } catch (error) {
    siteTitle.textContent = "Unable to load data";
    siteDescription.textContent =
      "We couldn't load the excavation catalog. Please refresh to try again.";
    console.error("Failed to load project data", error);
  }
}

function populateFilters() {
  const eras = new Set();
  const themes = new Set();

  projects.forEach((project) => {
    eras.add(project.era);
    project.themes.forEach((theme) => themes.add(theme));
  });

  eras.forEach((era) => {
    const option = document.createElement("option");
    option.value = era;
    option.textContent = era;
    eraFilter.append(option);
  });

  Array.from(themes)
    .sort()
    .forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      themeFilter.append(option);
    });
}

function addMarkers(projectList) {
  layerGroup.clearLayers();

  projectList.forEach((project) => {
    const colorMap = {
      excavation: "#f86d70",
      survey: "#43b581",
      lab: "#ffc857",
    };

    const markerColor = colorMap[project.type] ?? "#002554";

    const marker = L.circleMarker(project.coordinates, {
      radius: 10,
      color: markerColor,
      fillColor: markerColor,
      fillOpacity: 0.85,
      weight: 2,
    }).addTo(layerGroup);

    marker.bindPopup(
      `<div class="popup"><h3>${project.title}</h3><p>${project.summary}</p></div>`
    );

    marker.on("click", () => {
      updateDetails(project);
      scrollIntoView();
    });

    project.marker = marker;
  });
}

function renderProjects(projectList) {
  projectGrid.innerHTML = "";

  projectList.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.tabIndex = 0;

    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
      <div class="project-card__meta">
        <span aria-label="Era">📜 ${project.era}</span>
        <span aria-label="Years active">📅 ${project.years}</span>
      </div>
      <button type="button">View details</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      focusProject(project);
    });

    card.addEventListener("keypress", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusProject(project);
      }
    });

    projectGrid.append(card);
  });
}

function renderTimeline(projectList) {
  timelineTrack.innerHTML = "";

  projectList
    .slice()
    .sort((a, b) => a.startYear - b.startYear)
    .forEach((project) => {
      const item = document.createElement("article");
      item.className = "timeline__item";
      item.innerHTML = `
        <span class="timeline__year">${project.years}</span>
        <h3>${project.title}</h3>
        <p class="timeline__summary">${project.timelineSummary}</p>
      `;
      item.addEventListener("click", () => focusProject(project));
      timelineTrack.append(item);
    });
}

function updateDetails(project) {
  if (!project) {
    return;
  }

  siteTitle.textContent = project.title;
  siteDescription.textContent = project.longDescription;

  siteMeta.innerHTML = "";
  const metaItems = [
    { label: "Era", value: project.era },
    { label: "Investigation", value: project.typeLabel },
    { label: "Years", value: project.years },
    { label: "Lead", value: project.leadInvestigator },
  ];

  metaItems.forEach((meta) => {
    if (!meta.value) return;
    const chip = document.createElement("span");
    chip.className = "meta-chip";
    chip.textContent = `${meta.label}: ${meta.value}`;
    siteMeta.append(chip);
  });

  artifactInventory.innerHTML = "";

  project.artifactInventories.forEach((inventory) => {
    const wrapper = document.createElement("section");
    wrapper.className = "inventory";
    wrapper.innerHTML = `
      <div class="inventory__header">
        <h4>${inventory.category}</h4>
        <span class="inventory__count">${inventory.count} items</span>
      </div>
      <ul class="inventory__list">
        ${inventory.items
          .map(
            (item) => `
              <li class="inventory__item">
                <span>${item.name}</span>
                <span>${item.notes}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
    artifactInventory.append(wrapper);
  });

  highlightMarker(project);
}

function focusProject(project) {
  updateDetails(project);
  if (project.marker) {
    project.marker.openPopup();
  }
  map.flyTo(project.coordinates, 17, {
    duration: 0.8,
  });
  scrollIntoView();
}

function highlightMarker(project) {
  if (currentMarker) {
    currentMarker.setStyle({ radius: 10 });
  }

  if (project.marker) {
    project.marker.setStyle({ radius: 14 });
    currentMarker = project.marker;
  }
}

function filterProjects() {
  const era = eraFilter.value;
  const theme = themeFilter.value;

  const filtered = projects.filter((project) => {
    const eraMatch = era === "all" || project.era === era;
    const themeMatch = theme === "all" || project.themes.includes(theme);
    return eraMatch && themeMatch;
  });

  renderProjects(filtered);
  renderTimeline(filtered);
  addMarkers(filtered);

  if (filtered.length) {
    updateDetails(filtered[0]);
    map.flyTo(filtered[0].coordinates, 16, { duration: 0.6 });
  } else {
    siteTitle.textContent = "No projects match the filters";
    siteDescription.textContent =
      "Try selecting a different era or research theme to discover more excavations.";
    siteMeta.innerHTML = "";
    artifactInventory.innerHTML = "";
  }
}

function scrollIntoView() {
  if (window.innerWidth < 980) {
    document
      .getElementById("map-section")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

eraFilter.addEventListener("change", filterProjects);
themeFilter.addEventListener("change", filterProjects);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("copyright-year").textContent = new Date()
    .getFullYear()
    .toString();
});

loadProjects();

function getCheckedValues(form, selector) {
  return Array.from(form.querySelectorAll(selector)).map((input) => input.value);
}

function nullableValue(value) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function formatDate(value, options = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, options);
}

async function submitSiteRecord(event) {
  event.preventDefault();
  if (!siteRecordForm) return;

  if (siteRecordStatus) {
    siteRecordStatus.textContent = "Submitting record...";
  }

  const formData = new FormData(siteRecordForm);
  const payload = {
    county: nullableValue(formData.get("county") ?? ""),
    localNameFieldNumber: nullableValue(formData.get("localNameFieldNumber") ?? ""),
    shpoSiteNumber: nullableValue(formData.get("shpoSiteNumber") ?? ""),
    sectionLandGrant: nullableValue(formData.get("sectionLandGrant") ?? ""),
    township: nullableValue(formData.get("township") ?? ""),
    range: nullableValue(formData.get("range") ?? ""),
    isUpdate: nullableValue(formData.get("isUpdate") ?? ""),
    quadName: nullableValue(formData.get("quadName") ?? ""),
    topoDate: nullableValue(formData.get("topoDate") ?? ""),
    siteAreaM2: nullableValue(formData.get("siteAreaM2") ?? ""),
    utmZone: nullableValue(formData.get("utmZone") ?? ""),
    utmNorthing: nullableValue(formData.get("utmNorthing") ?? ""),
    utmEasting: nullableValue(formData.get("utmEasting") ?? ""),
    datum: nullableValue(formData.get("datum") ?? ""),
    nrhpStatus: nullableValue(formData.get("nrhpStatus") ?? ""),
    ownerAddress: nullableValue(formData.get("ownerAddress") ?? ""),
    tenantAddress: nullableValue(formData.get("tenantAddress") ?? ""),
    informationCurrentAsOf: nullableValue(formData.get("informationCurrentAsOf") ?? ""),
    recorderNameAddress: nullableValue(formData.get("recorderNameAddress") ?? ""),
    recordingOrganization: nullableValue(formData.get("recordingOrganization") ?? ""),
    siteDescription: nullableValue(formData.get("siteDescription") ?? ""),
    culturalAffiliation: getCheckedValues(
      siteRecordForm,
      'input[name="culturalAffiliation"]:checked'
    ),
    culturalOtherPrehistoric: nullableValue(
      formData.get("culturalOtherPrehistoric") ?? ""
    ),
    culturalOtherHistoric: nullableValue(
      formData.get("culturalOtherHistoric") ?? ""
    ),
    siteType: getCheckedValues(siteRecordForm, 'input[name="siteType"]:checked'),
    siteTypeOther: nullableValue(formData.get("siteTypeOther") ?? ""),
    waterSource: nullableValue(formData.get("waterSource") ?? ""),
    waterSourceOther: nullableValue(formData.get("waterSourceOther") ?? ""),
    waterSourceName: nullableValue(formData.get("waterSourceName") ?? ""),
    waterSourceDistance: nullableValue(formData.get("waterSourceDistance") ?? ""),
    topographicLocation: nullableValue(formData.get("topographicLocation") ?? ""),
    topographicOther: nullableValue(formData.get("topographicOther") ?? ""),
    materialsReported: getCheckedValues(
      siteRecordForm,
      'input[name="materialsReported"]:checked'
    ),
    materialsOther: nullableValue(formData.get("materialsOther") ?? ""),
    collectionStatus: nullableValue(formData.get("collectionStatus") ?? ""),
    repository: nullableValue(formData.get("repository") ?? ""),
    remoteSensing: getCheckedValues(
      siteRecordForm,
      'input[name="remoteSensing"]:checked'
    ),
    remoteOther: nullableValue(formData.get("remoteOther") ?? ""),
    samplingTechniques: getCheckedValues(
      siteRecordForm,
      'input[name="samplingTechniques"]:checked'
    ),
    samplingOther: nullableValue(formData.get("samplingOther") ?? ""),
    soilType: nullableValue(formData.get("soilType") ?? ""),
    landUse: nullableValue(formData.get("landUse") ?? ""),
    landUseOther: nullableValue(formData.get("landUseOther") ?? ""),
    contourElevation: nullableValue(formData.get("contourElevation") ?? ""),
    literatureSources: nullableValue(formData.get("literatureSources") ?? ""),
    featuresPrehistoric: getCheckedValues(
      siteRecordForm,
      'input[name="featuresPrehistoric"]:checked'
    ),
    featuresPrehistoricOther: nullableValue(
      formData.get("featuresPrehistoricOther") ?? ""
    ),
    featuresHistoric: getCheckedValues(
      siteRecordForm,
      'input[name="featuresHistoric"]:checked'
    ),
    featuresHistoricOther: nullableValue(formData.get("featuresHistoricOther") ?? ""),
    floralFaunalRemains: nullableValue(formData.get("floralFaunalRemains") ?? ""),
    humanRemains: nullableValue(formData.get("humanRemains") ?? ""),
    artifactDescriptions: nullableValue(formData.get("artifactDescriptions") ?? ""),
    artifactIllustrationsAttached: formData.has("artifactIllustrationsAttached"),
    sketchMapAttached: formData.has("sketchMapAttached"),
    topoMapSectionAttached: formData.has("topoMapSectionAttached"),
  };

  try {
    const response = await fetch("/api/site-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const details = Array.isArray(error.details) && error.details.length
        ? `: ${error.details.join(", ")}`
        : "";
      throw new Error((error.error || "Unable to store record") + details);
    }

    siteRecordForm.reset();
    if (siteRecordStatus) {
      siteRecordStatus.textContent = "Record saved successfully.";
    }
    await loadSiteRecords();
  } catch (error) {
    console.error("Failed to submit site record", error);
    if (siteRecordStatus) {
      siteRecordStatus.textContent =
        error.message || "We were unable to save the record. Please try again.";
    }
  }
}

async function loadSiteRecords() {
  if (!siteRecordList) return;

  try {
    const response = await fetch("/api/site-records");
    if (!response.ok) {
      throw new Error("Unable to load stored records");
    }

    const records = await response.json();
    if (!records.length) {
      siteRecordList.innerHTML =
        '<p class="records__empty">No site records have been stored yet.</p>';
      return;
    }

    siteRecordList.innerHTML = "";
    records.forEach((record) => {
      const card = document.createElement("article");
      card.className = "record-card";

      const createdDate =
        formatDate(record.created_at, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) || record.created_at || "";
      const affiliations = Array.isArray(record.cultural_affiliation)
        ? record.cultural_affiliation.join(", ")
        : record.cultural_affiliation || "None provided";
      const infoCurrent = formatDate(record.information_current_as_of) ||
        record.information_current_as_of ||
        "Not provided";

      card.innerHTML = `
        <div class="record-card__header">
          <div>
            <h4 class="record-card__title">${record.county || "Unknown County"}</h4>
            <p class="record-card__meta">${record.local_name_field_number || "Field ID N/A"}</p>
          </div>
          <span class="record-card__meta">${createdDate}</span>
        </div>
        <div class="record-card__body">
          <p><strong>Recorder:</strong> ${record.recorder_name_address || "Not provided"}</p>
          <p><strong>Information current as of:</strong> ${infoCurrent}</p>
          <p><strong>Cultural affiliation:</strong> ${affiliations}</p>
        </div>
      `;

      siteRecordList.append(card);
    });
  } catch (error) {
    console.error("Failed to load site records", error);
    siteRecordList.innerHTML =
      '<p class="records__empty">Unable to load stored records at this time.</p>';
  }
}

if (siteRecordForm) {
  siteRecordForm.addEventListener("submit", submitSiteRecord);
  loadSiteRecords();
}
