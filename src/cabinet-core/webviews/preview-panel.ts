import { CabinetNode } from 'cabinet-node';
import * as vscode from 'vscode';
import { MarkdownOption } from 'cabinet-node';

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
            console.log(documentText);
            const previewHtml = cabinetInstance.getFullHtmlDraft(documentText, new MarkdownOption({ collapsable: true }));

            const fileNameOnly = editor.document.fileName.split(/[\/\\]/).pop() ?? editor.document.fileName;
            showPreview(previewHtml, fileNameOnly);
        } else {

            vscode.window.showInformationMessage('[Cabinet] Only markdown files are supported for preview.');
        }

        // DO SOMETHING WITH `documentText`
    }
    // showPreview(previewHtml);

});

export let cabinetPreviewPanel: vscode.WebviewPanel | undefined = undefined;
export const showPreview = (html: string, documentTitle: string): vscode.WebviewPanel => {

    // Create and show panel
    if (!cabinetPreviewPanel) {
        cabinetPreviewPanel = vscode.window.createWebviewPanel(
            'cabinetPreview',
            documentTitle,
            vscode.ViewColumn.Beside,
            {}
        );

    } else {
        cabinetPreviewPanel.title = documentTitle;
    }

    // And set its HTML content
    cabinetPreviewPanel.webview.html = getWebviewContent(html);
    
    return cabinetPreviewPanel;
};

function getWebviewContent(insertHtml: string) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
  ${insertHtml}
  </body>
  </html>`;
}