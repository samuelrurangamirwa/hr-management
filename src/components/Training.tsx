import { useState } from 'react';
import { User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, BookOpen, Award, Users, Plus, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface TrainingProps {
  user: User;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  enrolled: number;
  completed: number;
  instructor: string;
  status: string;
  modules: number;
}

export function Training({ user }: TrainingProps) {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'Leadership Fundamentals',
      description: 'Essential skills for effective team leadership',
      category: 'Leadership',
      duration: '8 hours',
      level: 'Intermediate',
      enrolled: 42,
      completed: 28,
      instructor: 'Dr. Sarah Williams',
      status: 'active',
      modules: 6
    },
    {
      id: 2,
      title: 'Advanced Excel for Business',
      description: 'Master Excel for data analysis and reporting',
      category: 'Technical Skills',
      duration: '12 hours',
      level: 'Advanced',
      enrolled: 65,
      completed: 52,
      instructor: 'Michael Chen',
      status: 'active',
      modules: 8
    },
    {
      id: 3,
      title: 'Effective Communication',
      description: 'Improve workplace communication skills',
      category: 'Soft Skills',
      duration: '6 hours',
      level: 'Beginner',
      enrolled: 89,
      completed: 73,
      instructor: 'Emily Rodriguez',
      status: 'active',
      modules: 5
    },
    {
      id: 4,
      title: 'Project Management Essentials',
      description: 'Learn project management methodologies and tools',
      category: 'Management',
      duration: '10 hours',
      level: 'Intermediate',
      enrolled: 38,
      completed: 15,
      instructor: 'Robert Johnson',
      status: 'active',
      modules: 7
    },
  ]);

  const myEnrollments = [
    {
      id: 1,
      courseTitle: 'Leadership Fundamentals',
      progress: 75,
      completedModules: 5,
      totalModules: 6,
      lastAccessed: '2024-06-10',
      dueDate: '2024-07-15',
      certificateEarned: false
    },
    {
      id: 2,
      courseTitle: 'Advanced Excel for Business',
      progress: 100,
      completedModules: 8,
      totalModules: 8,
      lastAccessed: '2024-06-01',
      dueDate: '2024-06-30',
      certificateEarned: true
    },
    {
      id: 3,
      courseTitle: 'Effective Communication',
      progress: 40,
      completedModules: 2,
      totalModules: 5,
      lastAccessed: '2024-06-08',
      dueDate: '2024-08-01',
      certificateEarned: false
    },
  ];

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    level: '',
    instructor: '',
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseForm.title || !courseForm.description || !courseForm.category || !courseForm.duration || !courseForm.level || !courseForm.instructor) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCourse: Course = {
      id: courses.length + 1,
      title: courseForm.title,
      description: courseForm.description,
      category: courseForm.category,
      duration: courseForm.duration,
      level: courseForm.level,
      enrolled: 0,
      completed: 0,
      instructor: courseForm.instructor,
      status: 'active',
      modules: 5,
    };

    setCourses([newCourse, ...courses]);
    setCourseForm({ title: '', description: '', category: '', duration: '', level: '', instructor: '' });
    setCourseDialogOpen(false);
    toast.success('Course created successfully!');
  };

  const handleEnrollCourse = (courseId: number) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, enrolled: course.enrolled + 1 }
        : course
    ));
    toast.success('Successfully enrolled in course!');
  };

  const stats = [
    { label: 'Available Courses', value: '24', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Enrolled', value: '234', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Completed', value: '168', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Certificates Issued', value: '156', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getLevelBadge = (level: string) => {
    const variants: Record<string, { className: string }> = {
      Beginner: { className: 'bg-green-100 text-green-700' },
      Intermediate: { className: 'bg-blue-100 text-blue-700' },
      Advanced: { className: 'bg-purple-100 text-purple-700' },
    };
    
    const variant = variants[level] || variants.Beginner;
    return <Badge className={variant.className}>{level}</Badge>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Training & Development</h1>
          <p className="text-gray-600 mt-2">Employee learning and certification programs</p>
        </div>
        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Training Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input
                  placeholder="Enter course title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Course description..."
                  rows={4}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Leadership"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 8 hours"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input
                    placeholder="Beginner, Intermediate, Advanced"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Input
                    placeholder="Instructor name"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Course</Button>
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

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{course.title}</CardTitle>
                      <p className="text-gray-600 text-sm mt-2">{course.description}</p>
                    </div>
                    {getLevelBadge(course.level)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p>{course.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p>{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Instructor</p>
                      <p>{course.instructor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Modules</p>
                      <p>{course.modules}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Enrollment</span>
                      <span className="text-sm">{course.completed}/{course.enrolled} completed</span>
                    </div>
                    <Progress value={(course.completed / course.enrolled) * 100} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" onClick={() => handleEnrollCourse(course.id)}>
                      <Play className="w-4 h-4" />
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => toast.info('Course details coming soon')}>View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {myEnrollments.map(enrollment => (
                  <div key={enrollment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3>{enrollment.courseTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Last accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                      {enrollment.certificateEarned && (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <Award className="w-3 h-3" />
                          Certified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Modules Completed</p>
                          <p>{enrollment.completedModules}/{enrollment.totalModules}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p>{new Date(enrollment.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="gap-2" onClick={() => toast.info('Launching course player...')}>
                        <Play className="w-4 h-4" />
                        Continue Learning
                      </Button>
                      {enrollment.certificateEarned && (
                        <Button size="sm" variant="outline" onClick={() => toast.success('Certificate downloaded!')}>Download Certificate</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEnrollments.filter(e => e.certificateEarned).map(cert => (
                  <div key={cert.id} className="p-6 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-start justify-between mb-4">
                      <Award className="w-12 h-12 text-green-600" />
                      <Badge className="bg-green-100 text-green-700">Certified</Badge>
                    </div>
                    <h3 className="mb-2">{cert.courseTitle}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Completed on {new Date(cert.lastAccessed).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info('Opening certificate...')}>View</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success('Certificate downloaded!')}>Download</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success('Certificate shared!')}>Share</Button>
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
