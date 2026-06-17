import { useState } from 'react';
import { X, Plus, Building2, Briefcase } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication } from '../../api/applications';

interface Props {
  onClose: () => void;
}

const NewApplicationModal = ({ onClose }: Props) => {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createApplication({
      company_name: companyName,
      job_title: jobTitle,
      status: 'Wishlist',
      priority: 'MEDIUM',
      source: 'Website',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create application:", error);
      alert("Failed to create application. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-light-border/10 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-light-border/10">
          <h2 className="text-xl font-bold text-foreground">New Application</h2>
          <button onClick={onClose} className="p-2 text-stale hover:text-foreground hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-stale uppercase tracking-wider mb-2">Company Name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stale" />
              <input 
                type="text"
                autoFocus
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Stripe"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-stale uppercase tracking-wider mb-2">Job Title</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stale" />
              <input 
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-foreground bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || !companyName || !jobTitle}
              className="flex-[2] py-3 px-4 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? 'Creating...' : <><Plus size={18} /> Create Application</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewApplicationModal;
