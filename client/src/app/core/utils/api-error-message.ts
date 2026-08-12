import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  message?: string | string[];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const message = getMessage(error.error);

  if (message) {
    return message;
  }

  switch (error.status) {
    case 400:
      return 'Please review the submitted information.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This conflicts with an existing resource.';
    case 500:
      return 'An unexpected server error occurred. Please try again.';
    default:
      return fallback;
  }
}

function getMessage(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const message = (body as ApiErrorBody).message;

  if (Array.isArray(message)) {
    return message.join(' · ');
  }

  return typeof message === 'string' ? message : null;
}
