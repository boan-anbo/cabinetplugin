import * as vscode from 'vscode';
import { WritingPlan } from 'writing-plan';
import { updateStatusBarText as updatePlanStatusBarText } from './writing-plan-bar';
import { getCurrentPlan, refreshCurrentPlan, writingPlans } from './writing-plan-instance';


let changeTimeout: NodeJS.Timeout | null;
export const documentPlanListener = (event: vscode.TextDocumentChangeEvent) => {
    // if the cabinet preview panel is not visible, do not update it.


    if (changeTimeout != null)
        clearTimeout(changeTimeout);

    changeTimeout = setInterval(async function () {
        if (changeTimeout !== null) {

            clearTimeout(changeTimeout);
            changeTimeout = null;
            // if the current document is a markdown file, update the preview;

            let docText = vscode.window.activeTextEditor?.document.getText() ?? null;

            if (docText !== null) {
                refreshCurrentPlan(docText);

                console.log("checked", getCurrentPlan());
                updatePlanStatusBarText();
            }
        }
    }, 200);
}

export const stopChangePreviewListener = () => {
    if (changeTimeout !== null) {
        clearInterval(changeTimeout);

    }
};