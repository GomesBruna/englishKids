import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Activity,
    Trophy,
    TrendingUp,
    Calendar,
    ChevronLeft,
    Search,
    ArrowUpRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    points: number;
    last_active_at: string;
}

interface ActivityLog {
    id: string;
    user_id: string;
    activity_type: string;
    activity_name: string;
    points_earned: number;
    created_at: string;
    profiles: {
        full_name: string;
    };
}

interface AdminDashboardProps {
    onBack: () => void;
}

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch user profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('points', { ascending: false });

            if (profileError) throw profileError;
            setProfiles(profileData || []);

            // Fetch recent logs with user names
            const { data: logData, error: logError } = await supabase
                .from('user_activity_logs')
                .select(`
          *,
          profiles:user_id (full_name)
        `)
                .order('created_at', { ascending: false })
                .limit(200); // Increased limit for better filtering experience

            if (logError) throw logError;
            setLogs(logData || []);

        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProfiles = profiles.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    // Filter logs by selected profile
    const displayLogs = selectedProfileId
        ? logs.filter(log => log.user_id === selectedProfileId)
        : logs;

    // Prepare data for the chart (activity per day)
    const chartData = displayLogs.reduce((acc: any[], log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []).reverse();

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Voltar ao Início
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                            {selectedProfile ? `Atividade: ${selectedProfile.full_name}` : 'Painel do Administrador'}
                        </h1>
                        {selectedProfileId && (
                            <button
                                onClick={() => setSelectedProfileId(null)}
                                className="text-sm text-blue-600 font-medium hover:underline mt-1"
                            >
                                ✕ Limpar filtro de aluno
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar aluno..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <Calendar className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        label={selectedProfileId ? "Posição no Ranking" : "Total de Alunos"}
                        value={selectedProfileId ? profiles.findIndex(p => p.id === selectedProfileId) + 1 : profiles.length}
                        trend={selectedProfileId ? "Top Aluno" : "+2 esta semana"}
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        icon={<Activity className="w-6 h-6 text-purple-600" />}
                        label={selectedProfileId ? "Total de Interações" : "Atividades (Recentes)"}
                        value={displayLogs.length}
                        trend={selectedProfileId ? "Frequência" : "Geral"}
                        bgColor="bg-purple-50"
                    />
                    <StatCard
                        icon={<Trophy className="w-6 h-6 text-amber-600" />}
                        label={selectedProfileId ? "Pontos do Aluno" : "Média de Pontos"}
                        value={selectedProfileId ? selectedProfile?.points : (profiles.length ? Math.round(profiles.reduce((a, b) => a + b.points, 0) / profiles.length) : 0)}
                        trend={selectedProfileId ? "Estrelas" : "Estável"}
                        bgColor="bg-amber-50"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                        label={selectedProfileId ? "Atividade Recente" : "Alunos Ativos"}
                        value={selectedProfileId ? (selectedProfile ? new Date(selectedProfile.last_active_at).toLocaleDateString() : '-') : profiles.filter(p => {
                            const lastActive = new Date(p.last_active_at);
                            const now = new Date();
                            return (now.getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);
                        }).length}
                        labelSuffix={selectedProfileId ? "" : "hoje"}
                        bgColor="bg-emerald-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                {selectedProfileId ? `Interações de ${selectedProfile?.full_name}` : 'Interações por Dia (Geral)'}
                            </h2>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            name="Interações"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {!selectedProfileId && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Top Alunos por Pontuação
                                </h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={profiles.slice(0, 5)} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="full_name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="points" radius={[0, 8, 8, 0]} barSize={32}>
                                                {profiles.slice(0, 5).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity Logs & User List */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-purple-500" />
                                {selectedProfileId ? 'Histórico do Aluno' : 'Atividades Recentes'}
                            </h2>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {displayLogs.length > 0 ? displayLogs.map((log) => {
                                    // Handle both object and array return from joined profiles
                                    const profileData = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                                    const studentName = profileData?.full_name || 'Aluno Desconhecido';

                                    return (
                                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                                            <div className={`mt-1 p-2 rounded-lg ${log.activity_type === 'game_complete' ? 'bg-green-50 text-green-600' :
                                                log.activity_type === 'lesson_view' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                {!selectedProfileId && (
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {studentName}
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-500 mb-1">
                                                    {log.activity_name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {log.points_earned > 0 && (
                                                        <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                                                            +{log.points_earned} pts
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-8 text-slate-400">
                                        Nenhuma atividade encontrada
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-500" />
                                Alunos ({filteredProfiles.length})
                            </h2>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {filteredProfiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        onClick={() => setSelectedProfileId(profile.id === selectedProfileId ? null : profile.id)}
                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${profile.id === selectedProfileId
                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                                            : 'border-slate-50 hover:border-slate-100 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${profile.id === selectedProfileId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {profile.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{profile.full_name}</p>
                                                <p className="text-xs text-slate-400">
                                                    Último acesso: {new Date(profile.last_active_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-amber-500">{profile.points}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pontos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, bgColor, labelSuffix = '' }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${bgColor}`}>
                {icon}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
            </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">{label} {labelSuffix && <span className="text-xs opacity-60">({labelSuffix})</span>}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
);
