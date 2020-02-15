import axios from "axios";

const API_URL = "";

const axiosConfig = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: "application/json"
});

export function getData<T = any>(uri: string, params: {} = {}) {
  return axiosConfig.get<T>(uri, {
    params
  });
}
