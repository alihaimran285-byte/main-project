import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

const CreateClassModal = ({ isOpen, onClose, onSave, loading, teachers }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher: '',
    grade: '',
    subject: '',
    schedule: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        code: '',
        teacher: '',
        grade: '',
        subject: '',
        schedule: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const generateClassCode = (subject) => {
    const prefixes = {
      'Mathematics': 'MATH',
      'Science': 'SCI',
      'English': 'ENG',
      'History': 'HIST',
      'Urdu': 'URDU',
      'Islamiat': 'ISL',
      'Biology': 'BIO',
      'Physics': 'PHY',
      'Chemistry': 'CHEM'
    };
    
    const prefix = prefixes[subject] || 'GEN';
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomNum}`;
  };

  const handleSubjectChange = (subject) => {
    const newCode = generateClassCode(subject);
    setFormData(prev => ({
      ...prev,
      subject,
      code: newCode
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
      handleSubjectChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Class code is required';
    }

    if (!formData.teacher.trim()) {
      newErrors.teacher = 'Please select a teacher';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade level is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a subject';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CreateClassModal.jsx میں validation اضافه کریں
const handleSubmit = (e) => {
  // const handleSubmit = (e) => {
  e.preventDefault(); // ✅ Form submission روکیں
  
  const newErrors = {};
  
  if (!formData.name?.trim()) {
    newErrors.name = 'Class name is required';
  }
  if (!formData.code?.trim()) {
    newErrors.code = 'Class code is required';
  }
  if (!formData.teacher) {
    newErrors.teacher = 'Please select a teacher';
  }
  if (!formData.grade) {
    newErrors.grade = 'Please select grade level';
  }
  if (!formData.subject) {
    newErrors.subject = 'Please select subject';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  onSave(formData); 

};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Create New Class</h2>
              <p className="text-gray-600 text-sm">Add a new class to the system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Mathematics 101, Science Lab"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
                disabled={loading}
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Urdu">Urdu</option>
                <option value="Islamiat">Islamiat</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Class Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., MATH101"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
                disabled={loading}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.grade ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
                disabled={loading}
              >
                <option value="">Select Grade</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Teacher *
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors ${
                  errors.teacher ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
                disabled={loading}
              >
                <option value="">Select Teacher</option>
                {teachers && teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <option key={teacher._id || teacher.id} value={teacher.name}>
                      {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No teachers available</option>
                )}
              </select>
              {errors.teacher && (
                <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule
              </label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                placeholder="e.g., Mon, Wed, Fri • 9:00 AM"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-gray-50 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  <span>Create Class</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;