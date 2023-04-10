const express = require('express');

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require(`${__dirname}/../controllers/userController`);
const { signup, login, forgotPassword, resetPassword, updatePassword, protect } = require('./../controllers/authController');
const { restrictTo } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword',protect, updatePassword);
router.get('/me', protect, getMe, getUser)
router.delete('/deleteMe', protect, deleteMe)
router.patch('/updateMe', protect, uploadUserPhoto, resizeUserPhoto, updateMe)

router.route('/').get(protect, restrictTo('admin', 'lead-guide'), getAllUsers);
router.route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
