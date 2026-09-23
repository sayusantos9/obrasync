import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataFile = fileURLToPath(new URL('../../data/labels.json', import.meta.url));

const readLabels = async () => {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const persistLabels = async (labels) => {
  await mkdir(dirname(dataFile), { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(labels, null, 2));
  await rename(temporaryFile, dataFile);
};

export const labelRepository = {
  async create(label) {
    const labels = await readLabels();
    labels.push(label);
    await persistLabels(labels);
    return label;
  },

  async findById(id) {
    const labels = await readLabels();
    return labels.find((label) => label.id === id) || null;
  },

  async list() {
    return readLabels();
  },
};
