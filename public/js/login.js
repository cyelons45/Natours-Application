import axios from 'axios';
import {showAlert} from './alerts';
export const login = async (email, password) => {
  try {
    const res = await axios.post('/api/v1/users/login', {
      email,
      password,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 200);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    if (res.data.status === 'success')
      window.setTimeout(() => {
        location.assign('/');
      }, 100);
    // location.reload(true);
    // window.setTimeout((res),1000)
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const persDetails = {
      name,
      email,
      password,
      passwordConfirm,
    };
    const res = await axios.post(`/api/v1/users/signup`, persDetails);
    showAlert('success', 'You are sign in.');
    if (res.data.status === 'success')
      window.setTimeout(() => {
        location.assign('/');
      }, 100);
    // location.reload(true);
    // window.setTimeout((res),1000)
  } catch (err) {
    showAlert('error', 'Error Signing up! Try again');
  }
};
