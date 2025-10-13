# How to Run - Code Pipeline Generate Action

This guide explains all the ways to run, test, and debug the Code Pipeline Generate GitHub Action.

---

## 📋 Table of Contents

- [Development Commands](#development-commands)
- [Local Testing](#local-testing)
- [Running in GitHub Actions](#running-in-github-actions)
- [Debugging](#debugging)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Commands

### Quick Start

```bash
# Install dependencies
npm install

# Run full CI check (recommended)
npm run check
```

### Individual Commands

```bash
# Linting
npm run lint              # Auto-fix style issues
npm run lint:check        # Check only (no fixes)

# Testing
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode

# Coverage
npm run coverage          # Check coverage thresholds
npm run coverage:report   # Generate HTML coverage report

# Build
npm run build             # Build dist/index.js for production
```

### Full CI Pipeline

```bash
# Runs: lint → build → test → coverage
npm run check
```

**Expected Output:**
```
✅ Linting:   PASSED (0 errors)
✅ Build:     PASSED (7MB dist/index.js)
✅ Tests:     PASSED (35/35 tests)
✅ Coverage:  PASSED (65-81%)
```

---

## 🧪 Local Testing

### Method 1: Mock Environment Variables

**Windows PowerShell:**
```powershell
# Set mock input variables
$env:INPUT_CES_URL="https://test-ces:48226/"
$env:INPUT_CES_TOKEN="mock-token-12345"
$env:INPUT_SRID="host-37733"
$env:INPUT_ASSIGNMENT_ID="TEST001"
$env:INPUT_LEVEL="DEV1"
$env:INPUT_TASK_ID="12345,67890"
$env:INPUT_CHANGE_TYPE="S"
$env:INPUT_EXECUTION_STATUS="I"
$env:INPUT_AUTO_DEPLOY="false"

# Run the action
node index.js

# Clear variables when done
Remove-Item Env:\INPUT_*
```

**Windows CMD:**
```cmd
set INPUT_CES_URL=https://test-ces:48226/
set INPUT_CES_TOKEN=mock-token-12345
set INPUT_SRID=host-37733
set INPUT_ASSIGNMENT_ID=TEST001
set INPUT_LEVEL=DEV1
set INPUT_TASK_ID=12345,67890
set INPUT_CHANGE_TYPE=S
set INPUT_EXECUTION_STATUS=I
set INPUT_AUTO_DEPLOY=false

node index.js
```

**Linux/Mac (Bash):**
```bash
INPUT_CES_URL="https://test-ces:48226/" \
INPUT_CES_TOKEN="mock-token-12345" \
INPUT_SRID="host-37733" \
INPUT_ASSIGNMENT_ID="TEST001" \
INPUT_LEVEL="DEV1" \
INPUT_TASK_ID="12345,67890" \
INPUT_CHANGE_TYPE="S" \
INPUT_EXECUTION_STATUS="I" \
INPUT_AUTO_DEPLOY="false" \
node index.js
```

### Method 2: Using GitHub Act (Local Actions Runner)

```bash
# Install act (if not already installed)
# See: https://github.com/nektos/act

# Create a test workflow
mkdir -p .github/workflows
cat > .github/workflows/local-test.yml << 'EOF'
name: Local Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./
        with:
          ces_url: "https://test-ces:48226/"
          ces_token: "mock-token"
          srid: "host-37733"
          assignment_id: "TEST001"
          level: "DEV1"
          task_id: "12345,67890"
EOF

# Run with act
act push
```

### Method 3: Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test
npm test -- --grep "getParmsFromInputs"

# Run with verbose output
npm test -- --reporter spec

# Generate coverage report
npm run coverage:report
# Then open: coverage/index.html
```

---

## 🚀 Running in GitHub Actions

### Basic Workflow

Create `.github/workflows/ispw-generate.yml`:

```yaml
name: ISPW Generate

on:
  push:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    name: Generate ISPW Tasks
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run ISPW Generate
        uses: bmc-compuware/ispw-generate@v2
        id: generate
        with:
          ces_url: ${{ secrets.CES_URL }}
          ces_token: ${{ secrets.CES_TOKEN }}
          srid: ${{ secrets.ISPW_SRID }}
          runtime_configuration: "ISPW"
          assignment_id: "PLAY000826"
          level: "DEV1"
          task_id: "7E3A5B274D24,7E3A5B274EFA"
          change_type: "S"
          execution_status: "I"
          auto_deploy: "false"
      
      - name: Check Results
        if: always()
        run: |
          echo "=== Generate Results ==="
          echo "Set ID: ${{ steps.generate.outputs.set_id }}"
          echo "URL: ${{ steps.generate.outputs.url }}"
          echo "Success Count: ${{ steps.generate.outputs.generate_success_count }}"
          echo "Failed Count: ${{ steps.generate.outputs.generate_failed_count }}"
          echo "Has Failures: ${{ steps.generate.outputs.has_failures }}"
          echo "Timed Out: ${{ steps.generate.outputs.is_timed_out }}"
          echo "Task Count: ${{ steps.generate.outputs.task_count }}"
```

### With ISPW Sync (Automatic Parameters)

```yaml
name: Sync and Generate

on: [push]

jobs:
  sync-and-generate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: ISPW Sync
        uses: bmc-compuware/ispw-sync@v20.6.1
        id: sync
        with:
          host: ${{ secrets.ISPW_HOST }}
          port: 37733
          uid: ${{ secrets.TSO_USER }}
          pass: ${{ secrets.TSO_PASS }}
          runtimeConfiguration: 'ISPW'
          stream: 'PLAY'
          application: 'PLAY'
          checkoutLevel: 'DEV2'
          gitUid: 'admin'
          gitToken: ${{ secrets.GITHUB_TOKEN }}
      
      - name: ISPW Generate (Automatic)
        uses: bmc-compuware/ispw-generate@v2
        id: generate
        with:
          ces_url: ${{ secrets.CES_URL }}
          ces_token: ${{ secrets.CES_TOKEN }}
          srid: ${{ secrets.ISPW_SRID }}
          runtime_configuration: 'ISPW'
          # Automatically use parameters from sync
          generate_automatically: ${{ steps.sync.outputs.automaticBuildJson }}
      
      - name: Display Results
        run: |
          echo "Generated ${{ steps.generate.outputs.generate_success_count }} tasks"
```

### Using Certificate Authentication

```yaml
- name: Generate with Certificate
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    certificate: ${{ secrets.CES_CERTIFICATE }}  # Instead of ces_token
    srid: ${{ secrets.ISPW_SRID }}
    runtime_configuration: 'ISPW'
    assignment_id: 'PLAY000826'
    level: 'DEV1'
    task_id: '7E3A5B274D24,7E3A5B274EFA'
```

### Testing from Branch

```yaml
# Test from feature branch before merging
- name: Test Generate from Branch
  uses: bmc-compuware/ispw-generate@migration  # Use branch name
  with:
    # ... your inputs
```

---

## 🔍 Debugging

### Enable Debug Logging in GitHub Actions

1. Go to **Repository Settings → Secrets → Actions**
2. Add these secrets:
   - Name: `ACTIONS_RUNNER_DEBUG` Value: `true`
   - Name: `ACTIONS_STEP_DEBUG` Value: `true`
3. Run your workflow
4. View detailed debug output in logs

### VS Code Debugger

**Step 1:** Create `.vscode/launch.json`:

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
        "INPUT_CES_URL": "https://test-ces:48226/",
        "INPUT_CES_TOKEN": "test-token",
        "INPUT_SRID": "host-37733",
        "INPUT_ASSIGNMENT_ID": "TEST001",
        "INPUT_LEVEL": "DEV1",
        "INPUT_TASK_ID": "12345,67890",
        "INPUT_CHANGE_TYPE": "S",
        "INPUT_EXECUTION_STATUS": "I",
        "INPUT_AUTO_DEPLOY": "false"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": ["--timeout", "999999", "--colors"],
      "internalConsoleOptions": "openOnSessionStart"
    }
  ]
}
```

**Step 2:** Set breakpoints in `index.js`

**Step 3:** Press `F5` or click **Run → Start Debugging**

**Step 4:** Use debugger controls:
- `F5` - Continue
- `F10` - Step Over
- `F11` - Step Into
- `Shift+F11` - Step Out

### View GitHub Actions Logs

```bash
# Using GitHub CLI
gh run list                    # List recent runs
gh run view <run-id> --log     # View specific run logs
gh run view --log              # View latest run
gh run watch                   # Watch running workflow
```

### Debug Specific Function

```bash
# Test a specific function in Node REPL
node
> const index = require('./index.js')
> const result = index.getParmsFromInputs('PLAY001', 'DEV1', 'T1,T2')
> console.log(result)
```

---

## 💡 Common Use Cases

### Use Case 1: Manual Generate

```yaml
- name: Manual Generate
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    ces_token: ${{ secrets.CES_TOKEN }}
    srid: "host-37733"
    runtime_configuration: "ISPW"
    assignment_id: "PLAY000826"
    level: "DEV1"
    task_id: "TASK001,TASK002,TASK003"
    change_type: "S"
    execution_status: "I"
```

### Use Case 2: Emergency Change

```yaml
- name: Emergency Generate
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    ces_token: ${{ secrets.CES_TOKEN }}
    srid: "host-37733"
    runtime_configuration: "ISPW"
    assignment_id: "EMRG001"
    level: "PRD"
    task_id: "HOTFIX001"
    change_type: "E"              # Emergency
    execution_status: "I"          # Immediate
```

### Use Case 3: Held Generate (Manual Approval)

```yaml
- name: Generate and Hold
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    ces_token: ${{ secrets.CES_TOKEN }}
    srid: "host-37733"
    runtime_configuration: "ISPW"
    assignment_id: "PLAY000826"
    level: "QA"
    task_id: "TASK001"
    execution_status: "H"          # Hold for approval
```

### Use Case 4: Auto Deploy After Generate

```yaml
- name: Generate with Auto Deploy
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    ces_token: ${{ secrets.CES_TOKEN }}
    srid: "host-37733"
    runtime_configuration: "ISPW"
    assignment_id: "PLAY000826"
    level: "DEV1"
    task_id: "TASK001,TASK002"
    auto_deploy: "true"            # Auto deploy after generate
```

### Use Case 5: Conditional Generate

```yaml
- name: Conditional Generate
  if: github.ref == 'refs/heads/main'
  uses: bmc-compuware/ispw-generate@v2
  with:
    ces_url: ${{ secrets.CES_URL }}
    ces_token: ${{ secrets.CES_TOKEN }}
    srid: "host-37733"
    runtime_configuration: "ISPW"
    assignment_id: "PLAY000826"
    level: "PROD"
    task_id: ${{ steps.get-tasks.outputs.task_ids }}
```

---

## 🔧 Troubleshooting

### Issue: "Authentication failed"

**Symptoms:**
- HTTP 401 or 403 error
- "No valid authentication method provided"

**Solutions:**
1. Verify `ces_token` or `certificate` is set in secrets
2. Check token hasn't expired
3. Ensure only ONE auth method is provided (not both)
4. Test token/certificate manually with curl

```bash
# Test CES connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ces-server:48226/ispw/HOST-PORT/assignments
```

### Issue: "Missing required inputs"

**Symptoms:**
- Error: "Inputs required for Code Pipeline Generate are missing"
- Action exits without attempting generate

**Solutions:**
1. Ensure `assignment_id`, `level`, and `task_id` are provided
2. OR use `generate_automatically` from sync step
3. Check for typos in input names
4. Enable debug mode to see parsed inputs

### Issue: "Generate timed out"

**Symptoms:**
- `is_timed_out: true` in outputs
- Generate did not complete

**Solutions:**
1. Check mainframe job queue status
2. Verify CES server is responsive
3. Check Code Pipeline configuration
4. Review mainframe logs for the job

### Issue: "Build fails locally"

**Symptoms:**
- `npm run build` fails
- ncc command not found

**Solutions:**
```bash
# Install ncc globally
npm install -g @vercel/ncc

# Or use npx
npx @vercel/ncc build index.js -o dist
```

### Issue: "Tests fail"

**Symptoms:**
- One or more tests failing
- Coverage below threshold

**Solutions:**
```bash
# Run tests with verbose output
npm test -- --reporter spec

# Run specific failing test
npm test -- --grep "test name"

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Issue: "Linting errors"

**Symptoms:**
- `npm run lint` shows errors
- Code doesn't match style guide

**Solutions:**
```bash
# Auto-fix most issues
npm run lint

# Check what would be fixed
npm run lint:check

# Fix specific file
npx eslint index.js --fix
```

---

## 📚 Additional Resources

### Documentation
- **README.md** - User documentation and examples
- **DEBUGGING.md** - Comprehensive debugging guide
- **MIGRATION_SUMMARY.md** - Details about v2.0.0 changes
- **CONTRIBUTING.md** - Contributor guidelines

### GitHub Actions Documentation
- [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
- [Enabling Debug Logging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### Tools
- [GitHub CLI](https://cli.github.com/) - Command-line tool for GitHub
- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [ncc](https://github.com/vercel/ncc) - Node.js compiler

---

## 🎯 Quick Reference Card

```bash
# Development
npm install              # Install dependencies
npm run check            # Full CI check ✅
npm test                 # Run tests
npm run build            # Build distribution

# Local Testing
node index.js            # Run with env vars set
npm test -- --grep "X"   # Test specific function

# Debugging
npm run coverage:report  # Generate HTML coverage
gh run view --log        # View GitHub logs

# Production
git push origin main     # Triggers workflows
gh workflow run "name"   # Manually trigger workflow
```

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint:check`)
- [ ] Coverage meets thresholds (`npm run coverage`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested locally with mock data
- [ ] Tested in test workflow
- [ ] Secrets configured in repository
- [ ] Debug logging tested
- [ ] Documentation reviewed

---

**Version**: 2.0.0  
**Last Updated**: October 10, 2025  
**Status**: Production Ready ✅

