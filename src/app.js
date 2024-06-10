const cors = require('cors');
const express = require('express');
const compression = require('compression');

const helmet = require('helmet');

const httpStatus = require('http-status');
const routes = require('./routes');
const ApiError = require('./utils/ApiError');
const {errorConverter, errorHandler} = require('./middlewares/error');
const xss = require('xss-clean');


const app = express();


app.use(xss());

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({extended: true}));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// Reroute all API request starting with "/v1" route
app.use('/v1', routes);

app.get('/', (req, res) => {
  res.status(httpStatus.OK).send('Welcome to WanderOn API');
})
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;