import * as vscode from 'vscode';
import { Section } from 'writing-plan/build/main/lib/section';
export class MovePosition {
    line: number;
    index: number;

    constructor(line: number, index: number) {
        this.line = line;
        this.index = index;
    }
    // if the current position is after the parameter position
    isBefore(anotherPosition: MovePosition) {
        if (anotherPosition.line > this.line) {
            return true;
        }
        if (anotherPosition.line === this.line) {
            return (anotherPosition.index > this.index);
        }
        return false;
    }
}


export const moveSections = async (sectionMoved: Section, sectionToMoveTo: Section, insertRelation: InsertRelation) => {
    const beginPosition = new MovePosition(sectionMoved.markerOpenLine, sectionMoved.markerOpenStartIndex);
    const endPosition = new MovePosition(sectionMoved.markerCloseLine, sectionMoved.markerCloseEndIndex + 1);
    let insertPosition;
    switch (insertRelation) {

        case InsertRelation.Before:
            insertPosition = new MovePosition(
                sectionToMoveTo.markerOpenLine,
                sectionToMoveTo.markerOpenStartIndex > 0 ? sectionToMoveTo.markerOpenStartIndex - 1 : 0
            );
            break;
        case InsertRelation.After:
            insertPosition = new MovePosition(
                sectionToMoveTo.markerCloseLine,
                sectionToMoveTo.markerCloseEndIndex + 1
            );
            break;
    }
    if (insertPosition) {
        await movePassages(beginPosition, endPosition, insertPosition);
    }
};

export const movePassages = async (beginPosition: MovePosition, endPosition: MovePosition, insertPosition: MovePosition) => {
    // get active editor text
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const cutRange = new vscode.Range(
            new vscode.Position(beginPosition.line, beginPosition.index),
            new vscode.Position(endPosition.line, endPosition.index)
        );

        const cutText = `${editor.document.getText(cutRange)}`;

        await editor.edit((textEditorEdit) => {
            if (endPosition.isBefore(insertPosition)) {
                // if insert after cut passage, insert first and delete later
                textEditorEdit.insert(new vscode.Position(insertPosition.line, insertPosition.index), cutText);
                textEditorEdit.delete(cutRange);
            } else {
                textEditorEdit.delete(cutRange);
                textEditorEdit.insert(new vscode.Position(insertPosition.line, insertPosition.index), cutText);
            }
        });
    }
};

export enum InsertRelation {
    Before,
    After,
    Inside
}