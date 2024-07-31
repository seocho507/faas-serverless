const readline = require('readline');
const {exec} = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the service name to run offline: ', (name) => {
  if (!name) {
    console.error('\n'
        + '==========================================================\n'
        + 'Error: No package name provided.'
        + '\nPlease provide a package name.'
        + '\n=========================================================='
        + '\n');
    rl.close();
    process.exit(1);
  }

  rl.question('Enter the stage (dev/prod): ', (stage) => {
    if (!stage) {
      stage = 'dev';
    }

    process.env.name = name;
    process.env.stage = stage;

    rl.close();

    const compileCommand = 'tsc';
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error(`Error compiling TypeScript: ${compileStderr}`);
        process.exit(1);
      }
      console.log(compileStdout);

      const command = `cd packages/${name} && serverless offline --stage ${stage}`;
      console.log(`Executing: ${command}`);
      const childProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${stderr}`);
          process.exit(1);
        }
        console.log(stdout);
      });

      childProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      childProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
    });
  });
});

