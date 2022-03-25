import * as vscode from 'vscode';
import { getCurrentPlan, writingPlans } from './writing-plan-instance';


let writingPlanBarItem: vscode.StatusBarItem;

export const createStatusBar = () => {
    writingPlanBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);

    updateStatusBarText();

    writingPlanBarItem.show();
}


export const updateStatusBarText = (newStatus?: string): void => {
    if (!newStatus) {
        newStatus = getCurrentPlan()?.toString();
        if (!newStatus) {
            newStatus = "No Writing Plan";
        }
    }
    if (newStatus.length > 0) {
        writingPlanBarItem.text = `[W] ${newStatus}`;
        writingPlanBarItem.show();
    }
}
