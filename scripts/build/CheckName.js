const name = process.env.name;

if (!name) {
  console.error('\n'
      + '==========================================================\n'
      + 'Error: No name provided.'
      + '\nUse name=<package_name> to specify the package.'
      + '\n=========================================================='
      + '\n');
  process.exit(1);
}