function parseQueryString(queryString=''){
  return queryString.split('&').filter(Boolean).reduce((acc,pair)=>{const [rawKey,rawValue='']=pair.split('=');const key=decodeURIComponent(rawKey||'');if(key)acc[key]=decodeURIComponent(rawValue);return acc;},{});
}

export const labelApi={
  async getById(id){ throw new Error(`Etiqueta ${id} é demonstrativa e não usa servidor.`); },
  getIdFromQr(data){const match=String(data||'').match(/^obrasync:\/\/label\/([^/?#]+)/i);return match?decodeURIComponent(match[1]):null;},
  getDetailsFromQr(data){const match=String(data||'').match(/^obrasync:\/\/label\/([^?#]+)(?:\?(.+))?/i);if(!match)return null;const [,encodedLabelId,queryString='']=match;const query=parseQueryString(queryString);return{labelId:decodeURIComponent(encodedLabelId),materialCode:query.material||'',lot:query.lote||'',project:query.obra||'',location:query.local||''};},
};
