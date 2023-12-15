import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Log } from "../utils";

const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  Log.debug("[axios] request", config);
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  Log.debug("[axios] request error", error);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  Log.debug("[axios] response", response);
  return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  Log.debug("[axios] response error", error);
  return Promise.reject(error);
};

export function setupInterceptorsTo(
  axiosInstance: AxiosInstance
): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}
