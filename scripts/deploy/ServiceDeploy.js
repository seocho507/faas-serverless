const readline = require('readline');
const {exec} = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the service name to deploy: ', (name) => {
  if (!name) {
    console.error(
        '\n==========================================================\n' +
        'Error: No name provided.' +
        '\nPlease provide a package name.' +
        '\n==========================================================\n'
    );
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

    const commands = [
      'tsc',
      'yarn test',
      'yarn build-lambda',
      `cd packages/${name} && serverless deploy --stage ${stage}`
    ];

    const executeCommands = (cmds) => {
      if (cmds.length === 0) {
        console.log('All commands executed successfully.');
        return;
      }
      const command = cmds.shift();
      console.log(`Executing: ${command}`);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing ${command}:`, stderr);
          process.exit(1);
        }
        console.log(stdout);
        executeCommands(cmds);
      });
    };

    executeCommands(commands);
  });
});
