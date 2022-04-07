import { commands, Disposable, EventEmitter, Range, Selection, window } from "vscode";
import { SectionTreeParseError, WritingPlan } from "writing-plan";
import { WritingPlanOptions } from "writing-plan/build/main/lib/entities/writing-plan-options";
import { Section } from "writing-plan/build/main/lib/section";
import { SectionTreeItem } from "./entities/writing-plan-tree-item";
import { globalWritingPlanDisposables } from "./register-writing-plan";
import { unselectAll } from "./utils/unselect-all";

export class WritingPlanInstance implements Disposable {

    private _allCurrentSectionItems: SectionTreeItem[] = [];
    public get allCurrentSectionItems(): SectionTreeItem[] {
        return this._allCurrentSectionItems;
    }

    private set allCurrentSectionItems(value: SectionTreeItem[]) {
        this._allCurrentSectionItems = value ?? [];
    };

    async commentAllSectionMarkers() {
        const plan = this.getCurrentPlan();
        if (!plan) {
            return;
        }
        // use vscode api to comment a line
        const lines: number[] = plan.sections.flatMap(section => [section.markerOpenLine, section.markerCloseLine]);
        // select all the lines

        if (lines) {
            const ranges = lines.map(line => new Range(line, 0, line, 0));
            ranges.forEach(range => {
                // check if the line has been commented
            })
            const editor = window.activeTextEditor;
            if (editor) {
                editor.selections = ranges.map(range => new Selection(range.start, range.end));
                // comment the lines
                await commands.executeCommand('editor.action.commentLine');
                // cancel vs code multi-cursor selection
                unselectAll();

            }
        }
    }

    uncommentAllSectionMarkers() {
        const plan = this.getCurrentPlan();
        if (!plan) {
            return;
        }
        // use vscode api to comment a line
        const lines: number[] = plan.sections.flatMap(section => [section.markerOpenLine, section.markerCloseLine]);
        // select all the lines
        if (lines) {
            const ranges = lines.map(line => new Range(line, 0, line, 0));
            const editor = window.activeTextEditor;
            if (editor) {
                editor.selections = ranges.map(range => new Selection(range.start, range.end));
                // comment the lines
                commands.executeCommand('editor.action.removeCommentLine');
            }
        }
    }

    constructor(writingPlanOptions?: WritingPlanOptions) {
        writingPlanOptions ? this.defaultWritingPlanOptions = writingPlanOptions : null;
        this.writingPlanStatus.listener.event(this.updateSectionItems.bind(this));
    }
    dispose() {
        this.writingPlanStatus.listener.dispose();
    }

    writingPlans: (WritingPlan | null)[] = [];

    /**
     * the single source of truth for the current writing plan
     */
    writingPlanStatus = {
        enabled: false,
        /**
         * The single source of truth for the current writing plan's status, those actions to take when the writing plan changes should subscribe to this event.
         */
        listener: new EventEmitter<WritingPlanStatus>(),
    };

    defaultWritingPlanOptions: WritingPlanOptions = new WritingPlanOptions(
        {
            excludedStatsPatterns: new Set(['{{.*?}}']),
        }

    );
    getSectionById = (id: string): Section | null => {


        return this.getCurrentPlan()?.sections.find(section => section.id === id) ?? null;
    };

    getSectionByRange = (range: Range): Section | null => {

        return this.getCurrentPlan()?.getSectionByMarker(range.start.line, range.start.character, (range.end.character - range.start.character)) ?? null;
    }

    getSectionParent = (sectionId: string): Section | null => {
        return this.getCurrentPlan()?.getParentSection(sectionId) ?? null;
    }

    getCurrentPlan = (): WritingPlan | null => {
        if (!this.writingPlanStatus.enabled) {
            return null;
        }

        if (this.writingPlans[0] !== null) {
            return this.writingPlans[0] && this.writingPlans[0].hasPlan() ? this.writingPlans[0] : null;
        }
        return null;
    }

    updateSectionItems = (): void => {
        const currentPlan = this.getCurrentPlan();
        if (currentPlan && currentPlan.sections) {
            this.allCurrentSectionItems = SectionTreeItem.fromSections(currentPlan.sections) ?? [];
        }
    };
    // listen to writing plan status

    announceWritingPlanStatusUpdate = (status?: WritingPlanStatus): void => {
        this.writingPlanStatus.listener.fire(status ?? WritingPlanStatus.refreshed);
    };


    refreshCurrentPlan = (documentText?: string) => {
        if (!this.writingPlanStatus.enabled) {
            return;
        }
        try {

            if (!documentText) {

                const editor = window.activeTextEditor;
                if (!editor) {
                    return;
                }
                documentText = editor.document.getText();

                this.writingPlans[0] = new WritingPlan(documentText, this.defaultWritingPlanOptions);
            } else {
                this.writingPlans[0] = new WritingPlan(documentText, this.defaultWritingPlanOptions);
            }

            // notify the writing plan status so others subscribe to this event can update accordingly
            this.announceWritingPlanStatusUpdate();

        } catch (e: any) {
            // if it's section tree error
            if (e instanceof SectionTreeParseError) {
                window.showErrorMessage(`Error parsing writing plan: ${e.message} on line ${e.errorMarker}`);
            }
            this.writingPlans[0] = null;
            this.announceWritingPlanStatusUpdate();
        }
    }


}
export enum WritingPlanStatus {
    refreshed = 'refreshed',
    shutdown = 'shutdown',
}

export const writingPlanInstance = new WritingPlanInstance();