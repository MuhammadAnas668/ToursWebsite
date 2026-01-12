const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError') 

const handlerCastErrorDB = err=>{
  console.log(err.messageFormat);
  
  const message = `invalid ${err.path}: ${err.value}`
  return new AppError(message,StatusCodes.NOT_FOUND)
}

const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/dup key: {.*?: ['"](.*?)['"] }/);
  const dupValue = value ? value[1] : ''; 
  const message = `Duplicate field value: ${dupValue}. Please use another value!`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el=>el.message)
  const message = `invalid input data. ${errors}`
  console.log(errors);
  
  return new AppError(message,StatusCodes.BAD_REQUEST)
}
const handleJWTError = () =>new AppError('invalid token please login again! ',StatusCodes.UNAUTHORIZED)
const handleJWTExpiredError=()=>new AppError('your has expire! please login again.',StatusCodes.UNAUTHORIZED)
const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
    status: err.status,
    error:err,
    message: err.message,
    stack:err.stack
  });
}

const sendErrorProd = (err,res)=>{
  // Operational trusted error send message to client
  if(err.isOperational){
    res.status(err.statusCode).json({
    status: err.status,
    message:err.message,
    })
}else{
  console.error('ERROR ✨💥',err);

  // Send generic message
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status:'error',
    message:'Something went very wrong!'
  })
 }
}

module.exports=(err, req, res, next) => {
  // console.log(err.stack);
  
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV ==='development'){
    sendErrorDev(err,res)
  }else if (process.env.NODE_ENV === 'production'){
    if (err.name === 'CastError') err = handlerCastErrorDB(err)
    if (err.code === 11000) err = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
    if (err.name === 'JsonWebTokenError')err= handleJWTError()
    if (err.name === 'TokenExpiredError')err=handleJWTExpiredError()

      sendErrorProd(err,res)
  }

}