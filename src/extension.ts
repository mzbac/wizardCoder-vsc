import * as vscode from 'vscode';
import { WizardCoderInlineCompletionItemProvider } from './WizardCoderInlineCompletionItemProvider';
import { chatToWizardCoder } from './chatWithWizardCoder';
import { ViewProvider } from './webviews/viewProvider';

let chatToWizardCoderDisposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
	let providerDisposable: vscode.Disposable | undefined;

	// Status bar item creation
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'wizardCoder-vsc.toggleActivate';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Command registration
	let disposable = vscode.commands.registerCommand('wizardCoder-vsc.toggleActivate', function () {
		let activated = context.globalState.get('wizardCoder-vsc-activated') || false;
		activated = !activated; // toggle the activation state

		context.globalState.update('wizardCoder-vsc-activated', activated);

		if (activated) {
			const provider = new WizardCoderInlineCompletionItemProvider();
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: '*' },
				provider);
			context.subscriptions.push(providerDisposable);
			statusBarItem.text = 'WizardCoder: ON'; // Change status bar text
			vscode.window.setStatusBarMessage('WizardCoder activated!', 5000); // Show message for 5 seconds
		} else {
			if (providerDisposable) {
				providerDisposable.dispose(); // unregister the provider
				const index = context.subscriptions.indexOf(providerDisposable);
				if (index > -1) {
					context.subscriptions.splice(index, 1);
				}
				providerDisposable = undefined;
			}
			statusBarItem.text = 'WizardCoder: OFF'; // Change status bar text
			vscode.window.setStatusBarMessage('WizardCoder deactivated!', 5000); // Show message for 5 seconds
		}
	});
	context.subscriptions.push(disposable);

	// Automatically activate the extension if it was previously activated
	if (context.globalState.get('wizardCoder-vsc-activated')) {
		vscode.commands.executeCommand('wizardCoder-vsc.toggleActivate');
	} else {
		statusBarItem.text = 'WizardCoder: OFF';
	}

	const viewProvider = new ViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"wizardCoder-vsc.view",
			viewProvider,
			{
				webviewOptions: { retainContextWhenHidden: true },
			}
		)
	);

	chatToWizardCoderDisposable = vscode.commands.registerCommand(
		"wizardCoder-vsc.chat",
		chatToWizardCoder(viewProvider)
	);

	context.subscriptions.push(chatToWizardCoderDisposable);
}

export function deactivate() {
	if (chatToWizardCoderDisposable) {
		chatToWizardCoderDisposable.dispose();
	}
}
