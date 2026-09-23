import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { app } from '../src/app.js';
import { labelService } from '../src/services/labelService.js';

test('GET /health informa que a API está ativa', async (context) => {
  const server = app.listen(0);
  context.after(() => server.close());
  await once(server, 'listening');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'obrasync-api' });
});

test('serviço rejeita etiqueta sem campos obrigatórios', async () => {
  await assert.rejects(() => labelService.create({ materialCode: 'ACO-014' }), (error) => {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /Campos obrigatórios/);
    return true;
  });
});
