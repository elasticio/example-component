# Component Scaffolding Tool
To use this tool, clone this repo. Then, navigate to the directory and run `npm link`.

You can now run `elasticio-scaffold`. If the tool was installed correctly, you should see a help menu displayed such as:

```bash
   elasticio-scaffold 1.0.0 

   USAGE

     elasticio-scaffold <command> [options]

   COMMANDS

     create:component       Create a new component
     add:action             Add a new action
     add:trigger            Add a new trigger
     help <command>         Display help for a specific command

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```

The existing commands are `create:component`, `add:action`, and `add:trigger`. The latter two must be run within an existing component to work correctly.
