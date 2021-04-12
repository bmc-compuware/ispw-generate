const fs = require('fs');

function getParmsFromFile(parmFileLocation) {
  let buildParms;
  let buildParmsStr = getFileContentsStr(parmFileLocation)
  if (buildParmsStr !== null && buildParmsStr !== undefined && buildParmsStr !== '') {
    console.log('converting buildParms string: ' + buildParmsStr);
    buildParms = JSON.parse(buildParmsStr);
    console.log(buildParms.containerId);
    console.log(buildParms.taskIds);
  }
  return buildParms;
}

function getFileContentsStr(parmFileLocation) {
  let buildParmsStr;
  if (fs.existsSync(parmFileLocation)) {
    buildParmsStr = fs.readFileSync(parmFileLocation, 'utf8');
  }
  return buildParmsStr
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
module.exports = getParmsFromFile;
module.exports = getParmsFromInputs;
module.exports = getFileContentsStr;








/**
 * Build parms have the following fields:
 * String containerId
 * String releaseId
 * String taskLevel
 * ArrayList<String> taskIds
 */
// const getParmsFromFile = (parmFileLocation) => {
//   let buildParms;
//   if (fs.existsSync(parmFileLocation)) {
//     let buildParmsStr = fs.readFileSync(parmFileLocation, 'utf8');
//     if (buildParmsStr !== null && buildParmsStr !== undefined && buildParmsStr !== '') {
//       buildParms = JSON.parse(buildParmsStr);
//     }
//   }
//   return buildParms;
// };

// const getParmsFromInputs = (inputAssignment, inputLevel, inputTaskId) => {
//   let buildParms = {};
//   if (inputAssignment !== null && inputAssignment !== undefined && inputAssignment !== '') {
//     buildParms.containerId = inputAssignment;
//   }

//   if (inputLevel !== null && inputLevel !== undefined && inputLevel !== '') {
//     buildParms.taskLevel = inputLevel;
//   }

//   if (inputTaskId !== null && inputTaskId !== undefined && inputTaskId !== '') {
//     buildParms.taskIds = inputTaskId.split(',');
//   }
//   return buildParms;
// };

// const validateBuildParms = (buildParms) => {
//   let isValid = true;
//   if (buildParms.containerId === null || buildParms.containerId === undefined || buildParms.containerId === '') {
//     isValid = false;
//     console.error('An assignment ID must be specified.')
//   }

//   if (buildParms.taskLevel === null || buildParms.taskLevel === undefined || buildParms.taskLevel === '') {
//     isValid = false;
//     console.error('A level must be specified.')
//   }

//   if (buildParms.taskIds === null || buildParms.taskIds === undefined || buildParms.taskIds === '') {
//     isValid = false;
//     console.error('A list of task IDs must be specified.')
//   }
//   return isValid;
// };

// const convertObjectToJson = (data) => {
//   return JSON.stringify(data);
// };

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