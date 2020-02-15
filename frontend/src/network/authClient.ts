import { request } from './request';

export const authClient = {

  login(username: string, password: string): Promise<any> {
    const formData = new FormData();

    formData.append('username', username);
    formData.append('password', password);

    console.log('sending login request');

    return request.postData('/login', formData).then(response => {
      return true;
    });
  },

  logout(): Promise<boolean> {
    return request.postData('/logout', new FormData()).then(response => {
      return true;
    });
  },

  getWhoAmI(): Promise<boolean> {
    return request.getData('/who_am_i', {}).then(response => {
      return true;
    });
  },
}
