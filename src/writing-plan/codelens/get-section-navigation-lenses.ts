import { CodeLens, Range } from "vscode";
import { Section } from "writing-plan/build/main/lib/section";
import { writingPlanInstance } from "../writing-plan-instance";

export const getNavigationCodeLenses = (range: Range, section: Section): CodeLens[] => {

    const lenses: CodeLens[] = [];
    const plan = writingPlanInstance.getCurrentPlan();

    if (!plan) {
        return [];
    }


    const currentSectionId = section.id;
    const parentSection = plan.getParentSection(currentSectionId);
    if (parentSection) {
        lenses.push(new CodeLens(range, {
            title: ` ← `,
            tooltip: `Jump to parent section`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                parentSection?.markerOpenLine,
            ]
        }));
    }

    const previousSiblingSection = plan.getPreviousSiblingSection(currentSectionId);
    if (previousSiblingSection) {
        lenses.push(new CodeLens(range, {
            title: ` ⇈ `,
            tooltip: `Jump to previous sibling section`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                previousSiblingSection?.markerOpenLine,
            ]
        }));
    }

    const previousSection = plan.getPreviousSection(currentSectionId);
    if (previousSection) {
        lenses.push(new CodeLens(range, {
            title: ` ↥ `,
            tooltip: `Jump to previous section`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                previousSection?.markerOpenLine,
            ]
        }));
    }

    const nextSection = plan.getNextSection(currentSectionId);
    if (nextSection) {
        lenses.push(new CodeLens(range, {
            title: ` ↧ `,
            tooltip: `Jump to next section`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                nextSection?.markerOpenLine,
            ]
        }));
    }
    // if there is a next sibling prefer that over next child
    const nextSiblingSection = plan.getNextSiblingSection(currentSectionId);
    if (nextSiblingSection) {
        lenses.push(new CodeLens(range, {
            title: ` ⇊ `,
            tooltip: `Jump to next sibling section ${nextSiblingSection.title}`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                nextSiblingSection?.markerOpenLine,
            ]
        }));
    }

    const childSection = plan.getNextChildSection(currentSectionId);
    if (childSection) {
        lenses.push(new CodeLens(range, {
            title: ` → `,
            tooltip: `Jump to child section`,
            command: 'cabinetplugin.writing-plan.goToLine',
            arguments: [
                childSection?.markerOpenLine,
            ]
        }));
    }


    return lenses;
}