import { request } from "./request";

export const authClient = {

  login(username: string, password: string): Promise<any> {
    return request.postData('/api/login', '').then(response => {
      return true;
    });
  },

  logout(): Promise<boolean> {
    return request.postData('/api/logout', '').then(response => {
      return true;
    });
  },
}
