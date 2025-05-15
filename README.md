# Export all code in workspace to a single text file

The extension "exportallcoderingfenced" will export all the code your vscode workspace to a single text file. This can be used for ingesting all your workspace code in to an LLM for example. 

## Features

You provide the output file name that will be created in the workspace root. The extension will then create a file with the name you provided and write all the code files in your workspace to it, ring fenced in tripple back ticks.

For example if there is an app subfolder under your extension project workspace:

![Export app code](media/Exportallfiles.gif)

You can control what files or folders are excluded from the export under the settings. Some defaults are in place to exclude the node_modules and .git folders. You can add to this list in the settings.

![Export all settings](media/ExportAllSettings.gif)


## Release Notes


### 1.0.0

Initial release of the export all code files extension.
