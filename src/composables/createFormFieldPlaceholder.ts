export const createFormFieldPlaceholder = (label:string, placeholder?:string | null, required?:boolean): string => {
  let composedPlaceholder: string = label;

  if (placeholder) {
    composedPlaceholder = placeholder;
  }

  if (required === true && composedPlaceholder[composedPlaceholder.length - 1] !== '*') {
    composedPlaceholder = `${composedPlaceholder} *`;
  }

  return composedPlaceholder;
};
