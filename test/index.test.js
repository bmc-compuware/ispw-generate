/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
var index = require('../index.js');
const chai = require('chai');
var assert = chai.assert;
const gcore = require('@actions/core');
const github = require('@actions/github');

describe('#getParmsFromInputs(inputAssignment, inputLevel, inputTaskId)', function () {
  it('should return empty - null passed in', function () {

    let output = index.getParmsFromInputs(null, null, null);
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, undefined);
    assert.strictEqual(output.taskLevel, undefined);
    assert.strictEqual(output.releaseId, undefined);
    assert.strictEqual(output.taskIds, undefined);
  });

  it('should return empty - undefined passed in', function () {
    let output = index.getParmsFromInputs(undefined, undefined, undefined);
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, undefined);
    assert.strictEqual(output.taskLevel, undefined);
    assert.strictEqual(output.releaseId, undefined);
    assert.strictEqual(output.taskIds, undefined);
  });

  it('should return empty - empty passed in', function () {
    let output = index.getParmsFromInputs('', '', '');
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, undefined);
    assert.strictEqual(output.taskLevel, undefined);
    assert.strictEqual(output.releaseId, undefined);
    assert.strictEqual(output.taskIds, undefined);
  });

  it('should have assignment defined', function () {
    let output = index.getParmsFromInputs('assignment123', '', '');
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, 'assignment123');
    assert.strictEqual(output.taskLevel, undefined);
    assert.strictEqual(output.releaseId, undefined);
    assert.strictEqual(output.taskIds, undefined);
  });

  it('should have level defined', function () {
    let output = index.getParmsFromInputs('', 'level', '');
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, undefined);
    assert.strictEqual(output.taskLevel, 'level');
    assert.strictEqual(output.releaseId, undefined);
    assert.strictEqual(output.taskIds, undefined);
  });

  it('should have taskIds defined', function () {
    let output = index.getParmsFromInputs('', '', 'task1,task2,task3,task4');
    assert.isNotNull(output);
    assert.strictEqual(output.containerId, undefined);
    assert.strictEqual(output.taskLevel, undefined);
    assert.strictEqual(output.releaseId, undefined);
    assert.deepStrictEqual(output.taskIds, ['task1', 'task2', 'task3', 'task4']);
  });

});


describe('#setOutputs(core, responseBody)', function () {
  it('should call setOutput for each field in the response body', function () {
    let core = {
      outputs: {},
      setOutput: function (outputName, outputValue) {
        this.outputs[outputName] = outputValue;
      }
    };

    let responseBody = {};
    index.setOutputs(core, responseBody);
    assert.strictEqual(core.outputs.set_id, undefined);
    assert.strictEqual(core.outputs.url, undefined);
    assert.strictEqual(core.outputs.is_timed_out, false);
    assert.strictEqual(core.outputs.generate_failed_count, undefined);
    assert.strictEqual(core.outputs.generate_success_count, undefined);
    assert.strictEqual(core.outputs.has_failures, undefined);
    assert.strictEqual(core.outputs.task_count, undefined);

    responseBody = {
      setId: 'set1234',
      url: 'url/to/set1234'
    };
    index.setOutputs(core, responseBody);
    assert.strictEqual(core.outputs.set_id, 'set1234');
    assert.strictEqual(core.outputs.url, 'url/to/set1234');
    assert.strictEqual(core.outputs.is_timed_out, false);
    assert.strictEqual(core.outputs.generate_failed_count, undefined);
    assert.strictEqual(core.outputs.generate_success_count, undefined);
    assert.strictEqual(core.outputs.has_failures, undefined);
    assert.strictEqual(core.outputs.task_count, undefined);

    responseBody = {
      setId: 'set1234',
      url: 'url/to/set1234',
      awaitStatus: {
        generateFailedCount: 1,
        generateSuccessCount: 2,
        hasFailures: true,
        taskCount: 3
      }
    };
    index.setOutputs(core, responseBody);
    assert.strictEqual(core.outputs.set_id, 'set1234');
    assert.strictEqual(core.outputs.url, 'url/to/set1234');
    assert.strictEqual(core.outputs.is_timed_out, false);
    assert.strictEqual(core.outputs.generate_failed_count, 1);
    assert.strictEqual(core.outputs.generate_success_count, 2);
    assert.strictEqual(core.outputs.has_failures, true);
    assert.strictEqual(core.outputs.task_count, 3);

  });

  it('should return true for timed out', function () {
    let core = {
      outputs: {},
      setOutput: function (outputName, outputValue) {
        this.outputs[outputName] = outputValue;
      }
    };

    let responseBody = {
      setId: 'set5678',
      url: 'url/to/set5678',
      message: 'Generate failed: timed out'
    };
    index.setOutputs(core, responseBody);
    assert.strictEqual(core.outputs.set_id, 'set5678');
    assert.strictEqual(core.outputs.url, 'url/to/set5678');
    assert.strictEqual(core.outputs.is_timed_out, true);
    assert.strictEqual(core.outputs.generate_failed_count, undefined);
    assert.strictEqual(core.outputs.generate_success_count, undefined);
    assert.strictEqual(core.outputs.has_failures, undefined);
    assert.strictEqual(core.outputs.task_count, undefined);

  });

  it("should return false for timed out", function () {
    let core = {
      outputs: {},
      setOutput: function (outputName, outputValue) {
        this.outputs[outputName] = outputValue;
      }
    };
    let responseBody = {
      message: 'Some other problem occurred'
    };
    index.setOutputs(core, responseBody);
    assert.strictEqual(core.outputs.set_id, undefined);
    assert.strictEqual(core.outputs.url, undefined);
    assert.strictEqual(core.outputs.is_timed_out, false);
    assert.strictEqual(core.outputs.generate_failed_count, undefined);
    assert.strictEqual(core.outputs.generate_success_count, undefined);
    assert.strictEqual(core.outputs.has_failures, undefined);
    assert.strictEqual(core.outputs.task_count, undefined);
  });
});


describe('#getGenerateAwaitUrlPath(srid, buildParms)', function () {
  it('should handle single taskId', function () {
    let output = index.getGenerateAwaitUrlPath('SRID', {
      containerId: 'container1',
      taskLevel: 'DEV3',
      taskIds: ['abc123']
    });
    assert.strictEqual(output, '/ispw/SRID/assignments/container1/taskIds/generate-await?taskId=abc123&level=DEV3');
  });

  it('should handle multiple taskIds', function () {
    let output = index.getGenerateAwaitUrlPath('SRID', {
      containerId: 'container1',
      taskLevel: 'DEV3',
      taskIds: ['abc123', 'def456']
    });
    assert.strictEqual(output, '/ispw/SRID/assignments/container1/taskIds/generate-await?taskId=abc123&taskId=def456&level=DEV3');

  });
});


describe('#assembleRequestBodyObject(runtimeConfig, changeType, executionStatus, autoDeploy)', function () {
  it('should be missing runtime config', function () {
    let output = index.assembleRequestBodyObject(null, 'E', 'H', 'false');
    assert.strictEqual(output.runtimeConfig, undefined);
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject(undefined, 'E', 'H', 'false');
    assert.strictEqual(output.runtimeConfig, undefined);
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject('', 'E', 'H', 'false');
    assert.strictEqual(output.runtimeConfig, undefined);
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);
  });

  it('should be missing changeType', function () {
    let output = index.assembleRequestBodyObject('TPZP', null, 'H', 'false');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, undefined);
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject('TPZP', undefined, 'H', 'false');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, undefined);
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject('TPZP', '', 'H', 'false');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, undefined);
    assert.strictEqual(output.execStat, 'H');
    assert.strictEqual(output.autoDeploy, false);
  });

  it('should be missing executionStatus', function () {
    let output = index.assembleRequestBodyObject('TPZP', 'E', null, 'true');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, undefined);
    assert.strictEqual(output.autoDeploy, true);

    output = index.assembleRequestBodyObject('TPZP', 'E', undefined, 'true');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, undefined);
    assert.strictEqual(output.autoDeploy, true);

    output = index.assembleRequestBodyObject('TPZP', 'E', '', 'true');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, undefined);
    assert.strictEqual(output.autoDeploy, true);
  });

  it('should set autoDeploy to false', function () {
    let output = index.assembleRequestBodyObject('TPZP', 'E', 'I', null);
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'I');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject('TPZP', 'E', 'I', undefined);
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'I');
    assert.strictEqual(output.autoDeploy, false);

    output = index.assembleRequestBodyObject('TPZP', 'E', 'I', '');
    assert.strictEqual(output.runtimeConfig, 'TPZP');
    assert.strictEqual(output.changeType, 'E');
    assert.strictEqual(output.execStat, 'I');
    assert.strictEqual(output.autoDeploy, false);
  });
});


describe('#handleResponseBody(responseBody)', function () {
  it('should throw an exception - responseBody undefined', function () {
    assert.throw(function () { index.handleResponseBody(undefined) }, index.GenerateFailureException, 'No response was received from the generate request.');
  });

  it('should throw an exception - responseBody empty', function () {
    assert.throw(function () { index.handleResponseBody({}) }, index.GenerateFailureException, 'The generate request did not complete successfully.');
  });

  it('should throw an exception - timeout', function () {
    assert.throw(function () { index.handleResponseBody({ setID: 'S000238588', message: 'Generate failed: timed out', url: 'http://10.211.55.5:48080/ispw/CW09-47623/sets/S000238588' }) }, index.GenerateFailureException, 'Generate failed: timed out');
  });

  it('should throw an exception - generate failure', function () {
    let responseBody = {
      setID: 'S000238588',
      url: 'http://ces:48080/ispw/CW09-47623/sets/S000238588',
      awaitStatus: {
        generateFailedCount: 1,
        generateSuccessCount: 1,
        hasFailures: true,
        statusMsg: [
          "ISPW: Set S000238378 - The generate request completed successfully for TPROG21 in PLAY002631. Job ID and name: J0758875 XDEVREGG",
          "ISPW: Set S000238378 - The generate request failed for TPROG25 in PLAY002631. Job ID and name: J0758874 XDEVREGG",
          "ISPW: Generate job output DDs for job J0758874:\n                              JESMSGLG (50 records)\n                              JESJCL (237 records)\n                              JESYSMSG (505 records)\n                              WZZBPOUT (4 records)\n                              CWPERRM (55 records)\n                              SYSPRINT (423 records)\n                              SYSUT2 (423 records)\n                              SYSPRINT (4 records)\n                              WZZBPOUT (16 records)\n                              WZZBPOUT (5 records)\n                              SYSPRINT (349 records)\n                              SYS00010 (9 records)\n                              CWPWBNV (18 records)\n                              SYS00023 (24 records)"
        ],
        taskCount: 2
      }
    };
    assert.throw(function () { index.handleResponseBody(responseBody) }, index.GenerateFailureException, 'There were generate failures.');
  });

  it('should return successfully', function () {
    let responseBody = {
      setID: 'S000238588',
      url: 'http://ces:48080/ispw/CW09-47623/sets/S000238588',
      awaitStatus: {
        generateFailedCount: 0,
        generateSuccessCount: 1,
        hasFailures: false,
        statusMsg: [
          "ISPW: Set S000238378 - The generate request completed successfully for TPROG21 in PLAY002631. Job ID and name: J0758875 XDEVREGG"],
        taskCount: 1
      }
    };
    let output = index.handleResponseBody(responseBody);
    assert.strictEqual(output, responseBody);
  });

  it('should handle an empty message array', function () {
    let responseBody = {
      setId: 'S000241246',
      url: 'http://ces:48226/ispw/cw09-47623/sets/S000241246',
      awaitStatus: {
        generateFailedCount: 0,
        generateSuccessCount: 1,
        hasFailures: false,
        statusMsg: 'ISPW: Set S000241246 - The generate request completed successfully for KEEPRG2 in PLAY004799. Job ID and name: J0861367 AMIKEE0G',
        taskCount: 1
      }
    };
    let output = index.handleResponseBody(responseBody);
    assert.strictEqual(output, responseBody);
  });
});