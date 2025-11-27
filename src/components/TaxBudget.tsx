import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calculator, TrendingDown, TrendingUp, PieChart as PieChartIcon, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface TaxBudgetProps {
  user: User;
}

export function TaxBudget({ user }: TaxBudgetProps) {
  const taxData = [
    { month: 'Jan', federal: 42000, state: 18000, local: 8000 },
    { month: 'Feb', federal: 43000, state: 18500, local: 8200 },
    { month: 'Mar', federal: 44500, state: 19000, local: 8500 },
    { month: 'Apr', federal: 43800, state: 18800, local: 8300 },
    { month: 'May', federal: 45200, state: 19400, local: 8600 },
    { month: 'Jun', federal: 46000, state: 19800, local: 8800 },
  ];

  const budgetAllocation = [
    { category: 'Salaries', allocated: 5500000, spent: 5250000, percentage: 95 },
    { category: 'Benefits', allocated: 800000, spent: 720000, percentage: 90 },
    { category: 'Training', allocated: 200000, spent: 145000, percentage: 72 },
    { category: 'Recruitment', allocated: 150000, spent: 128000, percentage: 85 },
    { category: 'Infrastructure', allocated: 300000, spent: 285000, percentage: 95 },
    { category: 'Operations', allocated: 250000, spent: 198000, percentage: 79 },
  ];

  const expenseBreakdown = [
    { name: 'Salaries & Wages', value: 5250000, color: '#3B82F6' },
    { name: 'Benefits', value: 720000, color: '#10B981' },
    { name: 'Infrastructure', value: 285000, color: '#F59E0B' },
    { name: 'Recruitment', value: 128000, color: '#EF4444' },
    { name: 'Training', value: 145000, color: '#8B5CF6' },
    { name: 'Operations', value: 198000, color: '#EC4899' },
  ];

  const stats = [
    { label: 'Total Tax Paid', value: '$520,800', change: '+3.2%', icon: Calculator, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Annual Budget', value: '$7.2M', change: '+5.1%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Budget Used', value: '93.4%', change: '+2.8%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Savings', value: '$474,000', change: '+12%', icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const totalTax = taxData[taxData.length - 1];
  const totalMonthlyTax = totalTax.federal + totalTax.state + totalTax.local;

  const handleGenerateReport = () => {
    toast.success('Tax report generated successfully! Downloading...');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Tax & Budget Management</h1>
          <p className="text-gray-600 mt-2">Tax calculations and budget tracking</p>
        </div>
        <Button className="gap-2" onClick={handleGenerateReport}>
          Generate Tax Report
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
                    <p className="text-green-600 text-sm mt-1">{stat.change} from last period</p>
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

      <Tabs defaultValue="tax" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tax">Tax Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="space-y-6">
          {/* Tax Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Federal Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600">${totalTax.federal.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">{((totalTax.federal / totalMonthlyTax) * 100).toFixed(1)}% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>State Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600">${totalTax.state.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">{((totalTax.state / totalMonthlyTax) * 100).toFixed(1)}% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Local Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">${totalTax.local.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">{((totalTax.local / totalMonthlyTax) * 100).toFixed(1)}% of total</p>
              </CardContent>
            </Card>
          </div>

          {/* Tax Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Payment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={taxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="federal" fill="#3B82F6" name="Federal Tax" stackId="a" />
                  <Bar dataKey="state" fill="#10B981" name="State Tax" stackId="a" />
                  <Bar dataKey="local" fill="#F59E0B" name="Local Tax" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {/* Budget Allocation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetAllocation.map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{budget.category}</p>
                        <p className="text-sm text-gray-600">
                          ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-sm ${
                        budget.percentage > 90 ? 'text-red-600' :
                        budget.percentage > 75 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {budget.percentage}% used
                      </span>
                    </div>
                    <Progress value={budget.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}k`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
