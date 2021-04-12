const assert = require('assert');
const fs = require('fs');
const path = require('path');


describe('Testing index.js', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });

  describe('#getParmsFileStringContents(parmFileLocation)', async function () {
    await it('should return empty string', async function () {
      let pathName = __dirname + '/workspace/testEmpty.txt';
      pathName = path.normalize(pathName);
      fs.open(pathName, 'w', function (err) {
        if (err) {
          return console.error(err);
        }

        fs.writeFileSync(pathName,  '');

      });
      var getParmsFileStringContents = require('../src/utilities');
      let buildParms = await getParmsFileStringContents(pathName);
      assert.strictEqual(buildParms, '');
    });


    await it('should return abc', async function () {
      let pathName = __dirname + '/workspace/testABC.txt';
      pathName = path.normalize(pathName);
      console.log('pathName: ' + pathName);
      fs.open(pathName, 'w', function (err) {
        if (err) {
          return console.error(err);
        }
        
        fs.writeFileSync(pathName,  'abc');

      });
      var getParmsFileStringContents = require('../src/utilities');
      let buildParms = await getParmsFileStringContents(pathName);
      assert.strictEqual(buildParms, 'abc');
    });
  });

  describe('#getParmsFromFile(parmFileLocation)', async function () {
    await it('should return empty buildparms', async function () {
      fs.open(__dirname + '/workspace/automaticBuildParams.txt', 'w', function (err) {
        if (err) {
          return console.error(err);
        }

        fs.writeFileSync(__dirname + '/workspace/automaticBuildParams.txt',  JSON.stringify(undefined));

      });
      var getParmsFromFile = require('../src/utilities');
      let buildParms = await getParmsFromFile(__dirname + '/workspace/automaticBuildParams.txt');
      assert.strictEqual(buildParms, undefined);
    });

    await it('should return buildParms object with fields filled in', async function () {
      fs.open(__dirname + '/workspace/automaticBuildParams.txt', 'w', function (err) {
        if (err) {
          return console.error(err);
        }

        fs.writeFileSync(__dirname + '/workspace/automaticBuildParams.txt',
          JSON.stringify({
            containerId: 'PLAY003736',
            releaseId: ' ',
            taskLevel: 'DEV1',
            taskIds: ['7E45E3087494']
          }));


      });
      var getParmsFromFile = require('../src/utilities');
      let buildParms = await getParmsFromFile(__dirname + '/workspace/automaticBuildParams.txt');
      assert.strictEqual(buildParms, {
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskLevel: 'DEV1',
        taskIds: ['7E45E3087494']
      });
    });
  });

});