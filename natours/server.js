const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });
const mongoose = require('mongoose');

//handle runtime exceptions
// Must be on top to listen exceptions in app
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION!!! App is going to shutdown 🧨');
  //exit immediately as node is not in clean state
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected successfully'));

//require after env files is read
const app = require('./app');
// Start server
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});

//handle runtime rejections (Ex: DB connection failure)
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION!!! App is going to shutdown 🧨');
  //gracefully shutdown, process pending requests first
  server.close(() => process.exit(1));
});
