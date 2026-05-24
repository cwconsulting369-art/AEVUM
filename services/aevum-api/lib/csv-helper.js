// AEVUM CSV Helper — Wave I5
// Simple CSV parser with quoted-field + escaped-quote support.
// Returns rows as arrays of strings. Header NOT auto-stripped — caller decides.

export function csvParse(text) {
  if (!text || typeof text !== 'string') return [];
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      if (text[i + 1] === '\n') i++;
      row.push(field);
      // Only push non-empty rows (skip blank lines)
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  // Trailing
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some(v => v !== '')) rows.push(row);
  }
  return rows;
}
