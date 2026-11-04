import AsyncStorage from '@react-native-async-storage/async-storage';

export const operationId=()=>`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
const key=user=>`@obrasync:requests:${user.companyId}:${user.id}`;
let writes=Promise.resolve();
export async function readRequestQueue(user) {
  if(!user?.id || !user.companyId) return [];
  await writes.catch(()=>{});
  const stored=await AsyncStorage.getItem(key(user));
  if(!stored) return [];
  const rows=JSON.parse(stored);
  if(!Array.isArray(rows)) throw new Error('Fila local inválida. Contate o suporte antes de apagar dados.');
  return rows.filter(r=>r.userId===user.id && r.companyId===user.companyId);
}
export function updateRequestQueue(user,change) {
  const pending=writes.catch(()=>{}).then(async()=>{
    const stored=await AsyncStorage.getItem(key(user));
    const rows=stored?JSON.parse(stored):[];
    if(!Array.isArray(rows)) throw new Error('Fila local inválida.');
    const next=change(rows);
    await AsyncStorage.setItem(key(user),JSON.stringify(next));
    return next;
  });
  writes=pending;
  return pending;
}
