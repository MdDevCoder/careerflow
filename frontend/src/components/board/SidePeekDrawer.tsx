import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import type { Application } from '../../api/applications';
import { updateApplication, getApplicationActivities } from '../../api/applications';
import { getApplicationInterviews, createInterview, updateInterview, type Interview } from '../../api/interviews';
import { X, Building2, MapPin, DollarSign, Calendar, ExternalLink, User, Mail, Tag, Edit2, Clock, CalendarClock, Plus, Video, Map, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import ApplicationForm from './ApplicationForm';
import InterviewForm from './InterviewForm';
import TimelineSection from './TimelineSection';

interface Props {
  application: Application | null;
  onClose: () => void;
}

const SidePeekDrawer = ({ application, onClose }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showIntForm, setShowIntForm] = useState<string | false>(false);
  const queryClient = useQueryClient();
  const drawerRef = useFocusTrap(!!application);

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities', application?._id],
    queryFn: () => getApplicationActivities(application!._id),
    enabled: !!application?._id,
  });

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ['interviews', application?._id],
    queryFn: () => getApplicationInterviews(application!._id),
    enabled: !!application?._id,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (application) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [application, onClose]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateApplication(application!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['activities', application?._id] });
      setIsEditing(false);
    },
  });

  const createIntMutation = useMutation({
    mutationFn: (data: any) => createInterview(application!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', application?._id] });
      queryClient.invalidateQueries({ queryKey: ['activities', application?._id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingInterviews'] });
      setShowIntForm(false);
    }
  });

  const updateIntMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateInterview(application!._id, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', application?._id] });
      queryClient.invalidateQueries({ queryKey: ['activities', application?._id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingInterviews'] });
      setShowIntForm(false);
    }
  });

  const setIntStatus = (id: string, status: string) => {
    updateIntMutation.mutate({ id, data: { status } });
  };

  const renderViewMode = () => {
    if (!application) return null;
    return (
      <div className="p-6 space-y-8 animate-in fade-in duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             {application.company_logo ? (
                <img src={application.company_logo} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-border shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center font-bold text-2xl text-muted uppercase shadow-lg">
                  {application.company_name.substring(0, 2)}
                </div>
              )}
             <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{application.job_title}</h1>
                <p className="text-muted text-lg">{application.company_name}</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 bg-surface-elevated rounded-lg text-sm border border-border flex items-center gap-2 text-foreground">
              <Building2 size={14} className="text-muted" />
              {application.status}
            </span>
            <span className={`px-3 py-1 rounded-lg text-sm border font-medium ${
              application.health_score === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              application.health_score === 'AT_RISK' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              application.health_score === 'STALE' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {application.health_score}
            </span>
            <span className={`px-3 py-1 rounded-lg text-sm border font-medium ${
              application.priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              application.priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {application.priority} Priority
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted text-xs uppercase font-medium mb-1">
              <MapPin size={12} /> Location
            </div>
            <div className="font-medium text-sm text-foreground">{application.location || 'Not specified'}</div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted text-xs uppercase font-medium mb-1">
              <DollarSign size={12} /> Compensation
            </div>
            <div className="font-medium text-sm text-foreground">
              {application.salary_min ? `${application.currency === 'USD' ? '$' : ''}${application.salary_min/1000}k - ${application.salary_max!/1000}k` : 'Not specified'}
            </div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted text-xs uppercase font-medium mb-1">
              <Calendar size={12} /> Applied On
            </div>
            <div className="font-medium text-sm text-foreground">
              {application.applied_date ? format(new Date(application.applied_date), 'MMM dd, yyyy') : 'Unknown'}
            </div>
          </div>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-muted text-xs uppercase font-medium mb-1">
              <Tag size={12} /> Source
            </div>
            <div className="font-medium text-sm text-foreground">{application.source || 'Direct'}</div>
          </div>
        </div>

        {(application.contact_person || application.contact_email) && (
          <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Contact Details</h3>
            <div className="flex flex-col gap-2">
              {application.contact_person && (
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <User size={16} className="text-muted" />
                  <span>{application.contact_person}</span>
                </div>
              )}
              {application.contact_email && (
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail size={16} className="text-muted" />
                  <a href={`mailto:${application.contact_email}`} className="hover:underline">{application.contact_email}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {application.job_url && (
          <div>
            <a 
              href={application.job_url} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-max"
            >
              <ExternalLink size={16} /> View Job Posting
            </a>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider flex justify-between items-center">
            <span>Application Notes</span>
            <span className="text-xs text-muted/60 lowercase flex items-center gap-1"><Clock size={10} /> Last updated today</span>
          </h3>
          <div className="bg-surface-elevated p-4 rounded-xl border border-border min-h-[120px] text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {application.application_notes || <span className="text-muted italic">No notes recorded. Click edit to add your thoughts, interview questions, or next steps.</span>}
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <CalendarClock size={14} /> Interviews
            </h3>
            <button onClick={() => setShowIntForm('new')} className="text-xs flex items-center gap-1 bg-surface-elevated hover:bg-border text-foreground px-2 py-1 rounded transition-colors border border-border">
              <Plus size={12} /> Add Round
            </button>
          </div>

          <InterviewForm 
            interviews={interviews}
            showIntForm={showIntForm}
            setShowIntForm={setShowIntForm}
            onSubmit={(data) => showIntForm === 'new' ? createIntMutation.mutate(data) : updateIntMutation.mutate({ id: showIntForm as string, data })}
            isPending={createIntMutation.isPending || updateIntMutation.isPending}
          />

          {loadingInterviews ? (
             <div className="text-xs text-muted italic">Loading interviews...</div>
          ) : interviews.length === 0 && !showIntForm ? (
            <div className="border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted bg-surface-elevated/30">
              No interviews scheduled yet.
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((int: Interview) => (
                <div key={int._id} className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${int.status === 'Completed' ? 'bg-success' : int.status === 'Cancelled' ? 'bg-danger' : 'bg-primary'}`}></div>
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                        {int.round_type}
                        {int.status === 'Completed' && <span className="bg-success/10 text-success text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Completed</span>}
                        {int.status === 'Cancelled' && <span className="bg-danger/10 text-danger text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Cancelled</span>}
                      </h4>
                      <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                        <Calendar size={12}/> {format(new Date(int.scheduled_date), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <button onClick={() => setShowIntForm(int._id)} aria-label="Edit interview" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-foreground p-1">
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div className="pl-2 flex gap-4 text-xs text-muted mt-1">
                    <span className="flex items-center gap-1">
                      {int.interview_mode === 'Online' ? <Video size={12}/> : int.interview_mode === 'Onsite' ? <Map size={12}/> : <Phone size={12}/>}
                      {int.interview_mode}
                    </span>
                    {int.interviewer_name && (
                      <span className="flex items-center gap-1"><User size={12}/> {int.interviewer_name}</span>
                    )}
                  </div>
                  {int.notes && (
                    <div className="pl-2 mt-2 bg-surface p-2 border border-border rounded text-xs text-muted whitespace-pre-wrap font-mono">
                      {int.notes}
                    </div>
                  )}
                  {int.status === 'Upcoming' && (
                    <div className="pl-2 pt-2 mt-1 border-t border-white/5 flex gap-2">
                      <button onClick={() => setIntStatus(int._id, 'Completed')} className="text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-2 py-1 rounded font-medium transition-colors">Mark Completed</button>
                      <button onClick={() => setIntStatus(int._id, 'Cancelled')} className="text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-1 rounded font-medium transition-colors">Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <TimelineSection activities={activities} isLoading={loadingActivities} />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {application && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
          />
          <motion.div 
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-surface border-l border-light-border/10 shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 bg-surface/80 backdrop-blur-md px-6 py-4 border-b border-border flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-muted">Application Details</h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-lg transition-colors border border-primary/20 bg-primary/5">
                    <Edit2 size={14} /> Edit
                  </button>
                ) : (
                  <span className="text-xs text-success font-medium px-2 py-1 bg-success/10 rounded-md">Edit Mode</span>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-surface-elevated rounded-full transition-colors text-muted hover:text-foreground ml-2"
                  aria-label="Close drawer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {isEditing ? (
              <ApplicationForm 
                application={application} 
                onSubmit={updateMutation.mutate} 
                onCancel={() => setIsEditing(false)}
                isPending={updateMutation.isPending}
                isError={updateMutation.isError}
              />
            ) : renderViewMode()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePeekDrawer;
