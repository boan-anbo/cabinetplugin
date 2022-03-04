
import { CabinetNode } from "cabinet-node";
import * as vscode from "vscode";
import { updateCurrentCards } from "../../extension";
import { showInsertCardsMd } from "../dialogs/show-insert-cards-md";
import { showSearchInputBox } from "../dialogs/show-search-cards-input";
import { updateStatusBarText } from "../status-bars/cabinet-status-bar";
import { insertText } from "../utils/insert-text";


// fetch all cards by cci from api and save to current cabinet.json file.
export const fetchCardsFromApiCommand = (cabinetInstance: CabinetNode)  => {


    return  async () => {
    
        console.log('called')
        const editor = vscode.window.activeTextEditor;
        if (editor) {
    
            // Get the document text
            const documentType = editor.document.languageId;
            if (documentType === 'markdown' || documentType === 'latex' || documentType === 'plaintext') {
                const documentText = editor.document.getText();

                // const cards = cabinetInstance.extractAllCcisFromText(documentText);
                updateStatusBarText('Fetching cards from api...');
                const cards = await cabinetInstance.fetchAllCardsFromText(documentText);
                updateStatusBarText(`${cards?.length} cards fetched.`);

                if (cards && cards.length > 0) {
                    const result = await vscode.window.showInformationMessage(
                        `Do you want to save ${cards.length} cards to ${cabinetInstance.ccjFilename}?`,
                        ...["Yes", "No"]
                    );
                    if (result === "Yes") {
                        cabinetInstance.addCards(cards);
                    }
                }
                // console.log('dad i\'m here');
                console.log(cards);

                updateCurrentCards();
    
            } else {
                vscode.window.showInformationMessage('[Cabinet] Only markdown files are supported for preview.');
            }
    
            // DO SOMETHING WITH `documentText`
        }


    };
}