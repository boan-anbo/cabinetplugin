import * as vscode from 'vscode';
import { cabinetNodeInstance } from '../../extension';
let myStatusBarItem: vscode.StatusBarItem;


export const registerStatusBar = () => {
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
	cabinetStatusBarOff();

	return myStatusBarItem;

};

const startCabinetToolTip = "Start Cabinet";

const stopCabinetToolTip = "Stop Cabinet";

export const updateStatusBarCommand = () => {
	if (cabinetNodeInstance) {

		myStatusBarItem.command = "cabinetplugin.stopCabinet";
		myStatusBarItem.tooltip = stopCabinetToolTip;
	} else {
		myStatusBarItem.command = "cabinetplugin.startCabinet";
		myStatusBarItem.tooltip = startCabinetToolTip;

	}

}

export const cabinetStatusBarOff = () => {
	updateStatusBarText(`Off`);
}


export const updateStatusBarText = (newStatus: string): void => {
	if (newStatus.length > 0) {
		myStatusBarItem.text = `[C] ${newStatus}`;
		myStatusBarItem.show();
	}

	updateStatusBarCommand();
}

export const removeStatusBarItem = (): void => {
	myStatusBarItem.dispose();
}