/* eslint-disable */
import '@babel/polyfill';
import { login, updateSettings, logout } from './login';
import { loadMap } from './mapBox';
import { bookTour } from './stripe';
const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const saveUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const bookTourBtn = document.getElementById('book-tour');
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
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    //handling file
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('.btn-change-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
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

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing ...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
