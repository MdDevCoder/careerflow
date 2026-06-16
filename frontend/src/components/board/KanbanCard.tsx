import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import type { Application } from '../../api/applications';

interface Props {
  application: Application;
  onClick: (app: Application) => void;
}

const KanbanCard = ({ application, onClick }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    data: {
      type: 'Application',
      application,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MEDIUM': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'HEALTHY': return 'bg-emerald-500';
      case 'AT_RISK': return 'bg-yellow-500';
      case 'STALE': return 'bg-gray-500';
      case 'SUCCESS': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className="bg-surface border border-light-border/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-light-border/30 hover:bg-white/5 transition-all shadow-sm relative overflow-hidden group hover:-translate-y-0.5 duration-200"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${getHealthColor(application.health_score)} opacity-70`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {application.company_logo ? (
            <img src={application.company_logo} alt="logo" className="w-8 h-8 rounded-md object-cover border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-stale uppercase">
              {application.company_name.substring(0, 2)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-sm truncate max-w-[140px]">{application.company_name}</h3>
            <p className="text-xs text-stale truncate max-w-[140px]">{application.job_title}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPriorityColor(application.priority)}`}>
          {application.priority}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stale bg-white/5 px-2 py-1 rounded-md border border-white/5">
            {application.source}
          </span>
          {application.applied_date && (
            <span className="text-[10px] text-stale">
              {format(new Date(application.applied_date), 'MMM d')}
            </span>
          )}
        </div>
        {application.salary_min && application.salary_max && (
          <span className="text-[10px] text-stale font-mono font-medium tracking-tight">
            {application.currency === 'USD' ? '$' : ''}{application.salary_min/1000}k - {application.salary_max/1000}k
          </span>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
