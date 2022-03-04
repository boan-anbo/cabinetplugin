import { Position } from "vscode";
import * as vscode from "vscode";
import { cabinetNodeInstance } from "../../extension";
import { Card } from "cabinet-node";
import { CardPlace } from "../types/card-place";

export interface InsertOption {
    select?: boolean
    linesAfter?: number
}

export const getCurrentlyUsedCards = (): Card[] | null => {
    const editor = vscode.window.activeTextEditor;


    // Get the document last line.
    if (editor) {
        const doc = editor.document.getText();
        const cards = cabinetNodeInstance?.getAllCardsByCciFromText(doc);
        return cards ?? [];
    }
    return null;
}

export const getAllCardPlaces = (): CardPlace[] => {
    const cards = getCurrentlyUsedCards();
    if (!cards) {
        return [];
    }
    const allCardPlaces = [];
    // go through editor and find all card places
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // check each line of the document to see if it contains a card by id
        const allLines = editor.document.lineCount;
        for (let line = 0; line < allLines; line++) {
            const lineText = editor.document.lineAt(line).text;
            const card = cards.find(c => lineText.includes(c.id));
            if (card) {
                allCardPlaces.push({
                    card,
                    id: card.id,
                    line: line + 1,
                    column: 0,
                    lineText
                });
            }
        }
    }
    return allCardPlaces;
}