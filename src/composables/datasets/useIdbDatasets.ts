import { toRaw } from 'vue';
import Dexie from 'dexie';
import type { GenericForm as GenericFormType, TaxonType, TemporalJson } from 'localcosmos-client';
import { db } from '@/database/db';
import type { Dataset as IdbDataset, DatasetImage } from '@/database/db';
import { getTaxonomicImageFileName } from '@/composables/getTaxonomicImageFileName';
import type { DatasetSaveResult } from '@/types/datasets';
import { extractImages } from '@/utils/extractImages';
import { resizeImage } from '@/utils/resizeImage';

export function useIdbDatasets() {

  // Separate method for saving images
  const saveDatasetImages = async (
    images: Record<string, File[]>, 
    datasetUuid: string, 
    timestamp: number
  ): Promise<void> => {
    if (Object.keys(images).length === 0) {
      return; // No images to save
    }

    const isPersistent = await requestPersistentStorage();
    if (isPersistent) {
      console.log('✅ Images will be protected from auto-cleanup');
    } else {
      console.log('⚠️ Storage may be cleaned up automatically');
    }

    for (const [fieldUuid, fileList] of Object.entries(images)) {
      for (let position = 0; position < fileList.length; position++) {
        const originalFile = fileList[position];

        // resize the file
        let compression = 95;
        let maxSize = 2000;

        // @ts-ignore
        if (device.platform === 'iOS') {
          maxSize = 1500;
          compression = 90; // iOS has stricter limits on IndexedDB size
        }
        const resizedImage = await resizeImage(originalFile, maxSize, compression);

        if (resizedImage) {
          
          // Browser: store blob in IndexedDB, respect limits on ios
          await db.datasetImages.add({
            datasetUuid,
            fieldUuid,
            position,
            filename: originalFile.name,
            originalFilename: originalFile.name,
            mimeType: originalFile.type,
            size: resizedImage.size,
            timestamp,
            blob: resizedImage,
            synced: false,
          });
         
        } else {
          console.warn(`Failed to resize image for field ${fieldUuid} at position ${position}`);
          throw new Error(`Failed to resize image for field ${fieldUuid} at position ${position}`);
        }
      }
    }
  };

  const createDataset = async (genericForm: GenericFormType, data: Record<string, any>): Promise<DatasetSaveResult> => {
    const images = extractImages(genericForm, data);
  
    try {
      const timestamp = Date.now();
      const localUuid = crypto.randomUUID();
  
      await db.datasets.add({
        uuid: localUuid,
        observationForm: toRaw(genericForm),
        data: data,
        timestamp: timestamp,
        synced: false,
      });

      // Store images using separate method
      await saveDatasetImages(images, localUuid, timestamp);
  
      return { success: true, uuid: localUuid };
    } catch (error) {
      console.error('Failed to create dataset:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Dexie.ConstraintError) {
        errorMessage = 'Dataset already exists';
      } else if (error instanceof Dexie.DataError) {
        errorMessage = 'Invalid data format';
      } else if (error instanceof Dexie.QuotaExceededError) {
        errorMessage = 'Storage full';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      return { success: false, error: errorMessage };
    }
  };
  
  const updateDataset = async (datasetUuid: string, genericForm: GenericFormType, data: Record<string, any>): Promise<DatasetSaveResult> => {
    const images = extractImages(genericForm, data);
  
    try {
      // Check if dataset exists and is not synced
      const existingDataset = await db.datasets.where('uuid').equals(datasetUuid).first();
      
      if (!existingDataset) {
        return { success: false, error: 'Dataset not found' };
      }
      
      if (existingDataset.synced) {
        return { success: false, error: 'Cannot update synced dataset' };
      }
      
      const timestamp = Date.now();
      
      // Update existing dataset
      const updateResult = await db.datasets.where('uuid').equals(datasetUuid).modify({
        observationForm: toRaw(genericForm),
        data: data,
        timestamp: timestamp,
        synced: false,
      });
  
      if (updateResult === 0) {
        return { success: false, error: 'Dataset not found for update' };
      }

      await saveDatasetImages(images, datasetUuid, timestamp);
  
      return { success: true, uuid: datasetUuid };
    } catch (error) {
      console.error('Failed to update dataset:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Dexie.ConstraintError) {
        errorMessage = 'Dataset constraint violation';
      } else if (error instanceof Dexie.DataError) {
        errorMessage = 'Invalid data format';
      } else if (error instanceof Dexie.QuotaExceededError) {
        errorMessage = 'Storage full';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      return { success: false, error: errorMessage };
    }
  };

  const syncDatasets = async () => {

  };

  const getUnsyncedDatasets = async () => {
    return await db.datasets.filter(dataset => !dataset.synced).toArray();
  };

  const getUnsyncedDatasetImages = async (datasetUuid: string) => {
    return await db.datasetImages
      .where('datasetUuid')
      .equals(datasetUuid)
      .filter(image => !image.synced)
      .toArray();
  };

  const getAllUnsyncedImages = async () => {
    return await db.datasetImages.filter(image => !image.synced).toArray();
  }
  
  const markDatasetAsSynced = async (id: number, serverUuid: string) => {
    await db.datasets.where('id').equals(id).modify({ synced: true, serverUuid: serverUuid });
  };

  const markDatasetImageAsSynced = async (id: number) => {
    await db.datasetImages.where('id').equals(id).modify({ synced: true });
  };
  
  const deleteDataset = async (uuid: string) => {
    await db.transaction('rw', db.datasets, db.datasetImages, async () => {
      await db.datasets.where('uuid').equals(uuid).delete();
      await db.datasetImages.where('datasetUuid').equals(uuid).delete();
    });
  };

  const deleteDatasetImage = async (id: number) => {
    await db.datasetImages
      .where('id')
      .equals(id)
      .delete();

    // Optionally, you can also delete the file from the filesystem if needed
  };

  const getTaxonFromDataset = (genericForm: GenericFormType, data:Record<string, any>): TaxonType | null => {
    const taxonReferenceFieldUuid = genericForm.taxonomicReference;
    let taxon: TaxonType|null = null;
    if (taxonReferenceFieldUuid in data && data[taxonReferenceFieldUuid] instanceof Object) {
      taxon = data[taxonReferenceFieldUuid] as TaxonType;
    }
    return taxon;
  };

  const getDateFromDataset = (genericForm: GenericFormType, data: Record<string, any>): Date | null => {
    const dateFieldUuid = genericForm.temporalReference;
    if (dateFieldUuid in data && data[dateFieldUuid] instanceof Object) {
      const temporalData = data[dateFieldUuid] as TemporalJson;
      const timestamp = temporalData.cron.timestamp;
      const offset = temporalData.cron.timezoneOffset;
      
      // Create Date object from timestamp (assuming timestamp is in milliseconds)
      const date = new Date(timestamp);
      
      // Apply timezone offset if needed
      // Note: JavaScript Date handles UTC internally, so we may need to adjust
      // depending on how the offset is meant to be applied
      if (offset !== undefined) {
        // If offset is in minutes, convert to milliseconds and adjust
        const offsetMs = offset * 60 * 1000;
        return new Date(date.getTime() + offsetMs);
      }
      
      return date;
    }
    return null;
  };

  const getDataset = async (uuid: string) => {
    return await db.datasets.where('uuid').equals(uuid).first();
  };

  const getDatasetImage = async (idbDataset: IdbDataset): Promise<string> => {

    let imageUrl: string = '';

    // get the first image from db
    if (idbDataset.id) {
      const datasetImage = await db.datasetImages.where('datasetUuid').equals(idbDataset.uuid).first();
      if (datasetImage) {
        imageUrl = datasetImage.blob ? URL.createObjectURL(datasetImage.blob) : '';
      }
    }
    
    if (!imageUrl) {
      const taxon = getTaxonFromDataset(idbDataset.observationForm, idbDataset.data);
      let imageFileName = 'unknown';

      if (taxon) {
        const taxonImageFilename = getTaxonomicImageFileName(taxon.taxonSource, taxon.taxonNuid);
        if (taxonImageFilename) {
          imageFileName = taxonImageFilename;
        }
      }
      imageUrl = `/images/taxonomy-placeholder/${imageFileName}.svg`;
    }
    
    return imageUrl;
  };

  const getGenericFieldImages = async (datasetUuid: string, fieldUuid: string): Promise<DatasetImage[]> => {
    const images = await db.datasetImages
      .where('[datasetUuid+fieldUuid]')
      .equals([datasetUuid, fieldUuid])
      .toArray();
    
    return images.sort((a, b) => a.position - b.position);
  };

  const getImageBlob = async (datasetImage: DatasetImage): Promise<Blob | null> => {
    return datasetImage.blob || null;

  };

  const requestPersistentStorage = async (): Promise<boolean> => {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      return false;
    }
  
    try {
      // Check if already persistent
      const isPersistent = await navigator.storage.persisted();
      if (isPersistent) {
        return true;
      }
  
      // Request persistent storage
      const granted = await navigator.storage.persist();
      return granted;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  };
  
  const getStorageUsage = async () => {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }
  
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercent: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
        isPersistent: await navigator.storage.persisted()
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return null;
    }
  };

  return {
    createDataset,
    updateDataset,
    syncDatasets,
    getUnsyncedDatasets,
    markDatasetAsSynced,
    markDatasetImageAsSynced,
    deleteDataset,
    getTaxonFromDataset,
    getDateFromDataset,
    getDatasetImage,
    getDataset,
    getGenericFieldImages,
    getImageBlob,
    deleteDatasetImage,
    getAllUnsyncedImages,
    getUnsyncedDatasetImages,
    requestPersistentStorage,
    getStorageUsage,
  };
}