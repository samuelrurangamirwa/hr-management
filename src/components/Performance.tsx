import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Award, Target, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface PerformanceProps {
  user: User;
}

export function Performance({ user }: PerformanceProps) {
  const employeePerformance = [
    {
      id: 1,
      name: 'John Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      overallScore: 9.2,
      kpis: {
        quality: 9.5,
        productivity: 9.0,
        collaboration: 9.0,
        innovation: 9.3,
        leadership: 8.8
      },
      goals: 8,
      goalsCompleted: 7,
      reviewDate: '2024-06-01',
      status: 'excellent'
    },
    {
      id: 2,
      name: 'Jane Smith',
      department: 'Marketing',
      position: 'Marketing Manager',
      overallScore: 8.5,
      kpis: {
        quality: 8.8,
        productivity: 8.5,
        collaboration: 8.7,
        innovation: 8.2,
        leadership: 8.5
      },
      goals: 10,
      goalsCompleted: 8,
      reviewDate: '2024-06-02',
      status: 'good'
    },
    {
      id: 3,
      name: 'Robert Brown',
      department: 'Sales',
      position: 'Sales Director',
      overallScore: 9.0,
      kpis: {
        quality: 9.2,
        productivity: 9.0,
        collaboration: 8.5,
        innovation: 8.8,
        leadership: 9.5
      },
      goals: 12,
      goalsCompleted: 11,
      reviewDate: '2024-06-03',
      status: 'excellent'
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      department: 'HR',
      position: 'HR Manager',
      overallScore: 8.8,
      kpis: {
        quality: 9.0,
        productivity: 8.7,
        collaboration: 9.2,
        innovation: 8.5,
        leadership: 8.8
      },
      goals: 9,
      goalsCompleted: 8,
      reviewDate: '2024-06-04',
      status: 'good'
    },
  ];

  const departmentPerformance = [
    { department: 'Engineering', avgScore: 8.9, employees: 85 },
    { department: 'Sales', avgScore: 8.6, employees: 52 },
    { department: 'Marketing', avgScore: 8.4, employees: 38 },
    { department: 'HR', avgScore: 8.7, employees: 28 },
    { department: 'Finance', avgScore: 8.5, employees: 44 },
  ];

  const performanceTrend = [
    { month: 'Jan', score: 8.2 },
    { month: 'Feb', score: 8.3 },
    { month: 'Mar', score: 8.5 },
    { month: 'Apr', score: 8.4 },
    { month: 'May', score: 8.6 },
    { month: 'Jun', score: 8.7 },
  ];

  const stats = [
    { label: 'Avg Performance', value: '8.7/10', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Top Performers', value: '42', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Goals Achieved', value: '87%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reviews Completed', value: '234/247', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      excellent: { label: 'Excellent', className: 'bg-green-100 text-green-700' },
      good: { label: 'Good', className: 'bg-blue-100 text-blue-700' },
      average: { label: 'Average', className: 'bg-orange-100 text-orange-700' },
      'needs-improvement': { label: 'Needs Improvement', className: 'bg-red-100 text-red-700' },
    };
    
    const variant = variants[status] || variants.average;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getRadarData = (kpis: any) => [
    { skill: 'Quality', value: kpis.quality },
    { skill: 'Productivity', value: kpis.productivity },
    { skill: 'Collaboration', value: kpis.collaboration },
    { skill: 'Innovation', value: kpis.innovation },
    { skill: 'Leadership', value: kpis.leadership },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Performance Analytics</h1>
          <p className="text-gray-600 mt-2">Track employee performance and KPIs</p>
        </div>
        <Button className="gap-2">
          Schedule Reviews
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employee Performance</TabsTrigger>
          <TabsTrigger value="departments">Department Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          {employeePerformance.map(employee => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{employee.name}</CardTitle>
                    <p className="text-gray-600 mt-1">{employee.position} • {employee.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600">{employee.overallScore}/10</p>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* KPI Radar Chart */}
                  <div>
                    <h3 className="mb-4">Performance Metrics</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={getRadarData(employee.kpis)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar name={employee.name} dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* KPI Details */}
                  <div>
                    <h3 className="mb-4">Key Performance Indicators</h3>
                    <div className="space-y-3">
                      {Object.entries(employee.kpis).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm capitalize">{key}</span>
                            <span className="text-sm">{value}/10</span>
                          </div>
                          <Progress value={value * 10} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Goals Completed</p>
                          <p>{employee.goalsCompleted}/{employee.goals}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Review</p>
                          <p>{new Date(employee.reviewDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                  <Button size="sm" variant="outline">View Full Review</Button>
                  <Button size="sm" variant="outline">Schedule 1-on-1</Button>
                  <Button size="sm">Update Performance</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#3B82F6" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-8 space-y-4">
                {departmentPerformance.map((dept, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p>{dept.department}</p>
                        <p className="text-sm text-gray-600">{dept.employees} employees</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600">{dept.avgScore}/10</p>
                        <p className="text-sm text-gray-600">Avg Score</p>
                      </div>
                    </div>
                    <Progress value={dept.avgScore * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} name="Overall Performance" />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-600 text-sm">Improvement Rate</p>
                    <p className="mt-2 text-green-600">+6.1%</p>
                    <p className="text-sm text-gray-600 mt-1">vs last quarter</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-600 text-sm">High Performers</p>
                    <p className="mt-2">17%</p>
                    <p className="text-sm text-gray-600 mt-1">of workforce</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-600 text-sm">Needs Support</p>
                    <p className="mt-2 text-orange-600">8%</p>
                    <p className="text-sm text-gray-600 mt-1">require intervention</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
