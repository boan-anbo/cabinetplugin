import * as fs from 'fs';

export function getExistingFolders(allFolders: string[]): string[] {
        const existingFolders: string[] = [];
        for (const pdfFolder of allFolders) {

                if (fs.existsSync(pdfFolder)) {

                        existingFolders.push(pdfFolder);
                } else {

                        console.log('Folder does not exist', pdfFolder);
                }
        }
        return existingFolders;
}