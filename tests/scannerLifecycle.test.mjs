import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/hooks/useScanner.js',import.meta.url),'utf8').replace(/import[\s\S]*?from\s*['"][^'"]+['"];\s*/g,'').replace('export function','function');
function setup(permission){let requested=0,settings=0,alerts=[];
 const hook=vm.runInNewContext(source+';useScanner',{
  useApp:()=>({stock:[]}),useCameraPermissions:()=>[permission,async()=>requested++,async()=>permission],useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect:()=>{},
  Alert:{alert:(...args)=>alerts.push(args)},Linking:{openSettings:async()=>settings++},labelApi:{getIdFromQr:()=>null},findStockMaterial:()=>null,formatScannerDetails:()=>'',getScannerActionLabel:()=>'',
 });return {scanner:hook(),counts:()=>({requested,settings,alerts})};
}
test('permissão bloqueada abre configurações; permissão solicitável usa diálogo do sistema',async()=>{
 const blocked=setup({granted:false,canAskAgain:false});await blocked.scanner.handlePrimaryAction();assert.equal(blocked.counts().settings,1);assert.equal(blocked.counts().requested,0);
 const available=setup({granted:false,canAskAgain:true});await available.scanner.handlePrimaryAction();assert.equal(available.counts().requested,1);
});
test('quadros repetidos do mesmo QR não abrem múltiplos resultados',async()=>{
 const {scanner,counts}=setup({granted:true});await scanner.handleBarcodeScanned({data:'TESTE',type:'qr'});await scanner.handleBarcodeScanned({data:'TESTE',type:'qr'});assert.equal(counts().alerts.length,1);
 counts().alerts[0][2][0].onPress();await scanner.handleBarcodeScanned({data:'OUTRO',type:'qr'});assert.equal(counts().alerts.length,2);
});
