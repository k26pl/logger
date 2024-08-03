/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import createLogger, {
  time_short,
  time_long,
  colors,
  setDefaultDestinations,
  createCustomLogger,
  stringify_unknown,
  replace_console,
} from "./core.js";
import type { Level, Log, LogDestination } from "./core";

let console_log=console.log;
export function consoleDestination(): LogDestination {
  return (log) => {
    let { level, scope, timestamp, message } = log;
    console_log(
      `%c[${level}] [${time_short(timestamp)}] [${scope}]:%c`,
      `color: ${colors[level]}`,
      "color:white",
      ...message
    );
  };
}

let console_error=console.error;
export function fileDestination(path: string): LogDestination {
  console_error(
    "[Logger]: fileDestination is not supported in browser version.\n" +
      "Is your bundler configuration correct?"
  );
  return () => {};
}

setDefaultDestinations([consoleDestination()]);

export { createCustomLogger, time_long, time_short, setDefaultDestinations, stringify_unknown, replace_console };
export type { Level, Log, LogDestination };
export default createLogger;
