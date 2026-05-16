/**
 * User service - handles API calls for user operations
 * This should connect to your backend API
 */

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

/**
 * Create a new user via API
 * @param name - User's full name
 * @param email - User's email address
 * @param role - Optional user role (default: 'student')
 * @returns Promise resolving to created user data
 */
export async function createUser(
  name: string,
  email: string,
  role: string = 'student'
): Promise<CreateUserResponse> {
  try {
    // Replace with your actual API endpoint
    const apiEndpoint = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiEndpoint}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        email,
        role,
      } as CreateUserRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to create user: ${response.statusText}`);
    }

    const data: CreateUserResponse = await response.json();
    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
