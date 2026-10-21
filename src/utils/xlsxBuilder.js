// XLSX sem lib de planilha: OpenXML + ZIP (STORE), compatível com Expo Go.
import { Buffer } from 'buffer';
// Separado do React Native para testes com Node.js.
const xml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const column = (n) => {
  let s = '';
  for (let i = n + 1; i; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
  return s;
};
const utf8 = (s) => Uint8Array.from(Buffer.from(s, 'utf8'));
const u16 = (data, off, v) => { data[off] = v & 255; data[off + 1] = (v >>> 8) & 255; };
const u32 = (data, off, v) => { u16(data, off, v); u16(data, off + 2, v >>> 16); };
const crcTable = Array.from({ length: 256 }, (_, k) => {
  let c = k;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = -1;
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function zipStored(files) {
  const pieces = []; const central = [];
  let offset = 0;
  for (const [name, bytes] of Object.entries(files)) {
    const filename = utf8(name), crc = crc32(bytes);
    const head = new Uint8Array(30 + filename.length);
    u32(head, 0, 0x04034b50); u16(head, 4, 20); u16(head, 6, 0x0800);
    u32(head, 14, crc); u32(head, 18, bytes.length); u32(head, 22, bytes.length);
    u16(head, 26, filename.length); head.set(filename, 30);
    pieces.push(head, bytes);
    const entry = new Uint8Array(46 + filename.length);
    u32(entry, 0, 0x02014b50); u16(entry, 4, 20); u16(entry, 6, 20); u16(entry, 8, 0x0800);
    u32(entry, 16, crc); u32(entry, 20, bytes.length); u32(entry, 24, bytes.length);
    u16(entry, 28, filename.length); u32(entry, 42, offset); entry.set(filename, 46);
    central.push(entry); offset += head.length + bytes.length;
  }
  const centralLength = central.reduce((n, e) => n + e.length, 0);
  const ending = new Uint8Array(22);
  u32(ending, 0, 0x06054b50); u16(ending, 8, central.length); u16(ending, 10, central.length);
  u32(ending, 12, centralLength); u32(ending, 16, offset);
  const result = new Uint8Array(offset + centralLength + ending.length);
  let pos = 0;
  for (const entry of [...pieces, ...central, ending]) { result.set(entry, pos); pos += entry.length; }
  return result;
}
const sanitizeSheet = (name) => String(name || 'Planilha').replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31);
function sheetXml(rows) {
  const rowMarkup = rows.map((row, ri) => {
    const cells = row.map((value, ci) => {
      if (value === null || value === undefined) return '';
      const addr = `${column(ci)}${ri + 1}`;
      if (typeof value === 'number' && Number.isFinite(value))
        return `<c r="${addr}" s="${ci > 0 ? 2 : 0}"><v>${value}</v></c>`;
      if (typeof value === 'object' && typeof value.formula === 'string')
        return `<c r="${addr}" s="2"><f>${xml(value.formula.replace(/^=/, ''))}</f></c>`;
      return `<c r="${addr}" t="inlineStr"${ri === 0 ? ' s="1"' : ''}><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${ri + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><sheetData>${rowMarkup}</sheetData><autoFilter ref="A1:${column(Math.max(0, ...rows.map(r => r.length - 1)))}${Math.max(1,rows.length)}"/></worksheet>`;
}
export function makeXlsx(sheets) {
  if (!Array.isArray(sheets) || !sheets.length) throw new Error('Informe ao menos uma aba.');
  const files = {};
  const set = (key, value) => { files[key] = utf8(value); };
  const wsOverrides = sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  set('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${wsOverrides}</Types>`);
  set('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  set('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${xml(sanitizeSheet(s.name))}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`);
  set('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  set('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B2A5B"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>');
  sheets.forEach((s,i) => set(`xl/worksheets/sheet${i+1}.xml`, sheetXml(s.rows || [])));
  return zipStored(files);
}
