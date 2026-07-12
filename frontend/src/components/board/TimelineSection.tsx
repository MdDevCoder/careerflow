import { motion } from 'framer-motion';
import { History, Briefcase, Edit2, AlertCircle, CalendarClock, CheckCircle2, X, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityLog } from '../../api/applications';

interface Props {
  activities: ActivityLog[];
  isLoading: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'Application Created': return <Briefcase size={12} className="text-emerald-500" />;
    case 'Status Changed': return <History size={12} className="text-primary" />;
    case 'Application Updated': return <Edit2 size={12} className="text-blue-500" />;
    case 'Priority Changed': return <AlertCircle size={12} className="text-orange-500" />;
    case 'Interview Scheduled': return <CalendarClock size={12} className="text-yellow-500" />;
    case 'Interview Completed': return <CheckCircle2 size={12} className="text-emerald-500" />;
    case 'Interview Cancelled': return <X size={12} className="text-red-500" />;
    case 'Offer Received': return <CheckCircle2 size={12} className="text-emerald-500" />;
    default: return <FileText size={12} className="text-muted" />;
  }
};

const TimelineSection = ({ activities, isLoading }: Props) => {
  return (
    <div className="space-y-4 pt-6 border-t border-light-border/10">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
        <History size={14} /> Activity Timeline
      </h3>
      
      {isLoading ? (
        <div className="space-y-4 ml-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-3 h-3 rounded-full bg-border mt-1 shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 w-32 bg-surface-elevated rounded"></div>
                <div className="h-3 w-48 bg-surface-elevated rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative border-l border-light-border/10 ml-3 pl-6 py-2 space-y-8">
          {activities.length === 0 && (
            <div className="text-sm text-muted italic">No activity recorded yet.</div>
          )}
          {activities.map((activity, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={activity._id} 
              className="relative group"
            >
              <div className="absolute -left-[32px] top-0 w-6 h-6 rounded-full bg-surface border border-light-border/20 flex items-center justify-center shadow-md z-10 group-hover:border-primary/50 transition-colors">
                {getEventIcon(activity.event_type)}
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{activity.event_type}</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{activity.description}</p>
                </div>
                <span className="text-[10px] text-muted/60 whitespace-nowrap bg-surface-elevated px-2 py-0.5 rounded-full border border-border font-medium tracking-wide uppercase">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineSection;
