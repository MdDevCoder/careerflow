import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../api/analytics';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { LayoutGrid, BarChart3, LogOut, Lightbulb, Target, TrendingUp, Zap, CheckCircle2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const AnalyticsDashboard = () => {
  const logout = useAuthStore(state => state.logout);
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics
  });

  if (isLoading || !data) {
    return <div className="h-screen w-full flex items-center justify-center text-stale">Loading Analytics Engine...</div>;
  }

  const { kpis, funnel, sources, monthly, health, insights } = data;

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden relative">
      {/* Background gradients */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="h-16 border-b border-light-border/10 flex items-center justify-between px-8 shrink-0 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg">
            <Link to="/" className="flex items-center gap-2 px-4 py-1.5 rounded-md text-stale hover:text-foreground text-sm font-medium transition-colors">
              <LayoutGrid size={14} /> Board
            </Link>
            <Link to="/analytics" className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium transition-colors shadow-sm">
              <BarChart3 size={14} /> Analytics
            </Link>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm text-stale hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 z-10 relative">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data-Driven Insights</h1>

        {/* Insight Engine */}
        {insights.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lightbulb size={16} /> Insight Engine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-surface/50 border border-light-border/5 p-4 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={14} className="text-primary" />
                  </div>
                  <p className="text-sm text-stale leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface/30 border border-light-border/5 p-5 rounded-2xl">
            <div className="text-stale text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">Total Apps <Target size={14}/></div>
            <div className="text-3xl font-bold">{kpis.totalApplications}</div>
            <div className="text-xs text-emerald-500 mt-2">{kpis.activeApplications} Active</div>
          </div>
          <div className="bg-surface/30 border border-light-border/5 p-5 rounded-2xl">
            <div className="text-stale text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">Interviews <Calendar size={14}/></div>
            <div className="text-3xl font-bold">{kpis.interviewsScheduled}</div>
            <div className="text-xs text-primary mt-2">{kpis.interviewsCompleted} Completed</div>
          </div>
          <div className="bg-surface/30 border border-light-border/5 p-5 rounded-2xl">
            <div className="text-stale text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">Success Rate <CheckCircle2 size={14}/></div>
            <div className="text-3xl font-bold">{kpis.successRate}%</div>
            <div className="text-xs text-stale mt-2">{kpis.offersReceived} Offers</div>
          </div>
          <div className="bg-surface/30 border border-light-border/5 p-5 rounded-2xl">
            <div className="text-stale text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">Conv. Rate <TrendingUp size={14}/></div>
            <div className="text-3xl font-bold">{kpis.interviewConversionRate}%</div>
            <div className="text-xs text-red-400 mt-2">{kpis.applicationsRejected} Rejections</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Funnel */}
          <div className="bg-surface/30 border border-light-border/5 p-6 rounded-2xl h-[400px]">
            <h2 className="text-sm font-semibold text-foreground mb-6">Application Funnel</h2>
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                <Funnel
                  dataKey="value"
                  data={funnel.filter(f => f.value > 0)}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#888" stroke="none" dataKey="stage" />
                  {funnel.filter(f => f.value > 0).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-surface/30 border border-light-border/5 p-6 rounded-2xl h-[400px]">
            <h2 className="text-sm font-semibold text-foreground mb-6">Monthly Momentum</h2>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="applications" stroke="#7C3AED" fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sources */}
          <div className="bg-surface/30 border border-light-border/5 p-6 rounded-2xl h-[400px]">
            <h2 className="text-sm font-semibold text-foreground mb-6">Source Performance</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="source" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }} />
                <Bar dataKey="total" name="Applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" name="Interviews" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Health Score Pie */}
          <div className="bg-surface/30 border border-light-border/5 p-6 rounded-2xl h-[400px]">
            <h2 className="text-sm font-semibold text-foreground mb-6">Pipeline Health</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }} />
                <Pie
                  data={health}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {health.map((entry, index) => {
                    const color = entry.name === 'HEALTHY' ? '#10B981' : 
                                  entry.name === 'AT_RISK' ? '#F59E0B' : 
                                  entry.name === 'STALE' ? '#6B7280' : 
                                  '#3B82F6';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
