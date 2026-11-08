import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';

// Expo Go may generate the print URI outside this project's readable cache scope.
// Materialize the returned bytes in our own cache; never share the print URI directly.
export async function generateAndSharePdf(html,title='ObraSync'){
 const result=await Print.printToFileAsync({html,base64:true});
 if(!result.base64)throw new Error('A impressão não retornou o conteúdo do PDF. Tente novamente.');
 const name=String(title).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,60)||'ObraSync';
 const file=new File(Paths.cache,`${name}_${Date.now()}_${Math.random().toString(36).slice(2,8)}.pdf`);
 file.create({overwrite:true});
 await file.write(result.base64,{encoding:'base64'});
 const wasShared=await Sharing.isAvailableAsync();
 if(wasShared)await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',UTI:'com.adobe.pdf',dialogTitle:title});
 return {uri:file.uri,wasShared};
}
