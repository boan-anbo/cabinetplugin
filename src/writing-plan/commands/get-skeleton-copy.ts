import { env, window } from "vscode";
import { getCurrentPlan } from "../writing-plan-instance"

export const getSkeletonCopy = (): string => {
    return getCurrentPlan()?.getSkeletonPlan() ?? '';
}

export const copySkeletonPlanToVscodeClipboard = () => {
    const skeletonCopy = getSkeletonCopy();
    if (skeletonCopy) {
        env.clipboard.writeText(skeletonCopy);
        // show a message box to the user
        window.showInformationMessage(`Skeleton plan copied to clipboard: ${skeletonCopy}`);
    }
};

