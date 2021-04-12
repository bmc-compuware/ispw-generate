const assert = require('assert');
const fs = require('fs');
const path = require('path');


describe('Testing index.js', function () {

  describe('#getParmsFileStringContents(parmFileLocation)', function () {
    it('should return empty string', function () {
      let pathName = __dirname + '/workspace/testEmpty.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName,  '');
      var getFileContentsStr = require('../src/utilities.js').getFileContentsStr;
      let buildParms = getFileContentsStr(pathName);
      assert.strictEqual(buildParms, '');
    });


    it('should return abc', function () {
      let pathName = __dirname + '/workspace/testABC.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, 'abc');
      var getFileContentsStr = require('../src/utilities.js').getFileContentsStr;
      let buildParms = getFileContentsStr(pathName);
      assert.strictEqual(buildParms, 'abc');
    });
  });

  describe('#getParmsFromFile(parmFileLocation)', function () {
    it('test parsing', function () {
      let output = JSON.parse(JSON.stringify({
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskIds: ['7E45E3087494'],
        taskLevel: 'DEV1'
      }));
      assert.strictEqual(output.containerId, 'PLAY003736');
      assert.strictEqual(output.releaseId, ' ');
      assert.strictEqual(output.taskLevel, 'DEV1');

    });

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
      var getParmsFromFile = require('../src/utilities.js').getParmsFromFile;
      let buildParms = getParmsFromFile(pathName);
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
      var getParmsFromFile = require('../src/utilities.js').getParmsFromFile;
      let output = getParmsFromFile(pathName);
      assert.strictEqual(output.containerId, 'PLAY003736');
      assert.strictEqual(output.releaseId, ' ');
      assert.strictEqual(output.taskLevel, 'DEV1');
      assert.deepEqual(output.taskIds, ['7E45E3087494']);
    });
  });

});