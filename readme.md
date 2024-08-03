# Logger

A simple, universal and configurable logger for js and ts

# Usage:

Basic example:

```js
import createLogger from "@k26pl/logger";

let logger = createlogger("example");

logger.log("Hello world");
```

# Scopes

Scopes can help you distinguish logs from certain files, functions etc.  
Example scope cration:

```js
let function_logger = logger.scope("my_function");
function_logger.log("hi");
// console output:
// [log] [current time] [example:my_function]: hi
```

# Destinations

By default log messages will go only to console.  
You can change this by configuring destinations:

```js
import {
  setDefaultDestinations,
  consoleDestination,
  fileDestination,
} from "@k26pl/logger";

setDefaultDestinations([consoleDestination(), fileDestination("./my_program.log")]);
```

or for specific logger:

```js
import { createLogger, consoleDestination, fileDestination } from "@k26pl/logger";

createLogger("test", [fileDestination("./test_output.log")]);
```

# Custom destinations

It is possible to create custom destinations,  
for example to forward logs to centralised place.  
Example destination:

```ts
export function myDestination(my_arg: string): LogDestination {
  
  // the function that gets called with every log
  return (log) => {
    let { 
      // "verbose" | "info" | "log" | "warn" | "error"
      // severity of the log
      level, 
      // string
      // Scope of the log
      scope, 
      // Date 
      // `time_short` and `time_long` Helpers can be used to
      // convert it to human-readable time.
      timestamp, 
      // any[]
      // stringify_unknown helper can be used to
      // convert any type to text
      message 
    } = log;
    // ...
  };
}
```

# Replace console
You can use ``replace_console()`` to replace ``info``, ``log``, ``warn`` and ``error``  
on global ``console`` object. This is useful when dependencies are using raw console, 
and you want to redirect their output somewhere.