/**
 * Script para cargar datos de UBIGEO (departamentos, provincias, distritos)
 * desde archivos CSV a Firestore.
 *
 * Uso: node scripts/upload-ubigeo.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, getDocs, collection } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config (from .env.local)
const firebaseConfig = {
  apiKey: 'AIzaSyAHr4m5c5dPl6sOud6vYBmd4mxLfj4Zr9A',
  authDomain: 'vertientefb.firebaseapp.com',
  projectId: 'vertientefb',
  storageBucket: 'vertientefb.firebasestorage.app',
  messagingSenderId: '448881327053',
  appId: '1:448881327053:web:1d57ebdb26a456b0322284',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Parse CSV simple (no necesita dependencias externas)
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

// Firestore batch write has a limit of 500 operations
async function batchWrite(collectionName, docs) {
  const BATCH_SIZE = 450;
  let count = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);

    for (const docData of chunk) {
      const { id, ...data } = docData;
      const ref = doc(db, collectionName, id);
      batch.set(ref, data);
    }

    await batch.commit();
    count += chunk.length;
    console.log(`  [${collectionName}] ${count}/${docs.length} documentos escritos...`);
  }

  return count;
}

async function checkCollectionEmpty(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.empty;
}

async function main() {
  const csvDir = path.resolve('C:\\PCC\\ubigeo');

  console.log('===========================================');
  console.log('  CARGA DE UBIGEO A FIRESTORE');
  console.log('  Proyecto: vertientefb');
  console.log('===========================================\n');

  // 1. Parse CSVs
  console.log('📄 Leyendo archivos CSV...');
  const departamentosRaw = parseCSV(path.join(csvDir, 'departamentos.csv'));
  const provinciasRaw = parseCSV(path.join(csvDir, 'provincias.csv'));
  const distritosRaw = parseCSV(path.join(csvDir, 'distritos.csv'));

  console.log(`  - departamentos.csv: ${departamentosRaw.length} registros`);
  console.log(`  - provincias.csv: ${provinciasRaw.length} registros`);
  console.log(`  - distritos.csv: ${distritosRaw.length} registros\n`);

  // 2. Transform to Firestore format
  const departamentos = departamentosRaw.map((r) => ({
    id: r.id,
    nombre: r.name,
    activo: true,
  }));

  const provincias = provinciasRaw.map((r) => ({
    id: r.id,
    nombre: r.name,
    departamentoId: r.department_id,
    activo: true,
  }));

  const distritos = distritosRaw.map((r) => ({
    id: r.id,
    nombre: r.name,
    provinciaId: r.province_id,
    departamentoId: r.department_id,
    activo: true,
  }));

  // 3. Check if collections already have data
  console.log('🔍 Verificando colecciones existentes...');
  const depEmpty = await checkCollectionEmpty('departamentos');
  const provEmpty = await checkCollectionEmpty('provincias');
  const distEmpty = await checkCollectionEmpty('distritos');

  // 4. Upload each collection
  if (depEmpty) {
    console.log('\n📤 Subiendo DEPARTAMENTOS...');
    const count = await batchWrite('departamentos', departamentos);
    console.log(`  ✅ ${count} departamentos cargados.`);
  } else {
    console.log('\n⚠️  La colección "departamentos" ya tiene datos. Sobrescribiendo...');
    const count = await batchWrite('departamentos', departamentos);
    console.log(`  ✅ ${count} departamentos actualizados.`);
  }

  if (provEmpty) {
    console.log('\n📤 Subiendo PROVINCIAS...');
    const count = await batchWrite('provincias', provincias);
    console.log(`  ✅ ${count} provincias cargadas.`);
  } else {
    console.log('\n⚠️  La colección "provincias" ya tiene datos. Sobrescribiendo...');
    const count = await batchWrite('provincias', provincias);
    console.log(`  ✅ ${count} provincias actualizadas.`);
  }

  if (distEmpty) {
    console.log('\n📤 Subiendo DISTRITOS...');
    const count = await batchWrite('distritos', distritos);
    console.log(`  ✅ ${count} distritos cargados.`);
  } else {
    console.log('\n⚠️  La colección "distritos" ya tiene datos. Sobrescribiendo...');
    const count = await batchWrite('distritos', distritos);
    console.log(`  ✅ ${count} distritos actualizados.`);
  }

  console.log('\n===========================================');
  console.log('  ✅ CARGA COMPLETADA EXITOSAMENTE');
  console.log(`  Total: ${departamentos.length} deps, ${provincias.length} provs, ${distritos.length} dists`);
  console.log('===========================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error durante la carga:', err);
  process.exit(1);
});
