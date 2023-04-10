const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const { deleteOne, updateOne, getOne, getAll } = require("./handlerFactory");
const multer = require('multer');
const sharp = require('sharp');

// Store image to buffer
const multerStorage = multer.memoryStorage();

// Filter uploaded files to allow only images
const multerFilter = (req,file,cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true);
  }else{
    cb(new AppError('Not an Image! Please upload only image'), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
// Upload image
const uploadUserPhoto = upload.single('photo');

// Store image in project direcrory and resize it to square.
function resizeUserPhoto (req, res, next){
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);

  next();
}

async function updateMe (req,res,next) {
  try{
    if(req.body.password || req.body.passwordConfirm){
      return next(new AppError('This route is not for password updates! Please use /updatePassword', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new:true, runValidators:true});

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  }catch (err){
    return next(new AppError(err.message, 400));
  }
}

async function deleteMe(req,res,next){
  try{
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
      status: "success",
      data: null
    })
  }catch(err){
    return next(new AppError(err.message, 400));
  }
}

function getMe(req,res,next){
  if(!req.params.id){
    req.params.id = req.user.id;
  }
  next();
}

const getAllUsers = getAll(User)
const getUser = getOne(User);
const updateUser = updateOne(User)
const deleteUser = deleteOne(User);

// Filtering allowed keys in object
function filterObj(obj, ...allowedField) {
  let newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedField.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

module.exports = { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto};
