import { window } from "vscode";
import { writingPlanTreeView } from "../register-writing-plan";
import { writingPlanInstance } from "../writing-plan-instance";

export const toggleOutlineShowCards = () => {
    ;
    if (!writingPlanTreeView) {
        return;
    }
    writingPlanTreeView.showCards = !writingPlanTreeView.showCards;
    // show to user
    window.showInformationMessage(`Show cards: ${writingPlanTreeView.showCards}`);
};