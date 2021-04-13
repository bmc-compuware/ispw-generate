const core = require('@actions/core');
const github = require('@actions/github');
var utils = require('../src/utilities.js');

try {
  let buildParms;
  console.log("--------------------");
  if (core.getInput('generateAutomatically') === 'true') {
    buildParms = utils.getParmsFromFile(parmFileLocation);
  }
  else {
    let inputAssignment = core.getInput('assignmentId');
    let inputLevel = core.getInput('level');
    let inputTaskId = core.getInput('taskId');
    buildParms = utils.getParmsFromInputs(inputAssignment, inputLevel, inputTaskId);
  }

  if (buildParms === null || buildParms === undefined || !utils.validateBuildParms(buildParms)) {
    throw new InvalidArgumentException('Inputs required for ispw-generate are missing.');
  }

  console.log('...generating tasks in assignment '
    + buildParms.containerId + ' at level '
    + buildParms.taskLevel);

  let cesUrl = core.getInput('cesUrl');
  let srid = core.getInput('srid');
  let requestUrl = utils.assembleRequestUrl(cesUrl, srid, buildParms);

  let runtimeConfig = core.getInput('runtimeConfiguration');
  let changeType = core.getInput('changeType');
  let executionStatus = core.getInput('executionStatus');
  let autoDeploy = core.getInput('autoDeploy');
  let requestBodyObj = utils.assembleRequestBodyObject(runtimeConfig, changeType, executionStatus, autoDeploy);

  let requestBodyStr = utils.convertObjectToJson(requestBodyObj);
  let cesToken = core.getInput('cesToken');
  sendGeneratePOSTRequest(cesUrl, cesToken, requestBodyStr);

  console.log('...set ' + taskResponse.getSetId() + ' created to generate');


  let time = (new Date()).toTimeString();
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
console.log("--------------------");

function MissingArgumentException(message) {
  this.message = message;
  this.name = 'MissingArgumentException';
}