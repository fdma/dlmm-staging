"use client";

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VolumeDataPoint } from '@/types/pool';

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

const VolumeChart = ({ data }: VolumeChartProps) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: new Date(point.timestamp).toLocaleDateString(),
    }));
  }, [data]);

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.375rem',
            }}
            labelStyle={{ color: '#9CA3AF' }}
            itemStyle={{ color: '#10B981' }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart; 