import * as vscode from 'vscode';
import { writingPlans } from './writing-plan-instance';


let writingPlanBarItem: vscode.StatusBarItem;

export const createStatusBar = () => {
    writingPlanBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);

    updateStatusBarText(writingPlans[0].toString());

    writingPlanBarItem.show();
}


export const updateStatusBarText = (newStatus: string): void => {
    if (newStatus.length > 0) {
        writingPlanBarItem.text = `[W] ${newStatus}`;
        writingPlanBarItem.show();
    }
}
