import * as vscode from 'vscode';
import { globalWritingPlanDisposables } from './register-writing-plan';
import { writingPlanInstance } from './writing-plan-instance';


let writingPlanBarItem: vscode.StatusBarItem;

export const createStatusBar = () => {
    writingPlanBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
    // get properity to check if the writing plan is enabled
    const writingPlanEnabled = vscode.workspace.getConfiguration('cabinetplugin.writing-plan').get('enable') as boolean;
    writingPlanInstance.writingPlanStatus.enabled = writingPlanEnabled;
    writingPlanBarItem.command = toggleWritingPlanBarCommand;

    updateStatusBar();
    writingPlanBarItem.show();

    globalWritingPlanDisposables.push(writingPlanInstance.writingPlanStatus.listener.event(() => updateStatusBar()));
}


const toggleWritingPlanBarCommand: vscode.Command = {
    command: 'cabinetplugin.writing-plan.toggle',
    title: writingPlanInstance.writingPlanStatus.enabled ? 'Turn off Writing Plan' : 'Turn on Writing Plan',
    tooltip: 'Toggle Writing Plan',
}

export const updateStatusBar = (newStatus?: string): void => {
    if (!writingPlanInstance.writingPlanStatus.enabled) {
        writingPlanBarItem.text = '$(eye-closed) Writing Plan';
        writingPlanBarItem.tooltip = 'Writing Plan is disabled';
        return;
    } else if (newStatus) {
        writingPlanBarItem.text = `$(eye) Writing Plan: ${newStatus}`;
        writingPlanBarItem.tooltip = `Writing Plan is enabled: ${newStatus}`;
        return;
    }

    if (!newStatus) {
        newStatus = writingPlanInstance.getCurrentPlan()?.toString();
        if (!newStatus) {
            newStatus = "No Writing Plan";
        }
    }
    if (newStatus.length > 0) {
        writingPlanBarItem.text = `[W] ${newStatus}`;
        writingPlanBarItem.show();
    }
}
