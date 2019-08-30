import { getLogger } from 'log4js';
import * as chalk from 'chalk';

export const todoLogger = getLogger('[TODO]');
export const userLogger = getLogger('[USER]');
export const authLogger = getLogger('[AUTH]');
export const shutdownLogger = getLogger('[SHUTDOWN]');
export const startupLogger = getLogger('[STARTUP]');
export const mongoLogger = getLogger('[MONGO]');
export const devLogger = {
  info (msg: string): void {
    console.log(chalk.green(`[${getISOdate()}]`, '[INFO] [DEV]'), '- ' + msg);
  }
};

function getISOdate () {
  const date = new Date();
  return date.toISOString();
}
