import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


interface DataPoint {
    name: string;
    value: number;
  }

interface Props {
    data: DataPoint[],
}

function UsageChart({ data }: Props) {
    return (
        <ResponsiveContainer width="95%" height="95%">
            <LineChart data={data}>
                <XAxis dataKey="name" />
                <YAxis width={40}/>
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
}
  
export default UsageChart;