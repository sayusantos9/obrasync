const SEARCHABLE_PROJECT_FIELDS = ['name', 'client', 'location'];

export function filterProjects(projects, query) {
  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) return projects;

  return projects.filter((project) => (
    SEARCHABLE_PROJECT_FIELDS.some((field) => (
      project[field]?.toLowerCase().includes(searchTerm)
    ))
  ));
}
