export const CATALOG_ROLES = ['MASTER', 'ENGINEERING', 'PURCHASING', 'REQUESTER'];

export function normalizeCatalogSearch(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filterInputCatalog(items, query, category = 'Todas', bank = 'Todas') {
  const terms = normalizeCatalogSearch(query).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (category !== 'Todas' && (item.category || 'Sem categoria') !== category) return false;
    if (bank !== 'Todas' && item.source_bank !== bank) return false;
    const searchable = normalizeCatalogSearch([
      item.description, item.catalog_code, item.source_code, item.source_bank, item.unit, item.category,
    ].join(' '));
    return terms.every((term) => searchable.includes(term));
  });
}
