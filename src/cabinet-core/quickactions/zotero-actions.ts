/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Card } from "cabinet-node";
import path = require("path");
import {
        QuickPickItem,
        window,
        Disposable,
        CancellationToken,
        QuickInputButton,
        QuickInput,
        ExtensionContext,
        QuickInputButtons,
        Uri,
} from "vscode";
import { InsertOption } from "../types/insert-option";
import { getSearchedZoteroItems, getSelectedZoteroItems, getSelectedZoteroPaths } from "../zotero-utils/get-zotero-attachments";
import { insertZoteroItemsText, insertZoteroItemText, InsertZoteroItemTextType } from "../zotero-utils/insert-zotero-item-text";
import { SearchCondition } from "../zotero-utils/zotero-types/zotero-search";
import { ZoteroPickItem } from "./zotero-pick-item";


export enum referenceSourceType {
        SelectedItems = 'Selected Items',
        Search = 'Search',
        Collections = 'Browse Collections',
}

export enum zoteroItemActionType {
        InsertLatex = 'Insert Latex',
}

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function zoteroActions(context: ExtensionContext) {

        const zoteroActions: QuickPickItem[] = [
                referenceSourceType.SelectedItems.toString(),
                referenceSourceType.Search.toString()

        ].map(label => ({ label }));


        interface State {
                title: string;
                pageIndices: number[];
                step: number;
                totalSteps: number;
                items: ZoteroPickItem[];
                selectedItems: ZoteroPickItem[];
                name: string;
                runtime: QuickPickItem;
        }

        async function collectInputs() {
                const state = {} as Partial<State>;
                await MultiStepInput.run((input) => pickZoteroActions(input, state));
                return state as State;
        }

        const title = "Pick Zotero Actions";

        async function pickZoteroActions(input: MultiStepInput, state: Partial<State>) {
                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Zotero Actions",
                        items: zoteroActions,
                        activeItem: zoteroActions[0],
                        buttons: [],
                        shouldResume: shouldResume,
                });

                state.items = [];
                switch (pick.label) {
                        case referenceSourceType.SelectedItems:
                                try {

                                        state.items = ZoteroPickItem.fromZoteroItems(await getSelectedZoteroItems());
                                } catch (error: any) {
                                        // show to vscode user
                                        const errorMessage = error.message ?? 'Unknown error';
                                        window.showErrorMessage(errorMessage);
                                }

                                return (input: MultiStepInput) => pickZoteroItems(input, state, true);
                        case referenceSourceType.Search:
                                const query = await input.showInputBox({
                                        title,
                                        step: 2,
                                        totalSteps: 3,
                                        prompt: "Search Zotero Items",
                                        value: '',
                                        validate: (value): Promise<string | undefined> => {
                                                if (!value) {
                                                        return Promise.resolve('Please enter a search query');
                                                } else if (value.length < 2) {
                                                        return Promise.resolve('Search query must be at least 3 characters long');
                                                }
                                                return Promise.resolve(undefined);
                                        },
                                        buttons: [],
                                        shouldResume: shouldResume,
                                });
                                try {
                                        const searchConditions: SearchCondition[] = [
                                                {
                                                        field: 'title',
                                                        operator: 'contains',
                                                        query
                                                },
                                                {
                                                        field: 'creator',
                                                        operator: 'contains',
                                                        query
                                                }
                                        ];
                                        state.items = ZoteroPickItem.fromZoteroItems(await getSearchedZoteroItems(searchConditions));
                                } catch (error: any) {
                                        // show to vscode user
                                        const errorMessage = error.message ?? 'Unknown error';
                                        window.showErrorMessage(errorMessage);
                                }
                                return (input: MultiStepInput) => pickZoteroItems(input, state);
                        default:
                                break;
                }

                return (input: MultiStepInput) => pickZoteroItems(input, state);
        }


        async function pickZoteroItems(input: MultiStepInput, state: Partial<State>, selectAll = false) {

                // automatically select all items
                const picks = await input.showQuickPickMulti<
                        ZoteroPickItem,
                        QuickPickParameters<ZoteroPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: `Pick Zotero Items`,
                        selectAll,
                        items: state.items?.map(item => { item.picked = true; return item }) ?? [],
                        buttons: [],
                        shouldResume: shouldResume,
                });
                state.selectedItems = picks;

                return (input: MultiStepInput) => pickZoteroItemActions(input, state);
        }

        async function pickZoteroItemActions(input: MultiStepInput, state: Partial<State>) {

                const zoteroItemActions: QuickPickItem[] = [
                        zoteroItemActionType.InsertLatex.toString()
                ].map(label => ({ label }));

                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Reference Sources",
                        items: zoteroItemActions,
                        activeItem: zoteroItemActions[0],
                        buttons: [],
                        shouldResume: shouldResume,
                });

                switch (pick.label) {
                        case zoteroItemActionType.InsertLatex:
                                console.log('insert latex for', state.selectedItems);

                                if (state.selectedItems) {
                                        await insertZoteroItemsText(state.selectedItems.map(pickItem => pickItem.item), InsertZoteroItemTextType.Latex, {
                                                linesAfter: (state.selectedItems.length > 3) ? 1 : 0,
                                        } as InsertOption);
                                }
                                return;
                }
        }

        function shouldResume() {
                // Could show a notification with the option to resume.
                return new Promise<boolean>((resolve, reject) => {
                        // noop
                });
        }

        await collectInputs();


}

// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
        static back = new InputFlowAction();
        static cancel = new InputFlowAction();
        static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
        title: string;
        step: number;
        totalSteps: number;
        items: T[];
        selectedItems?: T[];
        activeItem?: T;
        placeholder: string;
        selectAll?: boolean,
        buttons?: QuickInputButton[];
        shouldResume: () => Thenable<boolean>;
}



interface InputBoxParameters {
        title: string;
        step: number;
        totalSteps: number;
        value: string;
        prompt: string;
        validate: (value: string) => Promise<string | undefined>;
        buttons?: QuickInputButton[];
        shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {
        static async run<T>(start: InputStep) {
                const input = new MultiStepInput();
                return input.stepThrough(start);
        }

        private current?: QuickInput;
        private steps: InputStep[] = [];

        private async stepThrough<T>(start: InputStep) {
                let step: InputStep | void = start;
                while (step) {
                        this.steps.push(step);
                        if (this.current) {
                                this.current.enabled = false;
                                this.current.busy = true;
                        }
                        try {
                                step = await step(this);
                        } catch (err) {
                                if (err === InputFlowAction.back) {
                                        this.steps.pop();
                                        step = this.steps.pop();
                                } else if (err === InputFlowAction.resume) {
                                        step = this.steps.pop();
                                } else if (err === InputFlowAction.cancel) {
                                        step = undefined;
                                } else {
                                        throw err;
                                }
                        }
                }
                if (this.current) {
                        this.current.dispose();
                }
        }

        async showQuickPick<
                T extends QuickPickItem,
                P extends QuickPickParameters<T>
        >({
                title,
                step,
                totalSteps,
                items,
                activeItem,
                placeholder,
                buttons,
                shouldResume,
        }: P) {
                const disposables: Disposable[] = [];
                try {
                        return await new Promise<
                                T | (P extends { buttons: (infer I)[] } ? I : never)
                        >((resolve, reject) => {
                                const input = window.createQuickPick<T>();
                                input.title = title;
                                input.step = step;
                                input.totalSteps = totalSteps;
                                input.placeholder = placeholder;
                                input.items = items;
                                if (activeItem) {
                                        input.activeItems = [activeItem];
                                }
                                input.buttons = [
                                        ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                                        ...(buttons || []),
                                ];
                                disposables.push(
                                        input.onDidTriggerButton((item) => {
                                                if (item === QuickInputButtons.Back) {
                                                        reject(InputFlowAction.back);
                                                } else {
                                                        resolve(<any>item);
                                                }
                                        }),
                                        input.onDidChangeSelection((items) => resolve(items[0])),
                                        input.onDidHide(() => {
                                                (async () => {
                                                        reject(
                                                                shouldResume && (await shouldResume())
                                                                        ? InputFlowAction.resume
                                                                        : InputFlowAction.cancel
                                                        );
                                                })().catch(reject);
                                        })
                                );
                                if (this.current) {
                                        this.current.dispose();
                                }
                                this.current = input;
                                this.current.show();
                        });
                } finally {
                        disposables.forEach((d) => d.dispose());
                }
        }

        async showQuickPickMulti<
                T extends QuickPickItem,
                P extends QuickPickParameters<T>
        >({
                title,
                step,
                totalSteps,
                items,
                activeItem,
                placeholder,
                selectAll,
                buttons,
                shouldResume,
        }: P) {
                const disposables: Disposable[] = [];
                try {
                        return await new Promise<
                                T[] | (P extends { buttons: (infer I)[] } ? I : never)
                        >((resolve, reject) => {
                                const input = window.createQuickPick<T>();
                                input.title = title;
                                input.canSelectMany = true;
                                input.step = step;
                                input.totalSteps = totalSteps;
                                input.placeholder = placeholder;
                                input.items = items;
                                if (selectAll) {
                                        input.selectedItems = items;
                                }

                                if (activeItem) {
                                        input.activeItems = [activeItem];
                                }
                                input.buttons = [
                                        ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                                        ...(buttons || []),
                                ];
                                disposables.push(
                                        input.onDidTriggerButton((item) => {
                                                if (item === QuickInputButtons.Back) {
                                                        reject(InputFlowAction.back);
                                                } else {
                                                        resolve(<any>item);
                                                }
                                        }),
                                        input.onDidChangeSelection((items) => {
                                                console.log('Pick changed', items);
                                        }),
                                        input.onDidAccept(() => {
                                                const selectedItems = [...input.selectedItems];
                                                resolve(selectedItems);
                                        }),
                                        input.onDidHide(() => {
                                                (async () => {
                                                        reject(
                                                                shouldResume && (await shouldResume())
                                                                        ? InputFlowAction.resume
                                                                        : InputFlowAction.cancel
                                                        );
                                                })().catch(reject);
                                        })
                                );
                                if (this.current) {
                                        this.current.dispose();
                                }
                                this.current = input;
                                this.current.show();
                        });
                } finally {
                        disposables.forEach((d) => d.dispose());
                }
        }


        async showInputBox<P extends InputBoxParameters>({
                title,
                step,
                totalSteps,
                value,
                prompt,
                validate,
                buttons,
                shouldResume,
        }: P) {
                const disposables: Disposable[] = [];
                try {
                        return await new Promise<
                                string | (P extends { buttons: (infer I)[] } ? I : never)
                        >((resolve, reject) => {
                                const input = window.createInputBox();
                                input.title = title;
                                input.step = step;
                                input.totalSteps = totalSteps;
                                input.value = value || "";
                                input.prompt = prompt;
                                input.buttons = [
                                        ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
                                        ...(buttons || []),
                                ];
                                let validating = validate("");
                                disposables.push(
                                        input.onDidTriggerButton((item) => {
                                                if (item === QuickInputButtons.Back) {
                                                        reject(InputFlowAction.back);
                                                } else {
                                                        resolve(<any>item);
                                                }
                                        }),
                                        input.onDidAccept(async () => {
                                                const value = input.value;
                                                input.enabled = false;
                                                input.busy = true;
                                                if (!(await validate(value))) {
                                                        resolve(value);
                                                }
                                                input.enabled = true;
                                                input.busy = false;
                                        }),
                                        input.onDidChangeValue(async (text) => {
                                                const current = validate(text);
                                                validating = current;
                                                const validationMessage = await current;
                                                if (current === validating) {
                                                        input.validationMessage = validationMessage;
                                                }
                                        }),
                                        input.onDidHide(() => {
                                                (async () => {
                                                        reject(
                                                                shouldResume && (await shouldResume())
                                                                        ? InputFlowAction.resume
                                                                        : InputFlowAction.cancel
                                                        );
                                                })().catch(reject);
                                        })
                                );
                                if (this.current) {
                                        this.current.dispose();
                                }
                                this.current = input;
                                this.current.show();
                        });
                } finally {
                        disposables.forEach((d) => d.dispose());
                }
        }
}
