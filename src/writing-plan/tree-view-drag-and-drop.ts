import * as vscode from 'vscode';
import { CardTreeItem, SectionTreeItem, WritingPlanTreeItem } from './entities/section-item';
import { InsertRelation, moveSections } from './utils/move-sections';
import { getCurrentPlan, refreshCurrentPlan } from './writing-plan-instance';

export class TestViewDragAndDrop implements vscode.TreeDataProvider<WritingPlanTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<WritingPlanTreeItem[] | undefined> = new vscode.EventEmitter<WritingPlanTreeItem[] | undefined>();
    // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
    public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    // Keep track of any SectionItems we create so that we can re-use the same objects.

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

    public getTreeItem(element: WritingPlanTreeItem): vscode.TreeItem {
        return element;
    }

    public getParent(element: WritingPlanTreeItem): WritingPlanTreeItem | null {
        return getSectionItemParent(element);
    }

    dispose(): void {
        // nothing to dispose
    }

    // Drag and drop controller

    // public async handleDrop(sources: any, target: SectionItem, token: vscode.CancellationToken) {
    //     const transferItem = sources.get('application/vnd.code.tree.testViewDragAndDrop');
    //     console.log('target', target);
    //     console.log('sources', transferItem);
    //     if (!transferItem) {
    //         return;
    //     }
    // }

    // public async handleDrag(source: SectionItem[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken)
    // // Thenable<TreeDataTransfer<TreeDataTransferItem>>
    // {
    //     // const transfer = new TreeDataTransfer<TreeDataTransferItem>();
    //     treeDataTransfer.set('application/vnd.code.tree.testViewDragAndDrop', new vscode.DataTransferItem(source));
    //     console.log('dragging', transfer);
    //     // return Promise.resolve(transfer);
    // }

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
            this.refresh();
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
            this.refresh();
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

        const section = currentPlan.getParentSection(sectionItem.section.id);

        return section ? SectionTreeItem.fromSection(section) : null;
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

        const section = currentPlan.getSectionChildren(sectionItem.section.id);
        allChildren.push(...SectionTreeItem.fromSections(section));

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
    return SectionTreeItem.fromSections(currentPlan.sections).filter(sectionItem => sectionItem.section.parentId === null);
};
