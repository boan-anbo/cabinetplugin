/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as cp from 'child_process';
import { Uri, window, Disposable } from 'vscode';
import { QuickPickItem } from 'vscode';
import { workspace } from 'vscode';
import { openPdfFile } from '../utils/open-source-file';

/**
 * A file opener using window.createQuickPick().
 * 
 * It shows how the list of items can be dynamically updated based on
 * the user's input in the filter field.
 */
export async function quickOpen() {
        const uri = await pickFile();
        if (uri) {
                // openPdfFile(Uri.joinPath(uri.path, 'file.pdf'));
                // resolve the absolute path of the pdf file
                const absolutePath = Uri.file(path.join(uri.path, uri.fsPath));
                openPdfFile(uri.fsPath);

                console.log("ready to open", uri);
        }
}

class FileItem implements QuickPickItem {

        label: string;
        description: string;

        constructor(public base: Uri, public uri: Uri) {
                this.label = path.basename(uri.fsPath);
                this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
        }
}

class MessageItem implements QuickPickItem {

        label: string;
        description = '';
        detail: string;

        constructor(public base: Uri, public message: string) {
                this.label = message.replace(/\r?\n/g, ' ');
                this.detail = base.fsPath;
        }
}

async function pickFile() {
        const disposables: Disposable[] = [];
        try {
                return await new Promise<Uri | undefined>(async (resolve, reject) => {
                        const input = window.createQuickPick<FileItem | MessageItem>();
                        input.placeholder = 'Type to search for files';

                        // load user pdf folders from contribution properties

                        input.busy = true;
                        const pdfFolders = workspace.getConfiguration('cabinetplugin').get('pdfFolders') as string[];

                        console.log(pdfFolders);

                        const allFiles: FileItem[] = []
                        // collection allFiles in pdfFolders;
                        // for async loop
                        for await (const pdfFolder of pdfFolders) {
                                // get all files in the folder through vscode fs api
                                const files = await workspace.fs.readDirectory(Uri.file(pdfFolder));
                                console.log(files);
                                // return all pdf files
                                const allFileItems = files
                                        .filter(file => file[0].endsWith('.pdf'))
                                        .map(file => new FileItem(
                                                // absolute path of the pdf folder
                                                Uri.file(file[0]),
                                                Uri.joinPath(Uri.file(pdfFolder), file[0])));
                                allFiles.push(...allFileItems);
                        }
                        input.busy = false;

                        // console.log(`found ${allFiles.length} files under ${pdfFolders}`);
                        input.placeholder = `${allFiles.length} Pdf Files`;


                        console.log(allFiles);

                        disposables.push(
                                input.onDidChangeValue(value => {
                                        if (!value) {
                                                input.items = [];
                                                return;
                                        }
                                        input.busy = true;
                                        input.items = allFiles
                                                .filter(file => file.label.toLowerCase().includes(value.toLowerCase()));
                                        input.busy = false;
                                        return;
                                }),
                                input.onDidChangeSelection(items => {
                                        const item = items[0];
                                        if (item instanceof FileItem) {
                                                resolve(item.uri);
                                                input.hide();
                                        }
                                }),
                                input.onDidHide(() => {
                                        resolve(undefined);
                                        input.dispose();
                                })
                        );
                        input.show();
                });
        } finally {
                disposables.forEach(d => d.dispose());
        }
}