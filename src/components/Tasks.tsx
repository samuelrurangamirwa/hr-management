import { useState } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckSquare, Plus, Clock, User as UserIcon, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface TasksProps {
  user: User;
}

export function Tasks({ user }: TasksProps) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Review Q2 Performance Reports',
      description: 'Analyze and review all department performance reports for Q2',
      assignedTo: 'John Doe',
      assignedBy: 'Admin User',
      dueDate: '2024-06-15',
      priority: 'high',
      status: 'in-progress',
      project: 'Performance Review System',
      completed: false
    },
    {
      id: 2,
      title: 'Update Employee Handbook',
      description: 'Review and update company policies in the employee handbook',
      assignedTo: 'Jane Smith',
      assignedBy: 'Admin User',
      dueDate: '2024-06-20',
      priority: 'medium',
      status: 'todo',
      project: 'HR System Redesign',
      completed: false
    },
    {
      id: 3,
      title: 'Schedule Training Sessions',
      description: 'Organize and schedule Q3 training sessions for all departments',
      assignedTo: 'Robert Brown',
      assignedBy: 'Admin User',
      dueDate: '2024-06-18',
      priority: 'high',
      status: 'in-progress',
      project: 'Training Platform Integration',
      completed: false
    },
    {
      id: 4,
      title: 'Process Payroll for June',
      description: 'Complete payroll processing for all employees',
      assignedTo: 'Lisa Anderson',
      assignedBy: 'Admin User',
      dueDate: '2024-06-30',
      priority: 'high',
      status: 'todo',
      project: 'Payroll Management',
      completed: false
    },
    {
      id: 5,
      title: 'Conduct New Hire Orientation',
      description: 'Welcome and orient 5 new employees',
      assignedTo: 'Sarah Johnson',
      assignedBy: 'Admin User',
      dueDate: '2024-06-14',
      priority: 'medium',
      status: 'completed',
      project: 'Employee Onboarding Portal',
      completed: true
    },
  ]);

  const stats = [
    { label: 'Total Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed', value: tasks.filter(t => t.completed).length.toString(), icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Overdue', value: '2', icon: Calendar, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      todo: { label: 'To Do', className: 'bg-gray-100 text-gray-700' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
      blocked: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
    };
    
    const variant = variants[status] || variants.todo;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      low: { label: 'Low', className: 'bg-gray-100 text-gray-700' },
      medium: { label: 'Medium', className: 'bg-orange-100 text-orange-700' },
      high: { label: 'High', className: 'bg-red-100 text-red-700' },
    };
    
    const variant = variants[priority] || variants.low;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const toggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, status: !task.completed ? 'completed' : 'todo' }
        : task
    ));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Task Management</h1>
          <p className="text-gray-600 mt-2">Assign and track tasks across the organization</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Task description..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Input placeholder="Employee name" />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Input placeholder="Related project" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input placeholder="High, Medium, Low" />
                </div>
              </div>
              <Button className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
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

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="my">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned by Me</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className={`p-4 border rounded-lg transition-colors ${
                    task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={task.completed ? 'line-through text-gray-500' : ''}>
                              {task.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500">Assigned to</p>
                              <p>{task.assignedTo}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Project</p>
                            <p>{task.project}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Assigned by</p>
                            <p>{task.assignedBy}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">View Details</Button>
                          {!task.completed && (
                            <Button size="sm" onClick={() => toggleTaskComplete(task.id)}>
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(t => t.assignedTo === user.name).map(task => (
                  <div key={task.id} className={`p-4 border rounded-lg transition-colors ${
                    task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={task.completed ? 'line-through text-gray-500' : ''}>
                              {task.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Project</p>
                            <p>{task.project}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Assigned by</p>
                            <p>{task.assignedBy}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Tasks I Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(t => t.assignedBy === user.name).map(task => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3>{task.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Assigned to</p>
                        <p>{task.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Project</p>
                        <p>{task.project}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
