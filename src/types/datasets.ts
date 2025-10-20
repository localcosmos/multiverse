import type { DatasetListEntry } from 'localcosmos-client';

export interface DatasetSaveResult {
  success: boolean;
  uuid?: string;
  error?: string;
}

export type NamedDatasetListEntry = DatasetListEntry & {
  name: string;
  imageUrl: {
    [key:string]: string;
  };
};