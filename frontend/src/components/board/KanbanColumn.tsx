import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import type { Application } from '../../api/applications';

interface Props {
  id: string;
  title: string;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

const KanbanColumn = ({ id, title, applications, onCardClick }: Props) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  return (
    <div className="flex flex-col w-[320px] shrink-0 mx-3">
      <div className="flex items-center justify-between mb-4 px-3 py-2 bg-surface/50 rounded-xl border border-light-border/5 shadow-sm">
        <h2 className="font-semibold text-foreground text-sm tracking-wide">{title}</h2>
        <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium text-stale">
          {applications.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 bg-surface/30 rounded-2xl p-3 flex flex-col gap-3 min-h-[150px] border border-light-border/5"
      >
        <SortableContext items={applications.map(app => app._id)} strategy={verticalListSortingStrategy}>
          {applications.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-light-border/10 rounded-xl p-6 text-center text-sm text-stale">
              Drop here or add applications
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
};

export default KanbanColumn;
