import { GroupNode, PageDocument, PageNode, PageSection } from './schemas';

export const MAX_GROUP_DEPTH = 4;

export function findNode(nodes: PageNode[], id: string): PageNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (isGroup(node)) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
}

export function isGroup(node: PageNode): node is GroupNode {
  return 'kind' in node && node.kind === 'group';
}

export function getNodeDepth(nodes: PageNode[], id: string, groupDepth = 0): number | undefined {
  for (const node of nodes) {
    const nodeDepth = groupDepth + (isGroup(node) ? 1 : 0);
    if (node.id === id) return nodeDepth;
    if (isGroup(node)) {
      const found = getNodeDepth(node.children, id, nodeDepth);
      if (found !== undefined) return found;
    }
  }
}

function findParentList(nodes: PageNode[], parentId?: string): PageNode[] | undefined {
  if (!parentId) return nodes;
  for (const node of nodes) {
    if (node.id === parentId && isGroup(node)) return node.children;
    if (isGroup(node)) {
      const found = findParentList(node.children, parentId);
      if (found) return found;
    }
  }
}

function findNodeLocation(nodes: PageNode[], id: string, parentId?: string): { parentId?: string; index: number } | undefined {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.id === id) return { parentId, index };
    if (isGroup(node)) {
      const found = findNodeLocation(node.children, id, node.id);
      if (found) return found;
    }
  }
}

export function findNodeParentId(nodes: PageNode[], id: string, parentId?: string): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return parentId;
    if (isGroup(node)) {
      const found = findNodeParentId(node.children, id, node.id);
      if (found !== undefined) return found;
    }
  }
}

function mapNodes(nodes: PageNode[], id: string, update: (node: PageNode) => PageNode): PageNode[] {
  return nodes.map(node => {
    if (node.id === id) return update(node);
    if (isGroup(node)) return { ...node, children: mapNodes(node.children, id, update) };
    return node;
  });
}

function removeFromNodes(nodes: PageNode[], id: string): { nodes: PageNode[]; removed?: PageNode } {
  const direct = nodes.find(node => node.id === id);
  if (direct) return { nodes: nodes.filter(node => node.id !== id), removed: direct };
  let removed: PageNode | undefined;
  const next = nodes.map(node => {
    if (!isGroup(node) || removed) return node;
    const result = removeFromNodes(node.children, id);
    removed = result.removed;
    return result.removed ? { ...node, children: result.nodes } : node;
  });
  return { nodes: next, removed };
}

function maxNestedGroupDepth(node: PageNode): number {
  if (!isGroup(node)) return 0;
  return 1 + Math.max(0, ...node.children.map(maxNestedGroupDepth));
}

function newId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function cloneWithNewIds(node: PageNode): PageNode {
  if (!isGroup(node)) return { ...JSON.parse(JSON.stringify(node)), id: newId() } as PageSection;
  return { ...node, id: newId(), children: node.children.map(cloneWithNewIds) };
}

export function insertNode(doc: PageDocument, node: PageNode, parentId?: string, index?: number): PageDocument {
  const target = findParentList(doc.sections, parentId);
  if (!target || (parentId && getNodeDepth(doc.sections, parentId) === undefined)) return doc;
  const parentDepth = parentId ? getNodeDepth(doc.sections, parentId) ?? 0 : 0;
  if (parentDepth + maxNestedGroupDepth(node) > MAX_GROUP_DEPTH) return doc;
  const insertionIndex = typeof index === 'number' ? Math.max(0, Math.min(index, target.length)) : target.length;
  const next = [...target];
  next.splice(insertionIndex, 0, node);
  if (!parentId) return { ...doc, sections: next };
  return { ...doc, sections: mapNodes(doc.sections, parentId, parent => isGroup(parent) ? { ...parent, children: next } : parent) };
}

export function moveNode(doc: PageDocument, id: string, targetParentId?: string, targetIndex?: number): PageDocument {
  const node = findNode(doc.sections, id);
  const sourceLocation = findNodeLocation(doc.sections, id);
  if (!node || id === targetParentId) return doc;
  if (targetParentId && isDescendant(doc.sections, id, targetParentId)) return doc;
  const removed = removeFromNodes(doc.sections, id);
  if (!removed.removed) return doc;
  const target = findParentList(removed.nodes, targetParentId);
  if (!target) return doc;
  const parentDepth = targetParentId ? getNodeDepth(removed.nodes, targetParentId) ?? 0 : 0;
  if (parentDepth + maxNestedGroupDepth(removed.removed) > MAX_GROUP_DEPTH) return doc;
  let requestedIndex = typeof targetIndex === 'number' ? targetIndex : target.length;
  if (sourceLocation && sourceLocation.parentId === targetParentId && sourceLocation.index < requestedIndex) requestedIndex--;
  const index = Math.max(0, Math.min(requestedIndex, target.length));
  const next = [...target];
  next.splice(index, 0, removed.removed);
  if (!targetParentId) return { ...doc, sections: next };
  return { ...doc, sections: mapNodes(removed.nodes, targetParentId, parent => isGroup(parent) ? { ...parent, children: next } : parent) };
}

function isDescendant(nodes: PageNode[], parentId: string, candidateId: string): boolean {
  const parent = findNode(nodes, parentId);
  return !!parent && isGroup(parent) && !!findNode(parent.children, candidateId);
}

export function addSection(doc: PageDocument, section: PageSection, index?: number): PageDocument {
  return insertNode(doc, section, undefined, index);
}

export function addNodeToGroup(doc: PageDocument, node: PageNode, groupId: string): PageDocument {
  return insertNode(doc, node, groupId);
}

export function removeSection(doc: PageDocument, sectionId: string): PageDocument {
  return { ...doc, sections: removeFromNodes(doc.sections, sectionId).nodes };
}

export function moveSection(doc: PageDocument, fromIndex: number, toIndex: number): PageDocument {
  if (fromIndex < 0 || fromIndex >= doc.sections.length || toIndex < 0 || toIndex >= doc.sections.length) return doc;
  const next = [...doc.sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return { ...doc, sections: next };
}

export function updateSection(doc: PageDocument, sectionId: string, updates: Partial<PageSection>): PageDocument {
  return updateNode(doc, sectionId, updates as Partial<PageNode>);
}

export function updateNode(doc: PageDocument, id: string, updates: Partial<PageNode>): PageDocument {
  return { ...doc, sections: mapNodes(doc.sections, id, node => ({ ...node, ...updates } as PageNode)) };
}

export function duplicateSection(doc: PageDocument, id: string): PageDocument {
  return duplicateNode(doc, id);
}

export function duplicateNode(doc: PageDocument, id: string): PageDocument {
  const flattened = flattenNodeSiblings(doc.sections);
  const target = flattened.find(({ node }) => node.id === id);
  if (!target) return doc;
  return insertNode(doc, cloneWithNewIds(target.node), target.parentId, target.index + 1);
}

function flattenNodeSiblings(nodes: PageNode[], parentId?: string): { node: PageNode; parentId?: string; index: number }[] {
  return nodes.flatMap((node, index) => [
    { node, parentId, index },
    ...(isGroup(node) ? flattenNodeSiblings(node.children, node.id) : []),
  ]);
}

export function toggleSectionVisibility(doc: PageDocument, id: string): PageDocument {
  const node = findNode(doc.sections, id);
  if (!node || isGroup(node)) return doc;
  return updateNode(doc, id, { isHidden: !node.isHidden });
}
