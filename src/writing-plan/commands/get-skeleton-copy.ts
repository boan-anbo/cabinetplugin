import { env, Uri, window, workspace } from "vscode";
import * as fs from "fs";
import { writingPlanInstance } from "../writing-plan-instance";
export const getSkeletonCopy = (): string => {
    return writingPlanInstance.getCurrentPlan()?.getSkeletonPlan() ?? '';
}

export const copySkeletonPlanToVscodeClipboard = () => {
    const skeletonCopy = getSkeletonCopy();
    if (skeletonCopy) {
        env.clipboard.writeText(skeletonCopy);
        // show a message box to the user
        window.showInformationMessage(`Skeleton plan copied to clipboard: ${skeletonCopy}`);
    }
};

export const writeSkeletonCopyIntoNewFile = async () => {
    const skeletonCopy = getSkeletonCopy();
    // get current active document file path
    const activeDocument = window.activeTextEditor?.document;
    if (activeDocument) {
        // prepare a skeleton copy file path with the same extension, not language id
        let skeletonCopyFilePath = `${activeDocument.fileName.replace(/\.[^/.]+$/, '')}-skeleton.${activeDocument.fileName.split('.').pop()}`;
        // check if it already exists using vscode fs api
        let i = 1;
        while (fs.existsSync(skeletonCopyFilePath)) {
            skeletonCopyFilePath = `${activeDocument.fileName.replace(/\.[^/.]+$/, '')}-skeleton-${i}.${activeDocument.fileName.split('.').pop()}`;
            i++;
        }
        // write the skeleton copy into the new file
        // add markdown line of the current datetime at the beginning of the file
        const now = new Date();
        const markdownDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const skeletonCopyWithDate = `# ${markdownDate}\n\n${skeletonCopy}`;
        fs.writeFileSync(skeletonCopyFilePath, skeletonCopyWithDate);
        // let the user know the file has been created
        window.showInformationMessage(`Skeleton plan written to file: ${skeletonCopyFilePath}`);



    }
};

