import React, { useEffect, useState } from 'react';
import { analyticsService } from '@/api/analyticsService';
import { 
    Terminal, 
    AlertTriangle, 
    Info, 
    XOctagon,
    RefreshCw,
    Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SystemLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [severity, setSeverity] = useState<string>('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await analyticsService.getSystemLogs({ severity: severity === 'all' ? undefined : severity });
            const logData = res.data?.logs || res.data || [];
            setLogs(Array.isArray(logData) ? logData : []);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [severity]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
                    <p className="text-sm text-gray-500">Real-time server logs and event monitoring.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <select 
                        className="text-sm border border-gray-200 rounded-lg p-2 outline-none"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="all">All Severities</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                    </select>
                    <Button variant="outline" size="icon" onClick={fetchLogs}>
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-sm">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="ml-2 text-xs text-slate-500">system-production.log</span>
                    </div>
                    <Badge variant="outline" className="text-slate-500 border-slate-700">Live</Badge>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading && logs.length === 0 ? (
                        <p className="text-slate-500 italic">Connecting to log stream...</p>
                    ) : logs.length === 0 ? (
                        <p className="text-slate-500 italic">No logs found for the selected criteria.</p>
                    ) : logs.map((log, i) => {
                        const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
                        const isValidDate = !isNaN(logDate.getTime());
                        const severity = log.severity?.toLowerCase() || 'info';

                        return (
                            <div key={i} className="group flex items-start space-x-3 py-1 hover:bg-slate-900/50 rounded transition-colors">
                                <span className="text-slate-600 flex-shrink-0 w-40">
                                    {isValidDate ? format(logDate, 'yyyy-MM-dd HH:mm:ss') : 'Invalid Date'}
                                </span>
                                <span className="flex-shrink-0 w-20">
                                    <Badge className={cn(
                                        "px-1.5 py-0 rounded text-[10px] uppercase",
                                        severity === 'error' || severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                        severity === 'warning' || severity === 'warn' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    )}>
                                        {log.severity || 'INFO'}
                                    </Badge>
                                </span>
                                <span className="text-slate-300 break-all flex-1">
                                    <span className="text-slate-500 mr-2">[{log.eventType}]</span>
                                    {log.message}
                                    {log.metadata && (
                                        <span className="text-slate-500 ml-2 italic text-xs">
                                            {JSON.stringify(log.metadata)}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                    <div className="h-4"></div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
