import { Range, window } from "vscode";
import { SectionTreeParseError, WritingPlan } from "writing-plan";
import { Section } from "writing-plan/build/main/lib/section";

export const writingPlans: (WritingPlan | null)[] = [];

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
    if (writingPlans[0] !== null) {
        return writingPlans[0];
    }
    return null;
}


export const refreshCurrentPlan = (documentText?: string) => {
    try {

        writingPlans[0] = new WritingPlan(documentText ?? (window.activeTextEditor?.document.getText() ?? ""));
    } catch (e: any) {
        // if it's section tree error
        if (e instanceof SectionTreeParseError) {
            window.showErrorMessage(`Error parsing writing plan: ${e.message} on line ${e.errorMarker}`);
        }
        writingPlans[0] = null;
        // show error message to vscode

    }
}