import { commands, EventEmitter, Range, window } from "vscode";
import { SectionTreeParseError, WritingPlan } from "writing-plan";
import { WritingPlanOptions } from "writing-plan/build/main/lib/entities/writing-plan-options";
import { Section } from "writing-plan/build/main/lib/section";
import { SectionTreeItem } from "./entities/section-item";

export const writingPlans: (WritingPlan | null)[] = [];
export enum WritingPlanStatus {
    refreshed = 'refreshed',
    shutdown = 'shutdown',
}
export const writingPlanStatus = {
    enabled: false,
    listener: new EventEmitter<WritingPlanStatus>(),
};

export const cabinetWritingPlanOptions = new WritingPlanOptions(
    {
        excludedContentPatterns: new Set(['{{.*?}}']),
    }
);

export const getSectionById = (id: string): Section | null => {


    return getCurrentPlan()?.sections.find(section => section.id === id) ?? null;
};

export const getSectionByRange = (range: Range): Section | null => {

    return getCurrentPlan()?.getSectionByMarker(range.start.line, range.start.character, (range.end.character - range.start.character)) ?? null;
}

export const getSectionParent = (sectionId: string): Section | null => {
    return getCurrentPlan()?.getParentSection(sectionId) ?? null;
}

export const getCurrentPlan = (): WritingPlan | null => {
    if (!writingPlanStatus.enabled) {
        return null;
    }
    if (writingPlans[0] !== null) {
        return writingPlans[0];
    }
    return null;
}

export const updateSectionItems = (): void => {
    const currentPlan = getCurrentPlan();
    if (currentPlan && currentPlan.sections) {
        allCurrentSectionItems = SectionTreeItem.fromSections(currentPlan.sections) ?? [];
    }
};

export const refreshCurrentPlan = async (documentText?: string) => {
    if (!writingPlanStatus.enabled) {
        return;
    }
    try {

        if (!documentText) {

            const editor = window.activeTextEditor;
            if (!editor) {
                return;
            }
            documentText = editor.document.getText();

            writingPlans[0] = new WritingPlan(documentText, cabinetWritingPlanOptions);
        } else {
            writingPlans[0] = new WritingPlan(documentText, cabinetWritingPlanOptions);
        }

        // notify the writing plan status so others subscribe to this event can update accordingly
        writingPlanStatus.listener.fire(WritingPlanStatus.refreshed);
        updateSectionItems();

    } catch (e: any) {
        // if it's section tree error
        if (e instanceof SectionTreeParseError) {
            window.showErrorMessage(`Error parsing writing plan: ${e.message} on line ${e.errorMarker}`);
        }
        writingPlans[0] = null;
        writingPlanStatus.listener.fire(WritingPlanStatus.refreshed);
        updateSectionItems();
        // updateSectionItems();
        // run vscode command 
        // show error message to vscode
    }
}

export let allCurrentSectionItems: SectionTreeItem[] = [];