import {wikijsProcessor} from 'wikijs-processor';
// import vscode
import {window, workspace} from 'vscode';
// import fs
import * as fs from 'fs';

export const replaceWikiCitations = async (text: string): Promise<string> => {

    const result = await wikijsProcessor(text, {
        bibliographySectionTitle: '# Bibliography',
        referenceSectionTitle: '',
    });

    console.log(result);

    return result.text;
};


export const writeCurrentDocumentIntoAnotherFile = async (): Promise<void> => {
    // get current opened document
    const currentDocument = window.activeTextEditor?.document ?? null;
    // replace wiki citations
    if (currentDocument) {

        const text = await replaceWikiCitations(currentDocument?.getText() ?? '');
        const fileName = currentDocument?.fileName ?? '';
        
        const fileExtension = currentDocument?.uri.fsPath?.split('.')?.[1] ?? '';
        if (fileExtension !== 'mdc') {
            // show error message in vscode
            window.showErrorMessage('You should generate only from mdc file');
            return;
        }
        const newFilePath = `${fileName.split('.').shift()}.md`;
        fs.writeFileSync(newFilePath, text);
    }
}