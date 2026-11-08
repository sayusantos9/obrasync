import test from 'node:test';
import assert from 'node:assert/strict';
import {createAutofillLoginGate,completeLoginPair} from '../src/utils/autofillLogin.js';

test('Senha em bloco arma uma tentativa; digitação normal e sugestão de e-mail não armam',()=>{
 const g=createAutofillLoginGate();let previous='';for(const ch of 'password'){g.key(100);g.change('password',previous,previous+ch,100);previous+=ch;}assert.equal(g.ready(),false);
 g.change('email','','person@example.test',1000);assert.equal(g.ready(),false);
 g.change('password',previous,'saved-password',2000);assert.equal(g.ready(),true);
});
test('Par preenchido nas duas ordens é aceito, sem depender de perfil inferido pelo e-mail',()=>{
 for(const fields of [['email','password'],['password','email']]){const g=createAutofillLoginGate();for(const field of fields)g.change(field,'',field==='email'?'person@example.test':'saved-password',1000);assert.equal(g.ready(),true);}
 assert.equal(completeLoginPair({email:' person@example.test ',password:'123456'}),true);
 for(const pair of [{email:'invalid',password:'123456'},{email:'person@example.test',password:'123'},{email:'person@example.test',password:'      '}])assert.equal(completeLoginPair(pair),false);
});
test('Uma tentativa consumida não se repete por rerender ou reaplicação das mesmas credenciais',()=>{
 const g=createAutofillLoginGate();g.change('password','','saved-password',1000);g.consume();assert.equal(g.ready(),false);
 g.change('password','saved-password','saved-password',2000);assert.equal(g.ready(),false);g.change('email','person@example.test','other@example.test',2001);assert.equal(g.ready(),false);
 g.change('password','saved-password','other-password',3000);assert.equal(g.ready(),false);
 g.change('password','other-password','completely-new-456',4000);assert.equal(g.ready(),true);
});
test('Editar, apagar, digitar após preenchimento ou alternar modo cancela o candidato',()=>{
 const g=createAutofillLoginGate();g.change('password','','saved-password',1000);g.key(1100);assert.equal(g.ready(),false);
 g.change('password','saved-password','saved-passwordx',1100);assert.equal(g.ready(),false);
 g.change('password','saved-passwordx','replacement-password',2000);g.change('password','replacement-password','',2001);assert.equal(g.ready(),false);
 g.change('password','','another-password',3000);g.reset();assert.equal(g.ready(),false);
});
