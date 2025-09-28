/**
 * API Client - A reusable component for making POST requests to the backend
 * 
 * Usage:
 * import ApiClient from './ApiClient'
 * 
 * const apiClient = new ApiClient()
 * const response = await apiClient.post('/api/endpoint', { data: 'value' })
 * 
 * Or with custom endpoint:
 * const apiClient = new ApiClient('https://api.example.com')
 */

class ApiClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL
  }

  /**
   * Make a POST request to the specified endpoint
   * @param {string} endpoint - The API endpoint (e.g., '/api/users')
   * @param {Object} body - The request body data (optional)
   * @param {Object} options - Additional fetch options (optional)
   * @returns {Promise<Object>} - The response data
   */
  async post(endpoint, body = null, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      
      const defaultOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }

      // Add body if provided
      if (body !== null) {
        defaultOptions.body = JSON.stringify(body)
      }

      // Merge with custom options
      const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      }

      console.log(`Making POST request to: ${url}`)
      if (body) {
        console.log('Request body:', body)
      }

      const response = await fetch(url, requestOptions)
      
      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Try to parse JSON response
      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        // If not JSON, return as text
        responseData = await response.text()
      }

      console.log('Response received:', responseData)
      return responseData

    } catch (error) {
      console.error('API Client Error:', error)
      throw error
    }
  }

  /**
   * Update the base URL for the API client
   * @param {string} newBaseURL - The new base URL
   */
  setBaseURL(newBaseURL) {
    this.baseURL = newBaseURL
  }

  /**
   * Get the current base URL
   * @returns {string} - The current base URL
   */
  getBaseURL() {
    return this.baseURL
  }

  /**
   * Test the connection to the API
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      await this.post('/health', null, { timeout: 5000 })
      return true
    } catch (error) {
      console.warn('API connection test failed:', error.message)
      return false
    }
  }
}

// Create a default instance
const defaultApiClient = new ApiClient()

// Export both the class and default instance
export default ApiClient
export { defaultApiClient }

// Export a hook for React components
export const useApiClient = (customBaseURL = null) => {
  return customBaseURL ? new ApiClient(customBaseURL) : defaultApiClient
}
