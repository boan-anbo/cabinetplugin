import path = require("path");
import { FileType, Uri, workspace } from "vscode";
import { FileItem } from "../inputs/file-item";
import { getExistingFolders } from "./get-existing-folders";



export const getFilesFromPdfFolders = async (): Promise<FileItem[]> => {

        const allPdfFolders = workspace.getConfiguration('cabinetplugin').get('pdfFolders') as string[];

        const pdfFolders: string[] = getExistingFolders(allPdfFolders);

        console.log('Valid folders', pdfFolders);

        const allFiles: [string, FileType][] = [];
        // collection allFiles in pdfFolders;
        // for async loop
        for await (const pdfFolder of pdfFolders) {
                // get all files in the folder through vscode fs api
                const files = await workspace.fs.readDirectory(Uri.file(pdfFolder));
                console.log(files);
                // return all pdf files
                const allFileItems = files
                        .filter(file => file[0].endsWith('.pdf'))
                        .map(file => {
                                const fullPath = path.join(pdfFolder, file[0]);
                                new FileItem(
                                        //         // absolute path of the pdf folder
                                        {
                                                // file path equal joiend path
                                                filePath: fullPath
                                        });
                        });
                allFiles.push(...allFileItems);
        }
        return allFiles;
}


