/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const core = require('@actions/core');
const utils = require('../src/utilities.js');

try {
  let buildParms;
  const inputs = utils.retrieveInputs(core);

  if (utils.stringHasContent(inputs.generateAutomatically)) {
    console.log('Generate parameters are being read from the ' +
      'generate_automatically input.');
    buildParms = utils.parseStringAsJson(inputs.generateAutomatically);
  } else {
    console.log('Generate parameters are being retrieved from the inputs.');
    buildParms = utils.getParmsFromInputs(inputs.assignmentId,
        inputs.level,
        inputs.taskId);
  }

  if (!utils.validateBuildParms(buildParms)) {
    throw new MissingArgumentException(
        'Inputs required for ispw-generate are missing. ' +
      '\nSkipping the generate request....');
  }

  const requestUrl = utils.assembleRequestUrl(inputs.cesUrl,
      inputs.srid,
      buildParms);

  const reqBodyObj = utils.assembleRequestBodyObject(inputs.runtimeConfig,
      inputs.changeType,
      inputs.execStat,
      inputs.autoDeploy);

  const reqBodyStr = utils.convertObjectToJson(reqBodyObj);

  utils.getHttpPromise(requestUrl, inputs.cesToken, reqBodyStr)
      .then((responseBody) => {
        setOutputs(responseBody);
        return utils.handleResponseBody(responseBody);
      },
      (error) => logErrorAndFailJob(error,
          'An error occurred while sending the generate request'))
      .then(() => console.log('The generate request completed successfully.'),
          (error) => logErrorAndFailJob(error,
              'An error occurred during generate.'));

  // the following code will execute after the HTTP request was made,
  // but before it receives a response.
  console.log('Starting the generate process for task ' +
    utils.convertObjectToJson(buildParms.taskId));
} catch (error) {
  if (error instanceof MissingArgumentException) {
    // this would occur if there was nothing to load during the sync process
    // no need to fail the action if the generate is never attempted
    console.log(error.message);
  } else {
    logErrorAndFailJob(error, 'An error occurred while starting the generate');
  }
}

/**
 * Logs the failure message to the error console and fails the job
 * @param {Error} error The error to show when failing the job
 * @param {string} failureMessage The message to print to the error console
 * before the job is failed
 */
function logErrorAndFailJob(error, failureMessage) {
  console.error(failureMessage);
  core.setFailed(error);
}

/**
 * Takes the fields from the response body and sends them to the outputs of
 * the job
 * @param {*} responseBody
 */
function setOutputs(responseBody) {
  if (responseBody) {
    core.setOutput('set_id', responseBody.setId);
    core.setOutput('url', responseBody.url);

    if (responseBody.awaitStatus) {
      core.setOutput('generate_failed_count',
          responseBody.awaitStatus.generateFailedCount);
      core.setOutput('generate_success_count',
          responseBody.awaitStatus.generateSuccessCount);
      core.setOutput('has_failures', responseBody.awaitStatus.hasFailures);
      core.setOutput('task_count', responseBody.awaitStatus.taskCount);
    }
  }
}

/**
 * Error to throw when not all the arguments have been specified for the action.
 * @param  {string} message the message associated with the error
 */
function MissingArgumentException(message) {
  this.message = message;
  this.name = 'MissingArgumentException';
}
MissingArgumentException.prototype = Object.create(Error.prototype);
