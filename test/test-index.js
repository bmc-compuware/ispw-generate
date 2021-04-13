const chai = require('chai');
var assert = chai.assert;
const fs = require('fs');
const path = require('path');


describe('Testing index.js', function () {

  describe('#getParmsFileStringContents(parmFileLocation)', function () {
    it('should return empty string', function () {
      let pathName = __dirname + '/workspace/testEmpty.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName,  '');
      var utils = require('../src/utilities.js');
      let buildParms = utils.getFileContentsStr(pathName);
      assert.strictEqual(buildParms, '');
    });


    it('should return abc', function () {
      let pathName = __dirname + '/workspace/testABC.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, 'abc');
      var utils = require('../src/utilities.js');
      let buildParms = utils.getFileContentsStr(pathName);
      assert.strictEqual(buildParms, 'abc');
    });
  });

  describe('#getParmsFromFile(parmFileLocation)', function () {

    it('should return empty buildparms', function () {
      let pathName = __dirname + '/workspace/automaticBuildParams.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, JSON.stringify({}));
      var getParmsFromFile = require('../src/utilities.js').getParmsFromFile;
      let output = getParmsFromFile(pathName);
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taksIds, undefined);
      assert.strictEqual(output.taskLevel, undefined);
    });

    it('should return undefined', function () {
      let pathName = __dirname + '/workspace/automaticBuildParams.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, '');
      var utils = require('../src/utilities.js');
      let buildParms = utils.getParmsFromFile(pathName);
      assert.strictEqual(buildParms, undefined);
    });

    it('should return buildParms object with fields filled in', function () {
      let pathName = __dirname + '/workspace/automaticBuildParams.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, JSON.stringify({
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskLevel: 'DEV1',
        taskIds: ['7E45E3087494']
      }));
      var utils = require('../src/utilities.js');
      let output = utils.getParmsFromFile(pathName);
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
      assert.deepStrictEqual(output.taskIds, ['task1','task2','task3','task4']);
    });

  });


  describe('#validateBuildParms(buildParms)', function () {
    it('should return false - no parms defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - taskLevel & taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {containerId: null};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {containerId: undefined};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {containerId: ''};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {containerId: 'assignment1'};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {taskLevel: null};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskLevel: undefined};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskLevel: ''};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskLevel: 'level1'};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskLevel not defined', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {taskIds: null};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskIds: undefined};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskIds: []};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);

      buildParms = {taskIds: ['task1', 'task2']};
      output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - containerId not defined', function () {
      var utils = require('../src/utilities.js');
      let  buildParms = {taskLevel: 'level2',taskIds: ['task1', 'task2']};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - taskLevel not defined', function () {
      var utils = require('../src/utilities.js');
      let  buildParms = {containerId: 'assignment2',taskIds: ['task1', 'task2']};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return false - taskIds not defined', function () {
      var utils = require('../src/utilities.js');
      let  buildParms = {containerId: 'assignment2',taskLevel: 'level3'};
      let output = utils.validateBuildParms(buildParms);
      assert.isFalse(output);
    });

    it('should return true - everything defined', function () {
      var utils = require('../src/utilities.js');
      let  buildParms = {containerId: 'assignment2',taskLevel: 'level3',taskIds: ['task1', 'task2']};
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
      let data = {field1:'value1', field2:'value2'};
      var utils = require('../src/utilities.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '{"field1":"value1","field2":"value2"}');
    });

  });


  describe('#assembleRequestUrl(CESUrl, buildParms)', function () {
    it('should use CES url as it is', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {containerId: 'assignment345',
                        taskLevel: 'DEV2',
                        taskIds: ['a37b46c2', '7bd249ba12']};
      let cesUrl = 'https://ces:48226'
      let output = utils.assembleRequestUrl(cesUrl, 'ISPW', buildParms);
      assert.strictEqual(output, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove Compuware', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {containerId: 'assignment345',
                        taskLevel: 'DEV2',
                        taskIds: ['a37b46c2', '7bd249ba12']};
      let cesUrl = 'https://ces:48226/Compuware'
      let output = utils.assembleRequestUrl(cesUrl, 'ISPW', buildParms);
      assert.strictEqual(output, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    
    });

    it('should modify CES url to remove ispw', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {containerId: 'assignment345',
                        taskLevel: 'DEV2',
                        taskIds: ['a37b46c2', '7bd249ba12']};
      let cesUrl = 'https://ces:48226/isPw'
      let output = utils.assembleRequestUrl(cesUrl, 'srid', buildParms);
      assert.strictEqual(output, 'https://ces:48226/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove trailing slash', function () {
      var utils = require('../src/utilities.js');
      let buildParms = {containerId: 'assignment345',
                        taskLevel: 'DEV2',
                        taskIds: ['a37b46c2', '7bd249ba12']};
      let cesUrl = 'https://ces:48226/'
      let output = utils.assembleRequestUrl(cesUrl, 'cw09-47623', buildParms);
      assert.strictEqual(output, 'https://ces:48226/ispw/cw09-47623/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
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



});