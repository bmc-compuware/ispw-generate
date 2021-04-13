const fs = require('fs');

function getFileContentsStr(parmFileLocation) {
  let buildParmsStr;
  if (fs.existsSync(parmFileLocation)) {
    buildParmsStr = fs.readFileSync(parmFileLocation, 'utf8');
  }
  return buildParmsStr
}

function getParmsFromFile(parmFileLocation) {
  let buildParms;
  let buildParmsStr = getFileContentsStr(parmFileLocation)
  if (stringHasContent(buildParmsStr)) {
    buildParms = JSON.parse(buildParmsStr);
  }
  return buildParms;
}

function getParmsFromInputs(inputAssignment, inputLevel, inputTaskId) {
  let buildParms = {};
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

function validateBuildParms(buildParms) {
  let isValid = true;
  if (!stringHasContent(buildParms.containerId)) {
    isValid = false;
    console.error('A container ID must be specified.')
  }

  if (!stringHasContent(buildParms.taskLevel)) {
    isValid = false;
    console.error('A level must be specified.')
  }

  if (buildParms.taskIds === null || buildParms.taskIds === undefined || buildParms.taskIds.length === 0) {
    isValid = false;
    console.error('A list of task IDs must be specified.')
  }
  return isValid;
}

function convertObjectToJson(data) {
  let dataStr = '';
  if (data !== null && data != undefined) {
    dataStr = JSON.stringify(data);
  }
  return dataStr;
}

function assembleRequestUrl(cesUrl, srid, buildParms) {
  // remove 'compuware' from url, if it exists
  let lowercaseUrl = cesUrl.toLowerCase();
  let cpwrIndex = lowercaseUrl.lastIndexOf('/compuware');
  if (cpwrIndex > 0) {
    cesUrl = cesUrl.substr(0, cpwrIndex);
  }

  // remove 'ispw' from url, if it exists
  lowercaseUrl = cesUrl.toLowerCase();
  let ispwIndex = lowercaseUrl.lastIndexOf('/ispw');
  if (ispwIndex > 0) {
    cesUrl = cesUrl.substr(0, ispwIndex);
  }

  // remove trailing slash
  if (cesUrl.endsWith('/')) {
    cesUrl = cesUrl.substr(0, cesUrl.length - 1);
  }

  let url = cesUrl.concat('/ispw/' + srid + '/assignments/', buildParms.containerId);
  url = url.concat('/taskIds/generate-await?');
  buildParms.taskIds.forEach(id => {
    url = url.concat('taskId=' + id + '&');
  });
  url = url.concat('level=' + buildParms.taskLevel);
  return url;
}

function stringHasContent(inputStr) {
  let hasContent = true;
  if (inputStr === null || inputStr === undefined || inputStr.length === 0) {
    hasContent = false;
  }
  return hasContent;
}

function assembleRequestBodyObject(runtimeConfig, changeType, executionStatus, autoDeploy) {
  let requestBody = {};
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

function sendGeneratePOSTRequest(cesUrl, token, requestBody) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
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
  getParmsFromFile,
  getParmsFromInputs,
  getFileContentsStr,
  validateBuildParms,
  convertObjectToJson,
  assembleRequestUrl,
  assembleRequestBodyObject
}

