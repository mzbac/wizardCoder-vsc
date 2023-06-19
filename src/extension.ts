import * as vscode from 'vscode';
import { WizardCoderInlineCompletionItemProvider } from './WizardCoderInlineCompletionItemProvider';

export function activate(context: vscode.ExtensionContext) {
	let providerDisposable: vscode.Disposable | undefined;

	// Status bar item creation
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'wizardCoder.toggleActivate';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Command registration
	let disposable = vscode.commands.registerCommand('wizardCoder.toggleActivate', function () {
		let activated = context.globalState.get('activated') || false;
		activated = !activated; // toggle the activation state

		context.globalState.update('activated', activated);

		if (activated) {
			const provider = new WizardCoderInlineCompletionItemProvider();
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file', language: 'typescript' },
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
	if (context.globalState.get('activated')) {
		vscode.commands.executeCommand('wizardCoder.toggleActivate');
	} else {
		statusBarItem.text = 'WizardCoder: OFF';
	}
}

export function deactivate() { }
