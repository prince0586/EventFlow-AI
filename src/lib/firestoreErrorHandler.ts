/**
 * Firestore Error Handling Tier
 * 
 * Provides high-precision error categorization and implements the 
 * architectural mandate for JSON-serialized error reporting.
 */
import { auth } from '../firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string | null; email: string | null; }[];
  }
}

/**
 * Handles Firestore exceptions by categorical analysis and serialization.
 * If the error is an authorization failure, it throws a structured JSON string
 * as mandated by the EventFlow AI security directives.
 * 
 * @param error - The raw error caught during a Firestore operation.
 * @param operationType - The type of operation being performed.
 * @param path - The Firestore path segment (if applicable).
 */
export function handleFirestoreError(
  error: any, 
  operationType: FirestoreErrorInfo['operationType'],
  path: string | null = null
): never {
  const user = auth.currentUser;
  
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || null,
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || true,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName,
        email: p.email
      })) || []
    }
  };

  const isPermissionDenied = errorInfo.error.toLowerCase().includes('permission') || 
                             errorInfo.error.toLowerCase().includes('insufficient');

  if (isPermissionDenied) {
    // CRITICAL: Protocol-mandated JSON serialization for security auditing
    throw new Error(JSON.stringify(errorInfo));
  }

  console.error(`[Firestore] ${operationType.toUpperCase()} Error:`, errorInfo.error);
  throw error;
}
