import { commands, Disposable, EventEmitter, Range, window } from "vscode";
import { SectionTreeParseError, WritingPlan } from "writing-plan";
import { WritingPlanOptions } from "writing-plan/build/main/lib/entities/writing-plan-options";
import { Section } from "writing-plan/build/main/lib/section";
import { SectionTreeItem } from "./entities/section-item";
import { globalWritingPlanDisposables } from "./register-writing-plan";

export class WritingPlanInstance implements Disposable {

    private _allCurrentSectionItems: SectionTreeItem[] = [];
    public get allCurrentSectionItems(): SectionTreeItem[] {
        return this._allCurrentSectionItems;
    }

    private set allCurrentSectionItems(value: SectionTreeItem[]) {
        this._allCurrentSectionItems = value ?? [];
    };


    constructor(writingPlanOptions?: WritingPlanOptions) {
        writingPlanOptions ? this.defaultWritingPlanOptions = writingPlanOptions : null;
        this.writingPlanStatus.listener.event(this.updateSectionItems.bind(this));
    }
    dispose() {
        this.writingPlanStatus.listener.dispose();
    }

    writingPlans: (WritingPlan | null)[] = [];

    writingPlanStatus = {
        enabled: false,
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
            return this.writingPlans[0];
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