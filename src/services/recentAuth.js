let listener=null,pending=null;
export function setReauthenticationListener(fn){listener=fn;return()=>{listener=null;if(pending){pending.reject(new Error('Confirmação cancelada.'));pending=null;}};}
export function requestReauthentication(){
 if(pending)return pending.promise;
 if(!listener)return Promise.reject(new Error('Confirme sua identidade em Mais → Segurança e privacidade.'));
 let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});pending={promise,resolve,reject};listener(true);return promise;
}
export function finishReauthentication(error){const current=pending;pending=null;listener?.(false);if(current){if(error)current.reject(error);else current.resolve();}}
export async function rpcWithReauthentication(client,name,args){
 const before=(await client.auth?.getSession?.())?.data?.session?.user?.id;
 const result=await client.rpc(name,args);
 if(!['REAUTH_REQUIRED','MFA_REQUIRED'].includes(result.error?.message))return result;
 await requestReauthentication();
 const after=(await client.auth.getSession()).data.session?.user?.id;
 if(!before||before!==after)throw new Error('A conta mudou. Reabra a operação.');
 return client.rpc(name,args);
}
