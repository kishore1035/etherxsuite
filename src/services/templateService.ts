import config from '../config';

const API_URL = config.api.baseUrl;

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface TemplateData {
  cells: Record<string, any>;
  template: {
    id: string;
    name: string;
    headers: string[];
    columns: string[];
    formulas?: Record<string, any>;
    conditionalFormatting?: any[];
    chart?: any;
  };
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Fetch all available templates
 */
export async function getAllTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_URL}/api/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Fetch a specific template by ID
 */
export async function getTemplateById(templateId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

/**
 * Generate spreadsheet data from a template
 */
export async function generateTemplate(templateId: string, token?: string): Promise<TemplateData> {
  try {
    const response = await fetch(`${API_URL}/api/templates/${templateId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error generating template:', error);
    throw error;
  }
}

/**
 * Apply template data to spreadsheet format
 */
export function applyTemplateToSpreadsheet(templateData: TemplateData) {
  const { cells, template } = templateData;
  
  return {
    cellData: cells,
    metadata: {
      templateId: template.id,
      templateName: template.name,
      headers: template.headers,
      formulas: template.formulas,
      conditionalFormatting: template.conditionalFormatting,
      chart: template.chart,
    },
  };
}
