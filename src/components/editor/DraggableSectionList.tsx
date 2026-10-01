import React from 'react';
import { PageSection, SectionType } from '@/lib/page-engine/schemas';
import { ComponentRegistry } from '@/lib/page-engine/registry';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Eye, EyeOff, Trash, GripVertical } from 'lucide-react';

function SortableSectionItem({ 
  section, 
  isSelected, 
  onSelect, 
  onRemove, 
  onDuplicate, 
  onToggleHide 
}: { 
  section: PageSection; 
  isSelected: boolean; 
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onToggleHide: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex flex-col p-2 rounded-lg border transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'} ${section.isHidden ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 font-medium text-sm cursor-pointer py-1" onClick={onSelect}>
          {ComponentRegistry[section.type as SectionType]?.label || section.type}
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onToggleHide(); }} className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white" title={section.isHidden ? "Show" : "Hide"}>
            {section.isHidden ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 text-slate-400 hover:text-blue-500" title="Duplicate">
            <Copy className="w-4 h-4"/>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600" title="Delete">
            <Trash className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DraggableSectionList({
  sections,
  selectedSectionId,
  onSelect,
  onReorder,
  onRemove,
  onDuplicate,
  onToggleHide
}: {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: PageSection[]) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHide: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sections.map(section => (
            <SortableSectionItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSelect(section.id)}
              onRemove={() => onRemove(section.id)}
              onDuplicate={() => onDuplicate(section.id)}
              onToggleHide={() => onToggleHide(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
