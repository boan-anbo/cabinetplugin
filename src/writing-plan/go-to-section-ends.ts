import * as vscode from 'vscode';
import { Section } from 'writing-plan/build/main/lib/section';
import { goToLine } from './go-to-line';
import { writingPlanInstance } from './writing-plan-instance';

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
    await goToLine(sectionIn.markerOpenLine, sectionIn.markerOpenStartIndex + sectionIn.markerOpenLength);
};

export const getWrappingSectionByCursorPosition = (cursor: vscode.Position, excludingMarkers: boolean = false): Section | null => {
    const cursorLine = cursor.line;
    const cursorIndex = cursor.character;
    const sectionIn = writingPlanInstance.getCurrentPlan()?.getSectionByLineAndIndex(cursorLine, cursorIndex);
    if (sectionIn && excludingMarkers) {
        if (sectionIn.markerOpenLine === cursorLine && cursorIndex >= sectionIn.markerOpenStartIndex && cursorIndex <= sectionIn.markerOpenEndIndex) {
            return null;
        }
        if (sectionIn.markerCloseLine === cursorLine && cursorIndex >= sectionIn.markerCloseStartIndex && cursorIndex <= sectionIn.markerCloseEndIndex) {
            return null;
        }
    }
    return sectionIn ?? null;
};