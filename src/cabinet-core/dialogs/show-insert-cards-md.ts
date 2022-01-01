import * as vscode from 'vscode';


export const showInsertCardsMd = async (length: number): Promise<boolean> => {
    if (length <= 0) {
        return false;
    }

    const result = await vscode.window
        .showInformationMessage(
            `Found ${length} cards? do you want to insert markdown?`,
            ...["Yes", "No"]
        );

    if (result === "Yes") {
        // Run function
        // console.log('Yes');
        return true;
    }

    return false;
}