import { CabinetNode, MarkdownOption } from "cabinet-node";
import path = require("path");

import * as vscode from "vscode";
import { showInsertCardsMd } from "../dialogs/show-insert-cards-md";
import { showSearchInputBox } from "../dialogs/show-search-cards-input";
import { getPreviewHtmlTemplate } from "../utils/get-preview-html-template";
import { insertText } from "../utils/insert-text";


export const outputPreviewHtml = (cabinetInstance: CabinetNode) => vscode.commands.registerCommand('cabinetplugin.outputPreviewHtml', async () => {

    const editor = vscode.window.activeTextEditor;
    if (editor) {

        // Get the document text
        const documentType = editor.document.languageId;
        if (documentType === 'markdown') {

            if (!vscode.workspace.workspaceFolders) {
                throw new Error('No workspace folder found.');
            }

            // write html to file
            const documentText = editor.document.getText();
            const documentUri = editor.document.uri.fsPath;
            const documentParentDir = path.dirname(documentUri);
            // console.log(documentText);
            const collapsablePreview = (vscode.workspace.getConfiguration('cabinetplugin').get('collapsablePreview') ?? true) as boolean;
            const previewInBlockquote = (vscode.workspace.getConfiguration('cabinetplugin').get('previewInBlockquote') ?? true) as boolean;

            const previewHtmlRaw = cabinetInstance.getFullHtmlDraft(documentText, new MarkdownOption({ collapsable: collapsablePreview, blockQuote: previewInBlockquote }));

            const fileNameOnly = editor.document.fileName.split(/[\/\\]/).pop() ?? editor.document.fileName;

            const previewHtml = getPreviewHtmlTemplate(previewHtmlRaw, fileNameOnly);

            // write html to file
            const filePath = documentParentDir + '\\' + '[Cabinet] ' + (fileNameOnly.split('.').shift() ?? fileNameOnly) + '.html';
            const outputUri = vscode.Uri.file(filePath);

            await vscode.workspace.fs.writeFile(outputUri, Buffer.from(previewHtml, 'utf8'));
            // show vscode message window
            vscode.window.showInformationMessage('Written preview HTML to file: ' + outputUri.fsPath);

        }
    }
}


)
