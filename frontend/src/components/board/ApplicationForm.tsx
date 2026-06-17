import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import type { Application } from '../../api/applications';

const formSchema = z.object({
  status: z.enum(['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  source: z.string().min(1, 'Source is required'),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  application_notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  application: Application;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
  isError: boolean;
}

const ApplicationForm = ({ application, onSubmit, onCancel, isPending, isError }: Props) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    reset({
      status: application.status,
      priority: application.priority,
      source: application.source || '',
      salary_min: application.salary_min || null,
      salary_max: application.salary_max || null,
      contact_person: application.contact_person || '',
      contact_email: application.contact_email || '',
      application_notes: application.application_notes || '',
    });
  }, [application, reset]);

  const handleFormSubmit = (data: FormValues) => {
    const cleanedData: any = {};
    Object.keys(data).forEach(key => {
      const val = (data as any)[key];
      if (val !== null) cleanedData[key] = val;
    });
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stale uppercase mb-1">Status</label>
          <select {...register('status')} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'].map(s => <option key={s} value={s} className="bg-[#1F2937] text-white">{s}</option>)}
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-stale uppercase mb-1">Priority</label>
          <select {...register('priority')} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="LOW" className="bg-[#1F2937] text-white">Low</option>
            <option value="MEDIUM" className="bg-[#1F2937] text-white">Medium</option>
            <option value="HIGH" className="bg-[#1F2937] text-white">High</option>
          </select>
          {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stale uppercase mb-1">Source</label>
          <input type="text" {...register('source')} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="LinkedIn, Indeed..." />
          {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>}
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs font-medium text-stale uppercase mb-1">Min Salary</label>
            <input type="number" {...register('salary_min', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="90000" />
          </div>
          <div className="w-1/2">
            <label className="block text-xs font-medium text-stale uppercase mb-1">Max Salary</label>
            <input type="number" {...register('salary_max', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="120000" />
          </div>
        </div>
      </div>

      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Contact Details</h3>
        <div>
          <label className="block text-xs font-medium text-stale uppercase mb-1">Contact Person</label>
          <input type="text" {...register('contact_person')} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="John Doe, Recruiter" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stale uppercase mb-1">Contact Email</label>
          <input type="email" {...register('contact_email')} className="w-full bg-white/5 border border-white/5 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="john@company.com" />
          {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-stale uppercase mb-1">Rich Notes</label>
        <textarea 
          {...register('application_notes')} 
          rows={8}
          className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y" 
          placeholder="Document your interview questions, company research, and thoughts here..." 
        />
      </div>

      {isError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
          Failed to save changes. Please try again.
        </div>
      )}

      <div className="pt-4 flex gap-3">
        <button type="submit" disabled={isSubmitting || isPending} className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2">
          {isPending ? 'Saving...' : <><Check size={16} /> Save Changes</>}
        </button>
        <button type="button" onClick={onCancel} className="px-6 bg-white/5 text-foreground font-semibold py-3 rounded-xl hover:bg-white/10 transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
