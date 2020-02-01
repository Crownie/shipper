import Shipper from './Shipper';
import ShipperServer from './ShipperServer';
import inquirer from 'inquirer';
import {displayKeyValue} from './utils/cmd-utils';
import chalk from 'chalk';

const kebabCase = require('lodash.kebabcase');

const shipper = new Shipper();
const shipperServer = new ShipperServer();
export default class CmdHandlers {
  public static init(argv) {
    shipper.init();
    process.exit();
  }

  public static async deploy(argv) {
    await shipper.deploy();
    process.exit();
  }

  public static create() {
    {
      const beginQuestion = async () => {
        const {projectName} = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: `Please provide a project name: `,
            validate: (answer) => answer.length >= 2,
          },
        ]);

        const {yes} = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'yes',
            message: `the following will be used: ${kebabCase(projectName)}`,
          },
        ]);

        if (yes) {
          const shipperServer = new ShipperServer();
          const {name, token, path} = shipperServer.createProject(
            kebabCase(projectName),
          );
          console.log('Project was created successfully!');
          displayKeyValue({
            name,
            path,
            token,
          });
        } else {
          beginQuestion();
        }
      };
      beginQuestion();
    }
  }

  public static list() {
    const shipperServer = new ShipperServer();
    const projects = shipperServer.getProjects();
    const lines = projects.map(({name}) => `- ${name}`);
    console.log(lines.join('\n'));
  }

  public static async delete(argv) {
    const shipperServer = new ShipperServer();
    const project = shipperServer.getProject(argv.name);
    if (project) {
      const {yes} = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'yes',
          message: `This will delete the project and all its files: ${chalk.yellow(
            project.name,
          )}`,
        },
      ]);
      if (yes) {
        shipperServer.deleteProject(project.name);
        console.log(
          `Project '${chalk.yellow(argv.name)}' was deleted successfully`,
        );
      }
    } else {
      console.log(`Project '${chalk.yellow(argv.name)}' does not exist`);
    }
  }

  public static show(argv) {
    const shipperServer = new ShipperServer();
    const {name, token, path} = shipperServer.getProject(argv.name) || {};
    if (name && token && path) {
      displayKeyValue({name, token, path});
    } else {
      console.log(`Project '${chalk.yellow(argv.name)}' does not exist`);
    }
  }

  public static start(argv) {
    const shipperServer = new ShipperServer();
    shipperServer.start(argv.port);
  }
}
