import { Position, Range, TextEditorSelectionChangeEvent } from "vscode";
import { getWrappingSectionByCursorPosition } from "./go-to-section-ends";
import { clearHighlightLines, highlightLines, highlightMarker } from "./decorators/line-highlighter";

export const cursorChangeHighlightListener = (e: TextEditorSelectionChangeEvent) => {
    // if the cursor is in a section, update the status bar with the section title
    if (e.selections.length > 0) {
        const sectionIn = getWrappingSectionByCursorPosition(e.selections[0].active);
        // console.log(`In this section for cursor at Line: ${cursorLine}, Cursor: ${cursorIndex}}`, sectionIn);
        if (!sectionIn) {
            clearHighlightLines();
            return;
        }
        const sectionRange = sectionIn.getSectionLinesRange();
        const [startPosition, endPosition] = sectionRange;
        highlightLines(startPosition.line, startPosition.index, endPosition.line, endPosition.index - 3);

        highlightMarker(new Range(new Position(
            sectionIn.markerOpenLine,
            sectionIn.markerOpenStartIndex + 1
        ),
            new Position(
                sectionIn.markerOpenLine,
                sectionIn.markerOpenEndIndex
            )
        ));
    }
};