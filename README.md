The assessment provided by WanderOn includes several tasks that I need to complete. The project contains a folder named "SRC," which includes several subfolders. These subfolders contain various files. I will describe the purpose of these files.

1. config
1.1- config,js - (Basically this is for .env variables)
Dependencies - 
a. joi- A powerful schema description language and data validator for JavaScript.
b. path - A Node.js core module for handling file and directory paths.
c. dotenv - A module to load environment variables from a .env file into process.env.

Uses dotenv.config to load environment variables from a .env file located two directories up from the current file's directory
The envVarsSchema object defines the expected structure and constraints of the environment variables:
NODE_ENV: Must be a string with one of the following values: 'test', 'development', 'production'. It is required.
PORT: Must be a number, defaulting to 8082 if not provided.
MONGODB_URL: Must be a string and is required.
SECRET_KEY: Must be a string and is required.
.unknown(): Allows the presence of additional environment variables that are not explicitly defined in the schema.

The module exports an object containing the validated and structured configuration:

env: The current environment ('test', 'development', 'production').
port: The port number on which the server will run.
mongoose: Configuration for connecting to MongoDB:
url: The MongoDB URL, with a suffix -test if the environment is 'test'.
options: Connection options for Mongoose.
secret_key: A secret key used for cryptographic operations.

1.2 logger.js- 
dependencies- The module relies on the following npm packages:
	winston: A versatile logging library for Node.js applications.
	config: A custom configuration module that provides environment-specific settings

The enumerateErrorFormat function formats error messages:

It checks if the log info object is an instance of Error.
If true, it replaces the message property with the error's stack trace.
This ensures that error logs contain detailed stack traces for easier debugging.

The createLogger method configures the logger with the following options:

level: Sets the logging level. In development mode, it's set to 'debug' for verbose logging. Otherwise, it's set to 'info'.
format: Combines multiple formatting options:
	enumerateErrorFormat(): Adds stack trace to error messages.
	colorize() or uncolorize(): Colors log messages in development mode for better readability; removes colors 	in other environments.
	splat(): Allows for string interpolation in log messages.
	printf(({ level, message }) => ${level}: ${message}): Customizes the log message format to include the log 	level and message.
transports: Specifies where to send log messages:
	Console: Logs messages to the console.
		stderrLevels: ['error']: Directs error messages to standard error (stderr).


2. controller- (basically it contains 2 functions that is login user and register user. 
loginUser: Handles user login by verifying credentials and generating a JWT.
registerUser: Handles user registration by creating a new user and generating a JWT)

2.1 auth.controller.js -
dependencies- The module requires the following dependencies:

authService and userService: Custom services for handling authentication and user operations.
jsonwebtoken (jwt): Library for generating and verifying JSON Web Tokens.
config: Configuration module containing application secrets and settings.
bcrypt: Library for hashing and comparing passwords (assumed to be imported but missing in the provided code)

loginUser- 
This asynchronous function handles user login. It verifies the user's credentials and generates a JWT if the credentials are valid.

Parameters-
	req (Object): The request object, containing email and password in the body.
	res (Object): The response object.
Process
a. Extracts email and password from the request body.
b. Attempts to retrieve the user by email using userService.getUserByEmail.
c. If the user does not exist, responds with a 400 status and an "Invalid Credentials" message.
d. Compares the provided password with the stored hash using bcrypt.compare.
e. If the passwords do not match, responds with a 400 status and an "Invalid Credentials" message.
f. Creates a JWT payload containing the user's ID.
g. Signs the JWT with the secret key from the configuration and sets an expiration time of 1 hour.
h. Sets the token in an HTTP-only cookie and responds with the token.
I. Catches any errors, logs them, and responds with a 500 status and a "Server error" message.

registerUser-

This asynchronous function handles user registration. It creates a new user and generates a JWT if the registration is successful.

Parameters
	req (Object): The request object, containing username, email, and password in the body.
	res (Object): The response object.
Process
a. Extracts username, email, and password from the request body.
b. Checks if a user with the given username or email already exists using userService.getUserByEmail.
c. If the user exists, responds with a 400 status and a "User already exists" message.
d. Creates a new user with the provided details using authService.createUser.
e. Saves the new user to the database.
f. Creates a JWT payload containing the user's ID.
g. Signs the JWT with the secret key from the configuration and sets an expiration time of 1 hour.
h. Sets the token in an HTTP-only cookie and responds with the token.
I. Catches any errors, logs them, and responds with a 500 status and a "Server error" message

3.middlewares

3.1 error.js- (basically contains 2 functions errorConvertor and errorHandler-
errorConverter: Converts any error into an ApiError instance to ensure consistent error formatting.
errorHandler: Handles errors by sending a standardized response to the client and logging errors in development mode.)

dependencies -The module relies on the following dependencies:

http-status: A library for HTTP status codes.
config: Custom configuration module for environment settings.
logger: Custom logging module.
ApiError: Custom error class for API-specific errors.

errorConverter-
This middleware function converts any thrown errors into an instance of ApiError, ensuring a consistent error format throughout the application.

Parameters
	err (Object): The error object thrown by the application.
	req (Object): The request object.
	res (Object): The response object.
	next (Function): The next middleware function in the stack.
Process
a. Checks if the provided err is an instance of ApiError.
b. If not, it converts the error into an ApiError:
	statusCode: Uses the error's status code or defaults to INTERNAL_SERVER_ERROR.
	message: Uses the error's message or the default message for the status code.
	stack: Includes the error's stack trace for debugging.
c. Passes the ApiError to the next middleware function using next(error).

errorHandler
This middleware function handles errors by sending an appropriate HTTP response to the client. It also logs errors in development mode.

Parameters
	err (Object): The error object passed from errorConverter or other middlewares.
	req (Object): The request object.
	res (Object): The response object.
	next (Function): The next middleware function in the stack (unused in this function).
Process
a. Extracts statusCode and message from the error object.
b. If the environment is 'production' and the error is not operational:
	Sets statusCode to INTERNAL_SERVER_ERROR.
	Sets message to the default message for INTERNAL_SERVER_ERROR.
c.Sets res.locals.errorMessage to the error's message for potential use in views.
d. Constructs the response object:
	Includes code and message.
	Includes the error's stack trace in development mode for debugging.
e. Logs the error using the logger if the environment is 'development'.
f. Sends the error response with the appropriate status code.

3.2 jwtAuth.js- (Middleware function for authenticating requests using JWT)

dependencies - The module relies on the following dependencies:

http-status: A library for HTTP status codes.
ApiError: Custom error class for API-specific errors.
User and Admin: Models representing user and admin data (assumed to be defined in the models directory).
userService and authService: Services for handling user and authentication operations.
dotenv: A module to load environment variables from a .env file.
jsonwebtoken (jwt): A library for generating and verifying JSON Web Tokens.
bodyParser: Middleware for parsing incoming request bodies.

jwtAuth-

This middleware function authenticates requests using JWT. It extracts the token from the request headers, verifies it, and attaches the decoded user information to the request object.

Usage-
This middleware should be used in routes that require authentication.

Parameters-
	req (Object): The request object.
	res (Object): The response object.
	next (Function): The next middleware function in the stack.
Process-
a. Token Extraction: Retrieves the JWT from the Authorization header.
	The token is expected to be in the format Bearer <token>.
b. Token Verification: Verifies the token using the secret key from environment variables.
	If the token is missing or invalid, responds with a 401 status and an "Unauthorized" message.
	If the token is valid, decodes it and attaches the user information to the req.user object.
c. Error Handling: Catches any errors during the process and responds with a 401 status and an "Unauthorized" message.
d. Next Middleware: If verification succeeds, calls the next middleware function.


3.3 pick.js - (creates a new object composed of specified properties from a given object)

The pick function takes an object and an array of keys and returns a new object that includes only the properties of the original object that match the specified keys.

Parameters-
	object (Object): The source object from which properties are to be picked.
	keys (string[]): An array of strings representing the keys to pick from the source object.
Returns-
	(Object): A new object composed of the picked properties.

Explanation
a. Function Signature: The function is defined to accept an object and an array of keys.
b. Reduce Method: The function uses the reduce method to iterate over the keys array.
c. Property Check: For each key, it checks if the key exists in the object using Object.prototype.hasOwnProperty.call.
d. Property Assignment: If the key exists, it assigns the value of the key from the object to the new object (obj).
e. Return New Object: The function returns the new object containing only the picked properties

3.4 - validate.js- ( ensures that incoming requests conform to a specified Joi schema. It supports validation for JSON and multipart/form-data request content types.)

Dependencies- The middleware relies on the following dependencies:

Joi: A powerful schema description language and data validator for JavaScript.
http-status: A library for HTTP status codes.
pick: A utility function for picking specific properties from an object.
ApiError: A custom error class for API-specific errors.

validate- 
The validate middleware function validates incoming requests against a given Joi schema. It checks the request content type, picks the relevant fields to validate, and ensures that the request data matches the schema.

Parameters-
	schema (Object): A Joi schema object defining the validation rules for request parameters, query, files, and body.
Returns-
	(Function): An asynchronous middleware function that validates the request.

Explanation
a. Content Type Verification:
	Uses req.is to check if the request's content type is application/json or multipart/form-data.
	Returns a 415 error if the content type is unsupported.

b. Schema and Request Object Picking:
	Utilizes the pick function to extract the necessary parts of the schema and request object.

c. Validation:
	Compiles and validates the schema with Joi.compile.
	If validation fails, it cleans up any file buffers and constructs a detailed error message.

d. Request Update:
	If validation passes, merges the validated values back into the request object for further processing.


4. models- 

4.1 user.model.js-(represents users in the application. The model is defined using Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js.)

dependencies-The model relies on the following dependencies:
mongoose: A MongoDB object modeling tool designed to work in an asynchronous environment.
bcryptjs: A library to hash passwords.

User Schema
The userSchema defines the structure and constraints for user documents in the MongoDB collection. It includes fields for username, phone, email, and password.

Schema Definition
a. Fields
	username (String): The username of the user.
		Trimmed, unique, and required.
b. phone (String): The phone number of the user.
	Trimmed, optional (default: null).
c. email (String): The email address of the user.
	Trimmed, unique, and required.
d. password (String): The hashed password of the user.
	Trimmed and required.

5. routes - 

5.1 auth.route.js-(These routes handle user login and registration functionalities, ensuring that the request data is validated before being processed by the respective controllers.)

Dependencies
The routes rely on the following dependencies:

express: A web application framework for Node.js.
authController: The controller handling authentication logic.
authValidation: The validation schemas for authentication routes.
validate: A middleware function that validates request data against the specified Joi schema.

POST /login
This route handles user login requests. It validates the incoming request data using the validate middleware and the authValidation.login schema before passing it to the authController.loginUser controller.

Middleware
	a. validate(authValidation.login): Validates the request body against the login validation schema.
	b. authController.loginUser: The controller function that processes the login request.

POST /register
This route handles user registration requests. It validates the incoming request data using the validate middleware and the authValidation.register schema before passing it to the authController.registerUser controller.

Middleware
	a. validate(authValidation.register): Validates the request body against the register validation schema.
	b. authController.registerUser: The controller function that processes the registration request.

Summary
a. Dependencies: The routes utilize Express for routing, controller functions for handling logic, and validation schemas for input validation.
b. Login Route: Validates and processes user login requests.
	Endpoint: /login
	Method: POST
	Middleware: validate(authValidation.login), authController.loginUser
c. Register Route: Validates and processes user registration requests.
	Endpoint: /register
	Method: POST
	Middleware: validate(authValidation.register), authController.registerUser

6. services- 

6.1 auth.service.js-(includes functions to handle user-related operations such as creating a user and fetching user details)


User Service Documentation
This documentation provides an overview of the User service, which includes functions to handle user-related operations such as creating a user and fetching user details.

Dependencies
The service relies on the following dependencies:

User: The User model from the Mongoose schema, representing the users in the database.
http-status: A library for HTTP status codes.
ApiError: A custom error class for API-specific errors.

createUser
The createUser function creates a new user in the database.

Parameters-
	user (Object): An object containing the user details to be created.
Returns-
	(Promise<Object>): A promise that resolves to the created user document.

Summary
a. Dependencies:
	User: Mongoose model representing users.
	http-status: HTTP status codes.
	ApiError: Custom error class for API-specific errors.
b. Functions:
	createUser: Creates a new user in the database.
	Parameters: user (Object)
	Returns: (Promise<Object>) The created user document.
c. Example Usage:
	Demonstrates how to use the createUser function to add a new user to the database.


6.2- user.service.js- (includes functions for managing user-related operations such as retrieving, updating, and deleting users. It ensures that user data is handled properly and that certain validations are performed before operations)
Dependencies
The service relies on the following dependencies:

User: The User model from the Mongoose schema, representing the users in the database.
http-status: A library for HTTP status codes.
ApiError: A custom error class for API-specific errors.
fileUploadService: Service for handling file uploads (e.g., to S3).

userValidator
Validates a user object and throws appropriate errors if the user is not valid.

Parameters-
	user (Object): The user object to validate.
Throws-
	ApiError: If the user is not found, has been deleted, or has been blocked.


getUserById
Fetches a user by their ID and validates the user.

Parameters-
	id (String): The ID of the user to retrieve.
Returns-
	(Promise<Object>): The user document.

getUsers
Fetches a list of users based on filters and pagination options.

Parameters-
	filters (Object): Filters to apply to the query.
	options (Object): Pagination options.
Returns-
	(Promise<Array>): An array of user documents.


updateUserById
Updates a user by their ID with new details, including handling profile picture uploads.

Parameters-
	id (String): The ID of the user to update.
	newDetails (Object): An object containing the new details to update the user with.
Returns-
	(Promise<Object>): The updated user document.

deleteUserById
Deletes a user by their ID.

Parameters-
	id (String): The ID of the user to delete.
Returns-
	(Promise<Boolean>): Returns true if the user was successfully deleted.

updatePreferencesById
Updates a user's preferences by their ID.

Parameters-
	id (String): The ID of the user to update.
	newPrefs (Object): An object containing the new preferences to update the user with.
Returns-
	(Promise<Object>): The updated user document.

Summary
Dependencies:
a. User: Mongoose model representing users.
b. http-status: HTTP status codes.
c. ApiError: Custom error class for API-specific errors.
d. fileUploadService: Service for handling file uploads.

Functions:
a. userValidator: Validates user object.
b. getUserById: Fetches user by ID.
c. getUserByEmail: Fetches user by email.
d. getUsers: Fetches users with filters and pagination.
e. updateUserById: Updates user by ID.
f. deleteUserById: Deletes user by ID.
g. updatePreferencesById: Updates user preferences by ID.


7. utils-

7.1 Apierror.js- (handle API-specific errors in a Node.js application. It extends the built-in Error class to include additional properties and methods that provide more context and control over API error handling)

Dependencies-
Error: The built-in JavaScript error class.

ApiError
The ApiError class extends the built-in Error class to include additional properties such as statusCode, isOperational, and a custom stack trace.

Constructor-
The constructor initializes the ApiError instance with the provided parameters.

Parameters-
a. statusCode (Number): The HTTP status code associated with the error.
b. message (String): A descriptive message for the error.
c.isOperational (Boolean, optional): Indicates whether the error is operational (default is true). Operational errors are expected and handled errors, as opposed to programming or other unforeseen errors.
d. stack (String, optional): A custom stack trace for the error. If not provided, the stack trace is captured automatically.

Properties-
a. statusCode (Number): The HTTP status code associated with the error.
b. message (String): The error message.
c. isOperational (Boolean): Indicates whether the error is operational.
d. stack (String): The stack trace for the error.
Methods-
a. captureStackTrace: Captures the stack trace if it is not provided.

8. validations-

8.1 auth.validation.js-( used for user registration and login in the application. These schemas are defined using the Joi library, which provides a robust framework for validating and sanitizing input data)

Dependencies
Joi: A powerful schema description language and data validator for JavaScript.

Schemas
baseRegisterSchema-
The baseRegisterSchema defines the basic validation rules for user registration data, including username, email, and password.

Rules-
a. username: A string that is required and must be trimmed.
b. email: A string representing an email address that is required, must be trimmed, and must be a valid email format.
c. password: A string representing the user's password that is required and must be at least 6 characters long.


register
The register schema combines the baseRegisterSchema with additional validation rules specific to the registration process.

Rules
a. body: An object containing the registration data.
b. username: Inherits rules from baseRegisterSchema.
c. email: Inherits rules from baseRegisterSchema.
d. password: Inherits rules from baseRegisterSchema.

login-
The login schema defines validation rules specific to the login process, including email and password.

Rules-
a. body: An object containing the login data.
b. email: A string representing the user's email address that is required, must be trimmed, and must be a valid email format.
c. password: A string representing the user's password that is required and must be at least 6 characters long.


9. app.js -(application is designed to handle HTTP requests, apply security measures, parse request bodies, enable CORS (Cross-Origin Resource Sharing), and define API routes)

Dependencies-
The application relies on the following dependencies:

a. cors: Middleware for enabling CORS in Express.js.
b. express: Web application framework for Node.js.
c. compression: Middleware for enabling gzip compression in Express.js.
d. helmet: Middleware for setting HTTP security headers in Express.js.
e. http-status: Library for HTTP status codes.
f. ApiError: Custom error class for API-specific errors.
g. routes: Module containing the application's API routes.
h. errorConverter and errorHandler: Middleware functions for error handling


Middleware
The application uses various middleware functions to handle different aspects of request processing and security.

a. helmet(): Sets security HTTP headers to enhance application security.
b. express.json(): Parses JSON request bodies.
c. express.urlencoded({extended: true}): Parses URL-encoded request bodies.
d. copression(): Enables gzip compression to reduce response size.
e. cors(): Enables Cross-Origin Resource Sharing (CORS) for handling requests from different origins.
f. app.options('*', cors()): Handles pre-flight requests by enabling CORS for all routes.

Summary
a. Dependencies: The application relies on various dependencies for middleware, routing, error handling, and HTTP status codes.
b. Middleware: Middleware functions are used for processing requests, enabling security features, and handling CORS.
c. API Routes: API routes are defined under the /v1 prefix, directing requests to route handlers.
d. Error Handling: Middleware functions are implemented for converting errors and handling errors in a structured manner.
e. Export: The configured Express.js application instance is exported for use by the Node.js server.

10. index.js - (This documentation outlines the startup process of the application, including connecting to MongoDB, starting the Express.js server, and handling various events such as uncaught exceptions and process termination signals)

Dependencies
The startup script relies on the following dependencies:

a. app: The main Express.js application instance.
b. config: Configuration settings for the application.
c. loger: Logger configuration for logging messages.
d. mongoose: MongoDB object modeling tool.

Startup Process
a. Connect to MongoDB: The script connects to the MongoDB database using the URL and options specified in the configuration.

b. Start Express Server: The Express server starts listening on the configured port.

c. Event Handlers: Event handlers are set up to handle various events like uncaught exceptions, unhandled rejections, and process termination signals.



