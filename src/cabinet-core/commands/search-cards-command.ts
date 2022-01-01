import { CabinetNode } from "cabinet-node"

import * as vscode from "vscode";
import { showInsertCardsMd } from "../dialogs/show-insert-cards-md";
import { showSearchInputBox } from "../dialogs/show-search-cards-input";
import { insertText } from "../utils/insert-text";


export const searchCardsCommand = function (cabinetNode: CabinetNode): () => Promise<void> {

    return async () => {


        const searchQuery = await showSearchInputBox();

        if (searchQuery) {
            vscode.window.showInformationMessage(`Searching for: ${searchQuery}`);
            const cards = await cabinetNode.cabinetApi.searchCards(searchQuery);
            if (cards) {

                vscode.window.showInformationMessage(`Found ${cards.length} cards for query: ${searchQuery}`);
                console.log(cards);
                const ifInsert = await showInsertCardsMd(cards.length);
                console.log('ifInsert', ifInsert);
                if (ifInsert) {

                    const md = cabinetNode.getCardsMarkdown(cards);
                    insertText(md);
                }
            }
        }
    }

}