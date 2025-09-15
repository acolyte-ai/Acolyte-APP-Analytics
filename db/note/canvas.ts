import { openDB } from 'idb';

const DB_NAME = 'CanvasDBInfinite';
const STORE_NAME = 'DocumentsInfinite';
const VERSION = 1;

// Queue system for IndexedDB operations to prevent concurrent access issues
class DBOperationQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift()!;
      try {
        await operation();
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1));
      } catch (error) {
        console.error('Queue operation failed:', error);
      }
    }

    this.isProcessing = false;
  }
}

const dbQueue = new DBOperationQueue();

async function initDB() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
      }
    },
  });
}

interface Document {
  id: string;
  elements: any[];
  appState: any;
  files: any;
  lastModified: number;
}

export async function saveAppState(
  currentDocumentId: string,
  elements: readonly any[] | undefined,
  appState: any,
  files: any
): Promise<boolean> {
  if (!currentDocumentId) {
    console.error('Invalid input: currentDocumentId is required');
    return false;
  }

  return dbQueue.add(async () => {
    try {
      const db = await initDB();
      if (!db) {
        console.error('Database initialization failed');
        return false;
      }

      const safeElements = elements ? [...elements] : [];
      const safeAppState = appState || {};
      const safeFiles = files || {};

      const updatedDoc: Document = {
        id: currentDocumentId,
        elements: safeElements,
        appState: safeAppState,
        files: safeFiles,
        lastModified: Date.now(),
      };

      await db.put(STORE_NAME, updatedDoc);
      return true;
    } catch (error) {
      console.error('Failed to save app state:', error);
      return false;
    }
  });
}

export async function getAppState(currentDocumentId: string) {
  if (!currentDocumentId) {
    console.error('Invalid input: currentDocumentId is required');
    throw new Error('Required parameter missing');
  }

  return dbQueue.add(async () => {
    try {
      const db = await initDB();
      if (!db) throw new Error('Database initialization failed');

      const doc = await db.get(STORE_NAME, currentDocumentId);
      if (!doc) return null;

      return {
        elements: doc.elements || [],
        appState: doc.appState || {},
        files: doc.files || {},
        lastModified: doc.lastModified || Date.now(),
      };
    } catch (error) {
      console.error('Failed to get app state:', error);
      return null;
    }
  });
}

export async function getAllNoteIds(): Promise<string[]> {
  try {
    const db = await initDB();
    if (!db) throw new Error('Database initialization failed');

    const allKeys = await db.getAllKeys(STORE_NAME);
    return allKeys as string[];
  } catch (error) {
    console.error('Failed to retrieve note IDs:', error);
    return [];
  }
}

export async function deleteAppState(currentDocumentId: string): Promise<boolean> {
  if (!currentDocumentId) {
    console.error('Invalid input: currentDocumentId is required');
    return false;
  }

  return dbQueue.add(async () => {
    try {
      const db = await initDB();
      if (!db) {
        console.error('Database initialization failed');
        return false;
      }

      await db.delete(STORE_NAME, currentDocumentId);
      return true;
    } catch (error) {
      console.error('Failed to delete app state:', error);
      return false;
    }
  });
}
