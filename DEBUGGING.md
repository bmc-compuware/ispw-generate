# Debugging Guide for Code Pipeline Generate Action

This guide provides comprehensive debugging strategies for the Code Pipeline Generate GitHub Action.

## Table of Contents

- [1. Local Debugging in VS Code](#1-local-debugging-in-vs-code)
- [2. Debugging Tests](#2-debugging-tests)
- [3. Debugging in GitHub Actions](#3-debugging-in-github-actions)
- [4. Mock HTTP Requests](#4-mock-http-requests-for-local-testing)
- [5. Console Logging Strategy](#5-console-logging-strategy)
- [6. Step-by-Step Debugging Workflow](#6-step-by-step-debugging-workflow)
- [7. Debugging in Production](#7-debugging-in-production-github-actions)
- [8. Common Issues & Solutions](#8-common-issues--solutions)
- [9. Quick Debug Commands](#9-quick-debug-commands)

---

## 1. Local Debugging in VS Code

### Setup Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Main Script",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/index.js",
      "env": {
        "INPUT_CES_URL": "https://your-ces-server:48226/",
        "INPUT_CES_TOKEN": "your-test-token",
        "INPUT_SRID": "host-37733",
        "INPUT_RUNTIME_CONFIGURATION": "ISPW",
        "INPUT_ASSIGNMENT_ID": "PLAY000826",
        "INPUT_LEVEL": "DEV1",
        "INPUT_TASK_ID": "7E3A5B274D24,7E3A5B274EFA",
        "INPUT_CHANGE_TYPE": "S",
        "INPUT_EXECUTION_STATUS": "I",
        "INPUT_AUTO_DEPLOY": "false"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": [
        "--timeout",
        "999999",
        "--colors",
        "${workspaceFolder}/test"
      ],
      "internalConsoleOptions": "openOnSessionStart"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Single Test",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": [
        "--timeout",
        "999999",
        "--colors",
        "--grep",
        "${input:testName}",
        "${workspaceFolder}/test"
      ]
    }
  ],
  "inputs": [
    {
      "id": "testName",
      "type": "promptString",
      "description": "Test name pattern to run",
      "default": "getParmsFromInputs"
    }
  ]
}
```

### Usage

1. Press `F5` or click **Run → Start Debugging**
2. Select the configuration you want
3. Set breakpoints by clicking left of line numbers
4. Use debugger controls:
   - `F5` - Continue
   - `F10` - Step Over
   - `F11` - Step Into
   - `Shift+F11` - Step Out
   - `Shift+F5` - Stop

---

## 2. Debugging Tests

### Run Single Test with Debugger

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "getParmsFromInputs"

# Run specific test by pattern
npm test -- --grep "should return empty"

# Run tests with coverage
npm run test

# Check coverage thresholds
npm run coverage
```

### Add Debug Statements in Tests

Example modification to `test/index.test.js`:

```javascript
it('should have assignment defined', function () {
  console.log('Testing assignment input...'); // Add debug line
  let output = index.getParmsFromInputs('assignment123', '', '');
  console.log('Output:', output); // Add debug line
  assert.isNotNull(output);
  assert.strictEqual(output.containerId, 'assignment123');
});
```

### Run Tests in Watch Mode

```bash
# Install mocha globally if needed
npm install -g mocha

# Run in watch mode
mocha --watch test/index.test.js
```

---

## 3. Debugging in GitHub Actions

### Enable Debug Logging

GitHub Actions has built-in debug logging. Enable it by setting repository secrets:

1. Go to your repository: **Settings → Secrets → Actions**
2. Add two secrets:
   - `ACTIONS_RUNNER_DEBUG` = `true`
   - `ACTIONS_STEP_DEBUG` = `true`

### Using core.debug() in Code

The code already has debug statements that only show when debug mode is enabled:

```javascript
// Example debug statements from index.js
core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs));
core.debug('Code Pipeline: parsed buildParms: ' + utils.convertObjectToJson(buildParms));
core.debug('Code Pipeline: request url: ' + reqUrl.href);
core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data));
```

### Add More Debug Statements

```javascript
// Add at critical points in index.js
console.log('Starting generate process...');
core.debug('Authentication method: ' + (inputs.ces_token ? 'token' : 'certificate'));
core.debug('Request body: ' + JSON.stringify(reqBodyObj, null, 2));
core.debug('Host and Port: ' + host + ':' + port);
```

---

## 4. Mock HTTP Requests for Local Testing

### Using nock (already in devDependencies)

Create `test/mock-server.js`:

```javascript
const nock = require('nock');

function mockSuccessfulGenerate() {
  nock('https://ces-server:48226')
    .post('/ispw/host-37733/assignments/PLAY000826/taskIds/generate-await')
    .query(true)
    .reply(200, {
      setId: 'S000238588',
      url: 'http://ces:48080/ispw/CW09-47623/sets/S000238588',
      awaitStatus: {
        generateFailedCount: 0,
        generateSuccessCount: 2,
        hasFailures: false,
        statusMsg: ['Generate completed successfully'],
        taskCount: 2
      }
    });
}

function mockFailedGenerate() {
  nock('https://ces-server:48226')
    .post(/\/ispw\/.*/)
    .reply(500, {
      message: 'Generate failed: Connection timeout'
    });
}

function mockTimeoutGenerate() {
  nock('https://ces-server:48226')
    .post(/\/ispw\/.*/)
    .reply(200, {
      setId: 'S000238588',
      url: 'http://ces:48080/ispw/CW09-47623/sets/S000238588',
      message: 'Generate failed: timed out'
    });
}

module.exports = {
  mockSuccessfulGenerate,
  mockFailedGenerate,
  mockTimeoutGenerate
};
```

### Using Mock in Tests

```javascript
const mockServer = require('./mock-server');

describe('#integration tests', function() {
  beforeEach(function() {
    mockServer.mockSuccessfulGenerate();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should handle successful generate', function() {
    // Your test code here
  });
});
```

---

## 5. Console Logging Strategy

### Add Structured Logging

Add at the top of `index.js`:

```javascript
const DEBUG = process.env.DEBUG === 'true';

function debugLog(section, message, data) {
  if (DEBUG) {
    console.log(`[DEBUG][${section}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

// Use throughout code
debugLog('INPUT', 'Received inputs', inputs);
debugLog('BUILD_PARMS', 'Generated build parameters', buildParms);
debugLog('REQUEST', 'Making HTTP request', { url: reqUrl.href, body: reqBodyObj });
debugLog('RESPONSE', 'Received response', response.data);
debugLog('AUTH', 'Authentication method', { 
  hasToken: !!inputs.ces_token, 
  hasCert: !!inputs.certificate 
});
```

### Run with Debug Enabled

```bash
# Windows PowerShell
$env:DEBUG="true"; node index.js

# Windows CMD
set DEBUG=true && node index.js

# Linux/Mac
DEBUG=true node index.js
```

---

## 6. Step-by-Step Debugging Workflow

### Debugging Test Functions (Lines 292-328)

The `testFunction2` has an issue. Here's how to debug and fix it:

**Current Code (Problematic):**
```javascript
function testFunction2() {
  try {
    error.response = '';  // error is not defined!
    error.data = '';
    
    throw new GenerateFailureException(error.response.data.message);
  } catch (error) {
    return error.message;
  }
}
```

**Fixed Code:**
```javascript
function testFunction2() {
  try {
    let error = {};  // Create error object first
    error.response = { 
      data: { 
        message: 'Test error message' 
      } 
    };
    
    console.log('Error object:', error); // Debug line
    throw new GenerateFailureException(error.response.data.message);
  } catch (error) {
    console.log('Caught error:', error.message); // Debug line
    return error.message;
  }
}
```

### Test in Terminal

```bash
# Run the specific test function
node -e "const idx = require('./index.js'); console.log(idx.testFunction2());"

# Run all test functions
node -e "const idx = require('./index.js'); console.log('Test 1:', idx.testFunction()); console.log('Test 2:', idx.testFunction1()); console.log('Test 3:', idx.testFunction2());"
```

---

## 7. Debugging in Production (GitHub Actions)

### Add Workflow Debug Step

```yaml
jobs:
  run-ispw-generate:
    runs-on: ubuntu-latest
    name: A job to generate source in Code Pipeline
    steps:
      - name: Generate
        uses: bmc-compuware/ispw-generate@v1
        id: generate
        with:
          ces_url: "https://CES:48226/"
          ces_token: ${{ secrets.CES_TOKEN }}
          srid: host-37733
          runtime_configuration: ISPW
          assignment_id: PLAY000826
          level: DEV1
          task_id: "7E3A5B274D24,7E3A5B274EFA"

      # Add this debug step
      - name: Debug Generate Output
        if: always()
        run: |
          echo "=== Generate Outputs ==="
          echo "Set ID: ${{ steps.generate.outputs.set_id }}"
          echo "URL: ${{ steps.generate.outputs.url }}"
          echo "Success Count: ${{ steps.generate.outputs.generate_success_count }}"
          echo "Failed Count: ${{ steps.generate.outputs.generate_failed_count }}"
          echo "Has Failures: ${{ steps.generate.outputs.has_failures }}"
          echo "Timed Out: ${{ steps.generate.outputs.is_timed_out }}"
          echo "Task Count: ${{ steps.generate.outputs.task_count }}"
          echo "=== Full JSON Output ==="
          echo '${{ steps.generate.outputs.output_json }}'
```

### View Logs Using GitHub CLI

```bash
# List recent workflow runs
gh run list

# View specific run logs
gh run view <run-id> --log

# View logs for latest run
gh run view --log

# Watch a running workflow
gh run watch
```

---

## 8. Common Issues & Solutions

| Issue | Symptoms | Debug Method | Solution |
|-------|----------|--------------|----------|
| **Action not found** | `Error: Unable to resolve action` | Check action reference in workflow | Verify tag exists, ensure `action.yml` syntax is correct |
| **HTTP 401/403 errors** | Authentication failure | Enable debug mode, check token/cert | Verify secrets are set correctly, check if token is expired |
| **HTTP 404 errors** | Resource not found | Check URL in debug output | Verify SRID format (`host-port`), check assignment ID exists |
| **HTTP 500 errors** | Server error | Check CES server logs | Contact CES administrator, verify server is running |
| **Timeout issues** | `is_timed_out: true` | Check response message | Increase timeout, check mainframe job queue |
| **Missing inputs** | `MissingArgumentException` | Check input validation at line 31 | Ensure required fields are provided |
| **Wrong auth method** | Connection fails | Add debug at line 49 | Verify either `ces_token` OR `certificate` is provided |
| **Build failures** | Dist file outdated | Run `npm run build` | Rebuild and commit `dist/index.js` |
| **Test failures** | Tests fail locally | Run with `--grep` to isolate | Check test expectations vs actual behavior |

---

## 9. Quick Debug Commands

### Development Commands

```bash
# Lint code
npm run lint

# Run tests with coverage
npm test

# Check coverage thresholds
npm run coverage

# Build the distribution
npm run build

# Run full CI check
npm run check

# Install dependencies
npm install

# Update dependencies
npm update
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "getParmsFromInputs"

# Run tests in watch mode
npx mocha --watch test/index.test.js

# Run with verbose output
npm test -- --reporter spec

# Generate coverage report
npm test && npx nyc report --reporter=html
# Then open coverage/index.html
```

### Local Execution with Mock Inputs

```bash
# Windows PowerShell
$env:INPUT_CES_URL="https://test:48226/"; $env:INPUT_SRID="host-123"; $env:INPUT_ASSIGNMENT_ID="TEST001"; $env:INPUT_LEVEL="DEV1"; $env:INPUT_TASK_ID="12345"; node index.js

# Windows CMD
set INPUT_CES_URL=https://test:48226/ && set INPUT_SRID=host-123 && set INPUT_ASSIGNMENT_ID=TEST001 && set INPUT_LEVEL=DEV1 && set INPUT_TASK_ID=12345 && node index.js

# Linux/Mac
INPUT_CES_URL="https://test:48226/" INPUT_SRID="host-123" INPUT_ASSIGNMENT_ID="TEST001" INPUT_LEVEL="DEV1" INPUT_TASK_ID="12345" node index.js
```

---

## 10. Debugging Specific Scenarios

### Scenario 1: Debugging Input Parsing

Add temporary logging at line 18:

```javascript
inputs = utils.retrieveInputs(core, inputs);
console.log('=== PARSED INPUTS ===');
console.log('CES URL:', inputs.ces_url);
console.log('SRID:', inputs.srid);
console.log('Assignment:', inputs.assignment_id);
console.log('Level:', inputs.level);
console.log('Task IDs:', inputs.task_id);
console.log('Has Token:', !!inputs.ces_token);
console.log('Has Certificate:', !!inputs.certificate);
console.log('====================');
core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs));
```

### Scenario 2: Debugging URL Generation

Add logging around line 37:

```javascript
const reqPath = getGenerateAwaitUrlPath(inputs.srid, buildParms);
console.log('Request Path:', reqPath);

const reqUrl = utils.assembleRequestUrl(inputs.ces_url, reqPath);
console.log('Full Request URL:', reqUrl.href);
core.debug('Code Pipeline: request url: ' + reqUrl.href);
```

### Scenario 3: Debugging Request Body

Add logging around line 41:

```javascript
const reqBodyObj = assembleRequestBodyObject(inputs.runtime_configuration,
    inputs.change_type, inputs.execution_status, inputs.auto_deploy);

console.log('=== REQUEST BODY ===');
console.log(JSON.stringify(reqBodyObj, null, 2));
console.log('===================');
```

### Scenario 4: Debugging Response Handling

Add logging in promise handlers:

```javascript
.then((response) => {
  console.log('=== RESPONSE RECEIVED ===');
  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(response.data, null, 2));
  console.log('========================');
  
  core.debug('Code Pipeline: received response body: ' +
    utils.convertObjectToJson(response.data));
  setOutputs(core, response.data);
  return handleResponseBody(response.data);
})
```

---

## 11. Troubleshooting Checklist

Before opening an issue, check:

- [ ] `npm install` completed successfully
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` generated `dist/index.js`
- [ ] Action uses correct tag/branch reference
- [ ] Required secrets are set in GitHub
- [ ] SRID is in correct format (`host-port`)
- [ ] CES server is accessible
- [ ] Debug mode is enabled in GitHub Actions
- [ ] Test with simple/known-good inputs first
- [ ] Check GitHub Actions logs for error messages
- [ ] Verify Node.js version compatibility

---

## 12. Getting Help

If you're still stuck:

1. **Review Logs**: Check both local terminal and GitHub Actions logs
2. **Enable Debug**: Set `ACTIONS_STEP_DEBUG` and `ACTIONS_RUNNER_DEBUG` to `true`
3. **Check Examples**: Review `README.md` for working examples
4. **Run Tests**: Ensure all tests pass with `npm test`
5. **Check Issues**: Search [GitHub Issues](https://github.com/bmc-compuware/ispw-generate/issues)
6. **Contact Support**: Reach out to BMC support for CES/Code Pipeline issues

---

## Appendix: Useful VS Code Extensions

- **JavaScript Debugger** (built-in)
- **ESLint** - Real-time linting
- **Mocha Test Explorer** - Visual test runner
- **GitLens** - Enhanced Git integration
- **GitHub Actions** - Workflow syntax highlighting

---

## Additional Resources

- [GitHub Actions Debugging Guide](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Mocha Documentation](https://mochajs.org/)
- [Nock Documentation](https://github.com/nock/nock)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

---

**Last Updated**: October 10, 2025  
**Version**: 1.0

