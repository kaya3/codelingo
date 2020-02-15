import axios from 'axios';

const API_URL = 'https://codelingo.werp.site/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const request = {
  getData<T = any>(uri: string, params: any): Promise<T> {
    return api.get<T>(uri, {
      params,
    }).then(response => {
      return response.data;
    });
  }
}
