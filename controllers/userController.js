

const multer = require('multer')
const sharp = require('sharp')
const {StatusCodes}=require("http-status-codes")
const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')


const multerStorage = multer.memoryStorage()
//  multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); // files will be saved in /uploads
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{cb(new AppError('Not an image ! Please upload only images.',400),false)}
}
const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});


const filterObj = (obj,...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el] =obj[el]
  })
  return newObj
}
exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.role) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /UpdateMyPassword',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Filter out unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Add photo if uploaded
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(StatusCodes.NO_CONTENT).json({
    status:'success',
    data:null
  })
})

exports.createUser = (req, res) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signUp instead'
  });
};


exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)
//do not updates passwords with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)