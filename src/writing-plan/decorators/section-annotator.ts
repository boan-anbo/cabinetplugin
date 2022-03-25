import { DecorationOptions, Position, Range, TextEditorDecorationType, window, workspace } from "vscode";
import { getCurrentPlan } from "../writing-plan-instance";
let currentHighlight: TextEditorDecorationType;


let timeout: NodeJS.Timer | undefined = undefined;

const activeEditor = window.activeTextEditor;
if (activeEditor) {
    // get vscode range based on regex match of the marker
    if (!activeEditor) {
        return;
    }
    const plan = getCurrentPlan();
    if (!plan) {
        return;
    }
    const regEx = plan.options.getMarkerRegex();
    const text = activeEditor.document.getText();
    const sectionDecorationType = window.createTextEditorDecorationType({});
    const sectionDecorationOptions: DecorationOptions[] = [];
    let match;
    while ((match = regEx.exec(text))) {
        // const markerLine = activeEditor.document.lineAt(match.index);
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const range = new Range(startPos, endPos);
        const section = plan.getSectionByMarker(startPos.line, startPos.character, match[0].length);
        // const decoration = { range: new Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
        const decoratationType = {
            range,
            after: {
                contentText: section?.wordTarget?.toString() ?? "Word target",
            }
        } as DecorationOptions;
        // set the decoration type

    }
    // set
    activeEditor.setDecorations(sectionDecorationType, sectionDecorationOptions);

}


export const clearSectionAnnotations = () => {
    // clear the highlight text editor decoration
    currentHighlight?.dispose();
}

function triggerUpdateDecorations(throttle: boolean = false) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (throttle) {
        timeout = setTimeout(updateDecorations, 500);
    } else {
        updateDecorations();
    }
}

if (activeEditor) {
    triggerUpdateDecorations();
}

window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
        triggerUpdateDecorations();
    }
}, null, context.subscriptions);

workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
    }
}, null, context.subscriptions);