import { CabinetCardIdentifier, CabinetNode } from 'cabinet-node';
import * as vscode from 'vscode';
import { MarkdownOption } from 'cabinet-node';
import { getPreviewHtmlTemplate } from '../utils/get-preview-html-template';
import { text } from 'body-parser';
import { insertText } from '../utils/insert-text';
import { InsertOption } from '../types/insert-option';
import { openCardSourceFile } from '../utils/open-source-file';

export const showPreviewCommand = (cabinetInstance: CabinetNode) => vscode.commands.registerCommand('cabinetplugin.showPreview', async () => {

    if (!cabinetInstance) {
        await vscode.commands.executeCommand('cabinetplugin.startCabinet');
    }

    const editor = vscode.window.activeTextEditor;
    if (editor) {

        // Get the document text
        const documentType = editor.document.languageId;
        if (documentType === 'markdown') {
            const documentText = editor.document.getText();

            const collapsablePreview = (vscode.workspace.getConfiguration('cabinetplugin').get('collapsablePreview') ?? true) as boolean;
            const previewInBlockquote = (vscode.workspace.getConfiguration('cabinetplugin').get('previewInBlockquote') ?? true) as boolean;

            const previewHtml = cabinetInstance.getFullHtmlDraft(documentText, new MarkdownOption({ collapsable: collapsablePreview, blockQuote: previewInBlockquote }));

            const fileNameOnly = editor.document.fileName.split(/[\/\\]/).pop() ?? editor.document.fileName;


            try {
                showPreview(previewHtml, fileNameOnly);

            } catch (e) {
                console.error(e);
            }
        } else {

            vscode.window.showInformationMessage('[Cabinet] Only markdown files are supported for preview.');
        }

        // DO SOMETHING WITH `documentText`
    }
    // showPreview(previewHtml);

});

export let cabinetPreviewPanel: vscode.WebviewPanel | undefined = undefined;
export const showPreview = async (html: string, documentTitle: string): Promise<void> => {
    const ifSyncPreviewWithEditor = await vscode.workspace.getConfiguration('cabinetplugin').get('syncPreviewWithEditor') ?? true;

    if (!ifSyncPreviewWithEditor) {
        return;
    }


    if (!cabinetPreviewPanel) {
        cabinetPreviewPanel = vscode.window.createWebviewPanel(
            'cabinetPreview',
            documentTitle,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
            }
        );

        cabinetPreviewPanel.onDidDispose(
            () => {
                // When the panel is closed, cancel any future updates to the webview content
                cabinetPreviewPanel = undefined;
            },
            null,
        );

        cabinetPreviewPanel.webview.onDidReceiveMessage(
            async message => {
                if (message.command.startsWith('add')) {
                    await freePreviewSync();
                }

                switch (message.command) {
                    case 'addCCI':
                        await insertText(
                            `{${message.text}}`
                            , {
                                linesBefore: 2,
                                linesAfter: 2,
                                focusFirstEditorGroup: true,
                            } as InsertOption);

                        vscode.window.showInformationMessage("CCI Inserted");
                        return;
                    case 'addPoint':
                        // refocus last active editor

                        await insertText(
                            `- ${message.text}`

                            , {
                                linesBefore: 1,
                                linesAfter: 1,
                                focusFirstEditorGroup: true,
                            } as InsertOption);

                        vscode.window.showInformationMessage("Point Inserted");
                        return;
                        case 'openFile':
                            const cardId = JSON.parse(message.text) as CabinetCardIdentifier;
                            openCardSourceFile(cardId.id);
                            return;
                }
            },
            undefined,
        );

    } else {

        cabinetPreviewPanel.title = documentTitle;

    }

    // And set its HTML content
    cabinetPreviewPanel.webview.html = getPreviewHtmlTemplate(html, documentTitle);
    // cabinetPreviewPanel.webview.html = ;

    return;
};

export const togglePreviewSyncCommand = function (): () => Promise<void> {

    return async () => {
        await togglePreviewSync();

    };

};

export const freePreviewSync = async () => {
    const syncPreviewWithEditor = await vscode.workspace.getConfiguration('cabinetplugin').get('syncPreviewWithEditor') ?? true;

    if (!syncPreviewWithEditor) {
        return;
    }

    await vscode.workspace.getConfiguration('cabinetplugin').update('syncPreviewWithEditor', false, true);

    // show message
    vscode.window.showInformationMessage(`Preview sync is now ${false ? 'enabled' : 'disabled'}`);

    if (cabinetPreviewPanel) {
        cabinetPreviewPanel.title = '[Freeze] ' + cabinetPreviewPanel.title;
    }

}

export const togglePreviewSync = async () => {
    const syncPreviewWithEditor = await vscode.workspace.getConfiguration('cabinetplugin').get('syncPreviewWithEditor') ?? true;
    // toggle sync preview with editor
    await vscode.workspace.getConfiguration('cabinetplugin').update('syncPreviewWithEditor', !syncPreviewWithEditor, true);

    const currentSyncPreviewWithEditorValue = !syncPreviewWithEditor;

    // show message
    vscode.window.showInformationMessage(`Preview sync is now ${currentSyncPreviewWithEditorValue ? 'enabled' : 'disabled'}`);

    if (cabinetPreviewPanel) {
        if (currentSyncPreviewWithEditorValue) {
            cabinetPreviewPanel.title = cabinetPreviewPanel.title.replace('[Freeze] ', '');
            // execute preview command
            vscode.commands.executeCommand('cabinetplugin.showPreview');
        } else {
            cabinetPreviewPanel.title = '[Freeze] ' + cabinetPreviewPanel.title;
        }
    }
}