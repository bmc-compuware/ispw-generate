/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const core = require('@actions/core');
const github = require('@actions/github');
const utils = require('../src/utilities.js');

try {
  let buildParms;
  console.log('--------------------');
  let genParmsInputStr = core.getInput('generate_automatically');
  if (utils.stringHasContent(genParmsInputStr)) {
    buildParms = utils.parseStringAsJson(genParmsInputStr);
  } else {
    const inputAssignment = core.getInput('assignment_id');
    const inputLevel = core.getInput('level');
    const inputTaskId = core.getInput('task_id');
    buildParms = utils.getParmsFromInputs(inputAssignment,
        inputLevel,
        inputTaskId);
  }

  if (!utils.validateBuildParms(buildParms)) {
    throw new InvalidArgumentException(
        'Inputs required for ispw-generate are missing. '+
    '\nSkipping the generate request....');
  }

  console.log('...generating tasks in assignment ' +
    buildParms.containerId + ' at level ' +
    buildParms.taskLevel);

  const cesUrl = core.getInput('ces_url');
  const srid = core.getInput('srid');
  const requestUrl = utils.assembleRequestUrl(cesUrl, srid, buildParms);

  const runtimeConfig = core.getInput('runtime_configuration');
  const changeType = core.getInput('change_type');
  const executionStatus = core.getInput('execution_status');
  const autoDeploy = core.getInput('auto_deploy');
  const requestBodyObj = utils.assembleRequestBodyObject(runtimeConfig,
      changeType,
      executionStatus,
      autoDeploy);

  const requestBodyStr = utils.convertObjectToJson(requestBodyObj);
  const cesToken = core.getInput('ces_token');
  util.sendPOSTRequest(requestUrl, cesToken, requestBodyStr);

  console.log('...set ' + taskResponse.getSetId() + ' created to generate');


  const time = (new Date()).toTimeString();
  core.setOutput('time', time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  if (e instanceof MissingArgumentException) {
    // this could occur if there was nothing to load during the sync process
    // no need to fail the action if the generate is never attempted
    console.log(e.message);
  } else {
    core.setFailed(error.message);
  }
}
console.log('--------------------');

/**
 * Error to throw when not all the arguments have been specified for the action.
 * @param  {string} message the message associated with the error
 */
function MissingArgumentException(message) {
  this.message = message;
  this.name = 'MissingArgumentException';
}
