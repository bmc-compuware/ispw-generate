import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
var Utilities = require('./src/utilities');

//const core = require('@actions/core');
//const github = require('@actions/github');
//const fs = require('fs');
//const utilities = require('./src/utilities');

try {
  let buildParms;
  if (core.getInput('generateAutomatically') === 'true') {
    buildParms = Utilities.getParmsFromFile(parmFileLocation);
  }
  else {
    let inputAssignment = core.getInput('assignmentId');
    let inputLevel = core.getInput('level');
    let inputTaskId = core.getInput('taskId');
    buildParms = Utilities.getParmsFromInputs(inputAssignment, inputLevel, inputTaskId);
  }

  if (buildParms === null || buildParms === undefined/* || !validateBuildParms(buildParms)*/) {
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

function InvalidArgumentException(message) {
  this.message = message;
  this.name = 'InvalidArgumentException';
}