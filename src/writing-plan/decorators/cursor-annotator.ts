import { DecorationOptions, ExtensionContext, Position, Range, TextEditorDecorationType, TextEditorSelectionChangeEvent, ThemableDecorationAttachmentRenderOptions, window, workspace } from "vscode";
import { Section } from "writing-plan/build/main/lib/section";
import { SectionTreeItem } from "../entities/section-item";
import { getWrappingSectionByCursorPosition } from "../go-to-section-ends";

export const registerCursorDecorations = (context: ExtensionContext) => {

    let timeout: NodeJS.Timer | undefined = undefined;

    // the type instance should be created only once, because it will be cleared when set again, otherwise it will multiply.
    // what is actually updated is the decoration options, which contains the updated information such as text, color, etc.
    const cursorDecorationType = window.createTextEditorDecorationType({
    });

    const updateDecorations = (section: Section, cursorPosition: Position, endOfLine: number) => {
        const activeEditor = window.activeTextEditor;
        const sectionItem = SectionTreeItem.fromSection(section);
        if (activeEditor && sectionItem) {
            // get vscode range based on regex match of the marker
            if (!activeEditor) {
                return;
            }
            const sectionDecorationOptions: DecorationOptions[] = [];
            // const decoration = { range: new Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
            const mainColor = 'rgba(0, 0, 0, 0.3)';

            const decorationOption = {
                // get line content length of the cursor position

                range: new Range(cursorPosition, new Position(cursorPosition.line, endOfLine)),
                renderOptions: {
                    after: {
                        contentText: sectionItem.description,
                        // if balance is negative, it will be pink color, if positive, it will be green color
                        color: sectionItem.section.wordBalance < 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 228, 0, 1)',
                        // top, right, bottom, left
                        margin: '0 0 0 20px',
                        // set smaller css font size
                        fontSize: 'smaller',
                    } as ThemableDecorationAttachmentRenderOptions
                }

            } as DecorationOptions;
            // set the decoration type
            sectionDecorationOptions.push(decorationOption);

            activeEditor.setDecorations(cursorDecorationType, sectionDecorationOptions);

        }
    };

    function clearDecoration() {
        // if active editor
        if (window.activeTextEditor) {
            window.activeTextEditor.setDecorations(cursorDecorationType, []);
        }
    }

    function triggerUpdateDecorations(section: Section, cursorPosition: Position, endOfLine: number, throttle: boolean = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations(section, cursorPosition, endOfLine);
        }
    }

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        const cursorPosition: Position = event.selections[0]?.active;
        // get the content of line at the cursor position
        const lineContent = event.textEditor.document.lineAt(cursorPosition.line);
        const sectionIn = getWrappingSectionByCursorPosition(cursorPosition, true);

        const isOnTheSameLineAsSectionMarker = (cursorPosition.line === sectionIn?.markerOpenLine || cursorPosition.line === sectionIn?.markerCloseLine);

        if (cursorPosition && sectionIn && !isOnTheSameLineAsSectionMarker) {
            const endOfLine = lineContent.text.length;
            triggerUpdateDecorations(sectionIn, cursorPosition, endOfLine);
        } else {
            clearDecoration();
        };
    }, null, context.subscriptions);
};