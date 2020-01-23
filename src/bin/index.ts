#!/usr/bin/env node

import Shipper from '../Shipper';

const chalk = require('chalk');
const boxen = require('boxen');
const yargs = require('yargs');

const shipper = new Shipper();
const {argv} = yargs
  .demandCommand(1)
  .usage('Usage: $0 <command> [options]')
  .command('init', 'initialize shipper in this project', (argv) => {
    console.log(`shipper initialized`);
    shipper.init();
  })
  .command('deploy', '', () => {
    shipper.deploy();
  });

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
