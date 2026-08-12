import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#E6B389', '#6A8B5F', '#5F85A1', '#C36453', '#8C7D64'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1614] border border-[#302A24] p-3 rounded-lg shadow-xl">
        <p className="text-white mb-2 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ trendData, genreData, timeFilter, setTimeFilter, stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-surface border border-[#302A24] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-serif text-lg">Xu hướng luân chuyển</h3>
            <p className="text-sm text-text-secondary">Lượt mượn vs trả sách</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimeFilter('7days')} 
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${timeFilter === '7days' ? 'bg-surfaceHover text-white' : 'text-text-secondary hover:text-white'}`}
            >
              7 Ngày
            </button>
            <button 
              onClick={() => setTimeFilter('30days')} 
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${timeFilter === '30days' ? 'bg-surfaceHover text-white' : 'text-text-secondary hover:text-white'}`}
            >
              30 Ngày
            </button>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMuon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E6B389" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E6B389" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6A8B5F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6A8B5F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#302A24" vertical={false} />
              <XAxis dataKey="name" stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#302A24', strokeWidth: 1}} />
              <Area type="monotone" dataKey="Mượn sách" stroke="#E6B389" strokeWidth={2} fillOpacity={1} fill="url(#colorMuon)" />
              <Area type="monotone" dataKey="Trả sách" stroke="#6A8B5F" strokeWidth={2} fillOpacity={1} fill="url(#colorTra)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
        <h3 className="text-white font-serif text-lg mb-1">Phân bổ thể loại</h3>
        <p className="text-sm text-text-secondary mb-4">Tỷ lệ theo số lượng sách</p>
        <div className="h-48 w-full flex-1 flex items-center justify-center relative">
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-text-secondary text-sm">Chưa có dữ liệu sách</div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-white font-serif text-xl">{stats.totalBooks}</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {genreData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full min-w-[8px]" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
              <span className="text-text-secondary truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
              <span className="text-white font-medium ml-1">{Math.round((entry.value / (stats.totalBooks || 1)) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
