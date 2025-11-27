import { useState } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Plus, Users, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface ProjectsProps {
  user: User;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: string[];
  priority: string;
  department: string;
}

export function Projects({ user }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'HR System Redesign',
      description: 'Complete overhaul of the HR management system',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-04-01',
      endDate: '2024-08-31',
      budget: 150000,
      spent: 97500,
      team: ['John Doe', 'Jane Smith', 'Michael Chen'],
      priority: 'high',
      department: 'Engineering'
    },
    {
      id: 2,
      name: 'Employee Onboarding Portal',
      description: 'Digital platform for new employee onboarding',
      status: 'in-progress',
      progress: 45,
      startDate: '2024-05-15',
      endDate: '2024-09-15',
      budget: 80000,
      spent: 36000,
      team: ['Sarah Johnson', 'David Kim'],
      priority: 'medium',
      department: 'HR'
    },
    {
      id: 3,
      name: 'Performance Review System',
      description: 'Automated performance evaluation platform',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-10',
      endDate: '2024-05-30',
      budget: 120000,
      spent: 115000,
      team: ['Robert Brown', 'Lisa Anderson', 'Emily Rodriguez'],
      priority: 'high',
      department: 'HR'
    },
    {
      id: 4,
      name: 'Training Platform Integration',
      description: 'Integration with external LMS system',
      status: 'planning',
      progress: 15,
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      budget: 200000,
      spent: 30000,
      team: ['Michael Chen', 'Sarah Johnson'],
      priority: 'low',
      department: 'Training'
    },
  ]);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    department: '',
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectForm.name || !projectForm.description || !projectForm.startDate || !projectForm.endDate || !projectForm.budget || !projectForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProject: Project = {
      id: projects.length + 1,
      name: projectForm.name,
      description: projectForm.description,
      status: 'planning',
      progress: 0,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      budget: parseFloat(projectForm.budget),
      spent: 0,
      team: [user.name],
      priority: 'medium',
      department: projectForm.department,
    };

    setProjects([newProject, ...projects]);
    setProjectForm({ name: '', description: '', startDate: '', endDate: '', budget: '', department: '' });
    setProjectDialogOpen(false);
    toast.success('Project created successfully!');
  };

  const handleUpdateStatus = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    let newStatus = project.status;
    switch (project.status) {
      case 'planning':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'planning';
        break;
    }

    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, status: newStatus, progress: newStatus === 'completed' ? 100 : p.progress }
        : p
    ));
    toast.success(`Project status updated to ${newStatus}`);
  };

  const stats = [
    { label: 'Active Projects', value: '8', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: '12', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Team Members', value: '47', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg Completion', value: '78%', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      planning: { label: 'Planning', className: 'bg-gray-100 text-gray-700' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
      'on-hold': { label: 'On Hold', className: 'bg-orange-100 text-orange-700' },
    };
    
    const variant = variants[status] || variants.planning;
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Project Management</h1>
          <p className="text-gray-600 mt-2">Track and manage organizational projects</p>
        </div>
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="Enter project name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Project description..."
                  rows={4}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    placeholder="e.g., Engineering"
                    value={projectForm.department}
                    onChange={(e) => setProjectForm({ ...projectForm, department: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{project.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(project.status)}
                  {getPriorityBadge(project.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Department</p>
                  <p>{project.department}</p>
                </div>
                <div>
                  <p className="text-gray-500">Team Size</p>
                  <p>{project.team.length} members</p>
                </div>
                <div>
                  <p className="text-gray-500">Timeline</p>
                  <p>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</p>
                </div>
              </div>

              {/* Budget Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Budget Utilization</span>
                  <span className="text-sm">{((project.spent / project.budget) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(project.spent / project.budget) * 100} className="h-2" />
              </div>

              {/* Team Members */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Team Members</p>
                <div className="flex -space-x-2">
                  {project.team.map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                      title={member}
                    >
                      <span className="text-xs text-blue-600">{member.charAt(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('Project details coming soon')}>View Details</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateStatus(project.id)}>Update Status</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
