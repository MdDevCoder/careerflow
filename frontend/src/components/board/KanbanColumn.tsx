import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import type { Application } from '../../api/applications';

interface Props {
  id: string;
  title: string;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

const KanbanColumn = memo(({ id, title, applications, onCardClick }: Props) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  return (
    <div className="flex flex-col w-[320px] shrink-0 mx-3 h-full max-h-full">
      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-surface-elevated/50 rounded-xl border border-border shadow-sm">
        <h2 className="font-semibold text-foreground text-sm tracking-wide">{title}</h2>
        <span className="bg-surface-elevated border border-border px-2.5 py-0.5 rounded-full text-xs font-medium text-muted">
          {applications.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 bg-surface-elevated/30 rounded-2xl p-3 flex flex-col gap-3 min-h-[150px] border border-border/30 overflow-y-auto"
      >
        <SortableContext items={applications.map(app => app._id)} strategy={verticalListSortingStrategy}>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] rounded-xl border-2 border-dashed border-border/50 bg-surface/30 p-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated border border-border shadow-sm">
                <Plus size={16} className="text-muted" />
              </div>
              <p className="text-xs font-medium text-foreground/80 mb-1 tracking-wide">Empty column</p>
              <p className="text-[10px] text-muted leading-relaxed max-w-[150px]">Drag and drop applications here</p>
            </div>
          ) : (
            applications.map(app => (
              <KanbanCard key={app._id} application={app} onClick={onCardClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
});

export default KanbanColumn;
