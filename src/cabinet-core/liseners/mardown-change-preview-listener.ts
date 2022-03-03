import * as vscode from 'vscode';
import { cabinetPreviewPanel } from '../webviews/preview-panel';

let changeTimeout: NodeJS.Timeout | null;
export const markdownChangePreviewListener = (event: vscode.TextDocumentChangeEvent) => {
    // if the cabinet preview panel is not visible, do not update it.
    if (cabinetPreviewPanel === undefined) {
        return;
    }

    if (changeTimeout != null)
        clearTimeout(changeTimeout);

    changeTimeout = setInterval(function () {
        if (changeTimeout !== null) {

            clearTimeout(changeTimeout);
            changeTimeout = null;
            // if the current document is a markdown file, update the preview;
            if (event.document.languageId === 'markdown') {
                vscode.commands.executeCommand('cabinetplugin.showPreview');
                console.log(event.document.fileName);
            }

        }
    }, 1000);
}

export const stopChangePreviewListener = () => {
    if (changeTimeout !== null) {
        clearInterval(changeTimeout);
        
    }
};