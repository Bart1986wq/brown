import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NarrativeBlueprint } from '../types';

interface TensionGraphProps {
    blueprint: NarrativeBlueprint;
}

export const TensionGraph: React.FC<TensionGraphProps> = ({ blueprint }) => {
    if (!blueprint.tensionMap || blueprint.tensionMap.length === 0) {
        return <div className="text-sm text-strand-400 p-4">No tension data available for this blueprint.</div>;
    }

    const data = blueprint.tensionMap.map((t, i) => ({
        name: `Beat ${i + 1}`,
        tension: t.tension
    }));

    return (
        <div className="h-64 w-full bg-white p-4 rounded-lg border border-strand-200">
            <h4 className="text-xs font-bold text-strand-500 uppercase tracking-widest mb-4">Tension Progression</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} domain={[0, 10]} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="tension" stroke="#1f2937" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
