import { Range, window } from "vscode";
import { SectionTreeParseError, WritingPlan } from "writing-plan";
import { WritingPlanOptions } from "writing-plan/build/main/lib/entities/writing-plan-options";
import { Section } from "writing-plan/build/main/lib/section";

export const writingPlans: (WritingPlan | null)[] = [];
export const writingPlanStatus = {
    enabled: false,
}

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


export const refreshCurrentPlan = (documentText?: string) => {
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

    } catch (e: any) {
        // if it's section tree error
        if (e instanceof SectionTreeParseError) {
            window.showErrorMessage(`Error parsing writing plan: ${e.message} on line ${e.errorMarker}`);
        }
        writingPlans[0] = null;
        // show error message to vscode

    }
}