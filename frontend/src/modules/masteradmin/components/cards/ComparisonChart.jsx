import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts';
import ProfessionalTooltip from '../common/ProfessionalTooltip';

export default function ComparisonChart({
    data = [],
    type = 'area', // area, bar, line, composed
    metrics = [], // { key, name, color, type }
    height = 400,
    showGrid = true,
    targetValue,
    targetLabel = "Target",
    xAxisKey = "name",
    currency = "₹"
}) {
    return (
        <div style={{ width: '100%', height: height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                    )}

                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                    />

                    <Tooltip
                        content={<ProfessionalTooltip currency={currency} />}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    />

                    {targetValue && (
                        <ReferenceLine
                            y={targetValue}
                            stroke="#f59e0b"
                            strokeDasharray="3 3"
                            label={{
                                position: 'right',
                                value: targetLabel,
                                fill: '#f59e0b',
                                fontSize: 10,
                                fontWeight: 600
                            }}
                        />
                    )}

                    {metrics.map((metric, index) => {
                        const ChartType = metric.type || type;

                        if (ChartType === 'area') {
                            return (
                                <React.Fragment key={metric.key}>
                                    <defs>
                                        <linearGradient id={`color-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey={metric.key}
                                        name={metric.name}
                                        stroke={metric.color}
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill={`url(#color-${metric.key})`}
                                        animationDuration={1000}
                                        animationBegin={index * 100}
                                    />
                                </React.Fragment>
                            );
                        }

                        if (ChartType === 'bar') {
                            return (
                                <Bar
                                    key={metric.key}
                                    dataKey={metric.key}
                                    name={metric.name}
                                    fill={metric.color}
                                    radius={[4, 4, 0, 0]}
                                    barSize={metric.barSize || 12}
                                    animationDuration={1000}
                                />
                            );
                        }

                        if (ChartType === 'line') {
                            return (
                                <Line
                                    key={metric.key}
                                    type="monotone"
                                    dataKey={metric.key}
                                    name={metric.name}
                                    stroke={metric.color}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: metric.color, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 5, strokeWidth: 0 }}
                                    animationDuration={1000}
                                />
                            );
                        }

                        return null;
                    })}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
