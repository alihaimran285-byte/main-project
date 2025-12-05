import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, BookOpen, Edit2, Trash2, BarChart3 } from 'lucide-react';
import CreateClassModal from './CreateClassModal';
import EditClassModal from './EditClassModal';
import ClassCard from './ClassCard';
import Notification from '../../../Notification';
import ClassStatistics from './ClassStatistics';
import DeleteConfirmationModal from './DeleteConfirmModal';

const ClassManagement = ({ classes, students, teachers, searchTerm, onDataUpdate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [searchText, setSearchText] = useState(searchTerm || '');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    visible: false
  });

  const [localClasses, setLocalClasses] = useState([]);

  useEffect(() => {
    if (classes && Array.isArray(classes)) {
      setLocalClasses(classes);
    } else {
      setLocalClasses([]);
    }
  }, [classes]);

  useEffect(() => {
    if (searchTerm !== undefined) {
      setSearchText(searchTerm);
    }
  }, [searchTerm]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
  };

  const hideNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  // ✅ CREATE CLASS FUNCTION
  // ✅ CREATE CLASS FUNCTION - Updated
const handleCreateClass = async (newClass) => {
  try {
    setLoading(true);

    // Prepare data WITHOUT _id - let backend handle it
    const classData = {
      name: newClass.name.trim(),
      code: newClass.code.trim().toUpperCase(), // Convert to uppercase
      teacher: newClass.teacher,
      grade: newClass.grade,
      subject: newClass.subject,
      schedule: newClass.schedule || "",
      room: newClass.room || "",
      capacity: newClass.capacity || 30,
      students: 0
    };

    console.log('📤 Sending data to backend:', classData);

    // Save to API
    const response = await fetch('http://localhost:3000/api/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData)
    });

    const result = await response.json();
    console.log('📥 Backend response:', result);

    if (response.ok && result.success) {
      // Save to localStorage as backup
      const storedClasses = JSON.parse(localStorage.getItem('schoolClasses') || '[]');
      storedClasses.push({
        ...result.data, // Use the data returned from backend
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('schoolClasses', JSON.stringify(storedClasses));

      showNotification("✅ Class created successfully!", "success");
      setShowCreateModal(false);
      
      if (onDataUpdate) {
        onDataUpdate();
      }
    } else {
      // Show backend error message
      showNotification(result.error || "Failed to create class", "error");
      console.error('Backend error:', result);
    }

  } catch (error) {
    console.error('❌ Create class error:', error);
    showNotification("Network error. Please check your connection.", "error");
  } finally {
    setLoading(false);
  }
};

  // ✅ EDIT CLASS FUNCTION
  const handleEditClass = async (updatedClass) => {
    try {
      setLoading(true);

      if (!selectedClass) return;

      const classId = selectedClass._id || selectedClass.id;
      
      // Update localStorage
      const storedClasses = JSON.parse(localStorage.getItem('schoolClasses') || '[]');
      const updatedClasses = storedClasses.map(cls => 
        (cls._id === classId || cls.id === classId) 
          ? { ...cls, ...updatedClass, updatedAt: new Date().toISOString() }
          : cls
      );
      localStorage.setItem('schoolClasses', JSON.stringify(updatedClasses));

      // Try to update API
      try {
        await fetch(`http://localhost:3000/api/classes/${classId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedClass)
        });
      } catch (apiError) {
        console.log('API Update failed, using localStorage only');
      }

      showNotification("Class updated successfully!", "success");
      setShowEditModal(false);
      setSelectedClass(null);
      
      if (onDataUpdate) {
        onDataUpdate();
      }

    } catch (error) {
      console.error('Edit class error:', error);
      showNotification("Error updating class", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE CLASS FUNCTION
  // ClassManagement.jsx میں handleDeleteClass function کو یوں update کریں:

const handleDeleteClass = async () => {
  if (!selectedClass) return;

  try {
    setLoading(true);
    console.log('🗑️ Deleting class:', selectedClass);

    // Get the correct ID (timestamp ya _id)
    const classId = selectedClass._id || selectedClass.id;
    
    if (!classId) {
      showNotification("Class ID is missing", "error");
      return;
    }

    console.log('🔍 Deleting class with ID:', classId);

    const response = await fetch(`http://localhost:3000/api/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 Delete response status:', response.status);

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete failed:', errorText);
      throw new Error(`Delete failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Delete result:', result);

    if (result.success) {
      showNotification("✅ Class deleted successfully!", "success");
      setShowDeleteModal(false);
      setSelectedClass(null);
      
      // Update local state immediately
      setLocalClasses(prev => prev.filter(cls => 
        cls._id !== classId && cls.id !== classId
      ));
      
      // Refresh parent data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } else {
      showNotification(result.error || "Failed to delete class", "error");
    }

  } catch (error) {
    console.error('❌ Delete class error:', error);
    showNotification(`Error: ${error.message}`, "error");
    
    // Temporary fallback: Remove from local state
    if (selectedClass) {
      const classId = selectedClass._id || selectedClass.id;
      setLocalClasses(prev => prev.filter(cls => 
        cls._id !== classId && cls.id !== classId
      ));
      showNotification("Class removed from view (backend pending)", "warning");
      setShowDeleteModal(false);
      setSelectedClass(null);
    }
  } finally {
    setLoading(false);
  }
};

  // ✅ Open edit modal
  const openEditModal = (classItem) => {
    setSelectedClass(classItem);
    setShowEditModal(true);
  };

  // ✅ Open delete confirmation modal
  const openDeleteModal = (classItem) => {
    setSelectedClass(classItem);
    setShowDeleteModal(true);
  };

  // ✅ Open statistics modal
  const openStatistics = (classItem) => {
    setSelectedClass(classItem);
    setShowStatistics(true);
  };

  const filteredClasses = localClasses.filter(classItem => {
    const matchesSearch = 
      classItem.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.teacher?.toLowerCase().includes(searchText.toLowerCase()) ||
      classItem.grade?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesSubject = 
      subjectFilter === 'All Subjects' || classItem.subject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = ['All Subjects', ...new Set(localClasses.map(c => c.subject).filter(Boolean))];

  // ✅ Calculate statistics for statistics modal
  const calculateClassStats = () => {
    if (!selectedClass) return null;
    
    return {
      totalStudents: selectedClass.students || 0,
      assignments: selectedClass.assignments || 0,
      averageGrade: selectedClass.averageGrade || 'N/A',
      attendanceRate: selectedClass.attendanceRate || 'N/A'
    };
  };

  return (
    <div className="space-y-6">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={hideNotification}
      />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing...</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateClass}
        loading={loading}
        teachers={teachers || []}
        students={students || []}
      />

      <EditClassModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
        }}
        onSave={handleEditClass}
        loading={loading}
        classData={selectedClass}
        teachers={teachers || []}
        students={students || []}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        onConfirm={handleDeleteClass}
        loading={loading}
        itemName={selectedClass?.name || 'Class'}
      />

      <ClassStatistics
        isOpen={showStatistics}
        onClose={() => {
          setShowStatistics(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
        stats={calculateClassStats()}
      />

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-800 mb-2">Class Management</h1>
            <p className="text-orange-600">Manage all classes in your school</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 mt-4 lg:mt-0"
          >
            <Plus size={20} />
            <span>Create Class</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Classes</p>
                <p className="text-2xl font-bold text-orange-800">{localClasses.length}</p>
              </div>
              <BookOpen className="text-orange-500" size={24} />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Subjects</p>
                <p className="text-2xl font-bold text-green-800">
                  {new Set(localClasses.map(c => c.subject)).size}
                </p>
              </div>
              <BookOpen className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-800">
                  {localClasses.reduce((total, cls) => total + (cls.students || 0), 0)}
                </p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search classes by name, code, teacher, or grade..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50"
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-3">
            <select 
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 text-gray-800" 
              value={subjectFilter} 
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CLASSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClasses.map((classItem) => (
          <ClassCard
            key={classItem._id || classItem.id}
            classItem={classItem}
            onEdit={() => openEditModal(classItem)}
            onDelete={() => openDeleteModal(classItem)}
            onViewStats={() => openStatistics(classItem)}
          />
        ))}
      </div>

      {/* NO CLASSES MESSAGE */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-orange-200">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-2">
            {localClasses.length === 0 
              ? "No classes found. Create your first class!" 
              : "No classes match your search criteria."
            }
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create Your First Class
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;