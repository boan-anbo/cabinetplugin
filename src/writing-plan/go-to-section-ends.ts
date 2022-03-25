import * as vscode from 'vscode';
import { Section } from 'writing-plan/build/main/lib/section';
import { goToLine } from './go-to-line';
import { getCurrentPlan } from './writing-plan-instance';

export const jumpToCursorSectionBeginning = async () => {
    // get the active editor and cursor and check if the section it is in
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const cursor = editor.selection.active;
    const sectionIn = getWrappingSectionByCursorPosition(cursor);
    if (!sectionIn) {
        return;
    }
    // jump to section position
    await goToLine(sectionIn.markerOpenLine, sectionIn.markerOpenIndex + sectionIn.markerOpenLength);
};

export const getWrappingSectionByCursorPosition = (cursor: vscode.Position): Section | null => {
    const cursorLine = cursor.line;
    const cursorIndex = cursor.character;
    const sectionIn = getCurrentPlan()?.getSectionByLineAndIndex(cursorLine, cursorIndex);
    return sectionIn ?? null;
};