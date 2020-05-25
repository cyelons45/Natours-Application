import axios from 'axios';
import {showAlert} from './alerts';

export const updateMe = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:4000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:4000/api/v1/users/updateMe';

    const res = await axios.patch(url, data);
    if (type != 'password') location.reload(true);
    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
  document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
};

// export const updateMyPassword = async (
//   password,
//   newpassword,
//   newpasswordConfirm
// ) => {
//   try {
//     const res = await axios.patch(
//       'http://127.0.0.1:4000/api/v1/users/updatePassword',
//       {
//         password,
//         newpassword,
//         newpasswordConfirm,
//       }
//     );

//     if (res.data.status === 'success') {
//       //   location.reload(true);
//       showAlert('success', 'Password updated successfully');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
//   document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
// };
