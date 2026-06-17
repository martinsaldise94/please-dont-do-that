export function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    command: null,
    path: null,
    json: false,
    rules: 'v1',
    industry: null,
    version: false,
    help: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--version' || arg === '-v') {
      opts.version = true;
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--rules') {
      opts.rules = args[++i] ?? 'v1';
    } else if (arg === '--industry') {
      opts.industry = args[++i] ?? null;
    } else if (arg.startsWith('--rules=')) {
      opts.rules = arg.slice('--rules='.length);
    } else if (arg.startsWith('--industry=')) {
      opts.industry = arg.slice('--industry='.length);
    } else if (!opts.command) {
      opts.command = arg;
    } else if (!opts.path) {
      opts.path = arg;
    }
    i++;
  }

  return opts;
}
