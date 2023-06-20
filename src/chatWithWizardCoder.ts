import * as vscode from "vscode";
import { hideStatusMessage, showTemporaryStatusMessage } from "./utils";
import { ViewProvider } from "./webviews/viewProvider";
import fetch from 'node-fetch';

type ApiResponse = {
    results: Array<{ text: string }>;
};

export const chatToWizardCoder = (
    webViewProvider: ViewProvider | undefined
) => {
    return async () => {
        if (!webViewProvider) {
            vscode.window.showErrorMessage("Webview is not available.");
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        const textForQuery = selectedText
            ? `
  \`\`\`
  ${selectedText}
  \`\`\`
  `
            : "";

        const customQuery = await vscode.window.showInputBox({
            prompt: "Enter your custom query",
        });

        if (!customQuery) {
            return;
        }

        const query = `${customQuery} : ${textForQuery}`;
        showTemporaryStatusMessage("Calling WizardCoder API...", undefined, true);
        await webViewProvider.sendMessageToWebView({
            type: "askQuestion",
            question: query,
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const apiEndpoint = vscode.workspace.getConfiguration('wizardCoder').get<string>('apiEndpoint') ?? '';

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'contentType': 'application/json' },
            body: JSON.stringify({
                prompt: `Below is an instruction that describes a task. Write a response that appropriately completes the request
### Instruction: ${query}
### Response:`,
                max_new_tokens: 1000,
            }),
        });
        const json = await response.json() as ApiResponse;
        const predictions = json.results;

        hideStatusMessage();

        if (predictions[0].text) {
            await webViewProvider.sendMessageToWebView({
                type: "addResponse",
                value: predictions[0].text,
            });
        } else {
            showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
            webViewProvider.sendMessageToWebView({
                type: "addResponse",
                value: "Failed to call chatgpt!",
            });
        }
    };
};