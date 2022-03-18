import path = require("path");
import { FileType, Uri, workspace } from "vscode";
import { FileItem } from "../quickactions/file-item";
import { getExistingFolders } from "./get-existing-folders";
import * as fs from "fs";



export const getFilesFromPdfFolders = async (): Promise<FileItem[]> => {

        const allPdfFolders = workspace.getConfiguration('cabinetplugin').get('pdfFolders') as string[];

        const pdfFolders: string[] = getExistingFolders(allPdfFolders);

        console.log('Valid folders', pdfFolders);

        const allFiles: FileItem[] = [];
        // collection allFiles in pdfFolders;
        // for async loop
        for await (const pdfFolder of pdfFolders) {
                // get all files in the folder through vscode fs api
                const files = await workspace.fs.readDirectory(Uri.file(pdfFolder));
                console.log(files.length, ' files found in ', pdfFolder);
                // return all pdf files
                const allFileItems = files
                        .filter(file => file[0].toLowerCase().endsWith('.pdf'))
                        .map(file => {
                                const fileName = file[0];
                                const fullPath = path.join(pdfFolder, fileName);
                                const fileType = file[1];
                                const fileStat = fs.statSync(fullPath);
                                return new FileItem(
                                        fileName,
                                        fullPath,
                                        pdfFolder,
                                        fileType,
                                        fileStat
                                );
                        });
                allFiles.push(...allFileItems);
        }
        return allFiles;
}

// get all files from pdfFolders and sort by modified date
export const getSortedFilesFromPdfFoldersByModifiedDates = async (): Promise<FileItem[]> => {

        const allFiles = await getFilesFromPdfFolders();

        const sortedFiles = allFiles.sort((a, b) => {
                if (a.fileStat && b.fileStat) {
                        return b.fileStat.mtime.getTime() - a.fileStat.mtime.getTime();
                }
                return 0;
        });

        return sortedFiles;
}


