/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as fs from 'fs';
import { Card, CardExporter, CardExporterUtils } from "cabinet-node";
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
        workspace,
} from "vscode";
import { cabinetNodeInstance } from "../../extension";
import { getFilesFromPdfFolders, getSortedFilesFromPdfFoldersByModifiedDates } from "../utils/get-all-pdfs";
import { insertCardCci, insertText } from "../utils/insert-text";
import { getSelectedZoteroPaths } from "../zotero-utils/get-zotero-attachments";
import { FileItem } from "./file-item";
import { CardItem } from "./card-item";
import { replaceWikiCitations } from '../../writing-plan/utils/replace-wiki-citations';

export enum NotesActionType {
        InsertIntoDocument = 'Insert into Current Document',
        GenerateDocuments = 'Generate Documents',
}

export enum GenerateDocumenType {
        ReadingReport = 'Reading Report',
}

export enum fileSourceType {
        FOLDERS = 'Folders',
        ZOTERO = 'Zotero'
}

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function extractPdfCards(context: ExtensionContext) {
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

        // const actionGroups: QuickPickItem[] = [
        //         'Extract Pdf Pages'
        // ]
        //         .map(label => ({ label }));
        const fileSources: QuickPickItem[] = [
                fileSourceType.FOLDERS.toString(),
                fileSourceType.ZOTERO.toString()
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
                name: string;
                runtime: QuickPickItem;
        }

        async function collectInputs() {
                const state = {} as Partial<State>;
                await MultiStepInput.run((input) => pickFileSources(input, state));
                return state as State;
        }

        const title = "Extract Pdf";

        async function pickFileSources(input: MultiStepInput, state: Partial<State>) {
                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Files to Extract",
                        items: fileSources,
                        activeItem:
                                typeof state.fileItem !== "string" ? state.fileItem : undefined,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });

                state.fileItems = [];
                switch (pick.label) {
                        case fileSourceType.FOLDERS:

                                state.fileItems = await getSortedFilesFromPdfFoldersByModifiedDates();
                                break;
                        case fileSourceType.ZOTERO:
                                try {

                                        state.fileItems = (await getSelectedZoteroPaths())
                                                .filter(filePath => filePath && filePath.toLowerCase().endsWith('.pdf'))
                                                .map(filePath => new FileItem(path.basename(filePath), filePath));
                                } catch (error: any) {
                                        // show to vscode user
                                        const errorMessage = error.message ?? 'Unknown error';
                                        window.showErrorMessage(errorMessage);
                                }
                        default:
                                break;
                }

                return (input: MultiStepInput) => pickFiles(input, state);
        }


        async function pickFiles(input: MultiStepInput, state: Partial<State>) {
                const pick = await input.showQuickPick<
                        FileItem,
                        QuickPickParameters<FileItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: `Pick Files to Extract: ${state.fileItems?.length}`,
                        items: state.fileItems ?? [],
                        activeItem:
                                typeof state.fileItem !== "string" ? state.fileItem : undefined,
                        buttons: [createResourceGroupButton],
                        shouldResume: shouldResume,
                });
                state.fileItem = pick;

                return (input: MultiStepInput) => inputPages(input, state);
        }

        async function inputPages(input: MultiStepInput, state: Partial<State>) {
                const inputPagesString = await input.showInputBox({
                        title,
                        step: 2,
                        totalSteps: 4,
                        value: typeof state.fileItem === "string" ? state.fileItem : "",
                        prompt: "Select pages to extract, default to all pages",
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
                return (input: MultiStepInput) => pickNotes(input, state);
        }

        async function pickNotes(input: MultiStepInput, state: Partial<State>) {
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
                        selectAll: true,
                }
                );
                // console.log(selectedCards);
                state.selectedCards = selectedCards.map(cardItem => cardItem.card);
                return (input: MultiStepInput) => pickNoteActions(input, state);
        }

        async function pickNoteActions(input: MultiStepInput, state: Partial<State>) {

                const notesActions: QuickPickItem[] = [
                        NotesActionType.InsertIntoDocument.toString(),
                        NotesActionType.GenerateDocuments.toString(),
                ].map(label => ({ label }));

                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Notes Actions",
                        items: notesActions,
                        activeItem: notesActions[0],
                        buttons: [],
                        shouldResume: shouldResume,
                });

                if (!state.selectedCards || state.selectedCards.length === 0) {
                        // show to vscode user
                        const errorMessage = 'No notes selected';
                        window.showErrorMessage(errorMessage);
                        return;
                }
                switch (pick.label) {
                        case NotesActionType.InsertIntoDocument:
                                window.showInformationMessage(`Inserting received '${state.selectedCards?.length}' cards\n${state.fileItem?.label ?? ''}.`);

                                cabinetNodeInstance?.addCards(state.selectedCards);
                                await insertCardCci(state.selectedCards);
                                return;

                        case NotesActionType.GenerateDocuments:
                                return (input: MultiStepInput) => pickGenerateDocumentType(input, state);
                }
        }

        async function pickGenerateDocumentType(input: MultiStepInput, state: Partial<State>) {
                if (!state.selectedCards || state.selectedCards.length === 0) {
                        // show to vscode user
                        const errorMessage = 'No notes selected';
                        window.showErrorMessage(errorMessage);
                }
                const generateDocumentTypes: QuickPickItem[] = [
                        GenerateDocumenType.ReadingReport.toString()
                ].map(label => ({ label }));

                const pick = await input.showQuickPick<
                        QuickPickItem,
                        QuickPickParameters<QuickPickItem>
                >({
                        title,
                        step: 1,
                        totalSteps: 3,
                        placeholder: "Pick Type of Document to Generate from the Notes",
                        items: generateDocumentTypes,
                        activeItem: generateDocumentTypes[0],
                        buttons: [],
                        shouldResume: shouldResume,
                });

                switch (pick.label) {
                        case GenerateDocumenType.ReadingReport:
                                // show to vscode user
                                const exporter = new CardExporter();
                                const selectedNotes = state.selectedCards;
                                if (!selectedNotes || selectedNotes.length === 0) {
                                        // show to vscode user
                                        const errorMessage = 'No notes selected';
                                        window.showErrorMessage(errorMessage);
                                        return;
                                }
                                // add only those cards needed for the report to local cabinet storage
                                const reportCards = CardExporterUtils.getAllReportCards(selectedNotes);
                                cabinetNodeInstance?.addCards(reportCards);

                                console.log("About to generate reading reports on selected notes", selectedNotes);
                                // generate the report
                                try {
                                        const result = exporter.readingReport(selectedNotes, {
                                                tags: [
                                                        "reading-notes",
                                                        "research"
                                                ]
                                        });
                                        // insert result into current document
                                        const documentTitleArray = selectedNotes[0].source?.fileName?.split('.');
                                        documentTitleArray?.pop();
                                        const documentTitle = documentTitleArray?.join('.');
                                        // write the report to a new file with .mdc extension to the current folder, using the document title extracted from the first card fed into it.

                                        // save to the current active workspace fold
                                        const currentActiveDocumentPath = window.activeTextEditor?.document.uri.fsPath;

                                        if (currentActiveDocumentPath) {
                                                const currentActiveFolderPath = path.dirname(currentActiveDocumentPath);
                                                const mdcFilePath = path.join(currentActiveFolderPath, `${documentTitle}.mdc`);
                                                fs.writeFileSync(mdcFilePath, result);
                                                window.showInformationMessage(`Generated reading report for '${selectedNotes.length}' notes\n${documentTitle}.`);

                                                const processedWikiMd = await replaceWikiCitations(result);
                                                // write md to the same folder as the mdc file
                                                const mdFilePath = path.join(currentActiveFolderPath, `${documentTitle}.md`);
                                                fs.writeFileSync(
                                                        mdFilePath,
                                                        processedWikiMd
                                                );
                                                window.showInformationMessage(`Processed Reading Report for Wiki Js for ${documentTitle}.`);
                                                return;
                                        } else {
                                                window.showErrorMessage(`No active workspace folder found to save reading report.`);
                                                return;
                                        }

                                } catch (error) {
                                        console.error(error);
                                }
                                break;

                        default:
                                break;
                }
        }

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

        async function getAvailableRuntimes(
                resourceGroup: QuickPickItem | string,
                token?: CancellationToken
        ): Promise<QuickPickItem[]> {
                // ...retrieve...
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return ["Node 8.9", "Node 6.11", "Node 4.5"].map((label) => ({ label }));
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
        activeItem?: T;
        placeholder: string;
        selectAll?: boolean;
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
