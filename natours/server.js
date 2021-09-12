const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
  })
  .then(() => console.log('DB connected successfully'));

//require after env files is read
const app = require('./app');
// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});
