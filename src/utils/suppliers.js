export function prepareSupplier(value) {
 const name=String(value.name||'').trim(),document=String(value.document||'').replace(/[^a-z0-9]/gi,'').toUpperCase();
 const email=String(value.email||'').trim().toLowerCase(),phone=String(value.phone||'').trim(),contactName=String(value.contactName||'').trim();
 if(name.length<2||name.length>160)throw new Error('Informe um nome entre 2 e 160 caracteres.');
 if(document&&(document.length<5||document.length>20))throw new Error('Revise a identificação: 5 a 20 letras ou números.');
 if(email&&(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)))throw new Error('Informe um e-mail válido.');
 if(phone&&(phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15))throw new Error('Informe telefone com DDD (10 a 15 dígitos).');
 if(contactName.length>120)throw new Error('O nome do contato deve ter até 120 caracteres.');
 return {id:value.id||null,updatedAt:value.updatedAt||null,name,document,email,phone,contactName,active:value.active!==false};
}
export function supplierMatches(s,query){
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=normalize(query).trim();
 return !q||normalize(`${s.name} ${s.document||''} ${s.contact_name||''} ${s.email||''}`).includes(q)||(q.replace(/[^a-z0-9]/g,'').length>=5&&String(s.document||'').toLowerCase().includes(q.replace(/[^a-z0-9]/g,'')));
}
