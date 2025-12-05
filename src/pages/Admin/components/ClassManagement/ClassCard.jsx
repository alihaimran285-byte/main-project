import React from 'react';
import { Calendar, Users, Edit3, Trash2, BookOpen, BarChart3 } from 'lucide-react';

const ClassCard = ({ classItem, onEdit, onDelete, onViewStats }) => {
  if (!classItem) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <p className="text-red-500 text-center text-sm md:text-base">Error: Class data missing</p>
      </div>
    );
  }

  // Safely handle schedule data - could be string or object
  const {
    name = 'Class Name',
    subject = 'General',
    schedule: rawSchedule = 'Schedule not set',
    teacher = 'Teacher not assigned',
    grade = 'Not specified',
    students = 0,
    code = 'N/A',
    color = 'bg-gray-500',
    _id,
    id,
    className, // Backend uses className
    classTeacherName, // Backend uses classTeacherName
    totalStudents,
    capacity,
    roomNo
  } = classItem;

  const classId = _id || id;
  
  // Use backend field names if available
  const displayName = name === 'Class Name' && className ? className : name;
  const displayTeacher = teacher === 'Teacher not assigned' && classTeacherName ? classTeacherName : teacher;
  const displayStudents = totalStudents !== undefined ? totalStudents : students;
  const displayCapacity = capacity || 40;
  
  // Handle schedule - convert object to string if needed
  const formatSchedule = () => {
    if (!rawSchedule) return 'Schedule not set';
    
    if (typeof rawSchedule === 'string') {
      return rawSchedule;
    }
    
    if (typeof rawSchedule === 'object') {
      // Convert object to readable string
      try {
        // If it's a schedule object with days
        if (rawSchedule.Monday || rawSchedule.Tuesday) {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          const firstDay = days.find(day => rawSchedule[day]);
          if (firstDay) {
            const periods = Array.isArray(rawSchedule[firstDay]) 
              ? rawSchedule[firstDay].slice(0, 2) 
              : [rawSchedule[firstDay]];
            return `${firstDay}: ${periods.join(', ')}${days.length > 1 ? '...' : ''}`;
          }
        }
        
        // For any other object structure
        return Object.entries(rawSchedule)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ') + (Object.keys(rawSchedule).length > 2 ? '...' : '');
      } catch (error) {
        return JSON.stringify(rawSchedule);
      }
    }
    
    return 'Schedule not set';
  };

  const schedule = formatSchedule();

  // ✅ Get color class safely
  const getColorClass = () => {
    const colorMap = {
      'bg-blue-500': 'bg-blue-500',
      'bg-green-500': 'bg-green-500', 
      'bg-purple-500': 'bg-purple-500',
      'bg-orange-500': 'bg-orange-500',
      'bg-red-500': 'bg-red-500',
      'bg-indigo-500': 'bg-indigo-500',
      'bg-pink-500': 'bg-pink-500',
      'bg-teal-500': 'bg-teal-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  // ✅ Get subject icon
  const getSubjectIcon = () => {
    const subjectIcons = {
      'Mathematics': '🧮',
      'Science': '🔬',
      'English': '📚',
      'History': '📜',
      'Urdu': '📖',
      'Islamiat': '🕌',
      'Biology': '🧬',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Social Studies': '🌍',
      'Computer Science': '💻'
    };
    return subjectIcons[subject] || '📝';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:border-orange-300 w-full">
      {/* Header with gradient - Responsive height */}
      <div className={`h-2 md:h-3 ${getColorClass()} group-hover:h-3 md:group-hover:h-4 transition-all duration-300`}></div>
      
      <div className="p-4 md:p-6">
        {/* Class Header - Stack on mobile, flex on desktop */}
        <div className="mb-3 md:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2 sm:gap-0">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-lg md:text-xl">{getSubjectIcon()}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-1 break-words">
                  {displayName}
                </h3>
                <p className="text-xs md:text-sm text-orange-600 font-medium line-clamp-1">
                  {subject}
                </p>
              </div>
            </div>
            <span className="self-start px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap mt-1 sm:mt-0">
              {code}
            </span>
          </div>
          
          <div className="flex items-start sm:items-center space-x-2 text-xs md:text-sm text-gray-500 mt-2">
            <Calendar size={14} className="text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="line-clamp-2 sm:line-clamp-1 break-words">{schedule}</span>
          </div>
        </div>

        {/* Class Details - Grid layout for better responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-1 mb-1 sm:mb-0">
              <BookOpen size={14} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Teacher:</span>
            </span>
            <span className="font-medium text-gray-800 text-sm text-right line-clamp-1 sm:max-w-[120px] break-words ml-5 sm:ml-0">
              {displayTeacher}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-1 mb-1 sm:mb-0">
              <Users size={14} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Grade:</span>
            </span>
            <span className="font-medium text-gray-800 text-sm ml-5 sm:ml-0">
              {grade}
            </span>
          </div>
          
          {/* Students count - show only if data exists */}
          {(displayStudents !== undefined || roomNo) && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center space-x-1 mb-1 sm:mb-0">
                  <Users size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Students:</span>
                </span>
                <span className="font-medium text-gray-800 text-sm ml-5 sm:ml-0">
                  {displayStudents}/{displayCapacity}
                </span>
              </div>
              
              {roomNo && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-1 mb-1 sm:mb-0">
                    <span className="text-xs sm:text-sm">Room:</span>
                  </span>
                  <span className="font-medium text-gray-800 text-sm ml-5 sm:ml-0">
                    {roomNo}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons - Stack on mobile, flex on desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-2 sm:gap-0">
          <div className="text-xs text-gray-500 order-2 sm:order-1">
            ID: {classId ? `...${classId.slice(-4)}` : 'N/A'}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1 order-1 sm:order-2 w-full sm:w-auto">
            <button 
              className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 hover:border-blue-300 flex-1 sm:flex-none text-xs sm:text-sm flex items-center justify-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewStats && onViewStats(classItem);
              }}
              title="View Statistics"
            >
              <BarChart3 size={14} className="sm:mr-1" />
              <span className="sm:hidden">Stats</span>
            </button>
            <button 
              className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300 flex-1 sm:flex-none text-xs sm:text-sm flex items-center justify-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(classItem);
              }}
              title="Edit Class"
            >
              <Edit3 size={14} className="sm:mr-1" />
              <span className="sm:hidden">Edit</span>
            </button>
            <button 
              className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 hover:border-red-300 flex-1 sm:flex-none text-xs sm:text-sm flex items-center justify-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete && onDelete(classItem);
              }}
              title="Delete Class"
            >
              <Trash2 size={14} className="sm:mr-1" />
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;