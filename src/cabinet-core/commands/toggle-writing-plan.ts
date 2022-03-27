import { window, workspace } from "vscode";
import { updateStatusBarText as updateWritingPlanStatusBarText } from "../../writing-plan/writing-plan-bar";
import { refreshCurrentPlan, writingPlanStatus } from "../../writing-plan/writing-plan-instance";

export const toggleWritingPlan = () => {
    // get properity to check if the writing plan is enabled
    const writingPlanEnabled = workspace.getConfiguration('cabinetplugin.writing-plan').get('enable');
    // toggle it
    workspace.getConfiguration('cabinetplugin.writing-plan').update('enable', !writingPlanEnabled, true);
    writingPlanStatus.enabled = !writingPlanEnabled;
    updateWritingPlanStatusBarText();
    if (writingPlanStatus.enabled) {
        refreshCurrentPlan();
    }
}