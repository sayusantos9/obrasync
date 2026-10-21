param(
  [string]$InputPath = 'C:\Users\pedro\Downloads\insumos_turiacu.xlsx',
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\supabase\seeds\insumos_turiacu.json')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($InputPath)
function Read-XmlEntry([string]$name) {
  $entry = $zip.GetEntry($name)
  if (!$entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
  $shared = Read-XmlEntry 'xl/sharedStrings.xml'
  $strings = @()
  if ($shared) {
    $strings = @($shared.SelectNodes('//*[local-name()="si"]') | ForEach-Object {
      ($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join ''
    })
  }
  $sheet = Read-XmlEntry 'xl/worksheets/sheet1.xml'
  $rows = @($sheet.SelectNodes('//*[local-name()="sheetData"]/*[local-name()="row"]'))
  $records = @($rows | ForEach-Object {
    $rowNumber = [int]$_.r
    $cells = @{}
    foreach ($cell in $_.SelectNodes('./*[local-name()="c"]')) {
      $valueNode = $cell.SelectSingleNode('./*[local-name()="v"]')
      $value = if ($cell.t -eq 's') { $strings[[int]$valueNode.InnerText] }
        elseif ($cell.t -eq 'inlineStr') { ($cell.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' }
        else { $valueNode.InnerText }
      $cells[($cell.r -replace '\d','')] = $value
    }
    if ($rowNumber -eq 1) {
      if (($cells['A'] -ne 'banco') -or ($cells['C'] -ne 'nome_insumo') -or ($cells['H'] -ne 'valor')) { throw 'Cabeçalho inesperado.' }
    } elseif ($cells['C']) {
      foreach ($column in @('A','C','E','F','G','H')) {
        if ([string]::IsNullOrWhiteSpace($cells[$column])) { throw "Campo $column ausente na linha $rowNumber" }
      }
      $numbers = @{}
      foreach ($column in @('F','G','H')) {
        $numbers[$column] = [decimal]::Parse($cells[$column], [Globalization.CultureInfo]::InvariantCulture)
        if ($numbers[$column] -lt 0) { throw "Valor negativo na linha $rowNumber" }
      }
      [ordered]@{
        catalog_code = ('TUR-{0:D4}' -f ($rowNumber - 1))
        source_file = [IO.Path]::GetFileName($InputPath)
        source_row = $rowNumber
        source_bank = $cells['A']
        source_code = if ([string]::IsNullOrWhiteSpace($cells['B'])) { $null } else { $cells['B'] }
        description = $cells['C']
        category = if ([string]::IsNullOrWhiteSpace($cells['D'])) { $null } else { $cells['D'] }
        unit = $cells['E']
        reference_quantity = $numbers['F']
        reference_unit_price = $numbers['G']
        reference_value = $numbers['H']
      }
    }
  })
  $folder = Split-Path -Parent $OutputPath
  [IO.Directory]::CreateDirectory($folder) | Out-Null
  [IO.File]::WriteAllText($OutputPath, (ConvertTo-Json -InputObject $records -Depth 5), [Text.UTF8Encoding]::new($false))
  [pscustomobject]@{ Rows = $records.Count; MissingCodes = @($records | Where-Object { !$_.source_code }).Count; Output = $OutputPath } | ConvertTo-Json
} finally { $zip.Dispose() }
