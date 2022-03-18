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
import * as fs from 'fs';
import { getExistingFolders } from '../utils/get-existing-folders';
import { FileItem } from './file-item';
import { getFilesFromPdfFolders, getSortedFilesFromPdfFoldersByModifiedDates as getSortedFilesFromPdfFoldersByModifiedDate } from '../utils/get-all-pdfs';

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

                        const allFiles: FileItem[] = await getSortedFilesFromPdfFoldersByModifiedDate();
                        input.placeholder = `${allFiles.length} Pdf Files`;
                        input.busy = false;

                        // console.log(`found ${allFiles.length} files under ${pdfFolders}`);


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
                                                resolve(Uri.file(item.filePath));
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