# OrchestratorMicroservice
A REST microservice to handle backend of OneToOneHelp

## Basic Flow

### Steps to write a new API

- Add the primary route in the `index.route.js` file
- Create a folder in server with the appropriate name
- Create three file `<foldername>.route.js` , `<foldername>.model.js` , `<foldername>.controller.js`,`<foldername>.test.js`
- `<foldername>.route.js` file should contain extension from the primary route written in `index.route.js` along with the appropriate HTTP verbs for the CURD operation. This is also the place where parameter validation is done
- `<foldername>.controller.js` contains the function definition used in `<foldername>.route.js`
- `<foldername>.model.js` contains the mongoose schema used to insert the data in the MongoDB
- `<foldername>.test.js` contains the test case for the APIs. Use `test.dbhandler.js` in the helper folder to create a mongoDB connection. Make sure the coverage for each file to be atleast 80%


