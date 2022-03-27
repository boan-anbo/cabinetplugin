import { DecorationOptions, ExtensionContext, Position, Range, TextEditorDecorationType, ThemableDecorationAttachmentRenderOptions, window, workspace } from "vscode";
import { arabic2roman } from "../../utils/arabic-roman";
import { SectionTreeItem } from "../entities/section-item";
import { getCurrentPlan } from "../writing-plan-instance";

// let currentHighlight: TextEditorDecorationType;

export const registerSectionDecorations = (context: ExtensionContext) => {

    console.log('decorator sample is activated');

    let timeout: NodeJS.Timer | undefined = undefined;

    // the type instance should be created only once, because it will be cleared when set again, otherwise it will multiply.
    // what is actualy updated is the decoration options, which contains the updated information such as text, color, etc.
    const sectionDecorationType = window.createTextEditorDecorationType({
        textDecoration: 'underline',
    });

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

            const sectionDecorationOptions: DecorationOptions[] = [];
            let match;
            while ((match = regEx.exec(text))) {
                // const markerLine = activeEditor.document.lineAt(match.index);
                const startPos = activeEditor.document.positionAt(match.index);
                const endPos = activeEditor.document.positionAt(match.index + match[0].length);
                const range = new Range(startPos, endPos);
                const markerString = activeEditor.document.getText(range);
                const isOpenMarker = plan.isOpenMarker(markerString);
                const section = plan.getSectionByMarker(startPos.line, startPos.character, match[0].length);
                if (!section) {
                    return;
                }
                const sectionItem = SectionTreeItem.fromSection(section);
                // const decoration = { range: new Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
                const mainColor = 'rgba(0, 0, 0, 0.3)';
                const isCloseMarkerNextToOpenMarker = !isOpenMarker && (section.markerOpenLine === section.markerCloseLine - 1) || (section.markerOpenLine === section.markerCloseLine);
                const decorationType = {
                    range,
                    renderOptions: {
                        before: {
                            fontSize: 'smaller',
                            contentText: `${arabic2roman(section?.level, 1)}.${arabic2roman(section?.levelOrder, 1)}`,
                            // top, right, bottom, left
                            margin: '0 10px 0 0',
                            // set to transparent if is not open marker
                            color: isOpenMarker ? mainColor : 'rgba(0, 0, 0, 0)',
                        } as ThemableDecorationAttachmentRenderOptions,
                        after: {
                            fontSize: 'smaller',
                            contentText: isCloseMarkerNextToOpenMarker ? '' : sectionItem.description,
                            // set color to beautiful light blue
                            color: sectionItem.section.wordBalance < 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 228, 0, 1)',
                            // top, right, bottom, left
                            margin: '0 0 0 20px',

                        } as ThemableDecorationAttachmentRenderOptions
                    }

                } as DecorationOptions;
                // set the decoration type
                sectionDecorationOptions.push(decorationType);

            }
            // set
            console.log('decoration options', sectionDecorationOptions);
            activeEditor.setDecorations(sectionDecorationType, sectionDecorationOptions);

        }
    };

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

    // window.onDidChangeActiveTextEditor(editor => {
    //     activeEditor = editor;
    //     if (editor) {
    //         triggerUpdateDecorations();
    //     }
    // }, null, context.subscriptions);

    workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);
}