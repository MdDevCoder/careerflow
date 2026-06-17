import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Interview } from '../../api/interviews';

const intSchema = z.object({
  round_type: z.string().min(1, 'Required'),
  scheduled_date: z.string().min(1, 'Required'),
  interview_mode: z.enum(['Online', 'Onsite', 'Phone']),
  interviewer_name: z.string().optional(),
  interviewer_email: z.string().optional(),
  notes: z.string().optional(),
});
type IntValues = z.infer<typeof intSchema>;

interface Props {
  interviews: Interview[];
  showIntForm: string | false;
  setShowIntForm: (val: string | false) => void;
  onSubmit: (data: IntValues) => void;
  isPending: boolean;
}

const InterviewForm = ({ interviews, showIntForm, setShowIntForm, onSubmit, isPending }: Props) => {
  const { register, handleSubmit, reset } = useForm<IntValues>({
    resolver: zodResolver(intSchema),
  });

  useEffect(() => {
    if (showIntForm === 'new') {
      reset({
        round_type: 'Technical Round',
        scheduled_date: new Date().toISOString().slice(0, 16),
        interview_mode: 'Online',
      });
    } else if (showIntForm) {
      const existing = interviews.find((i: Interview) => i._id === showIntForm);
      if (existing) {
        reset({
          round_type: existing.round_type,
          scheduled_date: new Date(existing.scheduled_date).toISOString().slice(0, 16),
          interview_mode: existing.interview_mode,
          interviewer_name: existing.interviewer_name || '',
          interviewer_email: existing.interviewer_email || '',
          notes: existing.notes || '',
        });
      }
    }
  }, [showIntForm, reset, interviews]);

  if (!showIntForm) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-surface/50 border border-light-border/10 p-4 rounded-xl space-y-4">
      <div className="flex justify-between items-center border-b border-light-border/10 pb-2 mb-2">
        <h4 className="text-sm font-medium">{showIntForm === 'new' ? 'Schedule Interview' : 'Edit Interview'}</h4>
        <button type="button" onClick={() => setShowIntForm(false)} className="text-muted hover:text-foreground" aria-label="Close interview form"><X size={14}/></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="int_round_type" className="block text-[10px] uppercase text-muted mb-1">Round Type</label>
          <input id="int_round_type" type="text" {...register('round_type')} className="w-full bg-surface-elevated border border-border rounded p-2 text-xs focus:ring-1 focus:ring-primary" placeholder="Technical, HR..." />
        </div>
        <div>
          <label htmlFor="int_scheduled_date" className="block text-[10px] uppercase text-muted mb-1">Date & Time</label>
          <input id="int_scheduled_date" type="datetime-local" {...register('scheduled_date')} className="w-full bg-surface-elevated border border-border rounded p-2 text-xs focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="int_interview_mode" className="block text-[10px] uppercase text-muted mb-1">Mode</label>
          <select id="int_interview_mode" {...register('interview_mode')} className="w-full bg-surface-elevated border border-border rounded p-2 text-xs focus:ring-1 focus:ring-primary">
            <option value="Online">Online</option>
            <option value="Onsite">Onsite</option>
            <option value="Phone">Phone</option>
          </select>
        </div>
        <div>
          <label htmlFor="int_interviewer_name" className="block text-[10px] uppercase text-muted mb-1">Interviewer Name</label>
          <input id="int_interviewer_name" type="text" {...register('interviewer_name')} className="w-full bg-surface-elevated border border-border rounded p-2 text-xs focus:ring-1 focus:ring-primary" placeholder="Jane Doe" />
        </div>
      </div>
      <div>
        <label htmlFor="int_notes" className="block text-[10px] uppercase text-muted mb-1">Notes / Links</label>
        <textarea id="int_notes" {...register('notes')} rows={2} className="w-full bg-surface-elevated border border-border rounded p-2 text-xs focus:ring-1 focus:ring-primary" placeholder="Zoom link, preparation notes..." />
      </div>
      <button type="submit" disabled={isPending} className="w-full bg-primary text-white py-2 rounded text-xs font-semibold hover:bg-primary/90 transition-colors">
        Save Interview
      </button>
    </form>
  );
};

export default InterviewForm;
