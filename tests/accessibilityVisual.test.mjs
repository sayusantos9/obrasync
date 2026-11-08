import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_ACCESSIBILITY as defaults,mergeAccessibility,ACCESSIBILITY_PRESETS,textAdjustments,visualColor} from '../src/utils/accessibility.js';
test('preferências visuais validam níveis, enums e cores persistidas',()=>{
 const next=mergeAccessibility({largeText:true},{fontLevel:3,lineLevel:99,contrast:'dark',saturation:'invalid',textColor:'#123ABC',backgroundColor:'javascript:bad'});
 assert.equal(next.fontLevel,3);assert.equal(next.lineLevel,0);assert.equal(next.contrast,'dark');assert.equal(next.saturation,'original');assert.equal(next.textColor,'#123ABC');assert.equal(next.backgroundColor,'');assert(next.largeText);
 assert.deepEqual(mergeAccessibility(next,ACCESSIBILITY_PRESETS.standard),defaults);
});
test('perfis não herdam ajustes anteriores e ampliação não modifica estilo de origem',()=>{
 assert.deepEqual(mergeAccessibility({...defaults,textColor:'#FF0000',contrast:'dark'},ACCESSIBILITY_PRESETS.reading),ACCESSIBILITY_PRESETS.reading);
 const original={fontSize:16,lineHeight:22};const adjusted=textAdjustments(original,{fontLevel:2,lineLevel:2,highlightTitles:true},'header');
 assert.equal(adjusted.fontSize,20.8);assert(adjusted.lineHeight>22);assert.equal(original.fontSize,16);assert.equal(adjusted.textDecorationLine,'underline');
});
test('contraste e saturação alteram cores de interface sem transformações de imagem',()=>{
 assert.equal(visualColor('#FFFFFF',{contrast:'dark'}),'#152337');
 assert.equal(visualColor('#102030',{contrast:'dark'},'text'),'#F5F7FF');
 assert.equal(visualColor('#123456',{contrast:'inverted'}),'#edcba9');
 const gray=visualColor('#FF0000',{saturation:'mono'});assert.equal(gray.slice(1,3),gray.slice(3,5));
 assert.equal(visualColor('transparent',{contrast:'dark'}),'transparent');
});
