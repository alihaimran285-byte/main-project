import React from 'react';
import { Mail, Phone, BookOpen, Users, Edit3, Trash2, Award, Calendar, Clock } from 'lucide-react';

const TeacherCard = ({ teacher, onEdit, onDelete }) => {
  if (!teacher) return null;

  // Extract teacher data with default values
  const {
    _id,
    name = 'Teacher Name',
    email = 'No email',
    phone = 'Not provided',
    subject = 'General',
    status = 'active',
    classes = 1,
    experience = 0,
    schedule = 'Not set',
    totalStudents = 0,
    rating = '4.5',
    joinDate,
    createdAt,
    avatar
  } = teacher;

  // Get avatar URL
  const getAvatarUrl = () => {
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fdba74&color=fff&size=128`;
  };

  // Get status color
  const getStatusColor = () => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'on leave': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Format experience
  const formatExperience = (exp) => {
    if (!exp || exp === 0) return 'Fresh';
    return `${exp} year${exp > 1 ? 's' : ''}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    if (typeof date === 'string') {
      try {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return 'Invalid Date';
      }
    }
    return date;
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300 hover:border-orange-300 overflow-hidden h-full flex flex-col">
      {/* Header Section */}
      <div className="h-3 bg-gradient-to-r from-orange-500 to-orange-400 flex-shrink-0"></div>
      
      <div className="p-4 sm:p-5 flex-grow flex flex-col">
        {/* Teacher Info */}
        <div className="flex items-start gap-3 mb-4 flex-shrink-0">
          <img 
            src={getAvatarUrl()} 
            alt={name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 sm:border-3 border-white shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-orange-900 truncate leading-tight">
              {name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full border ${getStatusColor()} whitespace-nowrap`}>
                {status}
              </span>
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200 whitespace-nowrap truncate max-w-[80px] sm:max-w-[100px]">
                {subject}
              </span>
            </div>
            
            {/* Contact Info */}
            <div className="mt-2 sm:mt-3 space-y-1">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Mail size={12} className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-700 truncate text-ellipsis overflow-hidden">
                  {email}
                </span>
              </div>
              {phone && phone !== 'Not provided' && (
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Phone size={12} className="text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teacher Details */}
        <div className="mb-4 flex-grow min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <BookOpen size={12} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Teacher Details
              </span>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="space-y-2">
            {/* Experience */}
            <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Experience:</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-800">
                {formatExperience(experience)}
              </span>
            </div>
            
            {/* ✅ FIX: Schedule with proper wrapping and no overlap */}
            {schedule && schedule !== 'Not set' && (
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Schedule:</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-800 break-words pl-4">
                  {schedule}
                </p>
              </div>
            )}
            
            {/* Join Date */}
            {(joinDate || createdAt) && (
              <div className="flex items-center justify-between bg-purple-50 p-2 rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Joined:</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  {formatDate(joinDate || createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 flex-shrink-0">
          {/* Classes Count */}
          <div className="bg-orange-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <BookOpen size={12} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs text-orange-700 whitespace-nowrap">Classes</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-orange-900">
              {classes}
            </p>
          </div>
          
          {/* ✅ FIX: Students Count - Now displays correctly */}
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Users size={12} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-700 whitespace-nowrap">Students</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-blue-900">
              {totalStudents}
            </p>
          </div>
          
          {/* Rating */}
          <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Award size={12} className="text-green-500 flex-shrink-0" />
              <span className="text-xs text-green-700 whitespace-nowrap">Rating</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-green-900">
              {rating}/5
            </p>
          </div>
          
          {/* Experience Years */}
          <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Clock size={12} className="text-purple-500 flex-shrink-0" />
              <span className="text-xs text-purple-700 whitespace-nowrap">Exp.</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-purple-900">
              {experience || 0}y
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-3 border-t border-orange-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 truncate pr-2">
              ID: {_id ? _id.slice(-6) : 'N/A'}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onEdit && onEdit(teacher)}
                className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300 flex-shrink-0"
                title="Edit Teacher"
              >
                <Edit3 size={14} className="sm:size-4" />
              </button>
              <button
                onClick={() => onDelete && onDelete(teacher)}
                className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 hover:border-red-300 flex-shrink-0"
                title="Delete Teacher"
              >
                <Trash2 size={14} className="sm:size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;