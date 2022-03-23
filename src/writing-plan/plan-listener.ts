import * as vscode from 'vscode';
import { WritingPlan } from 'writing-plan';
import { updateStatusBarText } from './writing-plan-bar';
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

            let docText: string | null = event.document.getText() ?? null;
            if (docText === null) {
                // get active editor document text
                docText = vscode.window.activeTextEditor?.document.getText() ?? null;
            }

            if (docText !== null) {
                refreshCurrentPlan(docText);
                // console.log(writingPlans[0].sections);
                // highlight the first five lines in the active editor

                // run vscode command 
                await vscode.commands.executeCommand('writing-plan.outline.refresh');
                console.log("checked", getCurrentPlan());
                updateStatusBarText(writingPlans[0].toString());
            }
        }
    }, 200);
}

export const stopChangePreviewListener = () => {
    if (changeTimeout !== null) {
        clearInterval(changeTimeout);

    }
};