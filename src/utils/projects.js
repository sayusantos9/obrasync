export function parseProjectBudget(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : NaN;
  const text = String(value ?? '').trim();
  if (!text) return 0;
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text) && !/^\d+\.\d{1,2}$/.test(text)) return NaN;
  const normalized = text.includes(',') || /^\d{1,3}(?:\.\d{3})+$/.test(text)
    ? text.replaceAll('.', '').replace(',', '.') : text;
  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? number : NaN;
}

export function reconcileSelectedProject(current, projects) {
  return projects.find(project => project.id === current?.id) || projects[0] || null;
}

export function filterProjects(projects, query) {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return projects.filter(project => {
    const text = normalize([project.name, project.client, project.location].join(' '));
    return terms.every(term => text.includes(term));
  });
}
