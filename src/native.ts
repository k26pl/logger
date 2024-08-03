/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import chalk from "chalk-template";
import createLogger, {
  time_short,
  time_long,
  colors,
  stringify_unknown,
  setDefaultDestinations,
  createCustomLogger,
} from "./core.js";
import type { Level, Log, LogDestination } from "./core";
import { appendFile } from "node:fs/promises";

let asyncQueue = {
  state: [],
  running: false,
  push(e: () => Promise<any>) {
    if (asyncQueue.running) {
      asyncQueue.state.push(e);
    } else {
      asyncQueue.running = true;
      e().then(asyncQueue._next);
    }
  },
  _next() {
    let nextJob = asyncQueue.state.shift();
    if (nextJob) {
      nextJob().then(asyncQueue._next);
    } else {
      asyncQueue.running = false;
    }
  },
};
let console_log=console.log;
export function consoleDestination(): LogDestination {
  return (log) => {
    let { level } = log;
    console_log(
      chalk`{${colors[level]} [${level}] [${time_short(log.timestamp)}] [${log.scope}]}`,
      ...log.message
    );
  };
}
export function fileDestination(path: string): LogDestination {
  return (log) => {
    asyncQueue.push(() =>
      appendFile(
        path,
        `[${log.level}] [${time_long(log.timestamp)}] [${log.scope}]:\n    ${log.message
          .map((e) => stringify_unknown(e))
          .join("    ")}\n`,
        { flag: "a+" }
      ).catch((e) => console.error("Failed to write logs: ", e))
    );
  };
}

setDefaultDestinations([consoleDestination()]);

export { createCustomLogger, time_long, time_short, setDefaultDestinations, stringify_unknown };
export type { Level, Log, LogDestination };
export default createLogger;
