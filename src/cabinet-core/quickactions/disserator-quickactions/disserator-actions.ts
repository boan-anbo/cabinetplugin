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
import { cabinetNodeInstance } from "../../../extension";
import { goToLine, goToLocation } from "../../commands/go-to-line-command";
import { Disserator } from "../../disserator/disserator";
import { MarkdownPointItem } from "./markdown-point-item";

interface State {
        title: string;
        step: number;
        totalSteps: number;
        points: MarkdownPointItem[];
        name: string;
}

async function listDocumentPoints(input: MultiStepInput, state: Partial<State>) {

        if (!cabinetNodeInstance) {
                return;
        }

        const disserator = new Disserator(cabinetNodeInstance);

        const currentDocumentText = window.activeTextEditor?.document.getText() ?? '';

        const allPoints = disserator.getStructure(currentDocumentText);

        const allPointItems = allPoints.map((point) => {
                return new MarkdownPointItem(point);
        });

        console.log(allPointItems);

        const title = 'Select points';

        const pointsSelected = await input.showQuickPickMarkdownPointItems<
                MarkdownPointItem,
                QuickPickParameters<MarkdownPointItem>
        >({
                title,
                step: 1,
                totalSteps: 3,
                placeholder: `Select Cards`,
                items: allPointItems,
                shouldResume: shouldResume,
        });
        // state.selectedCardItems = pointsSelected;

        console.log(pointsSelected);

        // return (input: MultiStepInput) => pickPointsActions(input, state);
}


/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function disseratorActions(context: ExtensionContext) {

        enum disseratorActionType {
                GET_DOC_POINTS = 'Get Document Points',
        }
        const disseratorActions: QuickPickItem[] = [
                disseratorActionType.GET_DOC_POINTS,
        ].map(label => ({ label }));


        async function collectInputs() {
                const state = {} as Partial<State>;
                await MultiStepInput.run((input) => pickDisseratorActions(input, state));
                return state as State;
        }

        const title = "Cabinet";

        async function pickDisseratorActions(input: MultiStepInput, state: Partial<State>) {
                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Cabinet Actions",
                        items: disseratorActions,
                        activeItem:
                                state.points ? state.points[0] : undefined,
                        // buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });

                switch (pick.label) {
                        case disseratorActionType.GET_DOC_POINTS:

                                return (input: MultiStepInput) => listDocumentPoints(input, state);
                        default:
                                throw new Error("Should never reach here");
                }

        }

        enum cardActionTypes {
                INSERT_CARD = 'Insert Card',
                NAVIGATE_TO_CARD_IN_DOCUMENT = 'Navigate to Card in Document',

        }

        const cardActions: QuickPickItem[] = [
                cardActionTypes.INSERT_CARD,
        ].map(label => ({ label }));


        const state = await collectInputs();

}

function shouldResume() {
        // Could show a notification with the option to resume.
        return new Promise<boolean>((resolve, reject) => {
                // noop
        });
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
        activeItem?: T;
        placeholder: string;
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

        async showQuickPickMarkdownPointItems<
                T extends MarkdownPointItem,
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
                                T | (P extends { buttons: (infer I) } ? I : never)
                        >((resolve, reject) => {
                                const input = window.createQuickPick<T>();
                                input.title = title;
                                input.canSelectMany = false;
                                input.step = step;

                                input.totalSteps = totalSteps;
                                input.placeholder = placeholder;
                                // filter on cards detail (Markdown) as well
                                input.matchOnDetail = true;
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
                                        input.onDidChangeSelection((items) => {
                                                console.log('Pick changed', items);
                                        }),
                                        input.onDidChangeActive(async () => {
                                                const activeItem = input.activeItems[0];
                                                await goToLine(activeItem.point.line);
                                        }),
                                        input.onDidAccept(() => {
                                                resolve(input.activeItems[0]);
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
                                // filter on cards detail (Markdown) as well
                                input.matchOnDetail = true;
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
