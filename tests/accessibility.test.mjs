import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_ACCESSIBILITY,mergeAccessibility,ACCESSIBILITY_PRESETS,accessibleTextStyle,accessibilitySummary} from '../src/utils/accessibility.js';
import {librasHtml} from '../src/utils/libras.js';
test('preferências antigas preservadas, novos campos recebem padrão e valores inválidos ignorados',()=>{
 const next=mergeAccessibility(DEFAULT_ACCESSIBILITY,{highContrast:true,largeText:'yes',slowSpeech:true,unknown:true});
 assert(next.highContrast);assert(next.slowSpeech);assert.equal(next.largeText,false);assert.equal(next.accessibilityToolbar,true);assert.equal(next.unknown,undefined);
 assert.deepEqual(mergeAccessibility(next,ACCESSIBILITY_PRESETS.standard),DEFAULT_ACCESSIBILITY);
});
test('ampliação de texto também amplia a altura da linha sem modificar o estilo original',()=>{
 const style={fontSize:16,lineHeight:20,fontWeight:'400'};
 const actual=accessibleTextStyle(style,{spacedText:true,boldText:true},1.16);
 assert(actual.lineHeight>=actual.fontSize*1.7);assert.equal(actual.fontWeight,'700');assert.equal(style.lineHeight,20);
});
test('texto do usuário é escapado no documento externo e limitado',()=>{
 const html=librasHtml('</p><script>alert("x")</script>');
 assert(!html.includes('<script>alert'));assert(html.includes('&lt;script&gt;'));
 assert(librasHtml('a'.repeat(2000)).length<4000);
});
test('resumo não inclui credenciais ou catálogo de perfil cliente',()=>{
 const summary=accessibilitySummary({currentScreen:'tabs',activeTab:'materials',selectedProject:{name:'Obra A'},currentUser:{role:'CLIENT',password:'segredo'},costInputs:[{description:'restrito',unit:'un'}]});
 assert(summary.includes('Obra A'));assert(!summary.includes('segredo'));assert(!summary.includes('restrito'));
});
