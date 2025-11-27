import React, { useState } from 'react';

const ChangePasswordForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword.trim()) newErrors.newPassword = 'New password is required';
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically make an API call to change the password
      console.log('Password change submitted:', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Success - close the form
      onClose();
      alert('Password changed successfully!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface-800 rounded-xl border border-background-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-white">Change Password</h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text-white text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-text-white text-sm font-medium mb-2">
              Current Password *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full bg-background-700 border ${
                errors.currentPassword ? 'border-red-500' : 'border-background-600'
              } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter current password"
              disabled={isSubmitting}
            />
            {errors.currentPassword && <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-text-white text-sm font-medium mb-2">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full bg-background-700 border ${
                errors.newPassword ? 'border-red-500' : 'border-background-600'
              } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter new password"
              disabled={isSubmitting}
            />
            {errors.newPassword && <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-text-white text-sm font-medium mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-background-700 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-background-600'
              } rounded-lg px-4 py-2 text-text-white placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Confirm new password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Password Requirements */}
          <div className="bg-background-700 rounded-lg p-3">
            <p className="text-text-light text-sm font-medium mb-2">Password Requirements:</p>
            <ul className="text-text-gray text-xs space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Should not match current password</li>
              <li>• Use a combination of letters, numbers, and symbols</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-background-600 text-text-white rounded-lg hover:bg-background-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Changing...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;