import axios from 'axios';

export interface Response<T = unknown> {
  status: number;
  statusText: string;
  data: T;
}

export class Axios {
  host: string;
  headers?: any;

  constructor(opt: {
    host: string;
    headers?: any;
  },
  ) {
    this.host = opt.host;
    this.headers = opt.headers;
  }

  private generateQuerystring(parameters: any): string {
    return Object.keys(parameters)
      .map(function (key) {
        return (
          encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
        );
      })
      .join("&");
  }

  private generateURL(api: string, parameters: any): string {
    const qs = this.generateQuerystring(parameters);
    return this.host.concat(api, "?", qs);
  }


  get<T = unknown, R = Response<T>, D = any>(api: string, paramters?: any, headers?: any): Promise<R> {
    const url = this.generateURL(api, paramters);
    const mergeHeadrs = { ...this.headers, ...headers };
    return axios.get<T, R, D>(url, { headers: mergeHeadrs });
  }

  post<T = unknown, R = Response<T>, D = any>(api: string, data: any, paramters?: any, headers?: any): Promise<any> {
    const url = this.generateURL(api, paramters);
    const mergeHeadrs = { ...this.headers, ...headers };
    return axios.post<T, R, D>(url, data, { headers: mergeHeadrs });
  }

  put<T = unknown, R = Response<T>, D = any>(api: string, data: any, paramters?: any, headers?: any): Promise<any> {
    const url = this.generateURL(api, paramters);
    const mergeHeadrs = { ...this.headers, ...headers };
    return axios.put<T, R, D>(url, data, { headers: mergeHeadrs });
  }

  delete<T = unknown, R = Response<T>, D = any>(api: string, paramters?: any, headers?: any): Promise<any> {
    const url = this.generateURL(api, paramters);
    const mergeHeadrs = { ...this.headers, ...headers };
    return axios.delete<T, R, D>(url, { headers: mergeHeadrs });
  }
}