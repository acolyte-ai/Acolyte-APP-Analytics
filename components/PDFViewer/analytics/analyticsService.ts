// src/services/analyticsService.ts

import axios from 'axios';

// API base URL configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/dev` || 'http://localhost:3000/dev';

// Reading analytics data type definition
export type ReadingAnalytics = {
  completedPages: number[];
  currentPage: number | null;
  documentId: string;
  documentName: string;
  lastAccessedAt: number;
  progress: number | string;
  userId: string;
  lastTimestamp: number;
  outline: any; // This could be more strictly typed based on your outline structure
  timeSpentPerPage: Record<number, number> | string; // Can be either an object or a stringified JSON
  totalPages: number;
  visitedPages: number[];
  visitedSections: string[];
  createdAt?: number;
};

/**
 * Class to handle all reading analytics operations
 */
export class AnalyticsService {
  /**
   * Save or update analytics data
   * @param analyticsData The reading analytics data to save
   * @returns Promise with the response from the API
   */
  static async saveAnalytics(analyticsData: ReadingAnalytics): Promise<any> {
    try {
      // Prepare the data - ensure timeSpentPerPage is formatted correctly
      const data = {
        ...analyticsData,
        // Parse timeSpentPerPage if it's a string
        timeSpentPerPage: typeof analyticsData.timeSpentPerPage === 'string' 
          ? JSON.parse(analyticsData.timeSpentPerPage) 
          : analyticsData.timeSpentPerPage,
        // Ensure progress is a number
        progress: typeof analyticsData.progress === 'string' 
          ? parseInt(analyticsData.progress, 10) 
          : analyticsData.progress
      };

      // Make API call to save analytics
      const response = await axios.post(`${API_BASE_URL}/analytics`, data);
      return response.data;
    } catch (error) {
      console.error('Error saving reading analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for a specific document by document ID
   * @param documentId The ID of the document to get analytics for
   * @returns Promise with the analytics data
   */
  static async getAnalyticsByDocId(documentId: string): Promise<ReadingAnalytics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting analytics for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get all analytics data for a document (useful for multiple users/sessions)
   * @param documentId The ID of the document to get analytics for
   * @returns Promise with an array of analytics data
   */
  static async getAllAnalytics(documentId: string): Promise<ReadingAnalytics[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/all/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting all analytics for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get all analytics data for a specific user
   * @param userId The ID of the user to get analytics for
   * @returns Promise with an array of analytics data
   */
  static async getUserAnalytics(userId: string): Promise<ReadingAnalytics[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting analytics for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete analytics data for a specific document
   * @param documentId The ID of the document to delete analytics for
   * @returns Promise with the deletion result
   */
  static async deleteAnalytics(documentId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/analytics/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting analytics for document ${documentId}:`, error);
      throw error;
    }
  }
}

export default AnalyticsService;