export const MAX_ATTACHMENT_BYTES=10*1024*1024;
export function attachmentType(name,bytes){
 if(!name||name.length>180||!bytes?.length||bytes.length>MAX_ATTACHMENT_BYTES)throw new Error('Use arquivos de até 10 MB e nome de até 180 caracteres.');
 const ext=name.split('.').pop().toLowerCase();
 if(ext==='pdf'&&[37,80,68,70,45].every((v,i)=>bytes[i]===v))return 'application/pdf';
 if(['jpg','jpeg'].includes(ext)&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(ext==='png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 throw new Error('Selecione PDF, JPG ou PNG válido. A extensão deve corresponder ao conteúdo.');
}
export function canUploadAttachment(role,kind){
 return ({request:['MASTER','PURCHASING','REQUESTER'],quote:['MASTER','ENGINEERING','PURCHASING'],order:['MASTER','PURCHASING'],receipt:['MASTER','PURCHASING','REQUESTER']})[kind]?.includes(role)||false;
}
