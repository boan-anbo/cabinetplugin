import { DecorationOptions, ExtensionContext, Position, Range, TextEditorDecorationType, ThemableDecorationAttachmentRenderOptions, window, workspace } from "vscode";
import { getCurrentPlan } from "../writing-plan-instance";

// let currentHighlight: TextEditorDecorationType;

export const registerSectionDecorations = (context: ExtensionContext) => {

    console.log('decorator sample is activated');

    let timeout: NodeJS.Timer | undefined = undefined;

    const updateDecorations = () => {
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
            const sectionDecorationType = window.createTextEditorDecorationType({
                backgroundColor: 'green',
                border: '2px solid white',
            });
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
                    renderOptions: {

                        after: {
                            contentText: section?.wordTarget?.toString() ?? "Word target",
                            color: 'black',
                        } as ThemableDecorationAttachmentRenderOptions
                    }

                } as DecorationOptions;
                // set the decoration type
                sectionDecorationOptions.push(decoratationType);

            }
            // set
            console.log('decoration options', sectionDecorationOptions);
            activeEditor.setDecorations(sectionDecorationType, sectionDecorationOptions);

        }
    }


    // export const clearSectionAnnotations = () => {
    //     // clear the highlight text editor decoration
    //     currentHighlight?.dispose();
    // }

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

    let activeEditor = window.activeTextEditor;

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
}