import React, { useState } from 'react';
import { PageNode, SectionType } from '@/lib/page-engine/schemas';
import { ComponentRegistry } from '@/lib/page-engine/registry';
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, FolderPlus, GripVertical, Layers, Trash } from 'lucide-react';
import { findNode, isGroup } from '@/lib/page-engine/operations';

type TreeProps = {
  nodes: PageNode[];
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, parentId: string | undefined, index: number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHide: (id: string) => void;
  onAddGroup: (parentId?: string) => void;
  onAddComponent: (parentId?: string) => void;
};

type DropHint = { kind: 'sibling' | 'inside' | 'root'; nodeId?: string; side?: 'before' | 'after' } | null;
type TreeInteraction = { rootNodes: PageNode[]; draggingId: string | null; dropHint: DropHint; setDraggingId: (id: string | null) => void; setDropHint: (hint: DropHint) => void };

function preventDrop(event: React.DragEvent) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function nodeLabel(node: PageNode) {
  return isGroup(node) ? node.name || 'Layout Group' : ComponentRegistry[node.type as SectionType]?.label || node.type;
}

function TreeRows({ nodes, parentId, depth, ...props }: TreeProps & TreeInteraction & { parentId?: string; depth: number }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-1.5">
      {nodes.map((node, index) => {
        const group = isGroup(node);
        const isSelected = props.selectedNodeId === node.id;
        const isCollapsed = !!collapsed[node.id];
        const isDropBefore = props.dropHint?.kind === 'sibling' && props.dropHint.nodeId === node.id && props.dropHint.side === 'before';
        const isDropAfter = props.dropHint?.kind === 'sibling' && props.dropHint.nodeId === node.id && props.dropHint.side === 'after';
        return (
          <div key={node.id}>
            <div
              draggable
              onDragStart={event => { event.dataTransfer.setData('text/smart-page-node', node.id); event.dataTransfer.effectAllowed = 'move'; props.setDraggingId(node.id); }}
              onDragEnd={() => { props.setDraggingId(null); props.setDropHint(null); }}
              onDragOver={event => {
                preventDrop(event);
                event.stopPropagation();
                if (!props.draggingId || props.draggingId === node.id) return;
                const draggedNode = findNode(props.rootNodes, props.draggingId);
                if (draggedNode && isGroup(draggedNode) && findNode(draggedNode.children, node.id)) return;
                const rect = event.currentTarget.getBoundingClientRect();
                props.setDropHint({ kind: 'sibling', nodeId: node.id, side: event.clientY > rect.top + rect.height / 2 ? 'after' : 'before' });
              }}
              onDrop={event => {
                event.preventDefault();
                event.stopPropagation();
                const draggedId = event.dataTransfer.getData('text/smart-page-node');
                if (!draggedId || draggedId === node.id) return;
                const after = event.clientY > event.currentTarget.getBoundingClientRect().top + event.currentTarget.getBoundingClientRect().height / 2;
                props.onMove(draggedId, parentId, index + (after ? 1 : 0));
                props.setDropHint(null);
              }}
              className={`relative rounded-lg border transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : group ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-slate-300'} ${!group && node.isHidden ? 'opacity-50' : ''}`}
              style={{ marginLeft: depth * 12 }}
            >
              {isDropBefore && <div className="pointer-events-none absolute -top-1 left-1 right-1 z-10 h-1 rounded-full bg-blue-500 shadow-[0_0_0_2px_white]" />}
              <div className="flex min-h-10 items-center gap-1.5 px-2">
                {group ? (
                  <button onClick={() => setCollapsed(prev => ({ ...prev, [node.id]: !prev[node.id] }))} className="p-0.5 text-slate-400" aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}>
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                ) : null}
                <GripVertical className="h-4 w-4 cursor-grab text-slate-400" />
                <div className="flex-1 cursor-pointer truncate py-1 text-sm font-medium" onClick={() => props.onSelect(node.id)}>
                  <span className="mr-1.5 inline-flex align-middle text-slate-400">{group ? <Layers className="h-3.5 w-3.5" /> : null}</span>
                  {nodeLabel(node)}
                  {group && <span className="ml-1 text-[10px] font-normal text-slate-400">{node.children.length}</span>}
                </div>
                {group && depth < 3 && (
                  <button onClick={() => props.onAddGroup(node.id)} title="Add nested group" className="p-1 text-slate-400 hover:text-blue-500"><FolderPlus className="h-3.5 w-3.5" /></button>
                )}
                {group && <button onClick={() => props.onAddComponent(node.id)} title="Add component to this group" className="p-1 text-slate-400 hover:text-blue-500"><span className="text-sm font-bold leading-none">+</span></button>}
                {!group && <button onClick={() => props.onToggleHide(node.id)} className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white" title={node.isHidden ? 'Show' : 'Hide'}>{node.isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>}
                <button onClick={() => props.onDuplicate(node.id)} title="Duplicate" className="p-1 text-slate-400 hover:text-blue-500"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => props.onRemove(node.id)} title="Delete" className="p-1 text-red-400 hover:text-red-600"><Trash className="h-3.5 w-3.5" /></button>
              </div>
              {isDropAfter && <div className="pointer-events-none absolute -bottom-1 left-1 right-1 z-10 h-1 rounded-full bg-blue-500 shadow-[0_0_0_2px_white]" />}
            </div>
            {group && !isCollapsed && (
              <div
                onDragOver={event => {
                  preventDrop(event);
                  event.stopPropagation();
                  if (!props.draggingId || props.draggingId === node.id) return;
                  const draggedNode = findNode(props.rootNodes, props.draggingId);
                  if (draggedNode && isGroup(draggedNode) && findNode(draggedNode.children, node.id)) return;
                  props.setDropHint({ kind: 'inside', nodeId: node.id });
                }}
                onDrop={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  const draggedId = event.dataTransfer.getData('text/smart-page-node');
                  const draggedNode = draggedId ? findNode(props.rootNodes, draggedId) : undefined;
                  if (draggedId && draggedId !== node.id && !(draggedNode && isGroup(draggedNode) && findNode(draggedNode.children, node.id))) props.onMove(draggedId, node.id, node.children.length);
                  props.setDropHint(null);
                }}
                className={`ml-3 mt-1 rounded-md border-l pl-2 transition-colors dark:border-slate-700 ${node.children.length ? 'pb-1 pt-1' : 'min-h-8 border border-dashed py-2 text-center text-[10px]'} ${props.dropHint?.kind === 'inside' && props.dropHint.nodeId === node.id ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-300 dark:bg-blue-950/50 dark:text-blue-300' : 'border-slate-200 text-slate-400 dark:border-slate-700'}`}
              >
                {node.children.length ? (
                  <TreeRows nodes={node.children} parentId={node.id} depth={depth + 1} {...props} />
                ) : props.dropHint?.kind === 'inside' && props.dropHint.nodeId === node.id ? 'Release to add to this group' : 'Drop items here'}
                {node.children.length > 0 && props.dropHint?.kind === 'inside' && props.dropHint.nodeId === node.id && <div className="py-1 text-center text-[10px] font-semibold text-blue-600 dark:text-blue-300">Release to move inside this group</div>}
              </div>
            )}
          </div>
        );
      })}
      {depth === 0 && (
        <div
          onDragOver={event => { preventDrop(event); if (props.draggingId) props.setDropHint({ kind: 'root' }); }}
          onDrop={event => {
            event.preventDefault();
            const draggedId = event.dataTransfer.getData('text/smart-page-node');
            if (draggedId) props.onMove(draggedId, undefined, nodes.length);
            props.setDropHint(null);
          }}
          className={`min-h-8 rounded-md border border-dashed text-center text-[10px] transition-colors ${props.dropHint?.kind === 'root' ? 'border-blue-500 bg-blue-50 py-2 font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' : 'border-transparent text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}
        >{props.dropHint?.kind === 'root' ? 'Release to move to page level' : 'Drop here to move to page level'}</div>
      )}
    </div>
  );
}

export function DraggableSectionList(props: TreeProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<DropHint>(null);
  const { nodes, ...rest } = props;
  return <TreeRows nodes={nodes} depth={0} {...rest} rootNodes={nodes} draggingId={draggingId} dropHint={dropHint} setDraggingId={setDraggingId} setDropHint={setDropHint} />;
}
