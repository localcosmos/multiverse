import type { GenericFormField } from 'localcosmos-client';
import { GenericFormFieldType } from 'localcosmos-client';

import { t } from 'i18next';

// returns a translated label
export const createGenericFieldLabel = (genericField: GenericFormField): string => {
  let label = t(genericField.definition.label);

  const numberFields: GenericFormFieldType[] = [GenericFormFieldType.DecimalField, GenericFormFieldType.FloatField, GenericFormFieldType.IntegerField];

  if (numberFields.includes(genericField.fieldClass)) {
    if (genericField.definition.unit) {
      label = `${label} (${genericField.definition.unit})`;
    }
  }

  if (genericField.definition.required === true) {
    label = `${label} *`;
  }

  return label;
};
