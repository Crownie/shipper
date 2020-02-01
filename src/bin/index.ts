#!/usr/bin/env node

import CmdHandlers from '../CmdHandlers';

const yargs = require('yargs');

const {argv} = yargs
  .demandCommand(1)
  .usage('Usage: $0 <command> [options]')
  .command('init', 'initialize shipper in this project', CmdHandlers.init)

  .command('deploy', '', () => {}, CmdHandlers.deploy)

  .command(
    'create',
    'create a new project. only run this in the server',
    () => {},
    CmdHandlers.create,
  )

  .command('list', 'List projects', () => {}, CmdHandlers.list)

  .command(
    'delete <name>',
    'Delete project by name',
    (yargs) => {
      yargs.positional('name', {
        describe: 'Project name',
        type: 'string',
      });
    },
    CmdHandlers.delete,
  )

  .command(
    'show <name>',
    'Show project details',
    (yargs) => {
      yargs.positional('name', {
        describe: 'Project name',
        type: 'string',
      });
    },
    CmdHandlers.show,
  )

  .command(
    'start [port]',
    'start server',
    (yargs) => {
      yargs.positional('port', {
        describe: 'port',
        type: 'string',
        default: 3001,
      });
    },
    CmdHandlers.start,
  );
