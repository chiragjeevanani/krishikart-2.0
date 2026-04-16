/**
 * One-time script: Copy all data from source MongoDB to destination MongoDB.
 * Run: node scripts/migrate-mongo.js
 */

import { MongoClient } from 'mongodb';

const SOURCE_URI = 'mongodb+srv://prachi:7694900512@cluster0.nd3xlri.mongodb.net/kisaankart?retryWrites=true&w=majority';
const DEST_URI = 'mongodb+srv://zookretail99_db_user:kisaankart%21%40%23123@cluster0.ombrukk.mongodb.net/kisaankart?retryWrites=true&w=majority';

async function migrate() {
  let sourceClient;
  let destClient;

  try {
    console.log('Connecting to source database...');
    sourceClient = new MongoClient(SOURCE_URI);
    await sourceClient.connect();
    const sourceDb = sourceClient.db();

    console.log('Connecting to destination database...');
    destClient = new MongoClient(DEST_URI);
    await destClient.connect();
    const destDb = destClient.db();

    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to copy.\n`);

    for (const { name } of collections) {
      if (name === 'system.indexes') continue;

      const sourceColl = sourceDb.collection(name);
      const destColl = destDb.collection(name);

      const count = await sourceColl.countDocuments();
      if (count === 0) {
        console.log(`  [${name}] (empty) - skipped`);
        continue;
      }

      const docs = await sourceColl.find({}).toArray();
      if (docs.length > 0) {
        await destColl.deleteMany({});
        await destColl.insertMany(docs);
      }

      // Copy indexes (except _id which is automatic)
      const indexes = await sourceColl.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        try {
          await destColl.createIndex(idx.key, {
            name: idx.name,
            unique: !!idx.unique,
            ...(idx.expireAfterSeconds != null && { expireAfterSeconds: idx.expireAfterSeconds }),
          });
        } catch (e) {
          if (e.code === 85 || e.codeName === 'IndexOptionsConflict') {
            console.log(`    Index ${idx.name} already exists or conflict - skipped`);
          } else {
            console.warn(`    Index ${idx.name}:`, e.message);
          }
        }
      }

      console.log(`  [${name}] ${docs.length} documents copied`);
    }

    console.log('\nMigration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (sourceClient) await sourceClient.close();
    if (destClient) await destClient.close();
    process.exit(0);
  }
}

migrate();
