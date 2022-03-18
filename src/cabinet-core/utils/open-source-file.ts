import { execFile } from "child_process";
import { cabinetNodeInstance } from "../../extension";
import * as fs from "fs";
import * as vscode from "vscode";
import { getExistingFolders } from "./get-existing-folders";
import path = require("path");

export function openCardSourceFile(cardId: string, useAlternativeFolders: boolean = true) {

    const card = cabinetNodeInstance?.getCardById(cardId);
    if (!card) {
        return;
    }

    // insert markdown to the range in current editor
    // card.openFile(`C:\\Program Files (x86)\\Foxit Software\Foxit PhantomPDF\\FoxitPDFEditor.exe`);

    if (!card.source?.filePath) {
        return;
    }
    let finalFilePath = card.source.filePath;
    // check if file exists
    if (!fs.existsSync(finalFilePath)) {
        const allPdfFolders = vscode.workspace.getConfiguration('cabinetplugin').get('pdfFolders') as string[];
        const pdfFolders = getExistingFolders(allPdfFolders);
        const fileName = card.source.fileName ?? path.basename(card.source.filePath);
        for (let index = 0; index < pdfFolders.length; index++) {
            const folderPath = pdfFolders[index];
            const currentPath = path.join(folderPath, fileName);
            if (fs.existsSync(currentPath)) {
                finalFilePath = currentPath;
                return;
            }

        }

        // tell the user the file cannot be found
        vscode.window.showErrorMessage(`File ${card.source.filePath} cannot be found ${useAlternativeFolders ? 'and alternative folders are not available' : ''}}`);
    }

    if (fs.existsSync(finalFilePath)) {
        openPdfFile(finalFilePath, card.source.pageIndex);
        // tell user
        vscode.window.showInformationMessage(`File ${finalFilePath} opened`);
    }
}

export function openPdfFile(filePath: string, pageNumber?: number) {

    let readerExecutable: string | undefined = undefined;
    let readerArgs: string[] = [];
    let argForPage: string | undefined = undefined;

    const actualPageNumber = pageNumber ? pageNumber + 1 : undefined;
    // switch on os platform
    switch (process.platform) {
        case "win32":
            readerExecutable = vscode.workspace.getConfiguration('cabinetplugin').get('pdfReaders.windows.executable') as string;
            argForPage = vscode.workspace.getConfiguration('cabinetplugin').get('pdfReaders.windows.argForPage') as string;
            // readerArgs = [
            //     argForPage && actualPageNumber ? argForPage + actualPageNumber : "",
            // ];
            // todo fix the temporary fix
            readerArgs = [
                "/A",
                pageNumber ? "page=" + (pageNumber + 1) : "",
            ];
            break;
        case "darwin":
            readerExecutable = vscode.workspace.getConfiguration('cabinetplugin').get('pdfReaders.mac.executable') as string;
            argForPage = vscode.workspace.getConfiguration('cabinetplugin').get('pdfReaders.mac.argForPage') as string;
            readerArgs = [
                argForPage && actualPageNumber ? argForPage + actualPageNumber : "",
            ];
            break;
    }

    // check if filePath exists
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('File path is not set\n' + filePath);
    }

    if (!readerExecutable) {
        throw new Error('Cannot find supported Pdf Reader is not set');
    }

    const validReaderArgs = readerArgs.filter(arg => arg && arg.length > 0);
    execFile(readerExecutable, [
        filePath,
        ...validReaderArgs
    ]);
}