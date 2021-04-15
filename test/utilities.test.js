/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

describe('Testing utilities.js', function () {

  describe('#retrieveInputs(core)', function () {
    var utils = require('../src/utilities.js');
    let core = {
      getInput: function (inputName) {
        return inputName;
      }
    };
    it('should return inputs', function () {
      let output = utils.retrieveInputs(core);
      assert.strictEqual(output.generateAutomatically, 'generate_automatically');
      assert.strictEqual(output.assignmentId, 'assignment_id');
      assert.strictEqual(output.level, 'level');
      assert.strictEqual(output.taskId, 'task_id');
      assert.strictEqual(output.cesUrl, 'ces_url');
      assert.strictEqual(output.cesToken, 'ces_token');
      assert.strictEqual(output.srid, 'srid');
      assert.strictEqual(output.runtimeConfig, 'runtime_configuration');
      assert.strictEqual(output.changeType, 'change_type');
      assert.strictEqual(output.execStat, 'execution_status');
      assert.strictEqual(output.autoDeploy, 'auto_deploy');
      assert.strictEqual(output.other, undefined);
    });
  });


  describe('#parseStringAsJson(jsonString)', function () {
    this.timeout(5000);
    it('should return empty buildparms', function () {
      var utils = require('../src/utilities.js');
      let output = utils.parseStringAsJson(JSON.stringify({}));
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taksIds, undefined);
      assert.strictEqual(output.taskLevel, undefined);
    });

    it('should return undefined', function () {
      var utils = require('../src/utilities.js');
      let output = utils.parseStringAsJson('');
      assert.strictEqual(output, undefined);
    });

    it('should return buildParms object with fields filled in', function () {
      var utils = require('../src/utilities.js');
      let output = utils.parseStringAsJson(JSON.stringify({
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskLevel: 'DEV1',
        taskIds: ['7E45E3087494']
      }));
      assert.strictEqual(output.containerId, 'PLAY003736');
      assert.strictEqual(output.releaseId, ' ');
      assert.strictEqual(output.taskLevel, 'DEV1');
      assert.deepEqual(output.taskIds, ['7E45E3087494']);
    });
  });

  describe('#getParmsFromInputs(inputAssignment, inputLevel, inputTaskId)', function () {
    it('should return empty - null passed in', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs(null, null, null);
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.taskLevel, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taskIds, undefined);
    });

    it('should return empty - undefined passed in', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs(undefined, undefined, undefined);
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.taskLevel, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taskIds, undefined);
    });

    it('should return empty - empty passed in', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs('', '', '');
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.taskLevel, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taskIds, undefined);
    });

    it('should have assignment defined', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs('assignment123', '', '');
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, 'assignment123');
      assert.strictEqual(output.taskLevel, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taskIds, undefined);
    });

    it('should have level defined', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs('', 'level', '');
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.taskLevel, 'level');
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taskIds, undefined);
    });

    it('should have taskIds defined', function () {
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromInputs('', '', 'task1,task2,task3,task4');
      assert.isNotNull(output);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.taskLevel, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.deepStrictEqual(output.taskIds, ['task1', 'task2', 'task3', 'task4']);
    });

  });


  describe('#validateBuildParms(buildParms)', function () {
    it('should return false - no parms defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - buildParms are null', function () {
      var utils = require('../src/utilities.js');
      let output = utils.validateBuildParms(null);
      assert.isFalse(output);
    });

    it('should return false - buildParms are undefined', function () {
      var utils = require('../src/utilities.js');
      let output = utils.validateBuildParms(undefined);
      assert.isFalse(output);
    });

    it('should return false - taskLevel & taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { containerId: null };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { containerId: undefined };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { containerId: '' };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { containerId: 'assignment1' };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { taskLevel: null };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskLevel: undefined };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskLevel: '' };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskLevel: 'level1' };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskLevel not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { taskIds: null };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskIds: undefined };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskIds: [] };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = { taskIds: ['task1', 'task2'] };
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { taskLevel: 'level2', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - taskLevel not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { containerId: 'assignment2', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { containerId: 'assignment2', taskLevel: 'level3' };
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return true - everything defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = { containerId: 'assignment2', taskLevel: 'level3', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms);
      assert.isTrue(output);
    });

  });


  describe('#convertObjectToJson(data)', function () {
    it('should return empty string - null input', function () {
      let data = null;
      var utils = require('../src/utilities.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '');
    });

    it('should return empty string - undefined input', function () {
      let data = undefined;
      var utils = require('../src/utilities.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '');
    });

    it('should return brackets - empty object input', function () {
      let data = {};
      var utils = require('../src/utilities.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '{}');
    });

    it('should return object serialization', function () {
      let data = { field1: 'value1', field2: 'value2' };
      var utils = require('../src/utilities.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '{"field1":"value1","field2":"value2"}');
    });

  });


  describe('#assembleRequestUrl(CESUrl, buildParms)', function () {
    it('should use CES url as it is', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {
        containerId: 'assignment345',
        taskLevel: 'DEV2',
        taskIds: ['a37b46c2', '7bd249ba12']
      };
      let cesUrl = 'https://ces:48226'
      let output = utils.assembleRequestUrl(cesUrl, 'ISPW', buildParms);
      assert.equal(output.href, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove Compuware', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {
        containerId: 'assignment345',
        taskLevel: 'DEV2',
        taskIds: ['a37b46c2', '7bd249ba12']
      };
      let cesUrl = 'https://ces:48226/Compuware'
      let output = utils.assembleRequestUrl(cesUrl, 'ISPW', buildParms);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');

    });

    it('should modify CES url to remove ispw', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {
        containerId: 'assignment345',
        taskLevel: 'DEV2',
        taskIds: ['a37b46c2', '7bd249ba12']
      };
      let cesUrl = 'https://ces:48226/isPw'
      let output = utils.assembleRequestUrl(cesUrl, 'srid', buildParms);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove trailing slash', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {
        containerId: 'assignment345',
        taskLevel: 'DEV2',
        taskIds: ['a37b46c2', '7bd249ba12']
      };
      let cesUrl = 'https://ces:48226/'
      let output = utils.assembleRequestUrl(cesUrl, 'cw09-47623', buildParms);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/cw09-47623/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });
  });


  describe('#assembleRequestBodyObject(runtimeConfig, changeType, executionStatus, autoDeploy)', function () {
    it('should be missing runtime config', function () {
      var utils = require('../src/utilities.js');
      let output = utils.assembleRequestBodyObject(null, 'E', 'H', 'false');
      assert.strictEqual(output.runtimeConfig, undefined);
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject(undefined, 'E', 'H', 'false');
      assert.strictEqual(output.runtimeConfig, undefined);
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject('', 'E', 'H', 'false');
      assert.strictEqual(output.runtimeConfig, undefined);
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);
    });

    it('should be missing changeType', function () {
      var utils = require('../src/utilities.js');
      let output = utils.assembleRequestBodyObject('TPZP', null, 'H', 'false');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, undefined);
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject('TPZP', undefined, 'H', 'false');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, undefined);
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject('TPZP', '', 'H', 'false');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, undefined);
      assert.strictEqual(output.execStat, 'H');
      assert.strictEqual(output.autoDeploy, false);
    });

    it('should be missing executionStatus', function () {
      var utils = require('../src/utilities.js');
      let output = utils.assembleRequestBodyObject('TPZP', 'E', null, 'true');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, undefined);
      assert.strictEqual(output.autoDeploy, true);

      output = utils.assembleRequestBodyObject('TPZP', 'E', undefined, 'true');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, undefined);
      assert.strictEqual(output.autoDeploy, true);

      output = utils.assembleRequestBodyObject('TPZP', 'E', '', 'true');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, undefined);
      assert.strictEqual(output.autoDeploy, true);
    });

    it('should set autoDeploy to false', function () {
      var utils = require('../src/utilities.js');
      let output = utils.assembleRequestBodyObject('TPZP', 'E', 'I', null);
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'I');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject('TPZP', 'E', 'I', undefined);
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'I');
      assert.strictEqual(output.autoDeploy, false);

      output = utils.assembleRequestBodyObject('TPZP', 'E', 'I', '');
      assert.strictEqual(output.runtimeConfig, 'TPZP');
      assert.strictEqual(output.changeType, 'E');
      assert.strictEqual(output.execStat, 'I');
      assert.strictEqual(output.autoDeploy, false);
    });
  });

  describe('#handleResponseBody(responseBody)', function () {
    var utils = require('../src/utilities.js');
    it('should throw an exception - responseBody undefined', function () {
      assert.throw(function () { utils.handleResponseBody(undefined) }, utils.GenerateFailureException, 'No response was received from the generate request.');
    });

    it('should throw an exception - responseBody empty', function () {
      assert.throw(function () { utils.handleResponseBody({}) }, utils.GenerateFailureException, 'The generate did not complete successfully.');
    });

    it('should throw an exception - timeout', function () {
      assert.throw(function () { utils.handleResponseBody({ setID: 'S000238588', message: 'Generate failed: timed out', url: 'http://10.211.55.5:48080/ispw/CW09-47623/sets/S000238588' }) }, utils.GenerateFailureException, 'The generate did not complete successfully.');
    });

    it('should throw an exception - generate failure', function () {
      let responseBody = {
        setID: 'S000238588',
        url: 'http://10.211.55.5:48080/ispw/CW09-47623/sets/S000238588',
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
      assert.throw(function () { utils.handleResponseBody(responseBody) }, utils.GenerateFailureException, 'There were generate failures.');
    });

    it('should return successfully', function () {
      let responseBody = {
        setID: 'S000238588',
        url: 'http://10.211.55.5:48080/ispw/CW09-47623/sets/S000238588',
        awaitStatus: {
          generateFailedCount: 0,
          generateSuccessCount: 1,
          hasFailures: false,
          statusMsg: [
            "ISPW: Set S000238378 - The generate request completed successfully for TPROG21 in PLAY002631. Job ID and name: J0758875 XDEVREGG"],
          taskCount: 1
        }
      };
      let output = utils.handleResponseBody(responseBody);
      assert.strictEqual(output, responseBody);
    });

    it('should handle an empty message array', function () {
      let responseBody = {
        setId: 'S000241246',
        url: 'http://10.100.12.250:48226/ispw/cw09-47623/sets/S000241246',
        awaitStatus: {
          generateFailedCount: 0,
          generateSuccessCount: 1,
          hasFailures: false,
          statusMsg: 'ISPW: Set S000241246 - The generate request completed successfully for KEEPRG2 in PLAY004799. Job ID and name: J0861367 AMIKEE0G',
          taskCount: 1
        }
      };
      let output = utils.handleResponseBody(responseBody);
      assert.strictEqual(output, responseBody);
    });
  });


  describe('#getHttpPromise(cesUrl, token, requestBody)', function () {
    const nock = require('nock');
    var utils = require('../src/utilities.js');

    afterEach(() => {
      assert.strictEqual(nock.pendingMocks.length, 0);
    });

    it('should be resolved', async function () {
      let reqUrl = new URL('http://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
      let token = '10987654321';
      let reqBody = JSON.stringify({
        runtimeConfig: 'CONFIG1',
        changeType: 'E',
        execStat: 'H',
        autoDeploy: false
      });
      const scope = nock('http://ces:48226')
        .post('/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2')
        .reply(200, {
          setId: 'S000241246',
          url: 'http://10.100.12.250:48226/ispw/cw09-47623/sets/S000241246',
          awaitStatus: {
            generateFailedCount: 0,
            generateSuccessCount: 1,
            hasFailures: false,
            statusMsg: 'ISPW: Set S000241246 - The generate request completed successfully for KEEPRG2 in PLAY004799. Job ID and name: J0861367 AMIKEE0G',
            taskCount: 1
          }
        });

      await utils.getHttpPromise(reqUrl, token, reqBody).then((resBody) => {
        console.log('verifying body');
        assert.strictEqual(resBody.setId, 'S000241246');
        assert.strictEqual(resBody.url, 'http://10.100.12.250:48226/ispw/cw09-47623/sets/S000241246');
        assert.strictEqual(resBody.awaitStatus.generateFailedCount, 0);
        assert.strictEqual(resBody.awaitStatus.generateSuccessCount, 1);
        assert.strictEqual(resBody.awaitStatus.hasFailures, false);
        assert.strictEqual(resBody.awaitStatus.taskCount, 1);
      }, (error) => {
        assert.fail('should not reach here');
      });

    });

    it('should be rejected', async function () {
      let reqUrl = new URL('http://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=reject');
      let token = '10987654321';
      let reqBody = JSON.stringify({
        runtimeConfig: 'CONFIG1',
        changeType: 'E',
        execStat: 'H',
        autoDeploy: false
      });
      const scope = nock('http://ces:48226')
        .post('/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=reject')
        .replyWithError('A error occurred when connecting to ISPW');

      await utils.getHttpPromise(reqUrl, token, reqBody).then(() => {
        assert.fail('should not reach here');
      }, (error) => {
        console.log('verifying body');
        assert.strictEqual(error.message, 'A error occurred when connecting to ISPW');
      });

    });
  });

});