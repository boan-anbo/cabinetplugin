
// output cards as csv as VsCode Plugin Command
import { CabinetNode, CardExporter } from 'cabinet-node';
import * as vscode from 'vscode';
import { cabinetNodeInstance } from '../../extension';
import * as fs from 'fs';

export const outputCsvFromDocumentCards = function (cabinetNodeInstance: CabinetNode): () => Promise<void>  {
    return async () => {
        // get all cards from current document
        // get current opened document text
        const currentDocument = vscode.window.activeTextEditor?.document ?? null;
        // get all cards from current document

        const fullText = currentDocument?.getText() ?? '';

        const allCards = cabinetNodeInstance.getAllCardsByCciFromText(fullText)

        if (allCards) {

            const csvText = new CardExporter()
                .spreadsheetReport(allCards);
            // write csv to local .csv file with UTF-8. File extension: .csv
            let fileName = currentDocument?.fileName ?? '';
            // add current date to the end of the file name
            fileName = `${fileName.split('.').shift()}_${new Date().toISOString().split('T').shift()}.csv`;         
            fs.writeFileSync(fileName, csvText);
        }
    }
}