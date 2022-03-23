import { Position, Range, TextEditorDecorationType, window } from "vscode";
let currentHighlight: TextEditorDecorationType;
export const highlightLines = (beginLine: number, beginIndex: number, endLine: number, endIndex: number) => {
    clearHighlightLines();
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
        const range = new Range(new Position(beginLine, beginIndex), new Position(endLine, endIndex));

        currentHighlight = window.createTextEditorDecorationType({
            backgroundColor: 'rgba(251, 255, 225, 0.8)'
        }), [range];
        // set the current highlight
        activeEditor.setDecorations(currentHighlight, [range]);
    }
}

export const clearHighlightLines = () => {
    // clear the highlight text editor decoration
    currentHighlight?.dispose();
}