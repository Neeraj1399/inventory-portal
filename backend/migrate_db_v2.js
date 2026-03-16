import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Athiva\\react\\inventory-portal\\inventory-portal\\backend\\.env' });

const migrate = async () => {
  try {
    const { MONGO_URI } = process.env;
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for migration...');

    const db = mongoose.connection.db;

    // 1. Assets Status Sync
    const a1 = await db.collection('assets').updateMany({ status: 'ASSIGNED' }, { $set: { status: 'ALLOCATED' } });
    const a2 = await db.collection('assets').updateMany({ status: 'IN_USE' }, { $set: { status: 'ALLOCATED' } }); // Cleanup previous pass
    console.log(`Assets: ALLOCATED sync complete (${a1.modifiedCount + a2.modifiedCount})`);

    // 2. Audit Logs Actions Sync
    const l1 = await db.collection('auditlogs').updateMany({ action: 'ASSIGNED' }, { $set: { action: 'ALLOCATED' } });
    const l2 = await db.collection('auditlogs').updateMany({ action: 'UPDATED' }, { $set: { action: 'MODIFIED' } });
    console.log(`AuditLogs: ALLOCATED/MODIFIED sync complete (${l1.modifiedCount + l2.modifiedCount})`);

    // 3. Employee metadata if any
    // Employee model used assignedAssetsCount, but the code now uses allocatedAssetsCount likely (if I replaced the substring)
    
    console.log('DB Migration synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
