const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  let buildParms = {};
  if (core.getInput('generateAutomatically') === 'true') {
    buildParms = getParmsFromFile(parmFileLocation);
  }
  else {
    let inputAssignment = core.getInput('assignmentId');
    let inputLevel = core.getInput('level');
    let inputTaskId = core.getInput('taskId');
    buildParms = getParmsFromInputs( inputAssignment, inputLevel, inputTaskId);
  }

  if (!validateBuildParms(buildParms)) {
    throw new InvalidArgumentException('Inputs required for ispw-generate are missing.');
  }

  // get CES request body

  // send CES request

  let time = (new Date()).toTimeString();
  core.setOutput('time', time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}


/**
 * Build parms have the following fields:
 * String containerId
 * String releaseId
 * String taskLevel
 * ArrayList<String> taskIds
 */
function getParmsFromFile(parmFileLocation) {
  const buildParms = fs.readFileSync(parmFileLocation, 'utf8');
  return buildParms;
}

function getParmsFromInputs(inputAssignment, inputLevel, inputTaskId) {
  let buildParms = {};
  if (inputAssignment !== null && inputAssignment !== undefined && inputAssignment !== '') {
    buildParms.containerId = inputAssignment;
  }

  if (inputLevel !== null && inputLevel !== undefined && inputLevel !== '') {
    buildParms.taskLevel = inputLevel;
  }

  if (inputTaskId !== null && inputTaskId !== undefined && inputTaskId !== '') {
    buildParms.taskIds = inputTaskId.split(',');
  }
  return buildParms;
}

function validateBuildParms(buildParms) {
  let isValid = true;
  if (buildParms.containerId === null || buildParms.containerId === undefined || buildParms.containerId === '') {
    isValid = false;
    console.error('An assignment ID must be specified.')
  }

  if (buildParms.taskLevel === null || buildParms.taskLevel === undefined || buildParms.taskLevel === '') {
    isValid = false;
    console.error('A level must be specified.')
  }

  if (buildParms.taskIds === null || buildParms.taskIds === undefined || buildParms.taskIds === '') {
    isValid = false;
    console.error('A list of task IDs must be specified.')
  }
  return isValid;
}

function convertObjectToJson(data) {
  return JSON.stringify(data);
}

function assembleRequestUrl(CESUrl, buildParms) {
  let url = CESUrl.concat('/ispw/ISPW/assignments/', buildParms.containerId);
  url = url.concat('/taskIds/generate-await');
  return url;
}

function sendGeneratePOSTRequest(CESUrl, token, requestBody) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });

  xhr.open('POST', assembleRequestUrl(CESUrl, buildParms));
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.setRequestHeader('authorization', token);

  xhr.send(requestBody);
}

function InvalidArgumentException(message) {
  this.message = message;
  this.name = 'InvalidArgumentException';
}