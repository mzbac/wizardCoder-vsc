import * as vscode from 'vscode';
import fetch from 'node-fetch';

type ApiResponse = {
    results: Array<{ text: string }>;
};

export class WizardCoderInlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {
    private debounceTimeout: NodeJS.Timeout | null = null;
    private debounceTimeInMilliseconds = 500;

    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionList> {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        return new Promise((resolve) => {
            this.debounceTimeout = setTimeout(async () => {
                const completionItems = await this.fetchCompletionItems(document, position);
                resolve({ items: completionItems });
            }, this.debounceTimeInMilliseconds);
        });
    }

    private async fetchCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionItem[]> {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const textAboveCursor = truncateText(document.getText(new vscode.Range(new vscode.Position(0, 0), position)));

        const textBelowCursor = truncateText(document.getText(new vscode.Range(position, new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).range.end.character))));

        const prompt = `<fim_prefix>${textAboveCursor}<fim_suffix>${textBelowCursor}<fim_middle>`;


        const completionItems: vscode.InlineCompletionItem[] = [];

        try {
            const apiEndpoint = vscode.workspace.getConfiguration('wizardCoder').get<string>('apiEndpoint') ?? '';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'contentType': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            const json = await response.json() as ApiResponse;
            const predictions = json.results;

            for (const prediction of predictions) {
                const code = prediction.text.trim();
                const completionText = code;
                const completionRange = new vscode.Range(position, position.translate(0, completionText.length));
                completionItems.push({
                    insertText: completionText,
                    range: completionRange
                });
            }

        } catch (err) {
            console.error('Error while calling AI API:', err);
        }

        return completionItems;
    }
}

function truncateText(str: string): string {
    const words = str.split(/\s+/);
    const truncatedText = words.slice(Math.max(words.length - 500, 0)).join(' ');
    return truncatedText;
}