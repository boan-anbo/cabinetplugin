import * as vscode from 'vscode';
import { cabinetNodeInstance } from '../../extension';
import { Disserator } from './disserator';
import { InsertCardOptions } from './types/insert-card-options';

export function testDisserator() {

    if (!cabinetNodeInstance) {
        return;
    }
    const disserator = new Disserator(cabinetNodeInstance);

    // current document text;
    const documentText = vscode.window.activeTextEditor?.document.getText() ?? '';

    const structure = disserator.getStructure(documentText);

    console.log(documentText);
    console.log(structure);


    const firstPoint = structure[2];

    const firstCard = cabinetNodeInstance.cards[0];
    disserator.insertCards(firstPoint, [
        firstCard
    ], {} as InsertCardOptions);

}