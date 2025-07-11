/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export type Level = "verbose" | "info" | "log" | "warn" | "error";
export type Log = {
  level: Level;
  timestamp: Date;
  scope: string;
  message: any[];
  filename:string;
};
export type LogDestination = (log: Log) => void;
export let colors: Record<Level, string> = {
  verbose: "gray",
  info: "gray",
  log: "white",
  warn: "yellow",
  error: "red",
};
export type Logger={
  scope(scope: string):Logger,
  info(...a: any):void,
  log(...a: any):void,
  warn(...a: any):void,
  error(...a: any):void,
  _raw_log(level: Level, message: any[],timestamp?: Date, filename?:string): void 
}
export const time_short = (d: Date) =>
  `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
export const time_long = (d: Date) =>
  `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d
    .getDate()
    .toString()
    .padStart(2, "0")} ${time_short(d)}`;
let filteredKeys = ["__proto__", "prototype"];
function stringifyObject(e: any, depth: number): string {
  let padding = "    ".repeat(depth + 2);
  let padding_s = "    ".repeat(depth + 1);
  if (Array.isArray(e)) {
    let out = e
      .map((v, k) => {
        let value = stringify_unknown(v, depth + 1);
        // Add comma for all except last
        if (k !== e.length - 1) {
          value = value.replace(/\n$/, ",\n");
        } else {
          value = value.replace(/\n$/, "");
        }
        return padding + value;
      })
      .join("");
    
    return `[\n${out}\n${padding_s}]\n`;
  }
  let keys = Object.getOwnPropertyNames(e).filter((k) => !filteredKeys.includes(k));
  if(keys.length===0){
    return "{}\n";
  }
  let out = keys
    .map((k) => {
      let value = stringify_unknown(e[k], depth + 1);
      // wrap keys that aren't alphanumeric and starting with letter in quotes
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)) {
        k = `"${k}"`;
      }
      return padding + `${k}: ${value}`;
    })
    .join("");
  return `{\n${out}\n${padding_s}}` + (depth>0 ? "," : "\n");
}
/**
 * Converts any value to pretty string
 * @param e value to convert
 * @returns string
 */
export function stringify_unknown(e: unknown, depth = 0): string {
  if (typeof e == "object") {
    if (e === null) return "null";
    if (depth == 4) return "...";

    /*
            Converting objects to strings can be tricky
            many classes can convert to {},
            which is not very usefull, especially for error class
        */
    if (e instanceof Error) {
      return (
        `${e.name}: ${e.message}${e.stack?"\n"+e.stack:""}`
          .replaceAll("\n", "\n   ")
          .replace(/   $/, "") + "\n"
      );
    }
    return stringifyObject(e, depth);
  }
  // for Symbol we need to call tostring
  else if (typeof e == "symbol") {
    return e.toString() + "\n";
  }
  // other types can be just converted to string
  // this way also works with undefined
  else return e + "\n";
}

let default_destinations:LogDestination[]=[];

export function setDefaultDestinations(dests:LogDestination[]){
  default_destinations=dests;
}

let warn=console.warn;
/**
 * An universal logger for js and ts. 
 *
 * The .scope() function allows creation of child loggers  
 * Returned functions do not rely on `this`,  
 * so they can be safely used as callbacks.  
 * @param scope
 * @param destinations
 * @returns Logger
 */
function createLogger(scope: string,destinations:LogDestination[]=default_destinations):Logger {
  if(destinations.length===0){
    warn("No destinations configured for logger "+scope);
  }
  function raw_log(level: Level, message: any[],timestamp=new Date(),filename="") {
    
    destinations.forEach(dest=>{
      dest({
        level,
        scope,
        timestamp,
        message,
        filename
      })
    })
  }
  return {
    scope(sc: string) {
      return createLogger(scope + ":" + sc,destinations);
    },
    info(...a: any) {
      raw_log("info", a);
    },
    log(...a: any) {
      raw_log("log", a);
    },
    warn(...a: any) {
      raw_log("warn", a);
    },
    error(...a: any) {
      raw_log("error", a);
    },
    _raw_log:raw_log
  };
}





/**
 * Replace global console object  
 * This is usefull when e.g. dependencies are using raw console.log,  
 * and you want to send their logs to configured destinations (file etc.).  
 */
export function replace_console(dests=default_destinations){
  let l=createLogger("console",dests)
  console.log=l.log;
  console.warn=l.warn;
  console.error=l.error;
  console.info=l.info;
}
export default createLogger;
export { createLogger as createCustomLogger, createLogger };
