const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const slugify  = require('slugify');
const DB = process.env.MONGO_URI;

    process.on('uncaughtException',err =>{
    console.log(err.name,err.message);
    console.log('unhandled rejection shuting down');
    process.exit(1)
  })
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port,"0.0.0.0", () => {  
  console.log(`App running on port ${port}...`);
});

  process.on('unhandledRejection',err =>{
    console.log(err.name,err.message);
    console.log('unhandled rejection shuting down');
    server.close(()=>{
      process.exit(1)
    })
    
  })


    // console.log(x);
