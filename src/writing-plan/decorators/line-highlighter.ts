import { Position, Range, TextEditorDecorationType, window } from "vscode";
let currentHighlight: TextEditorDecorationType;
let currentMarkerHighlight: TextEditorDecorationType;

export const highlightLines = (beginLine: number, beginIndex: number, endLine: number, endIndex: number) => {
    clearHighlightLines();
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
        const range = new Range(new Position(beginLine + 1, beginIndex), new Position(endLine - 1, endIndex));
        currentHighlight = window.createTextEditorDecorationType({
            backgroundColor: 'rgba(251, 255, 225, 0.3)',
            // otherwise only words will be highlighted
            isWholeLine: true,
        }), [range];
        // set the current highlight
        activeEditor.setDecorations(currentHighlight, [range]);
    }
};

export const highlightMarker = (range: Range) => {
    clearHighlighMarker();
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
        currentMarkerHighlight = window.createTextEditorDecorationType({
            // highlight the marker
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            // set font dark gray
            color: 'rgba(0, 0, 0, 0.5)',
            // otherwise only words will be highlighted
            isWholeLine: false,
        });

        activeEditor.setDecorations(currentMarkerHighlight, [range]);
    }
};

export const clearHighlightLines = () => {
    // clear the highlight text editor decoration
    currentHighlight?.dispose();
};

const clearHighlighMarker = () => {
    currentMarkerHighlight?.dispose();
};