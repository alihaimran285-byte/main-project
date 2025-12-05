import React from 'react';
import { Plus, RefreshCw, Users, Filter, Search, BookOpen } from 'lucide-react';

const TeacherHeader = ({ teachers, filteredTeachers, loading, onRefresh, onAddTeacher }) => {
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const uniqueSubjects = new Set(teachers.map(t => t.subject)).size;

  const stats = [
    {
      icon: Users,
      label: 'Total Teachers',
      value: teachers.length,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      icon: Filter,
      label: 'Active',
      value: activeTeachers,
      bgColor: 'bg-peach-100',
      iconColor: 'text-peach-600'
    },
    {
      icon: Search,
      label: 'Showing',
      value: filteredTeachers.length,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      icon: BookOpen,
      label: 'Subjects',
      value: uniqueSubjects,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Teachers Management</h1>
          <p className="text-orange-700 mt-2">Manage all teachers in your institution</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          
          <button 
            onClick={onAddTeacher}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Plus size={18} className="mr-2" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">{stat.label}</p>
                <p className="text-2xl font-bold text-orange-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherHeader;