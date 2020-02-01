import boxen, {BorderStyle} from 'boxen';
import chalk from 'chalk';

export const displayKeyValue = (obj: {[key: string]: string}) => {
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: BorderStyle.Round,
    borderColor: 'green',
    backgroundColor: '#555555',
  };
  const lines: string[] = [];
  for (let key of Object.keys(obj)) {
    const colKey = chalk.yellow(key);
    const val = obj[key];
    lines.push(`${colKey}: ${val}`);
  }
  const msgBox = boxen(lines.join('\n'), boxenOptions);
  console.log(msgBox);
};
