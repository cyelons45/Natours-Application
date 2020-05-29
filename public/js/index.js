import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout, signup} from './login';
import {updateMe} from './updateSettings';
import {payment} from './payment';
import {showAlert} from './alerts';
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettingsForm = document.querySelector('.form-user-settings');
const tour_Payment = document.getElementById('book-tour');
// const sideNav = document.querySelectorAll('.side-nav');
// const sidebar = document.querySelector('.user-view__menu');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
if (signUpForm)
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);
// if (accountBtn) accountBtn.addEventListener('click', account);
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const email = document.getElementById('email').value;
    // const name = document.getElementById('name').value;
    updateMe(form, 'data');
  });

if (userSettingsForm)
  userSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const password = document.getElementById('password-current').value;
    const newpassword = document.getElementById('password').value;
    const newpasswordConfirm = document.getElementById('password-confirm')
      .value;
    await updateMe({password, newpassword, newpasswordConfirm}, 'password');
    // updateMyPassword(password, newpassword, newpasswordConfirm);
    // document.getElementById('password-current').value = '';
    // document.getElementById('password').value = '';
    // document.getElementById('password-confirm').value = '';
  });

if (tour_Payment)
  tour_Payment.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    payment(e.target.dataset.tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
// if (sidebar)
//   sidebar.addEventListener('click', (e) => {
//     console.log(e.target.closest('.side-nav'));
//   });
