/** Converte datas do calendário pt-BR em ISO para colunas DATE do PostgreSQL. */
export function toDatabaseDate(value){
 if(!value) return null;
 const v=String(value).trim();
 let year,month,day;
 if(/^\d{4}-\d{2}-\d{2}$/.test(v)) [year,month,day]=v.split('-').map(Number);
 else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) [day,month,year]=v.split('/').map(Number);
 else throw new Error('Data inválida. Selecione a data pelo calendário.');
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==day)
  throw new Error('Data inexistente. Corrija dia, mês e ano.');
 return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
export function dateForDisplay(value){
 if(!value)return '';
 const v=String(value);
 if(/^\d{4}-\d{2}-\d{2}$/.test(v))return `${v.slice(8,10)}/${v.slice(5,7)}/${v.slice(0,4)}`;
 return v;
}
