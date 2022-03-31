import * as vscode from 'vscode';
import { CardTreeItem, SectionTreeItem, WritingPlanTreeItem } from './entities/section-item';
import { InsertRelation, moveSections } from './utils/move-sections';
import { allCurrentSectionItems, getCurrentPlan, refreshCurrentPlan, writingPlanStatus, WritingPlanStatus } from './writing-plan-instance';

export class WritingPlanOutlineTree implements vscode.TreeDataProvider<WritingPlanTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<WritingPlanTreeItem[] | undefined> = new vscode.EventEmitter<WritingPlanTreeItem[] | undefined>();
    // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
    public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    // Keep track of any SectionItems we create so that we can re-use the same objects.
    treeView: vscode.TreeView<WritingPlanTreeItem>;

    constructor(context: vscode.ExtensionContext) {

        const view = vscode.window.createTreeView('writing-outline', {
            treeDataProvider: this,
            showCollapseAll: true,
            canSelectMany: true,

            // dragAndDropController: this 
        });
        context.subscriptions.push(view);
        vscode.commands.registerCommand("writing-plan.outline.refresh", () =>
            this.refresh()
        );

        this.treeView = view;

        writingPlanStatus.listener.event(this.writingPlanStatusHandler);
    }

    writingPlanStatusHandler(status: WritingPlanStatus): void {
        console.log('writing plan status changed, tree items:', this.getChildren());
        switch (status) {
            case WritingPlanStatus.refreshed:
                this.refresh();
                break;
            case WritingPlanStatus.shutdown:
                this.refresh();
                break;
        }
    }



    // Tree data provider 
    public getChildren(sectionItem?: WritingPlanTreeItem): WritingPlanTreeItem[] {
        if (sectionItem) {
            return getSectionItemChildren(sectionItem);
        } else {
            return getRootSectionItems();
        }

    }


    refresh(): void {
        console.log('refreshing')
        this._onDidChangeTreeData.fire(undefined);
    }

    public getTreeItem(element: WritingPlanTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getParent(element: WritingPlanTreeItem): WritingPlanTreeItem | null {
        return getSectionItemParent(element);
    }
    // getParent() {
    //     return null;
    // }

    // public getParent(element: WritingPlanTreeItem): WritingPlanTreeItem | null {
    //     return getSectionItemParent(element);
    // }


    dispose(): void {
        // nothing to dispose
        this.treeView.dispose();
    }

    moveSectionUp = async (sectionItem: SectionTreeItem) => {
        const currentPlan = getCurrentPlan();
        if (currentPlan === null) {
            return;
        }
        const sectionToMove = sectionItem.section;
        const sectionToMoveTo = currentPlan.getPreviousSiblingSection(sectionToMove.id);
        if (sectionToMoveTo) {
            await moveSections(sectionToMove, sectionToMoveTo, InsertRelation.Before);
            refreshCurrentPlan();
        } else {
            // console.log('Section already on top');
            // show information message
            vscode.window.showInformationMessage('Section already on top');
        }
    };

    moveSectionDown = async (sectionItem: SectionTreeItem) => {
        const currentPlan = getCurrentPlan();
        if (currentPlan === null) {
            return;
        }
        const sectionToMove = sectionItem.section;
        const sectionToMoveTo = currentPlan.getNextSiblingSection(sectionToMove.id);
        if (sectionToMoveTo) {
            await moveSections(sectionToMove, sectionToMoveTo, InsertRelation.After);
            refreshCurrentPlan();
        } else {
            // console.log('Section already on top');
            // show information message
            vscode.window.showInformationMessage('Section already on level bottom');
        }
    };
}

// helper functions
const getSectionItemParent = (sectionItem: WritingPlanTreeItem): WritingPlanTreeItem | null => {

    const currentPlan = getCurrentPlan();
    if (currentPlan === null) {
        return null;
    }
    if (sectionItem instanceof SectionTreeItem) {

        const section = allCurrentSectionItems.find(s => s.section.id === sectionItem.section.parentId);

        return section ?? null;
    }

    return null;
};

const getSectionItemChildren = (sectionItem: WritingPlanTreeItem): WritingPlanTreeItem[] => {
    const currentPlan = getCurrentPlan();
    if (currentPlan === null) {
        return [];
    }
    const allChildren: WritingPlanTreeItem[] = [];
    if (sectionItem instanceof SectionTreeItem) {

        const sections = allCurrentSectionItems.filter(s => s.section.parentId === sectionItem.section.id);
        allChildren.push(...sections);

        if (sectionItem.hasCards) {
            allChildren.push(...sectionItem.cardItems);
        }
    }

    return allChildren;
};

const getRootSectionItems = (): WritingPlanTreeItem[] => {
    const currentPlan = getCurrentPlan();
    if (currentPlan === null) {
        return [];
    }
    // I need to convert all sections to section items first so that I can calculate cards among them, such as adding children section's cards to parent sections. And then filter out the children. This might be expensive, and could be optimized later.
    return allCurrentSectionItems.filter(sectionItem => sectionItem.section.parentId === null);
};



