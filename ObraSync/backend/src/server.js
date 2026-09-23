import { app } from './app.js';
import { environment } from './config/environment.js';

app.listen(environment.port, environment.host, () => {
  console.log(`ObraSync API disponível em http://${environment.host}:${environment.port}`);
});
