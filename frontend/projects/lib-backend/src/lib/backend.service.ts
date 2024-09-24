import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

type KeyValuePair = {[key: string]: any};
type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

interface RequestPayload {
  body?: any;
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: any;
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType: any;
  withCredentials?: boolean;
}
interface BackendUrls extends KeyValuePair {
  users: string;
  groups: string;
  posts: string;
}
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  backendURL?: string;

  constructor(@Inject('environment') private env: KeyValuePair,
              private http: HttpClient,) {
    this.backendURL = this.env['backendURL'];
  }

  private _constructURL(urlPath: string): string {
    urlPath = urlPath.startsWith('/') ? urlPath : '/'.concat(urlPath);
    if (this.backendURL && !urlPath.includes(this.backendURL)) {
      const url = this.backendURL.endsWith('/') ? this.backendURL.slice(0, -1) : this.backendURL;
      urlPath = url.concat(urlPath);
    }
    return urlPath;
  }

  get urlPaths(): BackendUrls {
    return {
      users: '/api/users',
      groups: '/api/groups',
      posts: '/api/posts'
    };
  }

  private _isArray(value: any): boolean {
    return value instanceof Array || Object.prototype.toString.call(value) === '[object Array]';
  }

  private _isObject(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  private _isFileValue(value: any): boolean {
    let isFile = value instanceof File;
    if (this._isArray(value)) {
      for (const val of value) {
        if (val instanceof File) {
          isFile = true;
          break;
        }
      }
    }
    return isFile;
  }

  private _cleanValue(value: any, asFormData: boolean): any {
    if (this._isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i] = this._cleanValue(value[i], asFormData);
      }
    } else if (value instanceof Date) {
      [value] = (value as Date).toISOString().split('T');
    } else if (asFormData) {
      if (value === null) {
        value = '';
      }
      if (value !== undefined && !(value instanceof File) && this._isObject(value)) {
        for (const [key, val] of Object.entries(value)) {
          value[key] = this._cleanValue(val, asFormData);
        }
        value = JSON.stringify(value);
      }
    }
    return value;
  }

  private _queryParams(queryParams: KeyValuePair): HttpParams {
    let params = new HttpParams();
    for (let [key, val] of Object.entries(queryParams)) {
      val = this._cleanValue(val, false);
      if (val !== null && val !== undefined) {
        params = params.append(key, val);
      }
    }
    return params;
  }

  private _headers(contentType?: string): HttpHeaders {
    contentType = contentType ? contentType : 'application/json';
    return new HttpHeaders({ 'Content-Type': contentType });
  }

  private _payloadBody(body: KeyValuePair, asFormData = false): FormData | KeyValuePair {
    const formBody: KeyValuePair = {};
    const fd = new FormData();
    asFormData = asFormData ? asFormData : !!Object.values(body).find(val => this._isFileValue(val));
    for (const [key, value] of Object.entries(body)) {
      if (this._isFileValue(value) && !asFormData) {
        asFormData = true;
      }
      if (value !== undefined) {
        formBody[key] = this._cleanValue(value, asFormData);
      }
    }
    if (asFormData) {
      for (const [key, val] of Object.entries(formBody)) {
        if (this._isArray(val)) {
          for (const item of val) {
            fd.append(key, item);
          }
        } else {
          fd.append(key, val);
        }
      }
      return fd;
    }
    return formBody;
  }

  private _constructPayload(method = 'GET', body?: KeyValuePair,
                            queryParams?: KeyValuePair, contentType?: string,
                            asFilePayload = false, buffer = false,
                            includeHeaders?: boolean): RequestPayload {
    const responseType: ResponseType = buffer ? 'arraybuffer' : asFilePayload && method === 'GET' ? 'blob' : 'json';
    const payload: RequestPayload = {
      responseType,
    };
    includeHeaders = (includeHeaders !== false && !asFilePayload) || (asFilePayload && method === 'GET');
    if (includeHeaders) { payload.headers = this._headers(contentType); }
    if (body) { payload.body = this._payloadBody(body, asFilePayload && method !== 'GET'); }
    if (queryParams) { payload.params = this._queryParams(queryParams); }
    if (asFilePayload) {
      payload.reportProgress = true;
      payload.observe = 'events';
    }
    return payload;
  }

  private _callBackend<T>(method: string, urlPath: string, payload: RequestPayload): Observable<T> {
    const url = this._constructURL(urlPath);
    return this.http.request<T>(method, url, payload);
  }

  get<T>(urlPath: string, queryParams?: KeyValuePair, getFile = false, contentType?: string, buffer = false): Observable<T> {
    const payload = this._constructPayload('GET', undefined, queryParams, contentType, getFile, buffer);
    return this._callBackend<T>('GET', urlPath, payload);
  }

  post<T>(urlPath: string, body?: KeyValuePair, hasFile = false): Observable<T> {
    const payload = this._constructPayload('POST', body, undefined, undefined, hasFile);
    return this._callBackend<T>('POST', urlPath, payload);
  }

  put<T>(urlPath: string, body?: KeyValuePair, hasFile = false): Observable<T> {
    const payload = this._constructPayload('PUT', body, undefined, undefined, hasFile);
    return this._callBackend<T>('PUT', urlPath, payload);
  }

  patch<T>(urlPath: string, body?: KeyValuePair, hasFile = false): Observable<T> {
    const payload = this._constructPayload('PATCH', body, undefined, undefined, hasFile);
    return this._callBackend<T>('PATCH', urlPath, payload);
  }

  delete<T>(urlPath: string, queryParams?: KeyValuePair): Observable<T> {
    const payload = this._constructPayload('DELETE', undefined, queryParams, undefined, undefined, undefined);
    return this._callBackend<T>('DELETE', urlPath, payload);
  }

}
