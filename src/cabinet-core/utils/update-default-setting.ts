import * as vscode from 'vscode';

export const updateDefaultSettings =() => {

    // set preview sync with editor to true
    vscode.workspace.getConfiguration('cabinetplugin').update('syncPreviewWithEditor', true, true);

}