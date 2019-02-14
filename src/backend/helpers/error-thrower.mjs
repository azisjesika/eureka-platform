/**
 * General Error thrower
 */

export default {
  notLoggedIn: () => {
    let error = new Error('Access denied, not logged in Backend');
    error.status = 401;
    throw error;
  },
  notCorrectEthereumAddress: () => {
    let error = new Error('Access denied, provided ethereum-address does not match owner-address');
    error.status = 403;
    throw error;
  },

  notAuthorizedToDoThisAction: () => {
    let error = new Error('Access denied, the user is not allowed to take this action');
    error.status = 403;
    throw error;
  },

  noEntryFoundById: (id) => {
    let error;

    if(id) {
      error = new Error('Could not find the entry with the provided ID: ' + id);
    } else {
      error= new Error('Could not find the entry with the provided ID');
    }
    error.status = 400;
    throw error;
  },

  noEntryFoundByParameters: (parameter) => {
    let error;

    if(parameter) {
      error = new Error('Could not find the entry with the provided parameter: ' + parameter);
    } else {
      error= new Error('Could not find the entry with the provided parameter');
    }
    error.status = 400;
    throw error;
  },

  noCreationOfEntry: (entryObject) => {
    let error;
    if(entryObject) {
      error = new Error('Could not create an entry in the DB: ' + entryObject);
    } else {
      error = new Error('Could not create an entry in the DB');
    }
    error.status = 500;
    throw error;
  },

  entryAlreadyExists: (entryObject) => {
    let error;
    if(entryObject) {
      error = new Error('Could not create an the entry since it already exists: ' + entryObject);
    } else {
      error = new Error('Could not create an the entry since it already exists');
    }
    error.status = 409;
    throw error;
  },

  missingParameter: (param) => {
    let error = new Error('Missing parameter was not provided: ' + param);
    error.status = 400;
    throw error;
  },
  missingQueryParameter: (queryparam) => {
    let error = new Error('Missing Query parameter was not provided: ' + queryparam);
    error.status = 400;
    throw error;
  },
  noQueryParameterProvided: () => {
    let error = new Error('No Query parameter was provided');
    error.status = 400;
    throw error;
  },
  missingBodyValue: (value) => {
    let error = new Error('Missing body-value was not provided: ' + value);
    error.status = 400;
    throw error;
  },
  internalError: (message) => {
    let error = new Error(message);
    error.status = 500;
    throw error;
  },
  notCorrectStatus: (expectedStatus, foundStatus) => {
    let error = new Error('The status found is not as expected. Expected Status: '
      + expectedStatus + '. Status found: ' + foundStatus);
    error.status = 400;
    throw error;
  },
  notExistingRole: (role) => {
    let error = new Error('The provided Role does not exist: ' + role);
    error.status = 400;
    throw error;
  }
};