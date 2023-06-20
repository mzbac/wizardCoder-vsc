import * as vscode from "vscode";

const asciiLoadingFrames = ["|", "/", "-", "\\"];
let statusBarItem: vscode.StatusBarItem | undefined;
let animationInterval: NodeJS.Timeout | undefined;

export function showTemporaryStatusMessage(
    message: string,
    timeout?: number,
    animate?: boolean
) {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left
        );
    }
    statusBarItem.text = message;
    statusBarItem.show();

    if (animate) {
        let counter = 0;
        animationInterval = setInterval(() => {
            counter = (counter + 1) % asciiLoadingFrames.length;
            if (statusBarItem) {
                statusBarItem.text = message + " " + asciiLoadingFrames[counter];
            }
        }, 100);
    }

    if (timeout) {
        setTimeout(() => {
            statusBarItem?.hide();
            if (animationInterval) {
                clearInterval(animationInterval);
            }
        }, timeout);
    }
}

export function hideStatusMessage() {
    if (statusBarItem) {
        statusBarItem.hide();
    }
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = undefined;
    }
}

export function removeTextBeforeAndAfterFirstTripleBackticks(
    response: string
): string {
    return response.replace(/[\s\S]*?```[\S]*\n?/, "").replace(/```$/, "");
}