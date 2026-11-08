// TextInput has no universal password-manager completion event. Treat a large,
// non-keyboard replacement as a candidate; the screen waits for a settled pair.
// This deliberately stores no credentials, and never decides authentication.
export function createAutofillLoginGate(){
 let revision=0,attempted=-1,candidate=false,lastKey=-Infinity,passwordBulkAt=-Infinity;
 return {
  key(now=Date.now()){lastKey=now;candidate=false;passwordBulkAt=-Infinity;},
  change(field,previous,next,now=Date.now()){
   if(previous===next)return false;
   revision++;let prefix=0,suffix=0;
   while(prefix<previous.length&&prefix<next.length&&previous[prefix]===next[prefix])prefix++;
   while(suffix<previous.length-prefix&&suffix<next.length-prefix&&previous[previous.length-1-suffix]===next[next.length-1-suffix])suffix++;
   const bulk=next.length>=6&&next.length-prefix-suffix>=6&&now-lastKey>250;
   if(field==='password'){passwordBulkAt=bulk?now:-Infinity;candidate=bulk;}
   else candidate=bulk&&now-passwordBulkAt<2000;
   return candidate;
  },
  ready(){return candidate&&revision!==attempted;},
  consume(){attempted=revision;candidate=false;passwordBulkAt=-Infinity;},
  reset(){revision++;candidate=false;lastKey=-Infinity;passwordBulkAt=-Infinity;},
 };
}
export function completeLoginPair({email,password}){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim())&&typeof password==='string'&&password.length>=6&&!!password.trim();
}
