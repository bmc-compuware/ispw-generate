/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const fs = require('fs');

/**
 * Reads the file from the given path and returns the contents as a string
 * @param  {string} parmFileLocation absolute path to the file to read
 * @return {string | undefined} contents of file or undefined
 * if the file does not exist
 */
function getFileContentsStr(parmFileLocation) {
  let fileContents;
  if (fs.existsSync(parmFileLocation)) {
    fileContents = fs.readFileSync(parmFileLocation, 'utf8');
  }
  return fileContents;
}

/**
 * Reads the contents of the file at the given path and returns the contents as
 * an object
 * @param  {string} parmFileLocation absolute path to the file to read
 * @return {any | undefined} parsed contents of the file,
 * or undefined if the file is empty
 */
function parseFileAsJson(parmFileLocation) {
  let parsedObj;
  const fileContents = getFileContentsStr(parmFileLocation);
  if (stringHasContent(fileContents)) {
    parsedObj = JSON.parse(fileContents);
  }
  return parsedObj;
}
/**
 * Uses the input parameters from the action metadata to fille in a BuildParms
 * object.
 * @param  {string} inputAssignment the assignmentId passed into the action
 * @param  {string} inputLevel the ISPW level passed into the action
 * @param  {string} inputTaskId the comma separated list of task IDs passed
 * into the action
 * @return {BuildParms} a BuildParms object with the fields filled in.
 * This will never return undefined.
 */
function getParmsFromInputs(inputAssignment, inputLevel, inputTaskId) {
  const buildParms = {};
  if (stringHasContent(inputAssignment)) {
    buildParms.containerId = inputAssignment;
  }

  if (stringHasContent(inputLevel)) {
    buildParms.taskLevel = inputLevel;
  }

  if (stringHasContent(inputTaskId)) {
    buildParms.taskIds = inputTaskId.split(',');
  }
  return buildParms;
}

/**
 * Validates the given BuildParms object to ensure that all the fields
 * are filled in.
 * @param  {BuildParms} buildParms the BuildParms object to check
 * @return {boolean} boolean indicating whether the build parms are valid
 */
function validateBuildParms(buildParms) {
  let isValid = false;
  if (buildParms !== null && buildParms !== undefined) {
    isValid = true;
    if (!stringHasContent(buildParms.containerId)) {
      isValid = false;
      console.error('A container ID must be specified.');
    }

    if (!stringHasContent(buildParms.taskLevel)) {
      isValid = false;
      console.error('A level must be specified.');
    }

    if (buildParms.taskIds === null ||
      buildParms.taskIds === undefined ||
      buildParms.taskIds.length === 0) {
      isValid = false;
      console.error('A list of task IDs must be specified.');
    }
  }
  return isValid;
}

/**
 * Converts the given data object to a JSON string
 * @param  {any} data
 * @return {string} JSON representing the given object. Returns an empty
 * string if the object is null
 */
function convertObjectToJson(data) {
  let dataStr = '';
  if (data !== null && data != undefined) {
    dataStr = JSON.stringify(data);
  }
  return dataStr;
}

/**
 * Assembles the URL to use when sending the generate request.
 * @param  {string} cesUrl the base CES URL that was passed in the action
 * arguments
 * @param  {string} srid the SRID for this ISPW
 * @param  {BuildParms} buildParms the BuildParms object with all the fields
 * filled in
 * @return {string} the url for the request
 */
function assembleRequestUrl(cesUrl, srid, buildParms) {
  // remove 'compuware' from url, if it exists
  let lowercaseUrl = cesUrl.toLowerCase();
  const cpwrIndex = lowercaseUrl.lastIndexOf('/compuware');
  if (cpwrIndex > 0) {
    cesUrl = cesUrl.substr(0, cpwrIndex);
  }

  // remove 'ispw' from url, if it exists
  lowercaseUrl = cesUrl.toLowerCase();
  const ispwIndex = lowercaseUrl.lastIndexOf('/ispw');
  if (ispwIndex > 0) {
    cesUrl = cesUrl.substr(0, ispwIndex);
  }

  // remove trailing slash
  if (cesUrl.endsWith('/')) {
    cesUrl = cesUrl.substr(0, cesUrl.length - 1);
  }

  let url = cesUrl.concat('/ispw/', srid, '/assignments/');
  url = url.concat(buildParms.containerId, '/taskIds/generate-await?');
  buildParms.taskIds.forEach((id) => {
    url = url.concat('taskId=' + id + '&');
  });
  url = url.concat('level=' + buildParms.taskLevel);
  return url;
}

/**
 * Checks to make sure a string is not undefined, null, or empty
 * @param  {string | undefined} inputStr the string to check
 * @return {boolean} a boolean indicating whether the string has content
 */
function stringHasContent(inputStr) {
  let hasContent = true;
  if (inputStr === null || inputStr === undefined || inputStr.length === 0) {
    hasContent = false;
  }
  return hasContent;
}

/**
 * Assembles an object for the CES request body.
 * @param  {string | undefined} runtimeConfig the runtime configuration passed
 * in the inputs
 * @param  {string | undefined} changeType the change type passed in the inputs
 * @param  {string | undefined} executionStatus the execution status passed
 * in the inputs
 * @param  {string | undefined} autoDeploy whether to auto deploy
 * @return {any} an object with all the fields for the request body filled in
 */
function assembleRequestBodyObject(runtimeConfig, changeType,
    executionStatus, autoDeploy) {
  const requestBody = {};
  if (stringHasContent(runtimeConfig)) {
    requestBody.runtimeConfig = runtimeConfig;
  }
  if (stringHasContent(changeType)) {
    requestBody.changeType = changeType;
  }
  if (stringHasContent(executionStatus)) {
    requestBody.execStat = executionStatus;
  }
  requestBody.autoDeploy = (autoDeploy === 'true');

  return requestBody;
}

/**
 * Creates an XMLHttpRequest and sends a POST request.
 * @param  {string} cesUrl the URL to send the request to
 * @param  {string} token the token to use for authentication
 * @param  {string} requestBody the request body string
 */
function sendPOSTRequest(cesUrl, token, requestBody) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function() {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });

  xhr.open('POST', assembleRequestUrl(cesUrl, buildParms));
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.setRequestHeader('authorization', token);

  xhr.send(requestBody);
}

module.exports = {
  getParmsFromFile: parseFileAsJson,
  getParmsFromInputs,
  getFileContentsStr,
  validateBuildParms,
  convertObjectToJson,
  assembleRequestUrl,
  assembleRequestBodyObject,
  sendPOSTRequest,
};

