import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProjectBudget, reconcileSelectedProject, filterProjects } from '../src/utils/projects.js';

test('orçamento de obra aceita moeda brasileira e rejeita entradas inválidas', () => {
  for (const [value, expected] of [['1.200,50', 1200.5], ['1200,50', 1200.5], ['1.200', 1200], ['1200.50', 1200.5], ['', 0], [0, 0]]) assert.equal(parseProjectBudget(value), expected);
  for (const value of ['-1', 'abc', '1,2,3', '1.20.0', 'Infinity', Infinity, -1]) assert(Number.isNaN(parseProjectBudget(value)));
});
test('atualização mantém seleção com os novos dados e resolve obra removida', () => {
  const old = { id: 'a', budget: 100 };
  const fresh = { id: 'a', budget: 250 };
  assert.equal(reconcileSelectedProject(old, [fresh]), fresh);
  const other = { id: 'b' };
  assert.equal(reconcileSelectedProject(old, [other]), other);
  assert.equal(reconcileSelectedProject(old, []), null);
});
test('busca de obras ignora acentos e combina campos sem alterar a lista', () => {
  const projects = [{ id: 'a', name: 'São José', client: 'Pedro', location: 'Maranhão' }, { id: 'b', name: 'Outra' }];
  assert.deepEqual(filterProjects(projects, 'sao pedro'), [projects[0]]);
  assert.deepEqual(filterProjects(projects, 'inexistente'), []);
  assert.equal(filterProjects(projects, '').length, 2);
});
