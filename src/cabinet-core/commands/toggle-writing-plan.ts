import { window, workspace } from "vscode";
import { updateStatusBar as updateWritingPlanStatusBarText } from "../../writing-plan/writing-plan-bar";
import { writingPlanInstance, WritingPlanStatus } from "../../writing-plan/writing-plan-instance";

export const toggleWritingPlan = () => {
    // get properity to check if the writing plan is enabled
    const writingPlanEnabled = workspace.getConfiguration('cabinetplugin.writing-plan').get('enable');
    // toggle it
    workspace.getConfiguration('cabinetplugin.writing-plan').update('enable', !writingPlanEnabled, true);
    writingPlanInstance.writingPlanStatus.enabled = !writingPlanEnabled;
    if (writingPlanInstance.writingPlanStatus.enabled) {
        writingPlanInstance.refreshCurrentPlan();
    } else {
        writingPlanInstance.writingPlanStatus.listener.fire(WritingPlanStatus.shutdown);
    }
};