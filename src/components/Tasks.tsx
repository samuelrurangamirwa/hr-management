import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface TasksProps {
   user: User;
}

interface Task {
   id: number;
   title: string;
   description: string;
   assigned_to: number;
   assigned_to_name: string;
   assigned_by: number;
   assigned_by_name: string;
   due_date: string;
   priority: string;
   status: string;
   project: number | null;
   project_name: string;
   created_date: string;
   completed_date: string | null;
}

interface Employee {
   id: number;
   user: {
     id: number;
     first_name: string;
     last_name: string;
   };
}

interface Project {
   id: number;
   name: string;
}

export function Tasks({ user }: TasksProps) {
   const [tasks, setTasks] = useState<Task[]>([]);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

   const [newTask, setNewTask] = useState({
     title: '',
     description: '',
     assigned_to: '',
     project: '',
     due_date: '',
     priority: 'medium'
   });

   const [editTask, setEditTask] = useState({
     id: 0,
     title: '',
     description: '',
     assigned_to: '',
     project: '',
     due_date: '',
     priority: 'medium'
   });

   useEffect(() => {
     const fetchData = async () => {
       const token = localStorage.getItem('token');
       if (!token) {
         setLoading(false);
         return;
       }

       try {
         const headers = { 'Authorization': `Bearer ${token}` };

         const [tasksRes, employeesRes, projectsRes] = await Promise.all([
           fetch('/api/tasks/', { headers }),
           fetch('/api/employees/', { headers }),
           fetch('/api/projects/', { headers })
         ]);

         if (tasksRes.ok) {
           const tasksData = await tasksRes.json();
           setTasks(tasksData);
         }

         if (employeesRes.ok) {
           const employeesData = await employeesRes.json();
           setEmployees(employeesData);
         }

         if (projectsRes.ok) {
           const projectsData = await projectsRes.json();
           setProjects(projectsData);
         }

       } catch (error) {
         console.error('Error fetching tasks data:', error);
         toast.error('Failed to load tasks data');
       } finally {
         setLoading(false);
       }
     };

     fetchData();
   }, []);

   const handleCreateTask = async (e: React.FormEvent) => {
      e.preventDefault();
 
      try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
 
        const taskData = {
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
          assigned_by: parseInt(currentUser.id),
          project: newTask.project ? parseInt(newTask.project) : null,
          due_date: newTask.due_date || null,
          priority: newTask.priority,
          status: 'todo'
        };

       const response = await fetch('/api/tasks/', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(taskData),
       });

       if (response.ok) {
         const createdTask = await response.json();
         setTasks([...tasks, createdTask]);
         setIsCreateDialogOpen(false);
         setNewTask({
           title: '',
           description: '',
           assigned_to: '',
           project: '',
           due_date: '',
           priority: 'medium'
         });
         toast.success('Task created successfully!');
       } else {
         const errorData = await response.json();
         toast.error(`Failed to create task: ${errorData.detail || 'Unknown error'}`);
       }
     } catch (error) {
       console.error('Error creating task:', error);
       toast.error('Failed to create task');
     }
   };

   const updateTaskStatus = async (taskId: number, newStatus: string) => {
     try {
       const token = localStorage.getItem('token');
       const response = await fetch(`/api/tasks/${taskId}/`, {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify({
           status: newStatus,
           completed_date: newStatus === 'completed' ? new Date().toISOString() : null
         }),
       });

       if (response.ok) {
         const updatedTask = await response.json();
         setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
         toast.success(`Task ${newStatus.replace('_', ' ')} successfully`);
       } else {
         toast.error('Failed to update task status');
       }
     } catch (error) {
       console.error('Error updating task status:', error);
       toast.error('Failed to update task status');
     }
   };

   const handleEditTask = (task: Task) => {
     setEditTask({
       id: task.id,
       title: task.title,
       description: task.description,
       assigned_to: task.assigned_to?.toString() || '',
       project: task.project?.toString() || '',
       due_date: task.due_date || '',
       priority: task.priority
     });
     setIsEditDialogOpen(true);
   };

   const handleViewTask = (task: Task) => {
     setSelectedTask(task);
     setIsViewDialogOpen(true);
   };

   const handleUpdateTask = async (e: React.FormEvent) => {
     e.preventDefault();

     try {
       const token = localStorage.getItem('token');
       const taskData = {
         title: editTask.title,
         description: editTask.description,
         assigned_to: editTask.assigned_to ? parseInt(editTask.assigned_to) : null,
         project: editTask.project ? parseInt(editTask.project) : null,
         due_date: editTask.due_date || null,
         priority: editTask.priority
       };

       const response = await fetch(`/api/tasks/${editTask.id}/`, {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(taskData),
       });

       if (response.ok) {
         const updatedTask = await response.json();
         setTasks(tasks.map(task => task.id === editTask.id ? updatedTask : task));
         setIsEditDialogOpen(false);
         toast.success('Task updated successfully!');
       } else {
         const errorData = await response.json();
         toast.error(`Failed to update task: ${errorData.detail || 'Unknown error'}`);
       }
     } catch (error) {
       console.error('Error updating task:', error);
       toast.error('Failed to update task');
     }
   };

   const stats = [
     { label: 'Total Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
     { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
     { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length.toString(), icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
     { label: 'Overdue', value: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length.toString(), icon: Calendar, color: 'text-red-600', bg: 'bg-red-50' },
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
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      updateTaskStatus(taskId, newStatus);
    }
  };

  if (loading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Task Management</h1>
          <p className="text-gray-600 mt-2">Assign and track tasks across the organization</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto w-full sm:max-w-2xl mx-4 my-8">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.user.first_name} {employee.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={newTask.project} onValueChange={(value) => setNewTask({...newTask, project: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto w-full sm:max-w-2xl mx-4 my-8">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateTask} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title *</Label>
                <Input
                  id="edit-title"
                  value={editTask.title}
                  onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editTask.description}
                  onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                  placeholder="Task description..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-assigned_to">Assign To</Label>
                  <Select value={editTask.assigned_to} onValueChange={(value: string) => setEditTask({...editTask, assigned_to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.user.first_name} {employee.user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project">Project</Label>
                  <Select value={editTask.project} onValueChange={(value: string) => setEditTask({...editTask, project: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-due_date">Due Date</Label>
                  <Input
                    id="edit-due_date"
                    type="date"
                    value={editTask.due_date}
                    onChange={(e) => setEditTask({...editTask, due_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editTask.priority} onValueChange={(value: string) => setEditTask({...editTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Update Task</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Task Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto w-full sm:max-w-2xl mx-4 my-8">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                  <p className="text-gray-600 mt-2">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedTask.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedTask.priority)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                    <p className="mt-1">{selectedTask.assigned_to_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned By</Label>
                    <p className="mt-1">{selectedTask.assigned_by_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Project</Label>
                    <p className="mt-1">{selectedTask.project_name || 'No project assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                    <p className="mt-1">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No due date'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                    <p className="mt-1">{new Date(selectedTask.created_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Completed Date</Label>
                    <p className="mt-1">{selectedTask.completed_date ? new Date(selectedTask.completed_date).toLocaleDateString() : 'Not completed'}</p>
                  </div>
                </div>
              </div>
            )}
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
                {tasks.map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div key={task.id} className={`p-4 border rounded-lg transition-colors ${
                      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleTaskComplete(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={isCompleted ? 'line-through text-gray-500' : ''}>
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
                                <p>{task.assigned_to_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Due Date</p>
                                <p>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Project</p>
                              <p>{task.project_name || 'No project'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Assigned by</p>
                              <p>{task.assigned_by_name}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleViewTask(task)}>View Details</Button>
                            {!isCompleted && (
                              <Button size="sm" onClick={() => toggleTaskComplete(task.id)}>
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                {tasks.filter(t => t.assigned_to_name === user.name).map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div key={task.id} className={`p-4 border rounded-lg transition-colors ${
                      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleTaskComplete(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={isCompleted ? 'line-through text-gray-500' : ''}>
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
                                <p>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Project</p>
                              <p>{task.project_name || 'No project'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Assigned by</p>
                              <p>{task.assigned_by_name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                {tasks.filter(t => t.assigned_by_name === user.name).map(task => (
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
                        <p>{task.assigned_to_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Project</p>
                        <p>{task.project_name || 'No project'}</p>
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
