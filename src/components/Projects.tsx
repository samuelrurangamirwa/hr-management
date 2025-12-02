import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Plus, Users, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/projects/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else if (response.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else {
          toast.error('Failed to load projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDetailsDialogOpen, setProjectDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectForm.name || !projectForm.description || !projectForm.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const projectData: any = {
        name: projectForm.name,
        description: projectForm.description,
        start_date: projectForm.start_date,
        budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
      };

      if (projectForm.end_date) {
        projectData.end_date = projectForm.end_date;
      }

      const response = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setProjectForm({ name: '', description: '', start_date: '', end_date: '', budget: '' });
        setProjectDialogOpen(false);
        toast.success('Project created successfully!');
      } else if (response.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };


  const handleViewProjectDetails = (project: any) => {
    setSelectedProject(project);
    setProjectDetailsDialogOpen(true);
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

  if (loading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Project Management</h1>
          <p className="text-gray-600 mt-2">Track and manage organizational projects</p>
        </div>
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              disabled={user.role !== 'admin' && user.role !== 'manager'}
              title={user.role !== 'admin' && user.role !== 'manager' ? 'Only managers and admins can create projects' : ''}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto w-full sm:max-w-2xl mx-4 my-8">
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
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                  />
                </div>
              </div>
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
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Manager</p>
                  <p>{project.manager_name || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Team Size</p>
                  <p>{project.team_members?.length || 0} members</p>
                </div>
                <div>
                  <p className="text-gray-500">Timeline</p>
                  <p>{new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p>${project.budget?.toLocaleString() || '0'}</p>
                </div>
              </div>

              {/* Team Members */}
              {project.team_members && project.team_members.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Team Members</p>
                  <div className="flex -space-x-2">
                    {project.team_members.map((member: any, index: number) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                        title={member.employee_name}
                      >
                        <span className="text-xs text-blue-600">{member.employee_name?.charAt(0) || '?'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewProjectDetails(project)}>View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Details Dialog */}
      <Dialog open={projectDetailsDialogOpen} onOpenChange={setProjectDetailsDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto w-full sm:max-w-2xl mx-4 my-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Project Details - {selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Project Overview */}
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedProject.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-updated based on tasks</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedProject.priority)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1 text-gray-700">{selectedProject.description}</p>
                </div>
              </div>

              {/* Progress Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Task Completion</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Calculated as average of task completion levels:<br/>
                    Todo (0%) → In Progress (50%) → Review (75%) → Completed (100%)
                  </p>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Manager</Label>
                      <p className="mt-1">{selectedProject.manager_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                      <p className="mt-1">{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Budget</Label>
                      <p className="mt-1">${selectedProject.budget?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Team Size</Label>
                      <p className="mt-1">{selectedProject.team_members?.length || 0} members</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">End Date</Label>
                      <p className="mt-1">{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Project ID</Label>
                      <p className="mt-1">#{selectedProject.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {selectedProject.team_members && selectedProject.team_members.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedProject.team_members.map((member: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {member.employee_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.employee_name}</p>
                          <p className="text-sm text-gray-500">{member.role || 'Team Member'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Tasks Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tasks Summary</h3>
                <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedProject.tasks?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'completed').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'in_progress').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'todo').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
