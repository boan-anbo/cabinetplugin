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
    const allCardPlaces: CardPlace[] = [];
    // get active editor
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const documentUri = editor.document.uri.toString();
        // check each line of the document to see if it contains a card by id
        const allLines = editor.document.lineCount;
        for (let line = 0; line < allLines; line++) {
            const lineText = editor.document.lineAt(line).text;
            const card = cards.find(c => lineText.includes(c.id));
            if (card) {
                allCardPlaces.push({
                    card,
                    id: card.id,
                    line: line,
                    column: 0,
                    lineText,
                    documentUri
                });
            }
        }
    }
    return allCardPlaces;
}