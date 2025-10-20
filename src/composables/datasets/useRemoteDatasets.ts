import { inject } from 'vue';
import type { LocalCosmosApi, GenericForm as GenericFormType, LCApiRequestResult, DatasetListEntry } from 'localcosmos-client';
import { LCApiResultTypes } from 'localcosmos-client';
import { extractImages } from '@/utils/extractImages';
import { usePermissionsStore } from '@/stores/permissions';
import { useAuthStore } from '@/stores/auth';
import { resizeImage } from '@/utils/resizeImage';
import { getTaxonomicImageFileName } from '@/composables/getTaxonomicImageFileName';

export type RemoteDatasetResult = {
  success: boolean;
  uuid?: string;
  result?: LCApiRequestResult | null;
}

export type ProgressCallback = (current: number, total: number, fileName?: string) => void;
export type ErrorCallback = (error: string, fileName?: string) => void;

export function useRemoteDatasets() {

  const LCApi = inject('LCApi') as LocalCosmosApi;
  const permissionsStore = usePermissionsStore();
  const authStore = useAuthStore();

  const getRemoteDataset = async (uuid: string): Promise<LCApiRequestResult> => {
    const result = await LCApi.getDataset(uuid);
    return result;
  };

  const getRemoteUserDatasets = async (limit: number, offset: number): Promise<LCApiRequestResult> => {

    const clientId = authStore.getDeviceUuid();

    let result: LCApiRequestResult | null = null;

    if (authStore.token) {
      result = await LCApi.getUserDatasetList(clientId, authStore.token.access, limit, offset);
    } else {
      result = await LCApi.getUserDatasetList(clientId, undefined, limit, offset);
    }

    return result;
  };

  const getRemoteDatasetImage = (dataset: DatasetListEntry): string => {

    if (dataset.imageUrl && dataset.imageUrl['2x']) {
      return dataset.imageUrl['2x'];
    }

    const taxon = dataset.taxon;
    let imageFileName = 'unknown';

    if (taxon) {
      const taxonImageFilename = getTaxonomicImageFileName(taxon.taxonSource, taxon.taxonNuid);
      if (taxonImageFilename) {
        imageFileName = taxonImageFilename;
      }
    }
    return `/images/taxonomy-placeholder/${imageFileName}.svg`;
  };

  const createRemoteDataset = async (
    genericForm: GenericFormType, 
    data: Record<string, any>, 
    onImageProgress?: ProgressCallback,
    onImageError?: ErrorCallback,
  ): Promise<RemoteDatasetResult> => {

    if (permissionsStore.canUseDatasets === true) {

      const clientId = authStore.getDeviceUuid();
      // @ts-ignore
      const platform = device.platform;

      const images = extractImages(genericForm, data);

      const checkFormResult = await LCApi.getObservationForm(genericForm.uuid, genericForm.version.toString());

      let datasetUuid: string | null = null;
      let performSubmission: boolean = true;
      let success: boolean = false;
      let result: LCApiRequestResult | null = null;

      if (checkFormResult.response && checkFormResult.response.status === 404) {
        let postFormResult = null;
        
          if (authStore.token) {
            postFormResult = await LCApi.postObservationForm(genericForm, authStore.token.access);
          } else {
            result = await LCApi.postObservationForm(genericForm);
          
        }

        if (postFormResult && postFormResult.type === LCApiResultTypes.error) {
          result = postFormResult;
          //setServerErrors(postFormResult.error);
          performSubmission = false;
        }
      }

      if (performSubmission === true) {

        let datasetResult: LCApiRequestResult | null = null;

        if (authStore.token) {
          datasetResult = await LCApi.createDataset(data, genericForm, clientId, platform, authStore.token.access);
        } else {
          datasetResult = await LCApi.createDataset(data, genericForm, clientId, platform);
        }

        result = datasetResult;
        if (datasetResult && datasetResult.type === LCApiResultTypes.success) {

          datasetUuid = datasetResult.data.uuid;

          // upload images
          if (Object.keys(images).length > 0 && datasetUuid) {
            await uploadImages(images, datasetUuid, onImageProgress, onImageError);
          }

          success = true;
        }

        result = datasetResult;
      }

      return { success : success, result: result};

    } 
    
    return { success: false, result: null };

  };

  const updateRemoteDataset = async (
    datasetUuid: string,genericForm: GenericFormType, 
    data: Record<string, any>, 
    onImageProgress?: ProgressCallback,
    onImageError?: ErrorCallback
  ): Promise<RemoteDatasetResult> => {

    if (permissionsStore.canUseDatasets === true) {

      const clientId = authStore.getDeviceUuid();
      // @ts-ignore
      const platform = device.platform;
      const images = extractImages(genericForm, data);

      let datasetResult: LCApiRequestResult | null = null;

      if (authStore.token) {
        datasetResult = await LCApi.updateDataset(datasetUuid, data, genericForm, clientId, platform, authStore.token.access);
      } else {
        datasetResult = await LCApi.updateDataset(datasetUuid, data, genericForm, clientId, platform);
      }

      if (datasetResult && datasetResult.type === LCApiResultTypes.success) {

        // upload images
        if (Object.keys(images).length > 0) {
          await uploadImages(images, datasetUuid, onImageProgress, onImageError);
        }

        return { success: true, uuid: datasetUuid, result: datasetResult };
      } else {
        return { success: false, result: datasetResult };
      }

    }

    return { success: false, result: null };
  };


  const createRemoteDatasetImage = async (datasetUuid: string, fieldUuid: string, resizedImage: Blob, imageFilename: string): Promise<LCApiRequestResult> => {
    const imageResponse = authStore.token 
      ? await LCApi.createDatasetImage(datasetUuid, fieldUuid, resizedImage, imageFilename, authStore.token.access)
      : await LCApi.createDatasetImage(datasetUuid, fieldUuid, resizedImage, imageFilename);

    return imageResponse
  };

  const uploadImages = async (
    images: Record<string, File[]>, 
    datasetUuid: string, 
    onProgress?: ProgressCallback,
    onError?: ErrorCallback
  ) => {
    // Calculate total files for progress
    const totalFiles = Object.values(images).flat().length;
    let uploadedCount = 0;

    for (const [fieldUuid, fileList] of Object.entries(images)) {
      for (let i = 0; i < fileList.length; i++) {
        const originalFile = fileList[i];
        
        try {
          // Report progress start for this file
          onProgress?.(uploadedCount, totalFiles, originalFile.name);

          const resizedImage = await resizeImage(originalFile, 2000, 95);
          
          if (!resizedImage) {
            const errorMsg = `Image resizing failed for ${originalFile.name}`;
            onError?.(errorMsg, originalFile.name);
            continue; // Skip this file but continue with others
          }

          const imageFilename = originalFile.name.replace(/\.[^/.]+$/, '.jpg');

          const imageResponse = await createRemoteDatasetImage(datasetUuid, fieldUuid, resizedImage, imageFilename);

          if (imageResponse.type === LCApiResultTypes.success) {
            uploadedCount++;
            // Report progress completion for this file
            onProgress?.(uploadedCount, totalFiles, originalFile.name);
          } else {
            const errorMsg = `Upload failed for ${originalFile.name}: ${JSON.stringify(imageResponse.error)}`;
            onError?.(errorMsg, originalFile.name);
          }

        } catch (error) {
          const errorMsg = `Unexpected error uploading ${originalFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          onError?.(errorMsg, originalFile.name);
        }
      }
    }
  };


  const deleteRemoteDataset = async (datasetUuid: string): Promise<RemoteDatasetResult> => {
    if (permissionsStore.canUseDatasets === true) {
      
      let result = null;
      const clientId = authStore.getDeviceUuid();

      if (authStore.token) {
        result = await LCApi.deleteDataset(datasetUuid, clientId, authStore.token.access);
      } else {
        result = await LCApi.deleteDataset(datasetUuid, clientId);
      }

      if (result && result.type === LCApiResultTypes.success) {
        return { success: true, result: result };
      } else {
        return { success: false, result: result};
      }
      
    } 

    return { success: false, result: null };
    
  };

  return {
    createRemoteDataset,
    createRemoteDatasetImage,
    updateRemoteDataset,
    getRemoteDataset,
    getRemoteUserDatasets,
    getRemoteDatasetImage,
    deleteRemoteDataset,
    uploadImages,
  };
}