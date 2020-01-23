#!/usr/bin/env node
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var Shipper_1 = __importDefault(require('../Shipper'));
var chalk = require('chalk');
var boxen = require('boxen');
var yargs = require('yargs');
var shipper = new Shipper_1.default();
var argv = yargs
  .demandCommand(1)
  .usage('Usage: $0 <command> [options]')
  .command('init', 'initialize shipper in this project', function(argv) {
    console.log('shipper initialized');
    shipper.init();
  })
  .command('deploy', '', function() {
    shipper.deploy();
  }).argv;
// const options = yargs
//     .usage('Usage: -n <name>')
//     .option('n', {alias: 'name', describe: 'Your name', type: 'string', demandOption: true})
//     .argv;
/*const greeting = chalk.white.bold(`Hello, ${options.name}!`);

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    backgroundColor: '#555555',
};
const msgBox = boxen(greeting, boxenOptions);

console.log(msgBox);*/
