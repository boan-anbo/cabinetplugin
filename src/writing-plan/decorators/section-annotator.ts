import { DecorationInstanceRenderOptions, DecorationOptions, Disposable, ExtensionContext, Position, Range, TextEditorDecorationType, ThemableDecorationAttachmentRenderOptions, window, workspace } from "vscode";
import { arabic2roman } from "../../utils/arabic-roman";
import { SectionTreeItem } from "../entities/writing-plan-tree-item";
import { writingPlanInstance, WritingPlanStatus } from "../writing-plan-instance";
import { annotatorColors } from "./annotator-colors";

// let currentHighlight: TextEditorDecorationType;

export const registerSectionDecorations = (context: ExtensionContext) => {

    console.log('decorator sample is activated');

    let timeout: NodeJS.Timer | undefined = undefined;

    // the type instance should be created only once, because it will be cleared when set again, otherwise it will multiply.
    // what is actualy updated is the decoration options, which contains the updated information such as text, color, etc.
    const sectionDecorationType = window.createTextEditorDecorationType({
        textDecoration: 'underline',
    });

    const mainBlueColor = 'rgba(82, 163, 250, 0.5)';
    const openGrayColor = 'rgba(150, 150, 150, 0.2)';
    const closeGrayColor = 'rgba(150, 150, 150, 0.1)';
    const mainGreenColor = 'rgba(0, 255, 0, 0.2)';
    const sectionOpenLineDecorationType = window.createTextEditorDecorationType({
        // top right bottom left
        borderWidth: '3px 2px 0px 2px',
        // make border rounded at the top
        borderRadius: '10px 10px 0px 0px',
        // set border color dark gray
        borderColor: mainBlueColor,
        color: mainBlueColor,
        borderStyle: 'solid',
        // set background light gray
        backgroundColor: openGrayColor,
        isWholeLine: true,
    });

    const sectionCloseLineDecorationType = window.createTextEditorDecorationType({
        // top right bottom left
        borderWidth: '0px 2px 3px 2px',
        // make border rounded at the top
        borderRadius: '0px 0px 10px 10px',
        // set border color dark gray
        borderColor: mainBlueColor,
        borderStyle: 'solid',
        backgroundColor: closeGrayColor,
        isWholeLine: true,
        color: mainBlueColor,
    });

    const updateDecorations = () => {
        const activeEditor = window.activeTextEditor;
        if (activeEditor) {
            // get vscode range based on regex match of the marker
            if (!activeEditor) {
                return;
            }
            const plan = writingPlanInstance.getCurrentPlan();
            if (!plan) {
                return;
            }
            const regEx = plan.options.getMarkerRegex();
            const text = activeEditor.document.getText();

            const sectionDecorationOptions: DecorationOptions[] = [];
            const sectionOpenLineDecorationOptions: DecorationOptions[] = [];
            const sectionCloseLineDecorationOptions: DecorationOptions[] = [];
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
                const isCloseMarkerNextToOpenMarker = !isOpenMarker && (section.markerOpenLine === section.markerCloseLine - 1) || (section.markerOpenLine === section.markerCloseLine);


                const decorationType = {
                    range,
                    renderOptions: {

                        before: {
                            fontSize: 'smaller',
                            contentText: sectionItem.sectionLevelOrderString,
                            // top, right, bottom, left
                            margin: '0 10px 0 10px',

                            // set to transparent if is not open marker
                            color: isOpenMarker ? mainBlueColor : 'rgba(0, 0, 0, 0)',
                        } as ThemableDecorationAttachmentRenderOptions,
                        after: {
                            fontSize: 'smaller',
                            contentText: isCloseMarkerNextToOpenMarker ? '' : sectionItem.description,
                            // set color to beautiful light blue
                            color: annotatorColors.getBalanceColor(sectionItem.section.goalStatus),
                            // top, right, bottom, left
                            margin: '0 0 0 20px',

                        } as ThemableDecorationAttachmentRenderOptions
                    }

                } as DecorationOptions;
                // set the decoration type
                sectionDecorationOptions.push(decorationType);

                if (isOpenMarker) {
                    const lineDecorationOptions: DecorationOptions = {
                        range,
                    };
                    sectionOpenLineDecorationOptions.push(lineDecorationOptions);
                } else {
                    const lineDecorationOptions: DecorationOptions = {
                        range,
                    };
                    sectionCloseLineDecorationOptions.push(lineDecorationOptions);
                }
            }
            // set
            console.log('decoration options', sectionDecorationOptions);
            activeEditor.setDecorations(sectionDecorationType, sectionDecorationOptions);
            activeEditor.setDecorations(sectionOpenLineDecorationType, sectionOpenLineDecorationOptions);
            activeEditor.setDecorations(sectionCloseLineDecorationType, sectionCloseLineDecorationOptions);
            // if open marker, set the upper border for the whole line

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

    // subscribe to writing plan status
    writingPlanInstance.writingPlanStatus.listener.event((status: WritingPlanStatus) => {
        switch (status) {
            case WritingPlanStatus.refreshed:
                triggerUpdateDecorations(true);
                break;
            case WritingPlanStatus.shutdown:
                clearAllDecorations();
                break;
            default:
                break;
        }
    });

    function clearAllDecorations() {
        const activeEditor = window.activeTextEditor;
        if (activeEditor) {
            activeEditor.setDecorations(sectionDecorationType, []);
            activeEditor.setDecorations(sectionOpenLineDecorationType, []);
            activeEditor.setDecorations(sectionCloseLineDecorationType, []);
        }

    }

    // window.onDidChangeActiveTextEditor(editor => {
    //     activeEditor = editor;
    //     if (editor) {
    //         triggerUpdateDecorations();
    //     }
    // }, null, context.subscriptions);

    // workspace.onDidChangeTextDocument(event => {
    //     if (activeEditor && event.document === activeEditor.document) {
    //         triggerUpdateDecorations(true);
    //     }
    // }, null, context.subscriptions);
}