import api from './api';

class AuthService {
  login(username, password) {
    return api.post('/auth/login/', { username, password })
      .then(response => {
        if (response.data.tokens) {
          this.setUserData(response.data);
        }
        return response.data;
      });
  }

  register(username, password, email) {
    return api.post('/auth/register/', {
      username,
      password,
      password2: password,
      email
    }).then(response => {
      if (response.data.tokens) {
        this.setUserData(response.data);
      }
      return response.data;
    });
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      api.post('/auth/logout/', { refresh: refreshToken })
        .catch(error => console.error('Logout error:', error));
    }
    this.clearUserData();
  }

  getProfile() {
    return api.get('/auth/profile/');
  }

  getUserBalance() {
    return this.getProfile().then(response => response.data.balance);
  }

  setUserData(data) {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
  }

  clearUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

export default new AuthService();