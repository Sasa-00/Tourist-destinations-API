const { promisify } = require('util')
const crypto = require('crypto')
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const jwt = require('jsonwebtoken')

function signToken (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}
function createSendToken(user,statusCode, res) {
  const token = signToken(user._id)

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // secure: true,
    httpOnly: true
  })

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  })
}

async function signup(req, res, next) {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role
    });

    createSendToken(newUser, 200, res)
  } catch (err) {
    next(new AppError(err.message, 404));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res)
  } catch (err) {
    next(new AppError(err.message, 404));
  }
}

async function protect(req, res, next) {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (freshUser.changedPasswordAfter(decoded.iat) === true) {
      return next(new AppError('User recently changed password! Please log in again', 401))
    }

    req.user = freshUser
    next()
  } catch (err) {
    new AppError(err.message, 400)
  }
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next();
  }
}

async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return next(new AppError('There is no user with that email address', 403))
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and
    passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      })
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false })
      return next(new AppError('There was an error sending the email.', 500))
    }

  } catch (err) {
    return next(new AppError(err.message, 400));
  }
}

async function resetPassword(req, res, next) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user,200,res)

  } catch (err) {
    return next(new AppError(err.message, 400));
  }
}

async function updatePassword (req,res,next){
  try{
    user = await User.findById(req.user.id).select('+password');
    if(!user){
      return next(new AppError('Please provide valid email address', 404));
    }

    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
      return next(new AppError('Provided old password is not valid', 404));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    createSendToken(user,200,res)
  }catch (err) {
    return next(new AppError(err.message, 400));
  }
}

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
};
