import Dexie, { type Table } from 'dexie';
import type { HistoryEntry, Template, Tab } from '../types';

export interface SyncQueueEntry {
  id?: number;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  payload: any;
  status: 'pending' | 'dead';
  retry_count: number;
  created_at: string;
}

export interface SyncMetaEntry {
  key: string;
  value: any;
}

class BMEDatabase extends Dexie {
  history!: Table<HistoryEntry, string>;
  templates!: Table<Template, string>;
  tabs!: Table<Tab, string>;
  sync_queue!: Table<SyncQueueEntry, number>;
  sync_meta!: Table<SyncMetaEntry, string>;

  constructor() {
    super('bme_local_db');
    this.version(1).stores({
      history: 'id, user_id, updated_at, deleted_at, [user_id+updated_at]',
      templates: 'id, user_id, updated_at, deleted_at, [user_id+updated_at]',
      tabs: 'id, user_id, updated_at, [user_id+updated_at]',
      sync_queue: '++id, table_name, operation, record_id, status, created_at',
      sync_meta: 'key',
    });
  }
}

export const db = new BMEDatabase();

// ============================================================
// MIGRATION: localStorage → IndexedDB (one-time)
// ============================================================

const MIGRATION_FLAG = 'bme_idb_migrated';

export async function migrateFromLocalStorage() {
  if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
    return { migrated: false, reason: 'already_done' };
  }

  const existingMeta = await db.sync_meta.get('migration_complete');
  if (existingMeta?.value === true) {
    localStorage.setItem(MIGRATION_FLAG, 'true');
    return { migrated: false, reason: 'already_done' };
  }

  console.log('[BME DB] Starting localStorage → IndexedDB migration...');
  const stats = { history: 0, templates: 0, tabs: 0 };

  try {
    await db.transaction('rw', [db.history, db.templates, db.tabs, db.sync_meta], async () => {
      // Migrate history
      const historyRaw = localStorage.getItem('bme_history');
      if (historyRaw) {
        try {
          const historyItems = JSON.parse(historyRaw);
          if (Array.isArray(historyItems) && historyItems.length > 0) {
            const now = new Date().toISOString();
            const records: HistoryEntry[] = historyItems.map((item, index) => ({
              id: item.id || `legacy_${Date.now()}_${index}`,
              user_id: 'guest',
              title: item.title || '',
              date: item.date || now,
              items: item.items || [],
              cardMode: item.cardMode || 'simple',
              timestamp: item.timestamp || now,
              created_at: item.timestamp || item.date || now,
              updated_at: item.timestamp || item.date || now,
              version: 1,
              deleted_at: null,
            }));
            await db.history.bulkPut(records);
            stats.history = records.length;
          }
        } catch (e) {
          console.warn('[BME DB] History migration parse error:', e);
        }
      }

      // Migrate templates
      const templatesRaw = localStorage.getItem('bme_templates');
      if (templatesRaw) {
        try {
          const templateItems = JSON.parse(templatesRaw);
          if (Array.isArray(templateItems) && templateItems.length > 0) {
            const now = new Date().toISOString();
            const records: Template[] = templateItems.map((item, index) => ({
              id: item.id || `tmpl_${Date.now()}_${index}`,
              user_id: 'guest',
              name: item.name || '',
              items: item.items || [],
              created_at: now,
              updated_at: now,
              version: 1,
              deleted_at: null,
            }));
            await db.templates.bulkPut(records);
            stats.templates = records.length;
          }
        } catch (e) {
          console.warn('[BME DB] Templates migration parse error:', e);
        }
      }

      // Migrate tabs
      const tabsRaw = localStorage.getItem('bme_tabs');
      if (tabsRaw) {
        try {
          const tabItems = JSON.parse(tabsRaw);
          if (Array.isArray(tabItems) && tabItems.length > 0) {
            const now = new Date().toISOString();
            const records: Tab[] = tabItems.map(item => ({
              id: item.id,
              user_id: 'guest',
              mode: item.mode,
              title: item.title || '',
              data: item.data || {},
              created_at: now,
              updated_at: now,
              version: 1,
            }));
            await db.tabs.bulkPut(records);
            stats.tabs = records.length;
          }
        } catch (e) {
          console.warn('[BME DB] Tabs migration parse error:', e);
        }
      }

      await db.sync_meta.put({ key: 'migration_complete', value: true });
    });

    localStorage.setItem(MIGRATION_FLAG, 'true');
    console.log('[BME DB] Migration complete:', stats);
    return { migrated: true, stats };
  } catch (e: any) {
    console.error('[BME DB] Migration failed:', e);
    return { migrated: false, reason: 'error', error: e.message };
  }
}

// ============================================================
// CRUD HELPERS
// ============================================================

export async function getAll(tableName: 'history' | 'templates' | 'tabs', userId = 'guest') {
  if (tableName === 'tabs') {
    return db.tabs.where('user_id').equals(userId).toArray();
  }
  if (tableName === 'templates') {
    return db.templates
      .where('user_id')
      .equals(userId)
      .filter(record => !record.deleted_at)
      .toArray();
  }
  return db.history
    .where('user_id')
    .equals(userId)
    .filter(record => !record.deleted_at)
    .toArray();
}

export async function getById(tableName: 'history' | 'templates' | 'tabs', id: string) {
  if (tableName === 'tabs') return db.tabs.get(id);
  if (tableName === 'templates') return db.templates.get(id);
  return db.history.get(id);
}

export async function putRecord(tableName: 'history' | 'templates' | 'tabs', record: any) {
  const now = new Date().toISOString();
  const existing = record.id ? await getById(tableName, record.id) : null;

  const updatedRecord = {
    ...record,
    updated_at: now,
    version: existing ? (existing.version || 0) + 1 : 1,
    created_at: existing?.created_at || record.created_at || now,
  };

  if (tableName === 'tabs') {
    await db.tabs.put(updatedRecord);
  } else if (tableName === 'templates') {
    await db.templates.put(updatedRecord);
  } else {
    await db.history.put(updatedRecord);
  }
  return updatedRecord.id;
}

export async function bulkPut(tableName: 'history' | 'templates' | 'tabs', records: any[]) {
  const now = new Date().toISOString();
  const updatedRecords = records.map(record => ({
    ...record,
    updated_at: record.updated_at || now,
    version: record.version || 1,
    created_at: record.created_at || now,
  }));

  if (tableName === 'tabs') {
    await db.tabs.bulkPut(updatedRecords);
  } else if (tableName === 'templates') {
    await db.templates.bulkPut(updatedRecords);
  } else {
    await db.history.bulkPut(updatedRecords);
  }
}

export async function softDelete(tableName: 'history' | 'templates', id: string) {
  const now = new Date().toISOString();
  if (tableName === 'templates') {
    await db.templates.update(id, { deleted_at: now, updated_at: now });
  } else {
    await db.history.update(id, { deleted_at: now, updated_at: now });
  }
}

export async function hardDelete(tableName: 'history' | 'templates' | 'tabs', id: string) {
  if (tableName === 'tabs') await db.tabs.delete(id);
  else if (tableName === 'templates') await db.templates.delete(id);
  else await db.history.delete(id);
}

export async function clearUserData(tableName: 'history' | 'templates' | 'tabs', userId: string) {
  if (tableName === 'tabs') {
    return db.tabs.where('user_id').equals(userId).delete();
  } else if (tableName === 'templates') {
    return db.templates.where('user_id').equals(userId).delete();
  } else {
    return db.history.where('user_id').equals(userId).delete();
  }
}

export async function getChangedSince(tableName: 'history' | 'templates' | 'tabs', userId: string, sinceTimestamp: string) {
  if (tableName === 'tabs') {
    return db.tabs
      .where('[user_id+updated_at]')
      .between([userId, sinceTimestamp], [userId, '\uffff'], false, true)
      .toArray();
  } else if (tableName === 'templates') {
    return db.templates
      .where('[user_id+updated_at]')
      .between([userId, sinceTimestamp], [userId, '\uffff'], false, true)
      .toArray();
  } else {
    return db.history
      .where('[user_id+updated_at]')
      .between([userId, sinceTimestamp], [userId, '\uffff'], false, true)
      .toArray();
  }
}

export async function replaceAllForUser(tableName: 'history' | 'templates' | 'tabs', userId: string, records: any[]) {
  if (tableName === 'tabs') {
    await db.transaction('rw', db.tabs, async () => {
      await db.tabs.where('user_id').equals(userId).delete();
      if (records && records.length > 0) {
        await db.tabs.bulkPut(records);
      }
    });
  } else if (tableName === 'templates') {
    await db.transaction('rw', db.templates, async () => {
      await db.templates.where('user_id').equals(userId).delete();
      if (records && records.length > 0) {
        await db.templates.bulkPut(records);
      }
    });
  } else {
    await db.transaction('rw', db.history, async () => {
      await db.history.where('user_id').equals(userId).delete();
      if (records && records.length > 0) {
        await db.history.bulkPut(records);
      }
    });
  }
}

// ============================================================
// SYNC METADATA HELPERS
// ============================================================

export async function getSyncMeta(key: string): Promise<any> {
  const record = await db.sync_meta.get(key);
  return record?.value;
}

export async function setSyncMeta(key: string, value: any): Promise<void> {
  await db.sync_meta.put({ key, value });
}

export async function getLastSyncTimestamp(): Promise<string | null> {
  return getSyncMeta('last_sync_at');
}

export async function updateLastSyncTimestamp(): Promise<void> {
  await setSyncMeta('last_sync_at', new Date().toISOString());
}

// ============================================================
// SYNC QUEUE HELPERS
// ============================================================

export async function enqueueSyncOp(
  tableName: 'history' | 'templates' | 'tabs',
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  recordId: string,
  payload: any = null
): Promise<number> {
  const existing = await db.sync_queue
    .where('record_id')
    .equals(recordId)
    .and(item => item.table_name === tableName && item.status === 'pending')
    .first();

  if (existing) {
    await db.sync_queue.update(existing.id!, {
      operation,
      payload,
      created_at: new Date().toISOString(),
    });
    return existing.id!;
  }

  return db.sync_queue.add({
    table_name: tableName,
    operation,
    record_id: recordId,
    payload,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
  });
}

export async function getPendingSyncOps(): Promise<SyncQueueEntry[]> {
  return db.sync_queue
    .where('status')
    .equals('pending')
    .sortBy('created_at');
}

export async function markSyncComplete(queueId: number): Promise<void> {
  await db.sync_queue.delete(queueId);
}

export async function markSyncFailed(queueId: number): Promise<void> {
  const entry = await db.sync_queue.get(queueId);
  if (!entry) return;

  if (entry.retry_count >= 5) {
    await db.sync_queue.update(queueId, { status: 'dead' });
  } else {
    await db.sync_queue.update(queueId, {
      status: 'pending',
      retry_count: entry.retry_count + 1,
    });
  }
}

export async function clearSyncQueue(): Promise<void> {
  await db.sync_queue.clear();
}

export async function resetDeadSyncOps(): Promise<number> {
  return db.transaction('rw', db.sync_queue, async () => {
    const deadOps = await db.sync_queue.where('status').equals('dead').toArray();
    if (deadOps.length > 0) {
      console.log(`[BME DB] Resetting ${deadOps.length} dead sync operations to pending...`);
      for (const op of deadOps) {
        await db.sync_queue.update(op.id!, { status: 'pending', retry_count: 0 });
      }
    }
    return deadOps.length;
  });
}

export async function clearSyncMeta(): Promise<void> {
  await db.sync_meta.clear();
}

export async function getPendingSyncCount(): Promise<number> {
  return db.sync_queue.where('status').equals('pending').count();
}

// ============================================================
// ACCOUNT ISOLATION
// ============================================================

export async function clearAccountData(userId: string | null = null): Promise<void> {
  await db.transaction('rw', [db.history, db.templates, db.tabs, db.sync_queue, db.sync_meta], async () => {
    if (userId) {
      await db.history.where('user_id').equals(userId).delete();
      await db.templates.where('user_id').equals(userId).delete();
      await db.tabs.where('user_id').equals(userId).delete();
    } else {
      await db.history.clear();
      await db.templates.clear();
      await db.tabs.clear();
    }
    await db.sync_queue.clear();

    const deviceId = await getSyncMeta('device_id');
    await db.sync_meta.clear();
    if (deviceId) {
      await setSyncMeta('device_id', deviceId);
    }
  });
}

export async function getUserDataCounts(userId = 'guest') {
  const [historyCount, templatesCount, tabsCount] = await Promise.all([
    db.history.where('user_id').equals(userId).filter(r => !r.deleted_at).count(),
    db.templates.where('user_id').equals(userId).filter(r => !r.deleted_at).count(),
    db.tabs.where('user_id').equals(userId).count(),
  ]);
  return { history: historyCount, templates: templatesCount, tabs: tabsCount };
}
