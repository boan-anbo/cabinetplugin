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
import { cabinetNodeInstance } from "../../extension";
import { getFilesFromPdfFolders } from "../utils/get-all-pdfs";
import { insertCardCci } from "../utils/insert-text";
import { getSelectedZoteroPaths } from "../zotero-utils/get-zotero-attachments";
import { FileItem } from "./file-item";
import { CardItem } from "./card-item";
import { getCardLocationsInCurrentDocument } from "../utils/get-card-locations";
import { CardLocationItem } from "./card-location-item";
import { goToLine, goToLocation } from "../commands/go-to-line-command";



/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function cabinetInstanceActions(context: ExtensionContext) {
        class MyButton implements QuickInputButton {
                constructor(
                        public iconPath: { light: Uri; dark: Uri },
                        public tooltip: string
                ) { }
        }

        const createResourceGroupButton = new MyButton(
                {
                        dark: Uri.file(context.asAbsolutePath("resources/dark/add.svg")),
                        light: Uri.file(context.asAbsolutePath("resources/light/add.svg")),
                },
                "Choose Cabinet Actions"
        );

        enum cabinetActionType {
                SEARCH_CARDS = 'Search Local Cards',
                BROWSE_CARDS_IN_DOCUMENT = 'Browse Cards in Document',
        }
        const cabinetActions: QuickPickItem[] = [
                cabinetActionType.SEARCH_CARDS,
                cabinetActionType.BROWSE_CARDS_IN_DOCUMENT,
        ].map(label => ({ label }));


        interface State {
                title: string;
                pageIndices: number[];
                step: number;
                totalSteps: number;
                fileSources: QuickPickItem[];
                fileItem: FileItem;
                fileItems: FileItem[];
                selectedCards: Card[];
                selectedCardItems: CardItem[];
                name: string;
                runtime: QuickPickItem;
        }

        async function collectInputs() {
                const state = {} as Partial<State>;
                await MultiStepInput.run((input) => pickCabinetInstanceActions(input, state));
                return state as State;
        }

        const title = "Cabinet";

        async function pickCabinetInstanceActions(input: MultiStepInput, state: Partial<State>) {
                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Cabinet Actions",
                        items: cabinetActions,
                        activeItem:
                                typeof state.fileItem !== "string" ? state.fileItem : undefined,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });

                state.fileItems = [];
                switch (pick.label) {
                        case cabinetActionType.SEARCH_CARDS:

                                return (input: MultiStepInput) => searchLocalCards(input, state);
                        default:
                                return (input: MultiStepInput) => browseCardLocations(input, state);

                }

        }


        async function searchLocalCards(input: MultiStepInput, state: Partial<State>) {

                const allCardsItems = CardItem.fromCards(cabinetNodeInstance?.cards ?? []);
                const cardsSelected = await input.showQuickPickMulti<
                        CardItem,
                        QuickPickParameters<CardItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: `Select Cards`,
                        items: allCardsItems,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });
                state.selectedCardItems = cardsSelected;

                return (input: MultiStepInput) => pickCardActions(input, state);
        }

        enum cardActionTypes {
                INSERT_CARD = 'Insert Card',
                NAVIGATE_TO_CARD_IN_DOCUMENT = 'Navigate to Card in Document',

        }

        const cardActions: QuickPickItem[] = [
                cardActionTypes.INSERT_CARD,
        ].map(label => ({ label }));


        async function pickCardActions(input: MultiStepInput, state: Partial<State>) {
                const availableCardActions = state.selectedCardItems && state.selectedCardItems?.length > 0
                        // for multiple cards
                        ? [
                                cardActionTypes.INSERT_CARD,
                                cardActionTypes.NAVIGATE_TO_CARD_IN_DOCUMENT,
                        ]
                        // for single card
                        : [
                                cardActionTypes.INSERT_CARD,
                                cardActionTypes.NAVIGATE_TO_CARD_IN_DOCUMENT,
                        ];
                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Cabinet Actions",
                        items: availableCardActions.map(label => ({ label })),
                        activeItem:
                                cardActions[0] ?? undefined,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });

                switch (pick.label) {
                        case cardActionTypes.INSERT_CARD:
                                await insertCardCci(state.selectedCardItems?.map(c => c.card) ?? []);
                                return;
                        case cardActionTypes.NAVIGATE_TO_CARD_IN_DOCUMENT:
                                return (input: MultiStepInput) => browseCardLocations(input, state);

                        default:
                                return;

                }

        }

        async function browseCardLocations(input: MultiStepInput, state: Partial<State>) {
                let selectedCardsLocation: CardLocationItem[] = [];
                const allCardsLocationsInCurrentDocument = await getCardLocationsInCurrentDocument();

                // if selected cards items, then only show locations of selected cards; otherwise show all locations;
                if (state.selectedCardItems) {
                        const selectedCardsLocationsInCurrentDoc = allCardsLocationsInCurrentDocument.filter(c => state.selectedCardItems?.some(s => s.card.id === c[0].id));
                        selectedCardsLocation = selectedCardsLocationsInCurrentDoc.flatMap(cardLocation => new CardLocationItem(cardLocation[0], cardLocation[1]));
                } else {
                        selectedCardsLocation = allCardsLocationsInCurrentDocument.flatMap(cardLocation => new CardLocationItem(cardLocation[0], cardLocation[1]));
                }

                const cardsSelected = await input.showQuickPickSingleCardLocation<
                        CardLocationItem,
                        QuickPickParameters<CardLocationItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 1,
                        placeholder: (selectedCardsLocation.length > 0) ? `Browse Card Locations` : `No Selected Card Locations Found`,
                        items: selectedCardsLocation,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });

                if (cardsSelected) {
                        // focus editor to the vs code location
                        await goToLocation(cardsSelected.cardLocation);
                }


                return;
        }
        async function inputPages(input: MultiStepInput, state: Partial<State>) {
                const inputPagesString = await input.showInputBox({
                        title,
                        step: 2,
                        totalSteps: 4,
                        value: typeof state.fileItem === "string" ? state.fileItem : "",
                        prompt: "Pick extraction action",
                        validate: validateInputPages,
                        shouldResume: shouldResume,
                });

                const pages = inputPagesString.length > 0
                        ? inputPagesString
                                .split("-")
                                .map((p) => parseInt(p, 10))
                                .filter((p) => !isNaN(p))
                        : [];
                state.pageIndices = pages;
                return (input: MultiStepInput) => pickNotesToInsert(input, state);
        }

        async function pickNotesToInsert(input: MultiStepInput, state: Partial<State>) {
                const filePath = state.fileItem?.filePath;
                const pageIndices = state.pageIndices;
                if (!(filePath && pageIndices)) {
                        return;
                }

                const cards =
                        await cabinetNodeInstance?.cabinetApi.extractAndStorePdfPagesAndReturnCards(
                                filePath,
                                pageIndices
                        );
                const selectedCards = await input.showQuickPickMulti<
                        CardItem,
                        QuickPickParameters<CardItem>
                >({
                        title,
                        step: 3,
                        totalSteps: 3,
                        placeholder: "Select Notes",
                        items:
                                cards?.map(
                                        (card: Card) =>
                                                new CardItem(card)) ?? [],
                        activeItem: undefined,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                }
                );
                // console.log(selectedCards);
                state.selectedCards = selectedCards.map(cardItem => cardItem.card);

                // return (input: MultiStepInput) => pickRuntime(input, state);

                cabinetNodeInstance?.addCards(state.selectedCards);
                await insertCardCci(state.selectedCards);
        }

        // async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
        //         const additionalSteps = typeof state.resourceGroup === 'string' ? 1 : 0;
        //         const runtimes = await getAvailableRuntimes(state.resourceGroup!, undefined /* TODO: token */);
        //         // TODO: Remember currently active item when navigating back.
        //         state.runtime = await input.showQuickPick({
        //                 title,
        //                 step: 3 + additionalSteps,
        //                 totalSteps: 3 + additionalSteps,
        //                 placeholder: 'Pick a runtime',
        //                 items: runtimes,
        //                 activeItem: state.runtime,
        //                 shouldResume: shouldResume
        //         });
        // }

        function shouldResume() {
                // Could show a notification with the option to resume.
                return new Promise<boolean>((resolve, reject) => {
                        // noop
                });
        }

        async function validateNameIsUnique(name: string) {
                // ...validate...
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return name === "vscode" ? "Name not unique" : undefined;
        }

        async function validateInputPages(inputPages: string) {
                // ...validate...
                // const pages = inputPages
                //         .split("-")
                //         .map((p) => parseInt(p, 10))
                //         .filter((p) => !isNaN(p));
                // return pages.length > 0 ? undefined : "Please enter a valid page range";
                return undefined;
        }


        const state = await collectInputs();

        // window.showInformationMessage(`Inserting received '${state.selectedCards?.length}' cards\n${state.fileItem.label}.`);


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

        async showQuickPickSingleCardLocation<
                T extends CardLocationItem,
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
                                                await goToLocation(activeItem.cardLocation);
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
