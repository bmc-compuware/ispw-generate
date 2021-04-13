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
  if (buildParmsStr !== null && buildParmsStr !== undefined && buildParmsStr !== '') {
    buildParms = JSON.parse(buildParmsStr);
  }
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

  if (buildParms.taskIds === null || buildParms.taskIds === undefined || buildParms.taskIds.length === 0) {
    isValid = false;
    console.error('A list of task IDs must be specified.')
  }
  return isValid;
}

function convertObjectToJson(data) {
  return JSON.stringify(data);
}

module.exports = {
  getParmsFromFile,
  getParmsFromInputs,
  getFileContentsStr,
  validateBuildParms,
  convertObjectToJson
}

// const assembleRequestUrl = (CESUrl, buildParms) => {
//   let url = CESUrl.concat('/ispw/ISPW/assignments/', buildParms.containerId);
//   url = url.concat('/taskIds/generate-await');
//   return url;
// };

// const sendGeneratePOSTRequest = (CESUrl, token, requestBody) => {
//   const xhr = new XMLHttpRequest();
//   xhr.withCredentials = true;

//   xhr.addEventListener('readystatechange', function () {
//     if (this.readyState === this.DONE) {
//       console.log(this.responseText);
//     }
//   });

//   xhr.open('POST', assembleRequestUrl(CESUrl, buildParms));
//   xhr.setRequestHeader('content-type', 'application/json');
//   xhr.setRequestHeader('authorization', token);

//   xhr.send(requestBody);
// };