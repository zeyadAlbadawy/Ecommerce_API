const dotenv = require('dotenv').config();
const app = require('../app.js');
const mongoose = require('mongoose');

const DB = process.env.CONNECTING_URL.replace(
  '<db_password>',
  process.env.USER_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log('Server is running');
});
