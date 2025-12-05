import React, { useState } from 'react';

const CandidateAssignments = ({ assignments, onSubmitAssignment, onRefresh, searchTerm }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    remarks: '',
    file: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    setSubmitting(true);
    try {
      const result = await onSubmitAssignment(selectedAssignment._id, submissionData);
      if (result.success) {
        alert('Assignment submitted successfully!');
        setSelectedAssignment(null);
        setSubmissionData({ remarks: '', file: '' });
        onRefresh();
      } else {
        alert(result.message || 'Failed to submit assignment');
      }
    } catch (error) {
      alert('Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6">
          <h3 className="text-sm font-medium opacity-90">Total Assignments</h3>
          <p className="text-3xl font-bold mt-2">{filteredAssignments.length}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
          <h3 className="text-sm font-medium opacity-90">Submitted</h3>
          <p className="text-3xl font-bold mt-2">
            {filteredAssignments.filter(a => a.isSubmitted).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6">
          <h3 className="text-sm font-medium opacity-90">Graded</h3>
          <p className="text-3xl font-bold mt-2">
            {filteredAssignments.filter(a => a.isGraded).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6">
          <h3 className="text-sm font-medium opacity-90">Pending</h3>
          <p className="text-3xl font-bold mt-2">
            {filteredAssignments.filter(a => !a.isSubmitted).length}
          </p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Assignments</h2>
          <p className="text-sm text-gray-600">View and submit your assignments</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map(assignment => (
                <tr key={assignment._id} className="hover:bg-orange-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-500">{assignment.teacherName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      {assignment.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${
                        assignment.daysRemaining <= 3 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {assignment.daysRemaining > 0 
                          ? `${assignment.daysRemaining} days left`
                          : 'Overdue'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        assignment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {assignment.isGraded ? (
                      <span className="text-lg font-bold text-green-600">
                        {assignment.submission?.marks}/{assignment.totalMarks}
                      </span>
                    ) : assignment.isSubmitted ? (
                      <span className="text-gray-500">Grading...</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!assignment.isSubmitted ? (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 text-sm"
                      >
                        Submit
                      </button>
                    ) : assignment.isGraded ? (
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                        View Feedback
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        View Submission
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Submit Assignment</h3>
              <p className="text-sm text-gray-600">{selectedAssignment.title}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={submissionData.remarks}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      remarks: e.target.value
                    })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any comments for the teacher..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File (URL)
                  </label>
                  <input
                    type="text"
                    value={submissionData.file}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      file: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://example.com/assignment.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide URL of your submitted file
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setSubmissionData({ remarks: '', file: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateAssignments;