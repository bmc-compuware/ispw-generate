/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const core = require('@actions/core');
const utils = require('@bmc-compuware/ispw-action-utilities');

// Constants
const REQUIRED_BUILD_FIELDS = ['containerId', 'taskLevel', 'taskIds'];
const INPUT_FIELDS = [
  'generate_automatically',
  'assignment_id',
  'level',
  'task_id',
  'ces_url',
  'ces_token',
  'certificate',
  'srid',
  'runtime_configuration',
  'change_type',
  'execution_status',
  'auto_deploy',
];
const ERROR_MESSAGES = {
  MISSING_ARGUMENTS: 'Inputs required for Code Pipeline Generate are ' +
    'missing. Skipping the generate request....',
  NO_RESPONSE: 'No response was received from the generate request.',
  GENERATE_INCOMPLETE: 'The generate request did not complete ' +
    'successfully.',
  GENERATE_FAILURES: 'There were generate failures.',
  GENERATE_START_ERROR: 'An error occurred while starting the generate',
};

// Main execution
(async function main() {
  try {
    // Parse and validate inputs
    const inputs = utils.retrieveInputs(core, INPUT_FIELDS);
    core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs));

    // Get build parameters
    const buildParms = getBuildParameters(inputs);
    core.debug('Code Pipeline: parsed buildParms: ' + utils.convertObjectToJson(buildParms));

    // Validate required fields
    validateBuildParameters(buildParms);

    // Prepare request
    const reqPath = getGenerateAwaitUrlPath(inputs.srid, buildParms);
    const reqUrl = utils.assembleRequestUrl(inputs.ces_url, reqPath);
    core.debug('Code Pipeline: request url: ' + reqUrl.href);

    const reqBodyObj = assembleRequestBodyObject(
        inputs.runtime_configuration,
        inputs.change_type,
        inputs.execution_status,
        inputs.auto_deploy,
    );

    // Execute generate request
    console.log('Starting the generate process for task ' + buildParms.taskIds.toString());

    await executeGenerateRequest(inputs, reqUrl, reqBodyObj);
  } catch (error) {
    handleMainError(error);
  }
})();

/** *****************************************************************************************/
// HELPER FUNCTIONS
/** *****************************************************************************************/

/**
 * Gets build parameters from inputs based on automatic or manual mode
 * @param {Object} inputs - The parsed action inputs
 * @return {Object} Build parameters object
 */
function getBuildParameters(inputs) {
  if (utils.stringHasContent(inputs.generate_automatically)) {
    console.log('Generate parameters are being retrieved from the generate_automatically input.');
    return utils.parseStringAsJson(inputs.generate_automatically);
  } else {
    console.log('Generate parameters are being retrieved from the inputs.');
    return getParmsFromInputs(inputs.assignment_id, inputs.level, inputs.task_id);
  }
}

/**
 * Validates that required build parameters are present
 * @param {Object} buildParms - Build parameters to validate
 * @throws {MissingArgumentException} If required fields are missing
 */
function validateBuildParameters(buildParms) {
  if (!utils.validateBuildParms(buildParms, REQUIRED_BUILD_FIELDS)) {
    throw new MissingArgumentException(ERROR_MESSAGES.MISSING_ARGUMENTS);
  }
}

/**
 * Executes the generate request using appropriate authentication method
 * @param {Object} inputs - The parsed action inputs
 * @param {URL} reqUrl - The request URL
 * @param {Object} reqBodyObj - The request body object
 * @return {Promise<void>}
 */
async function executeGenerateRequest(inputs, reqUrl, reqBodyObj) {
  const authMethod = getAuthenticationMethod(inputs);

  // Parse host and port for certificate authentication
  const hostAndPort = inputs.srid.split('-');
  const host = hostAndPort[0];
  const port = hostAndPort[1];

  try {
    let response;

    if (authMethod === 'token') {
      core.debug('Code Pipeline: Using token authentication');
      response = await utils.getHttpPostPromise(
          reqUrl, inputs.ces_token, reqBodyObj);
    } else if (authMethod === 'certificate') {
      core.debug('Code Pipeline: Using certificate authentication');
      response = await utils.getHttpPostPromiseWithCert(
          reqUrl, inputs.certificate, host, port, reqBodyObj);
    } else {
      throw new Error('No valid authentication method provided. ' +
        'Please specify either ces_token or certificate.');
    }

    // Handle successful response
    core.debug('Code Pipeline: received response body: ' +
      utils.convertObjectToJson(response.data));
    setOutputs(core, response.data);
    handleResponseBody(response.data);
    console.log('The generate request completed successfully.');
  } catch (error) {
    handleGenerateError(error);
  }
}

/**
 * Determines the authentication method to use
 * @param {Object} inputs - The parsed action inputs
 * @return {string|null} 'token', 'certificate', or null
 */
function getAuthenticationMethod(inputs) {
  if (utils.stringHasContent(inputs.ces_token)) {
    return 'token';
  } else if (utils.stringHasContent(inputs.certificate)) {
    return 'certificate';
  }
  return null;
}

/**
 * Handles errors during generate request
 * @param {Error} error - The error object
 * @throws {GenerateFailureException}
 */
function handleGenerateError(error) {
  if (error.response !== undefined) {
    core.debug('Code Pipeline: received error code: ' +
      error.response.status);
    core.debug('Code Pipeline: received error response body: ' +
      utils.convertObjectToJson(error.response.data));
    setOutputs(core, error.response.data);
    throw new GenerateFailureException(error.response.data.message);
  }
  core.debug(error.stack);
  core.setFailed(error.message);
  throw error;
}

/**
 * Handles errors in the main execution flow
 * @param {Error} error - The error object
 */
function handleMainError(error) {
  if (error instanceof MissingArgumentException) {
    // This would occur if there was nothing to load during the sync process
    // No need to fail the action if the generate is never attempted
    console.log(error.message);
  } else {
    core.debug(error.stack);
    console.error(ERROR_MESSAGES.GENERATE_START_ERROR);
    core.setFailed(error.message);
  }
}

/** *****************************************************************************************/
// CORE BUSINESS LOGIC FUNCTIONS
/** *****************************************************************************************/

/**
 * Uses the input parameters from the action metadata to fill in a BuildParms object.
 * @param  {string} inputAssignment - The assignmentId passed into the action
 * @param  {string} inputLevel - The Code Pipeline level passed into the action
 * @param  {string} inputTaskId - The comma separated list of task IDs passed into the action
 * @return {Object} A BuildParms object with the fields filled in. This will never return undefined.
 */
function getParmsFromInputs(inputAssignment, inputLevel, inputTaskId) {
  const buildParms = {};

  if (utils.stringHasContent(inputAssignment)) {
    buildParms.containerId = inputAssignment;
  }

  if (utils.stringHasContent(inputLevel)) {
    buildParms.taskLevel = inputLevel;
  }

  if (utils.stringHasContent(inputTaskId)) {
    buildParms.taskIds = inputTaskId.split(',');
  }

  return buildParms;
}

/**
 * Takes the fields from the response body and sends them to the outputs of the job
 * @param {Object} core - GitHub actions core module
 * @param {Object} responseBody - The response body received from the REST API request
 */
function setOutputs(core, responseBody) {
  if (!responseBody) {
    return;
  }

  core.setOutput('output_json', utils.convertObjectToJson(responseBody));
  core.setOutput('set_id', responseBody.setId);
  core.setOutput('url', responseBody.url);

  const isTimedOut = utils.stringHasContent(responseBody.message) &&
    responseBody.message.includes('timed out');
  core.setOutput('is_timed_out', isTimedOut);

  if (responseBody.awaitStatus) {
    core.setOutput('generate_failed_count', responseBody.awaitStatus.generateFailedCount);
    core.setOutput('generate_success_count', responseBody.awaitStatus.generateSuccessCount);
    core.setOutput('has_failures', responseBody.awaitStatus.hasFailures);
    core.setOutput('task_count', responseBody.awaitStatus.taskCount);
  }
}

/**
 * Gets the request path for the CES REST api generate-await on tasks.
 * The returned path starts with '/ispw/' and ends with the query parameters
 * @param {string} srid - The SRID for this instance of Code Pipeline
 * @param {Object} buildParms - The build parms to use when filling out the request url
 * @return {string} The request path which can be appended to the CES url
 */
function getGenerateAwaitUrlPath(srid, buildParms) {
  let tempUrlStr = `/ispw/${srid}/assignments/${buildParms.containerId}`;
  tempUrlStr = tempUrlStr.concat('/taskIds/generate-await?');

  buildParms.taskIds.forEach((id) => {
    tempUrlStr = tempUrlStr.concat(`taskId=${id}&`);
  });

  tempUrlStr = tempUrlStr.concat(`level=${buildParms.taskLevel}`);
  return tempUrlStr;
}

/**
 * Assembles an object for the CES request body.
 * @param  {string|undefined} runtimeConfig - The runtime configuration passed in the inputs
 * @param  {string|undefined} changeType - The change type passed in the inputs
 * @param  {string|undefined} executionStatus - The execution status passed in the inputs
 * @param  {string|undefined} autoDeploy - Whether to auto deploy
 * @return {Object} An object with all the fields for the request body filled in
 */
function assembleRequestBodyObject(runtimeConfig, changeType, executionStatus, autoDeploy) {
  const requestBody = {};

  if (utils.stringHasContent(runtimeConfig)) {
    requestBody.runtimeConfig = runtimeConfig;
  }

  if (utils.stringHasContent(changeType)) {
    requestBody.changeType = changeType;
  }

  if (utils.stringHasContent(executionStatus)) {
    requestBody.execStat = executionStatus;
  }

  requestBody.autoDeploy = (autoDeploy === 'true');

  return requestBody;
}

/**
 * Examines the given response body to determine whether an error occurred during the generate.
 * @param {Object} responseBody - The body returned from the CES request
 * @return {Object} The response body object if the generate was successful
 * @throws {GenerateFailureException} If there were failures during the generate
 */
function handleResponseBody(responseBody) {
  if (responseBody === undefined) {
    throw new GenerateFailureException(ERROR_MESSAGES.NO_RESPONSE);
  }

  if (responseBody.awaitStatus === undefined) {
    // Generate did not complete - there should be a message returned
    const message = responseBody.message || ERROR_MESSAGES.GENERATE_INCOMPLETE;
    throw new GenerateFailureException(message);
  }

  if (responseBody.awaitStatus.generateFailedCount !== 0) {
    // There were generate failures
    console.error(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
    throw new GenerateFailureException(ERROR_MESSAGES.GENERATE_FAILURES);
  }

  // Success
  console.log(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
  return responseBody;
}

/**
 * Checks which authentication method is used in workflow (token or certificate)
 * @param  {string} cesToken - The ces_token for authentication
 * @param  {string} certificate - The certificate passed for authentication
 * @return {boolean|undefined} true for token, false for certificate, undefined if neither
 * @deprecated Use getAuthenticationMethod() instead
 */
function isAuthTokenOrCerti(cesToken, certificate) {
  if (utils.stringHasContent(cesToken)) {
    return true;
  } else if (utils.stringHasContent(certificate)) {
    return false;
  }
  return undefined;
}

/** *****************************************************************************************/
// CUSTOM EXCEPTION CLASSES
/** *****************************************************************************************/

/**
 * Error to throw when not all the arguments have been specified for the action.
 * @param  {string} message - The message associated with the error
 */
function MissingArgumentException(message) {
  this.message = message;
  this.name = 'MissingArgumentException';
}
MissingArgumentException.prototype = Object.create(Error.prototype);

/**
 * Error to throw when the response for the generate request is incomplete or indicates errors.
 * @param  {string} message - The message associated with the error
 */
function GenerateFailureException(message) {
  this.message = message;
  this.name = 'GenerateFailureException';
}
GenerateFailureException.prototype = Object.create(Error.prototype);

/** *****************************************************************************************/
// MODULE EXPORTS (for testing)
/** *****************************************************************************************/

module.exports = {
  getParmsFromInputs,
  setOutputs,
  getGenerateAwaitUrlPath,
  assembleRequestBodyObject,
  handleResponseBody,
  isAuthTokenOrCerti,
  MissingArgumentException,
  GenerateFailureException,
};
