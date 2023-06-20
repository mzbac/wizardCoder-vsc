import * as vscode from "vscode";

export class ViewProvider implements vscode.WebviewViewProvider {
    private webView?: vscode.WebviewView;

    constructor(private context: vscode.ExtensionContext) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.webView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.webview.html = this.getWebviewContent(webviewView.webview);
    }
    public async sendMessageToWebView(message: any) {
        if (this.webView) {
            this.webView?.show?.(true);
        } else {
            await vscode.commands.executeCommand("wizardCoder-vsc.view.focus");
        }

        this.webView?.webview.postMessage(message);
    }
    getWebviewContent(webview: vscode.Webview) {
        const stylesMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
        );

        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${stylesMainUri}" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="overflow-hidden">
      <div class="flex flex-col h-screen">
        <div class="flex-1 overflow-y-auto" id="qa-list"></div>
        <div id="in-progress" class="p-4 flex items-center hidden">
            <div style="text-align: center;">
                <div>Please wait while we handle your request ❤️</div>
                <div class="loader"></div>
            </div>
        </div>
      </div>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
    }
}