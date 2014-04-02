## Overview

- **cli** parses args and calls the respective **command**
- **command** calls a sequence of **tasks**
- **tasks** do the actual work

## The different components of ember-cli
### cli.js
cli is only a small function that wires everything up

``` Javascript
// cli.js
// require parseCliArgs, merge

module.exports = function cli(args) {
  var commands = {}; // object produced through file glob
  var tasks = {}; // object produced through file glob
  var ui = new UI({
    inputStream: process.stdin,
    outputStream: process.stdout
  }),

  // Start desired command
  return parseCliArgs(args, commands)
    .then(function(parsingOutput) { // { command, options }
      if (!parsingOutput.command) {
        ui.write('No such command...\n');
        return;
      } else {
        return prasingOutput.command.run(merge(
          {},
          { ui: ui, commands: commands, tasks: tasks, args: args },
          parsingOutput.options
        ));
      }
    })
    .catch(...);
}
```
Note: cli.js is only tested in integration tests. All real testing is done on `parseArgs()` and the commands themselves.

### commands
Located in `lib/commands`.

``` JavaScript
// e.g. commands/serve.js

module.exports = {
  aliases: ['server', 's'],
  options: {
    port: { type: String, shortcut: 'p', default: 4200 },
    liveReloadPort: { type: Number, default: 39547 } // e.g. --live-reload-port 54729
  },
  run: function(options) { // { ui, commands, tasks, /* parsed options */ }
    var expressServer = options.tasks.expressServer; // Use passed in tasks
    var liveReloadServer = options.tasks.liveReloadServer;

    // Set any default options

    // Call tasks in sequence (promise chain), pass in options, return promise
    return sequence([expressServer, liveReloadServer], options);
  },
  usage: function() {
    return "help text with usage instructions for help command"; // Or we use JSON
  }
}
```

Note: `tasks` and `commands` (`commands` is needed by help command) are passed into the command via the `options` hash, that way we can easily plug in stub implementations in the tests.

### tasks
Located in `lib/tasks`.

Tasks do the real work. They also do only one thing: For example there are seperate `bower-install` and `npm-install` tasks, not just one unified `install` task. Also they don't call other tasks: For example `install-blueprint` doesn't call `npm-install` directly. The task sequence is determined by the command and is declared there. They always return a Promise which resolves or rejects depending on whether they ran through successfully or not.

The promise of an task has to
- resolve to `undefined`
- reject with an `Error` instance if the error is unhandled
- or reject with `undefined` if it was handled. In this case the task should log something via the `ui` first.

So, tasks don't have a return value per design.

``` JavaScript
// tasks/express-server.js
module.exports = function(options) { // { ui, /* other options */ }
  // ...
  // return promise
}
```

## General guidelines
- Everything Promise based
- Everything async (except require)
- No `console.log`, we've our own logging system
- HTML and CSS: Double quotes, JavaScript: Single quotes
- naming conventions
  - Dasherized (`some-thing`)
    - file, folder and package names
    - CSS classes
    - HTML tags and attributes
  - Camel case (`someThing`)
    - JavaScript (and JSON) propertys and variables
  - Pascal case (`SomeThing`)
    - JavaScript class names
  - Acronyms:
    - Okay: `url`, `id`, `rootURL` (property) or `URL`, `URLParser` (class)
    - Wrong: `Url`,`rootUrl`
    - We stick to how it's done in ember -> `rootURL`

## Style guide for log messages
ToDo