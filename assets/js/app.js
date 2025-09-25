(function () {
  const eraSelect = document.getElementById('filter-era');
  const focusSelect = document.getElementById('filter-focus');
  const resetButton = document.getElementById('reset-filters');
  const resultCount = document.getElementById('result-count');
  const projectGrid = document.getElementById('project-grid');
  const timelineList = document.getElementById('timeline-list');
  const detailPanel = document.getElementById('detail-panel');
  const detailTitle = document.getElementById('detail-title');
  const detailIntro = document.getElementById('detail-intro');
  const detailMeta = document.getElementById('detail-meta');
  const detailSummary = document.getElementById('detail-summary');
  const detailDiscoveries = document.getElementById('detail-discoveries');
  const detailArtifacts = document.getElementById('detail-artifacts');

  if (!projectGrid || !timelineList) {
    return;
  }

  detailPanel.setAttribute('tabindex', '-1');

  const typeLabels = {
    excavation: 'Excavation',
    survey: 'Survey',
    lab: 'Laboratory'
  };

  let map;
  const markerLayer = L.layerGroup();
  const markersById = new Map();

  let allProjects = [];
  let filteredProjects = [];
  let activeProjectId = null;

  const cardRefs = new Map();
  const timelineRefs = new Map();

  const markerIcons = {
    excavation: L.divIcon({
      className: 'marker marker--excavation',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    }),
    survey: L.divIcon({
      className: 'marker marker--survey',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    }),
    lab: L.divIcon({
      className: 'marker marker--lab',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    })
  };

  async function loadProjects() {
    const response = await fetch('data/excavations.json');
    if (!response.ok) {
      throw new Error('Unable to load excavation data');
    }
    return response.json();
  }

  function initMap() {
    map = L.map('map', {
      scrollWheelZoom: false,
      tap: true
    }).setView([38.6365, -90.2345], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markerLayer.addTo(map);
  }

  function populateFilters(projects) {
    const eras = Array.from(new Set(projects.map((project) => project.era))).sort(
      (a, b) => a.localeCompare(b)
    );
    const focuses = Array.from(
      new Set(projects.map((project) => project.focus))
    ).sort((a, b) => a.localeCompare(b));

    eras.forEach((era) => {
      const option = document.createElement('option');
      option.value = era;
      option.textContent = era;
      eraSelect.appendChild(option);
    });

    focuses.forEach((focus) => {
      const option = document.createElement('option');
      option.value = focus;
      option.textContent = focus;
      focusSelect.appendChild(option);
    });
  }

  function updateResultSummary(list) {
    if (!list.length) {
      resultCount.textContent = 'No projects match the current filters.';
      return;
    }

    const label = list.length === 1 ? 'project' : 'projects';
    resultCount.textContent = `Showing ${list.length} ${label}`;
  }

  function clearDetailPanel() {
    activeProjectId = null;
    detailTitle.textContent = 'Choose a project';
    detailIntro.textContent =
      'Use the map markers, timeline, or project list to learn more about each field school, excavation, and laboratory investigation.';
    detailMeta.innerHTML = '';
    detailSummary.innerHTML = '';
    detailDiscoveries.innerHTML = '';
    detailArtifacts.innerHTML = '';
  }

  function renderMetaRow(label, value) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    detailMeta.append(dt, dd);
  }

  function renderProjects(list) {
    projectGrid.innerHTML = '';
    cardRefs.clear();

    list.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('role', 'listitem');
      card.tabIndex = 0;
      card.dataset.projectId = project.id;
      card.innerHTML = `
        <span class="project-card__type">${typeLabels[project.type] || 'Project'}</span>
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__meta">${project.location} • ${project.years}</p>
        <p class="project-card__summary">${project.teaser}</p>
      `;

      card.addEventListener('click', () => showProject(project));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showProject(project);
        }
      });

      cardRefs.set(project.id, card);
      projectGrid.appendChild(card);
    });
  }

  function renderTimeline(list) {
    timelineList.innerHTML = '';
    timelineRefs.clear();

    const sorted = [...list].sort((a, b) => a.startYear - b.startYear);

    sorted.forEach((project) => {
      const item = document.createElement('li');
      item.className = 'timeline__item';
      item.dataset.year = project.years;
      item.tabIndex = 0;
      item.dataset.projectId = project.id;
      item.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.timelineNote || project.teaser}</p>
      `;

      item.addEventListener('click', () => showProject(project));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showProject(project);
        }
      });

      timelineRefs.set(project.id, item);
      timelineList.appendChild(item);
    });
  }

  function drawMarkers(list) {
    markerLayer.clearLayers();
    markersById.clear();

    list.forEach((project) => {
      const icon = markerIcons[project.type] || markerIcons.excavation;
      const marker = L.marker(project.coordinates, {
        icon,
        title: project.title
      });
      marker.on('click', () => showProject(project));
      marker.on('add', () => {
        if (project.id === activeProjectId) {
          marker.getElement()?.classList.add('marker--active');
        }
      });
      marker.addTo(markerLayer);
      markersById.set(project.id, marker);
    });
  }

  function setActiveProject(project) {
    activeProjectId = project ? project.id : null;

    cardRefs.forEach((card, id) => {
      card.classList.toggle('project-card--active', id === activeProjectId);
    });

    timelineRefs.forEach((item, id) => {
      item.classList.toggle('timeline__item--active', id === activeProjectId);
    });

    markersById.forEach((marker, id) => {
      const element = marker.getElement();
      if (element) {
        element.classList.toggle('marker--active', id === activeProjectId);
      }
    });
  }

  function renderArtifacts(artifacts) {
    if (!artifacts || !artifacts.length) {
      detailArtifacts.innerHTML = '';
      return;
    }

    const fragment = document.createDocumentFragment();
    const heading = document.createElement('h3');
    heading.textContent = 'Artifact inventory';
    fragment.appendChild(heading);

    artifacts.forEach((group) => {
      const groupHeading = document.createElement('h4');
      groupHeading.textContent = group.category;
      const list = document.createElement('ul');
      group.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      fragment.appendChild(groupHeading);
      fragment.appendChild(list);
    });

    detailArtifacts.innerHTML = '';
    detailArtifacts.appendChild(fragment);
  }

  function renderDiscoveries(discoveries) {
    if (!discoveries || !discoveries.length) {
      detailDiscoveries.innerHTML = '';
      return;
    }

    const heading = document.createElement('h3');
    heading.textContent = 'Excavation highlights';
    const list = document.createElement('ul');
    discoveries.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    detailDiscoveries.innerHTML = '';
    detailDiscoveries.append(heading, list);
  }

  function showProject(project, { flyTo = true } = {}) {
    if (!project) {
      clearDetailPanel();
      return;
    }

    detailTitle.textContent = project.title;
    detailIntro.textContent = project.teaser;
    detailMeta.innerHTML = '';
    renderMetaRow('Type', typeLabels[project.type] || project.type);
    renderMetaRow('Years', project.years);
    renderMetaRow('Era', project.era);
    renderMetaRow('Research focus', project.focus);
    renderMetaRow('Location', project.location);

    detailSummary.innerHTML = '';
    const summaryParagraph = document.createElement('p');
    summaryParagraph.textContent = project.summary;
    detailSummary.appendChild(summaryParagraph);

    renderDiscoveries(project.discoveries);
    renderArtifacts(project.artifacts);

    setActiveProject(project);

    if (flyTo && map) {
      map.setView(project.coordinates, 17, {
        animate: true,
        duration: 0.6
      });
    }

    requestAnimationFrame(() => {
      detailPanel.focus({ preventScroll: false });
    });
  }

  function applyFilters({ preserveSelection = false } = {}) {
    const era = eraSelect.value;
    const focus = focusSelect.value;

    filteredProjects = allProjects.filter((project) => {
      const matchesEra = era === 'all' || project.era === era;
      const matchesFocus = focus === 'all' || project.focus === focus;
      return matchesEra && matchesFocus;
    });

    renderProjects(filteredProjects);
    renderTimeline(filteredProjects);
    drawMarkers(filteredProjects);
    updateResultSummary(filteredProjects);

    const activeStillVisible = filteredProjects.some(
      (project) => project.id === activeProjectId
    );

    if (!filteredProjects.length) {
      clearDetailPanel();
      return;
    }

    if (preserveSelection && activeStillVisible) {
      setActiveProject(
        filteredProjects.find((project) => project.id === activeProjectId)
      );
      return;
    }

    showProject(filteredProjects[0]);
  }

  function resetFilters() {
    eraSelect.value = 'all';
    focusSelect.value = 'all';
    applyFilters();
  }

  async function init() {
    try {
      const data = await loadProjects();
      allProjects = Array.isArray(data.projects) ? data.projects : data;
      filteredProjects = [...allProjects];

      populateFilters(allProjects);
      initMap();
      applyFilters();
    } catch (error) {
      console.error(error);
      resultCount.textContent = 'There was a problem loading excavation data.';
    }
  }

  eraSelect.addEventListener('change', () => applyFilters({ preserveSelection: true }));
  focusSelect.addEventListener('change', () => applyFilters({ preserveSelection: true }));
  resetButton.addEventListener('click', resetFilters);

  init();
})();
