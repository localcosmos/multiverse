import type { GenericForm as GenericFormType, GenericFormField } from 'localcosmos-client';
import { GenericFormFieldType } from 'localcosmos-client';

export const extractImages = (genericForm: GenericFormType, data: Record<string, any>): Record<string, File[]> => {
  const images: Record<string, File[]> = {};
  
  genericForm.fields.forEach((field: GenericFormField) => {
    if (field.fieldClass === GenericFormFieldType.PictureField && field.uuid in data) {
      images[field.uuid] = data[field.uuid];
      delete data[field.uuid];
    }
  });
  
  return images;
};