import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import type { GenericForm, DatasetValue } from 'localcosmos-client';

interface Dataset {
  id?: number;
  uuid: string;
  serverUuid?: string; // Optional, for remote datasets
  observationForm: GenericForm;
  data: Record<string, DatasetValue>;
  timestamp: number;
  synced: boolean;
}

interface DatasetImage {
  id?: number;
  datasetUuid: string;  // Foreign key to Dataset
  fieldUuid: string;
  filePath?: string;
  blob?: Blob;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  position: number;     // For maintaining order
  timestamp: number;
  synced: boolean,
}

const db = new Dexie('LocalcosmosDatabase') as Dexie & {
  datasets: EntityTable<Dataset, 'id'>;
  datasetImages: EntityTable<DatasetImage, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  datasets: '++id, uuid, timestamp, synced',
  datasetImages: '++id, datasetUuid, fieldUuid, position, timestamp, synced, [datasetUuid+fieldUuid]'
});

export type { Dataset, DatasetImage };
export { db };