import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Style, Process, Worker, ProductionRecord, Subsidy } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

interface Database {
  styles: Style[];
  processes: Process[];
  workers: Worker[];
  productionRecords: ProductionRecord[];
  subsidies: Subsidy[];
}

type TableName = keyof Database;
type TableItem<T extends TableName> = Database[T][number];

const defaultDb: Database = {
  styles: [],
  processes: [],
  workers: [],
  productionRecords: [],
  subsidies: [],
};

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
  }
}

export function readDb(): Database {
  ensureDir();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

export function writeDb(db: Database) {
  ensureDir();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function initDatabase() {
  ensureDir();
  console.log('Database initialized successfully');
}

export const db = {
  all: <T extends TableName>(table: T): Database[T] => readDb()[table],
  
  get: <T extends TableName>(table: T, id: string): TableItem<T> | undefined => {
    return readDb()[table].find((item) => item.id === id);
  },
  
  where: <T extends TableName>(table: T, conditions: Record<string, unknown>): Database[T] => {
    return readDb()[table].filter((item) => {
      return Object.entries(conditions).every(([key, value]) => item[key as keyof typeof item] === value);
    }) as Database[T];
  },
  
  insert: <T extends TableName>(table: T, data: TableItem<T>): TableItem<T> => {
    const dbData = readDb();
    (dbData[table] as TableItem<T>[]).push(data);
    writeDb(dbData);
    return data;
  },
  
  update: <T extends TableName>(table: T, id: string, data: Partial<TableItem<T>>): TableItem<T> | null => {
    const dbData = readDb();
    const index = dbData[table].findIndex((item) => item.id === id);
    if (index === -1) return null;
    (dbData[table] as TableItem<T>[])[index] = { ...(dbData[table][index] as TableItem<T>), ...data };
    writeDb(dbData);
    return dbData[table][index] as TableItem<T>;
  },
  
  delete: <T extends TableName>(table: T, id: string): boolean => {
    const dbData = readDb();
    const index = dbData[table].findIndex((item) => item.id === id);
    if (index === -1) return false;
    (dbData[table] as TableItem<T>[]).splice(index, 1);
    writeDb(dbData);
    return true;
  },
  
  insertMany: <T extends TableName>(table: T, items: TableItem<T>[]): TableItem<T>[] => {
    const dbData = readDb();
    (dbData[table] as TableItem<T>[]).push(...items);
    writeDb(dbData);
    return items;
  },
};

export default db;
