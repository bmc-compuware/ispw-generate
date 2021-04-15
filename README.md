# ispw-generate

The ispw-generate action allows your GitHub Actions workflow to trigger a generate in your instance of BMC Compuware ISPW on the mainframe. This action can be used in scenarios where your mainframe source is stored in git, or when you want your GitHub Actions workflow to operate on source that is already stored in ISPW.

## Example usage

The following example will automatically retrieve the generate parameters from a previous step in the job

``` yaml
on: [push]

jobs:
  run-ispw-generate:
    runs-on: ubuntu-latest
    name: A job to sync git source into ISPW, then generate it on the mainframe
    steps:
      - name: Sync step
        uses: compuware-ispw/ispw-sync@v20.6.1.gtk
        id: sync
        with:
          host: 'host.example.com'
          port: 37733
          uid: ${{ secrets.TSOUSER }}
          pass: ${{ secrets.TSOPASS }}
          runtimeConfiguration: 'ISPW'
          stream: 'PLAY'
          application: 'PLAY'
          checkoutLevel: 'DEV2'
          gitUid: 'admin'
          gitPass: ${{ secrets.GITPASS }}
          showEnv: true
      - name: Generate
        uses: compuware-ispw/ispw-generate@v1
        id: generate
        with:
          ces_url: 'https://CES:48226/'
          ces_token: ${{ secrets.CES_TOKEN }}
          srid: 'host-37733'
          runtime_configuration: 'ISPW'
          generate_automatically: ${{ steps.sync.outputs.changedProgramsJson }}
      - name: Get the number of generate failures
        run: echo "The number of generate failures is ${{ steps.generate.outputs.generate_failed_count }}"
```

The following example will generate two specific ISPW tasks within assignment PLAY000826

``` yaml
on: [push]

jobs:
  run-ispw-generate:
    runs-on: ubuntu-latest
    name: A job to generate source in ISPW
    steps:
      - name: Generate
        uses: compuware-ispw/ispw-generate@v1
        id: generate
        with:
          ces_url: "https://CES:48226/"
          ces_token: ${{ secrets.CES_TOKEN }}
          srid: host-37733
          runtime_configuration: ISPW
          assignment_id: PLAY000826
          level: DEV1
          task_id: "7E3A5B274D24,7E3A5B274EFA"
      - name: Get the set ID for the generate
        run: echo "The ISPW set used for the generate is ${{ steps.generate.outputs.set_id }}"
```

## Inputs

| Input name | Required | Description |
| ---------- | -------- | ----------- |
| `ces_url` | Required | The URL to use when connecting to CES |
| `ces_token` | Required | The token to use when authenticating the request to CES |
| `srid` | Required | The SRID of the ISPW instance to connect to |
| `change_type` | Required | The change type of this request. The default value is 'S' for standard. |
| `execution_status` | Required | The flag to indicate whether the generate should happen immediately, or should be held. The default is 'I' for immediate. Other possible value is 'H' for hold. |
| `auto_deploy` | Required | Generates can be set up to automatically Deploy as well by an option set up by the ISPW. The default is to not use Auto Deploy. If the Auto Deploy option is set-up through ISPW, then you may use this option to automatically deploy. Possible values are `true` or `false`. |
| `runtime_configuration` | Optional | The runtime configuration for the instance of ISPW you are connecting to. |
| `generate_automatically` | Optional | A string of JSON that contains the parameters for the generate. If using an ispw-sync step before the generate, this JSON string can be retrieved from the outputs of that step. If `generate_automatically` is not being used, then the `assignment_id`, `level`, and `task_id` must be specified. |
| `assignment_id` | Optional | The assignment for which you intend to generate tasks. Do not use if `generate_automatically` has already been specified. |
| `level` | Optional | The level that the tasks exist at in the assignment. Do not use if `generate_automatically` has already been specified. |
| `task_id` | Optional | The comma-separated string of task IDs for the tasks that need to be generated. Do not use if `generate_automatically` has already been specified. |

## Outputs

| Output name | Output type | Description |
| ----------- | ----------- | ----------- |
| `generate_failed_count` | number | The number of tasks that failed to generate |
| `generate_success_count` | number | The number of tasks that generated successfully |
| `has_failures` | boolean | Whether there were any generate failures |
| `task_count` | number | The total number of tasks a generate was initiated against |
| `set_id` | string | The ID of the set that was used for processing |
| `url` | string | The URL that can be used to retrieved information about the set that was used for processing |

## Setup

TODO

### Developers

For information about contributing to the ispw-generate action, see [Developing on the ispw-generate GitHub action](./CONTRIBUTING.md)
