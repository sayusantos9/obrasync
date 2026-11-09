import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('Splash cobre a tela mesmo sem os atalhos removidos do StyleSheet', () => {
  const source = fs.readFileSync(new URL('../src/screens/SplashScreen.js', import.meta.url), 'utf8');
  const declaration = source.slice(source.indexOf('const styles = StyleSheet.create('));
  // Emula a API atual: create existe, absoluteFillObject não existe.
  const styles = vm.runInNewContext(`${declaration}\nstyles;`, {
    StyleSheet: { create: value => value },
  });
  assert.equal(styles.root.position, 'absolute');
  for (const edge of ['top', 'right', 'bottom', 'left']) assert.equal(styles.root[edge], 0);
  assert.ok(styles.root.zIndex > 0);
  assert.equal(styles.gradient.flex, 1);
  assert.equal(styles.safe.flex, 1);
});
