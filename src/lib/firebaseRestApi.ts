/**
 * Firebase REST API Client
 * Alternative method to access Firestore when WebChannel fails
 */

import { auth } from './firebase';

const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/inspira-f55e4/databases/(default)/documents';

class FirebaseRestClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      if (!auth?.currentUser) return null;
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.warn('⚠️ Failed to get auth token:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${FIRESTORE_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocument(collection: string, docId: string): Promise<any> {
    try {
      console.log(`🌐 REST: Getting document ${collection}/${docId}`);
      const data = await this.makeRequest(`/${collection}/${docId}`);
      
      // Convert Firestore REST format to regular format
      if (data.fields) {
        return this.convertFirestoreToJS(data.fields);
      }
      return null;
    } catch (error: any) {
      if (error.message.includes('404')) {
        console.log(`📄 Document ${collection}/${docId} not found`);
        return null;
      }
      throw error;
    }
  }

  async setDocument(collection: string, docId: string, data: any, merge = false): Promise<void> {
    try {
      console.log(`🌐 REST: Setting document ${collection}/${docId}`);
      const firestoreData = this.convertJSToFirestore(data);
      
      const method = merge ? 'PATCH' : 'POST';
      const endpoint = merge ? `/${collection}/${docId}` : `/${collection}?documentId=${docId}`;
      
      await this.makeRequest(endpoint, {
        method,
        body: JSON.stringify({
          fields: firestoreData
        })
      });
      
      console.log(`✅ Document ${collection}/${docId} saved via REST`);
    } catch (error) {
      console.error(`❌ Failed to save document ${collection}/${docId}:`, error);
      throw error;
    }
  }

  private convertFirestoreToJS(fields: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value !== null) {
        const fieldValue = value as any;
        
        if (fieldValue.stringValue !== undefined) {
          result[key] = fieldValue.stringValue;
        } else if (fieldValue.integerValue !== undefined) {
          result[key] = parseInt(fieldValue.integerValue);
        } else if (fieldValue.doubleValue !== undefined) {
          result[key] = parseFloat(fieldValue.doubleValue);
        } else if (fieldValue.booleanValue !== undefined) {
          result[key] = fieldValue.booleanValue;
        } else if (fieldValue.timestampValue !== undefined) {
          result[key] = new Date(fieldValue.timestampValue);
        } else if (fieldValue.arrayValue?.values) {
          result[key] = fieldValue.arrayValue.values.map((v: any) => 
            this.convertFirestoreToJS({ temp: v }).temp
          );
        } else if (fieldValue.mapValue?.fields) {
          result[key] = this.convertFirestoreToJS(fieldValue.mapValue.fields);
        } else if (fieldValue.nullValue !== undefined) {
          result[key] = null;
        }
      }
    }
    
    return result;
  }

  private convertJSToFirestore(obj: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result[key] = { nullValue: null };
      } else if (typeof value === 'string') {
        result[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          result[key] = { integerValue: value.toString() };
        } else {
          result[key] = { doubleValue: value };
        }
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value };
      } else if (value instanceof Date) {
        result[key] = { timestampValue: value.toISOString() };
      } else if (Array.isArray(value)) {
        result[key] = {
          arrayValue: {
            values: value.map(v => this.convertJSToFirestore({ temp: v }).temp)
          }
        };
      } else if (typeof value === 'object') {
        result[key] = {
          mapValue: {
            fields: this.convertJSToFirestore(value)
          }
        };
      }
    }
    
    return result;
  }
}

export const firebaseRestClient = new FirebaseRestClient();
