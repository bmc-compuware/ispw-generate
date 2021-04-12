const assert = require('assert');
const fs = require('fs');
const path = require('path');


describe('Testing index.js', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });

  describe('#getParmsFileStringContents(parmFileLocation)', function () {
    it('should return empty string', function () {
      let pathName = __dirname + '/workspace/testEmpty.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName,  '');
      var getFileContentsStr = require('../src/utilities');
      let buildParms = getFileContentsStr(pathName);
      assert.strictEqual(buildParms, '');
    });


    it('should return abc', function () {
      let pathName = __dirname + '/workspace/testABC.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, 'abc');
      var getFileContentsStr = require('../src/utilities');
      let buildParms = getFileContentsStr(pathName);
      assert.strictEqual(buildParms, 'abc');
    });
  });

  describe('#getParmsFromFile(parmFileLocation)', function () {
    it('should return empty buildparms', function () {
      let pathName = __dirname + '/workspace/automaticBuildParams.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, JSON.stringify({}));
      var getParmsFromFile = require('../src/utilities');
      let buildParms = getParmsFromFile(pathName);
      assert.strictEqual(buildParms, {});
    });

    it('should return undefined', function () {
      let pathName = __dirname + '/workspace/automaticBuildParams.txt';
      pathName = path.normalize(pathName);
      fs.writeFileSync(pathName, '');
      var getParmsFromFile = require('../src/utilities');
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
      var getParmsFromFile = require('../src/utilities');
      let buildParms = getParmsFromFile(pathName);
      assert.strictEqual(buildParms, {
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskLevel: 'DEV1',
        taskIds: ['7E45E3087494']
      });
    });
  });

});