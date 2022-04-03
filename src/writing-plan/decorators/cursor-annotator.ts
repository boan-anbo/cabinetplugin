import { DecorationOptions, ExtensionContext, Position, Range, TextEditorDecorationType, TextEditorSelectionChangeEvent, ThemableDecorationAttachmentRenderOptions, window, workspace } from "vscode";
import { Section } from "writing-plan/build/main/lib/section";
import { SectionTreeItem } from "../entities/writing-plan-tree-item";
import { getWrappingSectionByCursorPosition } from "../go-to-section-ends";
import { writingPlanTreeView } from "../register-writing-plan";
import { writingPlanInstance, WritingPlanStatus } from "../writing-plan-instance";
import { annotatorColors } from "./annotator-colors";

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
            const decorationOption = {
                // get line content length of the cursor position

                range: new Range(cursorPosition, new Position(cursorPosition.line, endOfLine)),
                renderOptions: {
                    after: {
                        contentText: `${sectionItem.description}`,
                        // if balance is negative, it will be pink color, if positive, it will be green color
                        color: annotatorColors.getBalanceColor(sectionItem.section.goalStatus),

                        // top, right, bottom, left
                        margin: '0 0 0 20px',
                        // set smaller css font size
                        fontSize: 'small',
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


    function updateCursorAnnotation(cursorPosition: Position) {
        clearDecoration();
        // get the content of line at the cursor position
        const lineContent = window.activeTextEditor?.document.lineAt(cursorPosition.line);
        const sectionIn = getWrappingSectionByCursorPosition(cursorPosition, true);


        const isOnTheSameLineAsSectionMarker = (cursorPosition.line === sectionIn?.markerOpenLine || cursorPosition.line === sectionIn?.markerCloseLine);

        if (cursorPosition && lineContent && sectionIn && !isOnTheSameLineAsSectionMarker) {
            const endOfLine = lineContent.text.length;
            triggerUpdateDecorations(sectionIn, cursorPosition, endOfLine);

            // highlight the current section in treeview writing plan outline
            if (writingPlanTreeView && sectionIn) {
                // get section item from the tree view that includes the sectionIn
                const sectionItem = writingPlanInstance.allCurrentSectionItems.find(item => item.section.id === sectionIn.id);
                console.log('Highlighting', sectionIn, sectionItem);
                // suppress typescript warning

                if (sectionItem) {
                    // check is writing plan tree view is visible
                    if (writingPlanTreeView.treeView.visible) {
                        // select the section item in the tree view
                        writingPlanTreeView.treeView.reveal(sectionItem);
                    }

                }

            }
        }
    }

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        const cursorPosition: Position = event.selections[0]?.active;
        updateCursorAnnotation(cursorPosition);
    }, null, context.subscriptions);


    writingPlanInstance.writingPlanStatus.listener.event(() => {
        // get current cursor position
        const cursorPosition = window.activeTextEditor?.selection.active;
        if (cursorPosition) {
            updateCursorAnnotation(cursorPosition);
        }

    });
    function dispose() {
        cursorDecorationType.dispose();
    }
};