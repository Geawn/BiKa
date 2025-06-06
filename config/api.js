export const API_URL = "http://13.214.52.55:8080/api/v1"

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login/`,
  REGISTER: `${API_URL}/auth/signup/`,
  CREATE_ASSIGNMENT: `${API_URL}/assignments/`,
  USER_PROFILE: `${API_URL}/users/profile/`,
  TASK_COMPLETION_PERCENTAGE: `${API_URL}/tasks/percent-completed/`,
  TASKS: `${API_URL}/tasks/`,
  // Add other endpoints as needed
}; 