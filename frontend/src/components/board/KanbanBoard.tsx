import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getApplications, updateApplicationStatus, type Application } from '../../api/applications';
import { getUpcomingInterviews } from '../../api/interviews';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import SidePeekDrawer from './SidePeekDrawer';
import NewApplicationModal from './NewApplicationModal';
import { Search, LogOut, Filter, CalendarClock, Building2, Calendar, BarChart3, LayoutGrid, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const COLUMNS = [
  'Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'
];

const KanbanBoard = () => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  
  const logout = useAuthStore(state => state.logout);

  const { 
    data: applicationsData, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['applications'],
    queryFn: ({ pageParam = 1 }) => getApplications(pageParam as number),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 100 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const applications = applicationsData ? applicationsData.pages.flat() : [];

  const { data: upcomingInterviews = [] } = useQuery({
    queryKey: ['upcomingInterviews'],
    queryFn: getUpcomingInterviews,
  });

  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  const queryClient = useQueryClient();
  
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateApplicationStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);
      
      queryClient.setQueryData(['applications'], (old: Application[] | undefined) => {
        if (!old) return [];
        return old.map(app => app._id === id ? { ...app, status } : app);
      });
      
      return { previousApps };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(['applications'], context?.previousApps);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnsData = useMemo(() => {
    const acc: Record<string, Application[]> = {};
    COLUMNS.forEach(col => acc[col] = []);
    
    // Filter by search
    let filteredApps = applications.filter(app => 
      app.company_name.toLowerCase().includes(search.toLowerCase()) ||
      app.job_title.toLowerCase().includes(search.toLowerCase())
    );

    if (filterPriority !== 'ALL') filteredApps = filteredApps.filter(app => app.priority === filterPriority);
    if (filterHealth !== 'ALL') filteredApps = filteredApps.filter(app => app.health_score === filterHealth);
    if (filterSource !== 'ALL') filteredApps = filteredApps.filter(app => app.source === filterSource);

    filteredApps.forEach(app => {
      if (acc[app.status]) {
        acc[app.status].push(app);
      }
    });
    return acc;
  }, [applications, search]);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Application') {
      setActiveApplication(event.active.data.current.application);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveApplication(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    let targetStatus = '';
    if (overData?.type === 'Column') {
      targetStatus = overData.columnId;
    } else if (overData?.type === 'Application') {
      targetStatus = overData.application.status;
    }

    if (targetStatus && activeData?.application.status !== targetStatus) {
      statusMutation.mutate({ id: activeId as string, status: targetStatus });
    }
  };

  if (isLoading) return <div className="p-8 text-stale">Loading board...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      {/* Board Header */}
      <div className="h-16 border-b border-light-border/10 flex items-center justify-between px-8 shrink-0 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg">
            <Link to="/" className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium transition-colors shadow-sm">
              <LayoutGrid size={14} /> Board
            </Link>
            <Link to="/analytics" className="flex items-center gap-2 px-4 py-1.5 rounded-md text-stale hover:text-foreground text-sm font-medium transition-colors">
              <BarChart3 size={14} /> Analytics
            </Link>
          </div>
          
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stale" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${showFilters ? 'bg-primary text-white' : 'text-stale hover:text-foreground hover:bg-white/5'}`}>
            <Filter size={14} /> Filters {(filterPriority !== 'ALL' || filterHealth !== 'ALL' || filterSource !== 'ALL') && <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 text-sm text-white bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} /> New Application
          </button>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-stale hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="h-12 border-b border-light-border/10 flex items-center gap-4 px-8 shrink-0 bg-surface/30">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-white/5 border border-white/5 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={filterHealth} onChange={(e) => setFilterHealth(e.target.value)} className="bg-white/5 border border-white/5 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="ALL">All Health Scores</option>
            <option value="HEALTHY">Healthy</option>
            <option value="AT_RISK">At Risk</option>
            <option value="STALE">Stale</option>
            <option value="SUCCESS">Success</option>
          </select>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="bg-white/5 border border-white/5 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="ALL">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Direct">Direct</option>
            <option value="Referral">Referral</option>
            <option value="Indeed">Indeed</option>
          </select>
          {(filterPriority !== 'ALL' || filterHealth !== 'ALL' || filterSource !== 'ALL') && (
            <button onClick={() => { setFilterPriority('ALL'); setFilterHealth('ALL'); setFilterSource('ALL'); }} className="text-xs text-stale hover:text-foreground hover:underline ml-2">Clear Filters</button>
          )}
        </div>
      )}

      {/* Upcoming Interviews Smart Reminders */}
      {upcomingInterviews.length > 0 && (
        <div className="border-b border-light-border/10 bg-surface/20 px-8 py-4 shrink-0 overflow-x-auto">
          <h3 className="text-sm font-semibold text-stale uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-primary" /> Upcoming Interviews
          </h3>
          <div className="flex gap-4">
            {upcomingInterviews.map((int: any) => (
              <div key={int._id} className="bg-white/5 border border-white/5 rounded-xl p-3 min-w-[240px] flex-shrink-0 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => {
                const app = applications.find(a => a._id === int.application_id);
                if (app) setSelectedApplication(app);
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Building2 size={14} className="text-stale" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground truncate w-40">{int.company_name}</h4>
                    <p className="text-xs text-stale truncate w-40">{int.job_title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{int.round_type}</span>
                  <span className="text-stale flex items-center gap-1"><Calendar size={12}/> {format(new Date(int.scheduled_date), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex"
        onWheel={(e) => {
          if (e.shiftKey) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex h-full gap-4 pb-4">
            {COLUMNS.map(col => (
              <KanbanColumn 
                key={col} 
                id={col} 
                title={col} 
                applications={columnsData[col] || []} 
                onCardClick={setSelectedApplication}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pb-6">
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium text-stale rounded-full transition-colors"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load older applications'}
              </button>
            </div>
          )}

          <DragOverlay>
            {activeApplication && <KanbanCard application={activeApplication} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      <SidePeekDrawer 
        application={selectedApplication} 
        onClose={() => setSelectedApplication(null)} 
      />

      {showNewModal && <NewApplicationModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
};

export default KanbanBoard;
