const RULES = {
  login: {
    email: [
      { required: true, message: 'Please enter your email!' },
      { type: 'email', message: 'Please enter a valid email!' },
    ],
    password: [
      { required: true, message: 'Please enter a password!' },
      { min: 6, message: 'Password must be at least 6 characters!' },
      {
        max: 16,
        message: 'Password must be at most 16 characters!',
      },
    ],
  },
  register: {
    name: [
      { required: true, message: 'Please enter the employee name!' },
      { min: 3, message: 'Name must be at least 3 characters!' },
      {
        max: 30,
        message: 'Name must be at most 30 characters!',
      },
    ],
    email: [
      { required: true, message: 'Please enter your email!' },
      { type: 'email', message: 'Please enter a valid email!' },
    ],
    password: [
      { required: true, message: 'Please enter a password!' },
      { min: 6, message: 'Password must be at least 6 characters!' },
      {
        max: 16,
        message: 'Password must be at most 16 characters!',
      },
    ],
  },
  createEmployee: {
    name: [
      { required: true, whitespace: true, message: 'Vui lòng nhập tên nhân viên.' },
      { max: 100, message: 'Tên nhân viên tối đa 100 ký tự.' },
    ],
    email: [
      { required: true, message: 'Vui lòng nhập email.' },
      { type: 'email', message: 'Email không hợp lệ.' }
    ],
    phone: [
      { pattern: /^\+?\d{9,15}$/, message: 'Số điện thoại cần từ 9 đến 15 chữ số.' },
      { max: 15, message: 'Số điện thoại tối đa 15 ký tự, kể cả dấu +.' },
    ],
    password: [
      { required: true, message: 'Please enter a password!' },
      { min: 6, message: 'Password must be at least 6 characters!' },
      {
        max: 16,
        message: 'Password must be at most 16 characters!',
      },
    ],
  },
};
export default RULES;
