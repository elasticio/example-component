# Component Scaffolding Tool
To run changes locally, run `npm link`. This will create an executable for every command listed in the `bin` of `package.json`, so it can now be run from anywhere on the command line.

Run `create-component` to get started.

## General File Structure
Each tool has its own folder inside `lib`, containing an `index.js` file, a `run.js` file and a folder of `templates` (if needed). 

```
.
├── lib
│   ├── wizard1          
│   │   ├── templates  
│   │   ├── run.js  
│   │   └── index.js        
│   └── ...                
├── spec                   
│   ├── wizard1.spec.js                        
└── ...
```

The `run.js` file exports the functions that need to be run in `index.js`