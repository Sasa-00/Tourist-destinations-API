const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Able to read variables from config.env
dotenv.config({ path: './config.env' });

const app = require(`${__dirname}/app`);

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}...`);
});
