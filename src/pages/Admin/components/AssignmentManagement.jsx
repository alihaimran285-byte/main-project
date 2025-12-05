// components/AssignmentManagement/AssignmentManagement.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, User, Users, Plus, Search, Filter, Edit, 
  Trash2, CheckCircle, XCircle, Clock, AlertCircle,
  Download, Upload, RefreshCw, Calendar, FileText, Eye,
  Save, X, Loader2
} from 'lucide-react';

const AssignmentManagement = ({ 
  students = [], 
  teachers = [], 
  onDataUpdate = () => {}, 
  searchTerm = '',
  updateData = () => {},
  deleteData = () => {}
}) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API Base URL
  const API_BASE = 'http://localhost:3000';
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    assignedTo: 'all',
    studentId: '',
    class: '',
    teacherId: '',
    dueDate: '',
    totalMarks: '100',
    instructions: ''
  });

  // Get unique classes from students
  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))];

  // Fetch assignments from backend
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/assignments`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignments(data.data || []);
        } else {
          console.error('Failed to fetch assignments:', data.error);
          // Load from localStorage as fallback
          loadFromLocalStorage();
        }
      } else {
        console.error('HTTP error fetching assignments:', response.status);
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAssignments(parsed);
      } else {
        // Create sample assignments
        const sampleAssignments = createSampleAssignments();
        setAssignments(sampleAssignments);
        localStorage.setItem('assignments', JSON.stringify(sampleAssignments));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setAssignments([]);
    }
  };

  const createSampleAssignments = () => {
    return [
      {
        _id: '1',
        title: 'Mathematics Homework - Chapter 1',
        description: 'Solve all problems from Chapter 1',
        subject: 'Mathematics',
        teacherId: teachers[0]?._id || '1',
        teacherName: teachers[0]?.name || 'Mr. Johnson',
        assignedTo: 'specific-class',
        class: '5A',
        studentIds: students.filter(s => s.class === '5A').map(s => s._id),
        studentNames: students.filter(s => s.class === '5A').map(s => s.name),
        dueDate: '2024-03-20',
        totalMarks: 100,
        submittedCount: 1,
        totalStudents: students.filter(s => s.class === '5A').length,
        status: 'active',
        createdAt: '2024-03-10',
        instructions: 'Submit handwritten solutions'
      },
      {
        _id: '2',
        title: 'Science Project - Solar System',
        description: 'Create a model of the solar system',
        subject: 'Science',
        teacherId: teachers[1]?._id || '2',
        teacherName: teachers[1]?.name || 'Ms. Williams',
        assignedTo: 'specific-student',
        studentId: students[0]?._id || '1',
        studentName: students[0]?.name || 'Aarav Sharma',
        class: students[0]?.class || '5A',
        dueDate: '2024-03-25',
        totalMarks: 50,
        submittedCount: 0,
        totalStudents: 1,
        status: 'pending',
        createdAt: '2024-03-12',
        instructions: 'Use recyclable materials'
      }
    ];
  };

  // Handle Create Assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!formData.title || !formData.subject || !formData.dueDate || !formData.teacherId) {
      alert('Please fill all required fields');
      setIsSubmitting(false);
      return;
    }

    const teacher = teachers.find(t => t._id === formData.teacherId);
    if (!teacher) {
      alert('Selected teacher not found');
      setIsSubmitting(false);
      return;
    }

    const assignmentData = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      teacherId: formData.teacherId,
      teacherName: teacher.name,
      assignedTo: formData.assignedTo,
      studentId: formData.assignedTo === 'specific-student' ? formData.studentId : null,
      studentName: formData.assignedTo === 'specific-student' 
        ? students.find(s => s._id === formData.studentId)?.name : null,
      class: formData.assignedTo === 'specific-class' ? formData.class : null,
      dueDate: formData.dueDate,
      totalMarks: parseInt(formData.totalMarks) || 100,
      instructions: formData.instructions
    };

    try {
      // Try to save to backend
      const response = await fetch(`${API_BASE}/api/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Add to local state
          const newAssignment = data.data;
          setAssignments(prev => [...prev, newAssignment]);
          
          // Save to localStorage
          const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
          localStorage.setItem('assignments', JSON.stringify([...currentAssignments, newAssignment]));
          
          setShowAddModal(false);
          resetForm();
          alert('Assignment created successfully!');
          
          // Refresh parent component
          onDataUpdate();
        } else {
          throw new Error(data.error || 'Failed to create assignment');
        }
      } else {
        throw new Error('HTTP error: ' + response.status);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      
      // Fallback: Create locally
      const newAssignment = {
        _id: Date.now().toString(),
        ...assignmentData,
        submittedCount: 0,
        totalStudents: calculateTotalStudents(assignmentData),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      
      // Save to localStorage
      const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      localStorage.setItem('assignments', JSON.stringify([...currentAssignments, newAssignment]));
      
      setShowAddModal(false);
      resetForm();
      alert('Assignment created (offline mode)!');
      
      onDataUpdate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalStudents = (assignmentData) => {
    if (assignmentData.assignedTo === 'all') {
      return students.length;
    } else if (assignmentData.assignedTo === 'specific-class' && assignmentData.class) {
      return students.filter(s => s.class === assignmentData.class).length;
    } else if (assignmentData.assignedTo === 'specific-student') {
      return 1;
    }
    return 0;
  };

  // Handle Edit Assignment
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      subject: assignment.subject || '',
      assignedTo: assignment.assignedTo || 'all',
      studentId: assignment.studentId || '',
      class: assignment.class || '',
      teacherId: assignment.teacherId || '',
      dueDate: assignment.dueDate?.split('T')[0] || '',
      totalMarks: assignment.totalMarks?.toString() || '100',
      instructions: assignment.instructions || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks) || 100
      };

      // Try to update on backend
      const response = await fetch(`${API_BASE}/api/assignments/${editingAssignment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setAssignments(prev => prev.map(a => 
            a._id === editingAssignment._id ? data.data : a
          ));
          
          // Update localStorage
          const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
          const updatedAssignments = currentAssignments.map(a => 
            a._id === editingAssignment._id ? data.data : a
          );
          localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
          
          setShowEditModal(false);
          resetForm();
          alert('Assignment updated successfully!');
          
          onDataUpdate();
        } else {
          throw new Error(data.error || 'Failed to update assignment');
        }
      } else {
        throw new Error('HTTP error: ' + response.status);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      
      // Fallback: Update locally
      const updatedAssignment = {
        ...editingAssignment,
        ...formData,
        totalMarks: parseInt(formData.totalMarks) || 100,
        updatedAt: new Date().toISOString()
      };
      
      setAssignments(prev => prev.map(a => 
        a._id === editingAssignment._id ? updatedAssignment : a
      ));
      
      // Update localStorage
      const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const updatedAssignments = currentAssignments.map(a => 
        a._id === editingAssignment._id ? updatedAssignment : a
      );
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      
      setShowEditModal(false);
      resetForm();
      alert('Assignment updated (offline mode)!');
      
      onDataUpdate();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Assignment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      // Try to delete from backend
      const response = await fetch(`${API_BASE}/api/assignments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from local state
          setAssignments(prev => prev.filter(a => a._id !== id));
          
          // Remove from localStorage
          const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
          const updatedAssignments = currentAssignments.filter(a => a._id !== id);
          localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
          
          alert('Assignment deleted successfully!');
          onDataUpdate();
        } else {
          throw new Error(data.error || 'Failed to delete assignment');
        }
      } else {
        throw new Error('HTTP error: ' + response.status);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      
      // Fallback: Delete locally
      setAssignments(prev => prev.filter(a => a._id !== id));
      
      const currentAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const updatedAssignments = currentAssignments.filter(a => a._id !== id);
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      
      alert('Assignment deleted (offline mode)!');
      onDataUpdate();
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      assignedTo: 'all',
      studentId: '',
      class: '',
      teacherId: '',
      dueDate: '',
      totalMarks: '100',
      instructions: ''
    });
    setEditingAssignment(null);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus !== 'all' && assignment.status !== filterStatus) return false;
    if (filterTeacher !== 'all' && assignment.teacherId !== filterTeacher) return false;
    if (filterClass !== 'all' && assignment.class !== filterClass) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        assignment.title?.toLowerCase().includes(term) ||
        assignment.description?.toLowerCase().includes(term) ||
        assignment.subject?.toLowerCase().includes(term) ||
        assignment.teacherName?.toLowerCase().includes(term) ||
        (assignment.studentName && assignment.studentName.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  // Calculate statistics
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    pending: assignments.filter(a => a.status === 'pending').length,
    overdue: assignments.filter(a => {
      if (a.status === 'completed') return false;
      return new Date(a.dueDate) < new Date();
    }).length
  };

  const calculateSubmissionRate = (assignment) => {
    if (!assignment.totalStudents || assignment.totalStudents === 0) return 0;
    return Math.round((assignment.submittedCount / assignment.totalStudents) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Assignment Management</h1>
            <p className="opacity-90">Create and manage assignments for students</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {stats.total} Total Assignments
              </div>
              <div className="bg-green-500 bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {stats.active} Active
              </div>
              <div className="bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {stats.pending} Pending
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAssignments}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg"
            >
              <Plus size={20} />
              <span>New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="all">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full border border-orange-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterTeacher('all');
                setFilterClass('all');
              }}
              className="w-full border border-orange-500 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Submission</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.overdue}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-800">All Assignments ({filteredAssignments.length})</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchAssignments}
                className="flex items-center space-x-2 px-4 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No assignments found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-orange-600 hover:text-orange-700 underline"
              >
                Create your first assignment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Assignment</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Teacher</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Assigned To</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Due Date</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Submission</th>
                    <th className="text-left p-4 text-sm font-medium text-orange-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(assignment => {
                    const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
                    const submissionRate = calculateSubmissionRate(assignment);
                    
                    return (
                      <tr key={assignment._id} className="border-b border-orange-100 hover:bg-orange-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-800">{assignment.title}</p>
                            <p className="text-sm text-gray-600">{assignment.subject}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                              <User size={14} className="text-orange-600" />
                            </div>
                            <span className="text-sm font-medium">{assignment.teacherName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {assignment.assignedTo === 'all' ? (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">All Students</span>
                          ) : assignment.assignedTo === 'specific-class' ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Class {assignment.class}</span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{assignment.studentName}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Calendar size={14} className="text-gray-400 mr-1" />
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {new Date(assignment.dueDate).toLocaleDateString()}
                              {isOverdue && <span className="ml-1">⚠️</span>}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${submissionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{assignment.submittedCount}/{assignment.totalStudents}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewAssignment(assignment)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(assignment._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-orange-800">Create New Assignment</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Enter assignment title"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="e.g., Mathematics, Science"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Describe the assignment..."
                      rows="3"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigning Teacher *
                      </label>
                      <select
                        value={formData.teacherId}
                        onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.name} - {teacher.subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To *
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="all">All Students</option>
                        <option value="specific-class">Specific Class</option>
                        <option value="specific-student">Specific Student</option>
                      </select>
                    </div>
                  </div>
                  
                  {formData.assignedTo === 'specific-class' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Class
                      </label>
                      <select
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {formData.assignedTo === 'specific-student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Student
                      </label>
                      <select
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name} - {student.class} - {student.rollNo}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="e.g., 100"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Provide instructions for students..."
                      rows="3"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg flex items-center space-x-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Create Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && editingAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-orange-800">Edit Assignment</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      rows="3"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigning Teacher *
                      </label>
                      <select
                        value={formData.teacherId}
                        onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.name} - {teacher.subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To *
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="all">All Students</option>
                        <option value="specific-class">Specific Class</option>
                        <option value="specific-student">Specific Student</option>
                      </select>
                    </div>
                  </div>
                  
                  {formData.assignedTo === 'specific-class' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Class
                      </label>
                      <select
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {formData.assignedTo === 'specific-student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Student
                      </label>
                      <select
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name} - {student.class} - {student.rollNo}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="e.g., 100"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      rows="3"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg flex items-center space-x-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Update Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Assignment Modal */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-orange-800">Assignment Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{selectedAssignment.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                      {selectedAssignment.subject}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </span>
                    <span>Total Marks: {selectedAssignment.totalMarks}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedAssignment.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedAssignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedAssignment.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                    {selectedAssignment.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Assigned By</h5>
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedAssignment.teacherName}</p>
                        <p className="text-sm text-gray-600">Teacher</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Assigned To</h5>
                    {selectedAssignment.assignedTo === 'all' ? (
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="font-medium">All Students</p>
                        <p className="text-sm text-gray-600">Total: {selectedAssignment.totalStudents} students</p>
                      </div>
                    ) : selectedAssignment.assignedTo === 'specific-class' ? (
                      <div className="p-3 bg-green-50 rounded-xl">
                        <p className="font-medium">Class {selectedAssignment.class}</p>
                        <p className="text-sm text-gray-600">{selectedAssignment.totalStudents} students</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <p className="font-medium">{selectedAssignment.studentName}</p>
                        <p className="text-sm text-gray-600">Class: {selectedAssignment.class}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Submission Status</h5>
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Submitted: {selectedAssignment.submittedCount}/{selectedAssignment.totalStudents}</span>
                      <span className="font-medium text-green-600">
                        {calculateSubmissionRate(selectedAssignment)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${calculateSubmissionRate(selectedAssignment)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {selectedAssignment.instructions && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Instructions</h5>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                      {selectedAssignment.instructions}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;