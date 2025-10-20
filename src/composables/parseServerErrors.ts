import type { ServerErrorTypes } from 'localcosmos-client';

export type ServerErrorMessages = Record<string, string>;

export const NON_FIELD_ERROR_KEY = 'nonFieldErrors';

export function parseServerErrors(serverError: ServerErrorTypes, existingFields?: string[]): ServerErrorMessages | null {
  const errorMessages: ServerErrorMessages = {};
  let hasErrors = false;

  if (serverError != null) {
    if (typeof serverError === 'string' && serverError.length > 0) {
      hasErrors = true;
      errorMessages[NON_FIELD_ERROR_KEY] = serverError;
    } else if (serverError instanceof Array && serverError.length > 0) {
      hasErrors = true;
      errorMessages[NON_FIELD_ERROR_KEY] = serverError.join(', ');
    } else if (serverError.constructor === Object && Object.keys(serverError).length > 0) {
      hasErrors = true;

      let errorDict = serverError as Record<string, any>;
      if ('errors' in errorDict) {
        errorDict = errorDict.errors;
      }

      Object.entries(errorDict).forEach(([fieldName, error]) => {
        if (fieldName === 'detail') {
          fieldName = NON_FIELD_ERROR_KEY;
        } else if (existingFields && !(existingFields.includes(fieldName))) {
          error = `${fieldName}: ${error}`;
          fieldName = NON_FIELD_ERROR_KEY;
        }

        if (error instanceof Array) {
          errorMessages[fieldName] = error.join(', ');
        } else {
          errorMessages[fieldName] = error;
        }
      });
    }
  }

  if (hasErrors === true) {
    return errorMessages;
  } else {
    return null;
  }
}


export function parseServerErrorsToString (serverError: ServerErrorTypes): string {

  let errorMessage = 'unknown error';

  const errorMessages = parseServerErrors(serverError);
  if (errorMessages){
    if (NON_FIELD_ERROR_KEY in errorMessages){
      errorMessage = errorMessages[NON_FIELD_ERROR_KEY];
    }
    else {
      errorMessage = Object.values(errorMessages).join();
    }
  }
  else {
    errorMessage = 'unknown error'
  }

  return errorMessage;
}