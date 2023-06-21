# wizardcoder-vsc 
a Visual Studio Code extension, developed as a proof of concept (POC) to demonstrate how AI-powered code auto-completion features like GitHub Copilot work.

[![wizardCoder-vsc-demo](https://img.youtube.com/vi/zBRccicTI58/0.jpg)](https://www.youtube.com/watch?v=zBRccicTI58)

## To understand how WizardCoder works, you can refer to the main files:

- `extension.ts`: This file contains the code for registering the command and the status bar item for activating the extension.
- `WizardCoderInlineCompletionItemProvider.ts`: This file includes the code for fetching the WizardCoder api backend for code completion suggestions and providing them to the Visual Studio Code.

## Backend API

Please check out the backend API repository here. https://github.com/mzbac/AutoGPTQ-API

## Extension Settings
This extension contributes the following configuration settings:

```
{
    "wizardCoder.apiEndpoint": "your wizardcoder api endpoint"
}

```
## Usage
You can access the extension's commands by:

- Right-clicking in the editor and selecting the `Chat with Wizard Coder` command from the context menu.
- Using the copilot's inline completion the "toggle wizardCoder activation" command: Shift+Ctrl+' (Windows/Linux) or Shift+Cmd+' (Mac).



