import { window, workspace } from "vscode";
import { writingPlanTreeView } from "../register-writing-plan";
import { writingPlanInstance } from "../writing-plan-instance";
import { WritingPlanOutlineTree } from "./writing-plan-outline-tree";

export const toggleOutlineShowCards = () => {
    ;
    if (!writingPlanTreeView) {
        return;
    }
    writingPlanTreeView.showCards = !writingPlanTreeView.showCards;
    // show to user
    window.showInformationMessage(`Show cards: ${writingPlanTreeView.showCards}`);
};

export const showOutlineCards = async () => {
    // set vscode property "cabinetplugin.writing-plan.outline.showCards" to true
    await workspace.getConfiguration('cabinetplugin.writing-plan.outline').update("showCards", true, true);

    if (writingPlanTreeView) {
        writingPlanTreeView.showCards = true;
    }
};

export const hideOutlineCards = async () => {
    // set vscode property "cabinetplugin.writing-plan.outline.showCards" to false
    await workspace.getConfiguration('cabinetplugin.writing-plan.outline').update("showCards", false, true);

    if (writingPlanTreeView) {
        writingPlanTreeView.showCards = false;
    }
}
