#!/usr/bin/env node
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var CmdHandlers_1 = __importDefault(require('../CmdHandlers'));
var yargs = require('yargs');
var argv = yargs
  .demandCommand(1)
  .usage('Usage: $0 <command> [options]')
  .command(
    'init',
    'initialize shipper in this project',
    CmdHandlers_1.default.init,
  )
  .command('deploy', '', function() {}, CmdHandlers_1.default.deploy)
  .command(
    'create',
    'create a new project. only run this in the server',
    function() {},
    CmdHandlers_1.default.create,
  )
  .command('list', 'List projects', function() {}, CmdHandlers_1.default.list)
  .command(
    'delete <name>',
    'Delete project by name',
    function(yargs) {
      yargs.positional('name', {
        describe: 'Project name',
        type: 'string',
      });
    },
    CmdHandlers_1.default.delete,
  )
  .command(
    'show <name>',
    'Show project details',
    function(yargs) {
      yargs.positional('name', {
        describe: 'Project name',
        type: 'string',
      });
    },
    CmdHandlers_1.default.show,
  )
  .command(
    'start [port]',
    'start server',
    function(yargs) {
      yargs.positional('port', {
        describe: 'port',
        type: 'string',
        default: 4040,
      });
    },
    CmdHandlers_1.default.start,
  ).argv;
