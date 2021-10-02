/* eslint-disable */
import '@babel/polyfill';
import { login, updateSettings, logout } from './login';
import { loadMap } from './mapBox';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const saveUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
if (map) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW5hbnRoYWsiLCJhIjoiY2t1ODJnaGc5M2RreTJucWh1bmhsY21mZiJ9.uLrrMSTYbrRiKONqJXyJGw';
  loadMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (saveUserForm) {
  saveUserForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    updateSettings({ email, name }, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('.btn-change-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    console.log({ passwordCurrent, password, passwordConfirm });
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn-change-password').textContent =
      'Save Password';
  });
}
