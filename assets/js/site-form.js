(function () {
  const form = document.getElementById('recordation-form');
  const statusEl = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    const formData = new FormData(form);
    const payload = buildPayload(formData);

    try {
      const response = await fetch('/api/site-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save site record.');
      }

      const result = await response.json();
      showStatus('success', result.message || 'Site record saved successfully.');
      form.reset();
      form.dispatchEvent(new Event('reset'));
    } catch (error) {
      console.error('Failed to submit site record', error);
      showStatus('error', error.message || 'Unable to save site record.');
    }
  });

  form.addEventListener('reset', () => {
    clearStatus();
  });

  function buildPayload(formData) {
    return {
      county: formData.get('county')?.trim() || '',
      localName: formData.get('localName')?.trim() || '',
      shpoSiteNumber: formData.get('shpoSiteNumber')?.trim() || '',
      sectionLandGrant: formData.get('sectionLandGrant')?.trim() || '',
      township: formData.get('township')?.trim() || '',
      range: formData.get('range')?.trim() || '',
      updateStatus: formData.get('updateStatus') || '',
      quadName: formData.get('quadName')?.trim() || '',
      topoDate: formData.get('topoDate')?.trim() || '',
      siteArea: formData.get('siteArea')?.trim() || '',
      utmZone: formData.get('utmZone')?.trim() || '',
      utmNorthing: formData.get('utmNorthing')?.trim() || '',
      utmEasting: formData.get('utmEasting')?.trim() || '',
      datum: formData.get('datum') || '',
      nrhpStatus: formData.get('nrhpStatus') || '',
      ownerAddress: formData.get('ownerAddress')?.trim() || '',
      tenantAddress: formData.get('tenantAddress')?.trim() || '',
      infoCurrentAsOf: formData.get('infoCurrentAsOf')?.trim() || '',
      recorderNameAddress: formData.get('recorderNameAddress')?.trim() || '',
      recordingOrganization: formData.get('recordingOrganization')?.trim() || '',
      siteDescription: formData.get('siteDescription')?.trim() || '',
      culturalPrehistoric: formData.getAll('culturalPrehistoric'),
      culturalHistoric: formData.getAll('culturalHistoric'),
      culturalOther: formData.get('culturalOther')?.trim() || '',
      siteTypes: formData.getAll('siteTypes'),
      siteTypeOther: formData.get('siteTypeOther')?.trim() || '',
      waterSource: formData.get('waterSource') || '',
      waterSourceOther: formData.get('waterSourceOther')?.trim() || '',
      waterSourceName: formData.get('waterSourceName')?.trim() || '',
      waterSourceDistance: formData.get('waterSourceDistance')?.trim() || '',
      topographicLocation: formData.getAll('topographicLocation'),
      topographicLocationOther: formData.get('topographicLocationOther')?.trim() || '',
      materialReported: formData.getAll('materialReported'),
      materialOther: formData.get('materialOther')?.trim() || '',
      collection: formData.get('collection') || '',
      repository: formData.get('repository')?.trim() || '',
      remoteSensing: formData.getAll('remoteSensing'),
      remoteSensingOther: formData.get('remoteSensingOther')?.trim() || '',
      samplingTechniques: formData.getAll('samplingTechniques'),
      samplingOther: formData.get('samplingOther')?.trim() || '',
      soilType: formData.get('soilType')?.trim() || '',
      landUse: formData.get('landUse') || '',
      landUseOther: formData.get('landUseOther')?.trim() || '',
      contourElevation: formData.get('contourElevation')?.trim() || '',
      literatureSources: formData.get('literatureSources')?.trim() || '',
      featuresPrehistoric: formData.getAll('featuresPrehistoric'),
      featuresHistoric: formData.getAll('featuresHistoric'),
      featuresOther: formData.get('featuresOther')?.trim() || '',
      floralFaunalRemains: formData.get('floralFaunalRemains')?.trim() || '',
      humanRemains: formData.get('humanRemains') || '',
      artifactDescriptions: formData.get('artifactDescriptions')?.trim() || '',
      artifactIllustrations: formData.get('artifactIllustrations')?.trim() || '',
      sketchMap: formData.get('sketchMap')?.trim() || '',
      usgsTopoMapSection: formData.get('usgsTopoMapSection')?.trim() || ''
    };
  }

  function showStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('form-status--error', 'form-status--success');
    statusEl.classList.add(type === 'error' ? 'form-status--error' : 'form-status--success');
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = '';
    statusEl.classList.remove('form-status--error', 'form-status--success');
  }
})();
