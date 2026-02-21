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
    console.warn('Backend unavailable, using hardcoded templates fallback');
    // Fallback to original hardcoded templates if backend fails
    return [
      { id: 'business-report', name: 'Business Report Template', description: 'Professional business performance report with key metrics and analysis', category: 'Business', icon: 'TrendingUp' },
      { id: 'attendance', name: 'Attendance Template', description: 'Track employee attendance with conditional formatting', category: 'HR', icon: 'Users' },
      { id: 'budget-planner', name: 'Monthly Budget Template', description: 'Structured monthly budget planner with income, expenses, and savings tracking', category: 'Finance', icon: 'DollarSign' },
      { id: 'invoice', name: 'Invoice Template', description: 'Professional invoice with automatic calculations', category: 'Business', icon: 'FileText' },
      { id: 'project-tracker', name: 'Project Tracker Template', description: 'Track tasks, deadlines, and project status', category: 'Project Management', icon: 'CheckSquare' },
      { id: 'sales-tracker', name: 'Sales Tracker Template', description: 'Track product sales with revenue calculations and regional analysis', category: 'Sales', icon: 'ShoppingCart' },
      { id: 'inventory-management', name: 'Inventory Management Template', description: 'Track stock levels and inventory balance', category: 'Operations', icon: 'Package' },
      { id: 'timesheet', name: 'Employee Timesheet Template', description: 'Track employee hours worked with automatic total calculations', category: 'HR', icon: 'Clock' },
      { id: 'school-gradebook', name: 'School Gradebook Template', description: 'Track student grades with automatic grade calculation', category: 'Education', icon: 'BookOpen' },
    ];
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
  // Always use hardcoded local data to ensure consistent original template content
  console.log(`✅ Loading hardcoded template data for: ${templateId}`);
  return getHardcodedTemplateData(templateId);
}

/**
 * Hardcoded template data for production use
 * Ensures templates work even if backend is unavailable
 */
function getHardcodedTemplateData(templateId: string): TemplateData {
  const templates: Record<string, TemplateData> = {
    'attendance': {
      cells: {
        'A1': { value: 'EMPLOYEE ATTENDANCE REGISTER', bold: true, fontSize: 16, backgroundColor: '#1B5E20', color: '#FFFFFF' },
        'A2': { value: 'Department:', bold: true },
        'B2': { value: 'All Departments' },
        'C2': { value: 'Month:', bold: true },
        'D2': { value: 'January 2024' },
        'A4': { value: 'Emp ID', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'B4': { value: 'Employee Name', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'C4': { value: 'Department', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'D4': { value: 'Designation', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'E4': { value: 'Days Present', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'F4': { value: 'Days Absent', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'G4': { value: 'Leave Taken', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'H4': { value: 'Total Hours', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'I4': { value: 'OT Hours', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'J4': { value: 'Status', bold: true, backgroundColor: '#4CAF50', color: '#FFFFFF' },
        'A5': { value: 'EMP001' }, 'B5': { value: 'John Doe' }, 'C5': { value: 'Engineering' }, 'D5': { value: 'Senior Dev' }, 'E5': { value: '22' }, 'F5': { value: '0' }, 'G5': { value: '0' }, 'H5': { value: '176' }, 'I5': { value: '8' }, 'J5': { value: 'Excellent', color: '#1B5E20' },
        'A6': { value: 'EMP002' }, 'B6': { value: 'Jane Smith' }, 'C6': { value: 'HR' }, 'D6': { value: 'HR Manager' }, 'E6': { value: '20' }, 'F6': { value: '1' }, 'G6': { value: '1' }, 'H6': { value: '160' }, 'I6': { value: '0' }, 'J6': { value: 'Good', color: '#2E7D32' },
        'A7': { value: 'EMP003' }, 'B7': { value: 'Bob Johnson' }, 'C7': { value: 'Finance' }, 'D7': { value: 'Accountant' }, 'E7': { value: '18' }, 'F7': { value: '3' }, 'G7': { value: '1' }, 'H7': { value: '144' }, 'I7': { value: '0' }, 'J7': { value: 'Average', color: '#F57F17' },
        'A8': { value: 'EMP004' }, 'B8': { value: 'Alice Brown' }, 'C8': { value: 'Marketing' }, 'D8': { value: 'Designer' }, 'E8': { value: '22' }, 'F8': { value: '0' }, 'G8': { value: '0' }, 'H8': { value: '176' }, 'I8': { value: '12' }, 'J8': { value: 'Excellent', color: '#1B5E20' },
        'A9': { value: 'EMP005' }, 'B9': { value: 'Charlie Wilson' }, 'C9': { value: 'Engineering' }, 'D9': { value: 'QA Engineer' }, 'E9': { value: '19' }, 'F9': { value: '2' }, 'G9': { value: '1' }, 'H9': { value: '152' }, 'I9': { value: '4' }, 'J9': { value: 'Good', color: '#2E7D32' },
        'A10': { value: 'EMP006' }, 'B10': { value: 'Diana Prince' }, 'C10': { value: 'Sales' }, 'D10': { value: 'Sales Exec' }, 'E10': { value: '21' }, 'F10': { value: '1' }, 'G10': { value: '0' }, 'H10': { value: '168' }, 'I10': { value: '6' }, 'J10': { value: 'Good', color: '#2E7D32' },
        'A11': { value: 'EMP007' }, 'B11': { value: 'Edward Clark' }, 'C11': { value: 'Engineering' }, 'D11': { value: 'DevOps' }, 'E11': { value: '22' }, 'F11': { value: '0' }, 'G11': { value: '0' }, 'H11': { value: '176' }, 'I11': { value: '16' }, 'J11': { value: 'Excellent', color: '#1B5E20' },
        'A12': { value: 'EMP008' }, 'B12': { value: 'Fiona Green' }, 'C12': { value: 'Support' }, 'D12': { value: 'Support Eng' }, 'E12': { value: '17' }, 'F12': { value: '4' }, 'G12': { value: '1' }, 'H12': { value: '136' }, 'I12': { value: '0' }, 'J12': { value: 'Below Avg', color: '#C62828' },
        'A13': { value: 'EMP009' }, 'B13': { value: 'George Hill' }, 'C13': { value: 'Marketing' }, 'D13': { value: 'SEO Analyst' }, 'E13': { value: '20' }, 'F13': { value: '2' }, 'G13': { value: '0' }, 'H13': { value: '160' }, 'I13': { value: '2' }, 'J13': { value: 'Good', color: '#2E7D32' },
        'A14': { value: 'EMP010' }, 'B14': { value: 'Hannah Lee' }, 'C14': { value: 'Finance' }, 'D14': { value: 'CFO' }, 'E14': { value: '22' }, 'F14': { value: '0' }, 'G14': { value: '0' }, 'H14': { value: '176' }, 'I14': { value: '20' }, 'J14': { value: 'Excellent', color: '#1B5E20' },
        'A16': { value: 'SUMMARY', bold: true, backgroundColor: '#E8F5E9', fontSize: 13 },
        'A17': { value: 'Total Employees:', bold: true }, 'B17': { value: '10' },
        'A18': { value: 'Avg Attendance %:', bold: true }, 'B18': { value: '=AVERAGE(E5:E14)/22*100', formula: '=AVERAGE(E5:E14)/22*100' },
        'A19': { value: 'Total OT Hours:', bold: true }, 'B19': { value: '=SUM(I5:I14)', formula: '=SUM(I5:I14)' },
        'D17': { value: 'Perfect Attendance:', bold: true }, 'E17': { value: '4 Employees' },
        'D18': { value: 'Total Absent Days:', bold: true }, 'E18': { value: '=SUM(F5:F14)', formula: '=SUM(F5:F14)' },
      },
      template: {
        id: 'attendance',
        name: 'Attendance Template',
        headers: ['Emp ID', 'Employee Name', 'Department', 'Designation', 'Days Present', 'Days Absent', 'Leave Taken', 'Total Hours', 'OT Hours', 'Status'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      },
    },
    'invoice': {
      cells: {
        'A1': { value: 'INVOICE', bold: true, fontSize: 28, color: '#1A237E' },
        'E1': { value: 'Invoice No:', bold: true }, 'F1': { value: 'INV-2024-001' },
        'E2': { value: 'Date:', bold: true }, 'F2': { value: '2024-01-15' },
        'E3': { value: 'Due Date:', bold: true }, 'F3': { value: '2024-02-15' },
        'A3': { value: 'From:', bold: true, color: '#1A237E' },
        'A4': { value: 'EtherX Solutions Pvt. Ltd.' },
        'A5': { value: '123 Business Park, Suite 400' },
        'A6': { value: 'New York, NY 10001' },
        'A7': { value: 'Phone: +1-555-0100 | contact@etherx.com' },
        'A9': { value: 'Bill To:', bold: true, color: '#1A237E' },
        'A10': { value: 'Acme Corporation' }, 'D10': { value: 'Ship To:', bold: true },
        'A11': { value: 'Mr. John Principal' }, 'D11': { value: 'Acme Corp Warehouse' },
        'A12': { value: '456 Client Avenue' }, 'D12': { value: '789 Delivery Road' },
        'A13': { value: 'Chicago, IL 60601' }, 'D13': { value: 'Chicago, IL 60602' },
        'A15': { value: '#', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'B15': { value: 'Description', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'C15': { value: 'HSN Code', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'D15': { value: 'Qty', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'E15': { value: 'Unit', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'F15': { value: 'Rate ($)', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'G15': { value: 'Discount %', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'H15': { value: 'Amount ($)', bold: true, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'A16': { value: '1' }, 'B16': { value: 'Web Development Services' }, 'C16': { value: '998314' }, 'D16': { value: '80' }, 'E16': { value: 'Hrs' }, 'F16': { value: '75' }, 'G16': { value: '0' }, 'H16': { value: '=D16*F16*(1-G16/100)', formula: '=D16*F16*(1-G16/100)' },
        'A17': { value: '2' }, 'B17': { value: 'UI/UX Design' }, 'C17': { value: '998314' }, 'D17': { value: '40' }, 'E17': { value: 'Hrs' }, 'F17': { value: '65' }, 'G17': { value: '5' }, 'H17': { value: '=D17*F17*(1-G17/100)', formula: '=D17*F17*(1-G17/100)' },
        'A18': { value: '3' }, 'B18': { value: 'API Integration' }, 'C18': { value: '998314' }, 'D18': { value: '20' }, 'E18': { value: 'Hrs' }, 'F18': { value: '90' }, 'G18': { value: '0' }, 'H18': { value: '=D18*F18*(1-G18/100)', formula: '=D18*F18*(1-G18/100)' },
        'A19': { value: '4' }, 'B19': { value: 'Cloud Hosting Setup' }, 'C19': { value: '998315' }, 'D19': { value: '1' }, 'E19': { value: 'Pkg' }, 'F19': { value: '500' }, 'G19': { value: '10' }, 'H19': { value: '=D19*F19*(1-G19/100)', formula: '=D19*F19*(1-G19/100)' },
        'A20': { value: '5' }, 'B20': { value: 'SEO Optimization' }, 'C20': { value: '998316' }, 'D20': { value: '1' }, 'E20': { value: 'Pkg' }, 'F20': { value: '800' }, 'G20': { value: '0' }, 'H20': { value: '=D20*F20*(1-G20/100)', formula: '=D20*F20*(1-G20/100)' },
        'A21': { value: '6' }, 'B21': { value: 'Mobile App Development' }, 'C21': { value: '998314' }, 'D21': { value: '120' }, 'E21': { value: 'Hrs' }, 'F21': { value: '85' }, 'G21': { value: '5' }, 'H21': { value: '=D21*F21*(1-G21/100)', formula: '=D21*F21*(1-G21/100)' },
        'F23': { value: 'Subtotal:', bold: true }, 'H23': { value: '=SUM(H16:H21)', formula: '=SUM(H16:H21)' },
        'F24': { value: 'GST (18%):', bold: true }, 'H24': { value: '=H23*0.18', formula: '=H23*0.18' },
        'F25': { value: 'Shipping:', bold: true }, 'H25': { value: '50' },
        'F26': { value: 'GRAND TOTAL:', bold: true, fontSize: 13, backgroundColor: '#E8EAF6' }, 'H26': { value: '=H23+H24+H25', formula: '=H23+H24+H25', bold: true, backgroundColor: '#E8EAF6' },
        'A28': { value: 'Payment Terms:', bold: true }, 'B28': { value: 'Net 30 Days' },
        'A29': { value: 'Bank Details:', bold: true }, 'B29': { value: 'HDFC Bank | A/C: 1234567890 | IFSC: HDFC0001234' },
        'A30': { value: 'Notes:', bold: true }, 'B30': { value: 'Thank you for your business! Please make payment within due date.' },
      },
      template: {
        id: 'invoice',
        name: 'Invoice Template',
        headers: ['#', 'Description', 'HSN Code', 'Qty', 'Unit', 'Rate ($)', 'Discount %', 'Amount ($)'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        formulas: {
          'H16': '=D16*F16*(1-G16/100)', 'H17': '=D17*F17*(1-G17/100)',
          'H18': '=D18*F18*(1-G18/100)', 'H19': '=D19*F19*(1-G19/100)',
          'H20': '=D20*F20*(1-G20/100)', 'H21': '=D21*F21*(1-G21/100)',
          'H23': '=SUM(H16:H21)', 'H24': '=H23*0.18', 'H26': '=H23+H24+H25',
        },
      },
    },
    'budget-planner': {
      cells: {
        'A1': { value: 'MONTHLY BUDGET PLANNER', bold: true, fontSize: 18, backgroundColor: '#004D40', color: '#FFFFFF' },
        'A2': { value: 'Month:', bold: true }, 'B2': { value: 'January 2024' }, 'C2': { value: 'Name:', bold: true }, 'D2': { value: 'John Doe' },
        'A4': { value: 'INCOME SOURCES', bold: true, backgroundColor: '#00796B', color: '#FFFFFF' }, 'B4': { value: 'Monthly ($)', bold: true, backgroundColor: '#00796B', color: '#FFFFFF' }, 'C4': { value: 'Annual ($)', bold: true, backgroundColor: '#00796B', color: '#FFFFFF' },
        'A5': { value: 'Primary Salary' }, 'B5': { value: '5500' }, 'C5': { value: '=B5*12', formula: '=B5*12' },
        'A6': { value: 'Freelance Income' }, 'B6': { value: '800' }, 'C6': { value: '=B6*12', formula: '=B6*12' },
        'A7': { value: 'Investment Returns' }, 'B7': { value: '250' }, 'C7': { value: '=B7*12', formula: '=B7*12' },
        'A8': { value: 'Rental Income' }, 'B8': { value: '600' }, 'C8': { value: '=B8*12', formula: '=B8*12' },
        'A9': { value: 'Other Income' }, 'B9': { value: '150' }, 'C9': { value: '=B9*12', formula: '=B9*12' },
        'A10': { value: 'TOTAL INCOME', bold: true, backgroundColor: '#E0F2F1' }, 'B10': { value: '=SUM(B5:B9)', formula: '=SUM(B5:B9)', bold: true, backgroundColor: '#E0F2F1' }, 'C10': { value: '=SUM(C5:C9)', formula: '=SUM(C5:C9)', bold: true, backgroundColor: '#E0F2F1' },
        'A12': { value: 'FIXED EXPENSES', bold: true, backgroundColor: '#B71C1C', color: '#FFFFFF' }, 'B12': { value: 'Budget ($)', bold: true, backgroundColor: '#B71C1C', color: '#FFFFFF' }, 'C12': { value: 'Actual ($)', bold: true, backgroundColor: '#B71C1C', color: '#FFFFFF' }, 'D12': { value: 'Difference', bold: true, backgroundColor: '#B71C1C', color: '#FFFFFF' },
        'A13': { value: 'Rent / Mortgage' }, 'B13': { value: '1500' }, 'C13': { value: '1500' }, 'D13': { value: '=B13-C13', formula: '=B13-C13' },
        'A14': { value: 'Electricity Bill' }, 'B14': { value: '120' }, 'C14': { value: '135' }, 'D14': { value: '=B14-C14', formula: '=B14-C14' },
        'A15': { value: 'Water Bill' }, 'B15': { value: '40' }, 'C15': { value: '38' }, 'D15': { value: '=B15-C15', formula: '=B15-C15' },
        'A16': { value: 'Internet & Phone' }, 'B16': { value: '100' }, 'C16': { value: '100' }, 'D16': { value: '=B16-C16', formula: '=B16-C16' },
        'A17': { value: 'Car EMI' }, 'B17': { value: '350' }, 'C17': { value: '350' }, 'D17': { value: '=B17-C17', formula: '=B17-C17' },
        'A18': { value: 'Insurance Premium' }, 'B18': { value: '200' }, 'C18': { value: '200' }, 'D18': { value: '=B18-C18', formula: '=B18-C18' },
        'A19': { value: 'VARIABLE EXPENSES', bold: true, backgroundColor: '#E53935', color: '#FFFFFF' }, 'B19': { value: 'Budget ($)', bold: true, backgroundColor: '#E53935', color: '#FFFFFF' }, 'C19': { value: 'Actual ($)', bold: true, backgroundColor: '#E53935', color: '#FFFFFF' }, 'D19': { value: 'Difference', bold: true, backgroundColor: '#E53935', color: '#FFFFFF' },
        'A20': { value: 'Groceries & Food' }, 'B20': { value: '500' }, 'C20': { value: '545' }, 'D20': { value: '=B20-C20', formula: '=B20-C20' },
        'A21': { value: 'Dining Out' }, 'B21': { value: '200' }, 'C21': { value: '280' }, 'D21': { value: '=B21-C21', formula: '=B21-C21' },
        'A22': { value: 'Transportation / Fuel' }, 'B22': { value: '150' }, 'C22': { value: '140' }, 'D22': { value: '=B22-C22', formula: '=B22-C22' },
        'A23': { value: 'Entertainment' }, 'B23': { value: '100' }, 'C23': { value: '120' }, 'D23': { value: '=B23-C23', formula: '=B23-C23' },
        'A24': { value: 'Clothing & Shopping' }, 'B24': { value: '150' }, 'C24': { value: '90' }, 'D24': { value: '=B24-C24', formula: '=B24-C24' },
        'A25': { value: 'Healthcare & Medical' }, 'B25': { value: '100' }, 'C25': { value: '60' }, 'D25': { value: '=B25-C25', formula: '=B25-C25' },
        'A26': { value: 'Education / Courses' }, 'B26': { value: '80' }, 'C26': { value: '80' }, 'D26': { value: '=B26-C26', formula: '=B26-C26' },
        'A27': { value: 'Miscellaneous' }, 'B27': { value: '100' }, 'C27': { value: '75' }, 'D27': { value: '=B27-C27', formula: '=B27-C27' },
        'A28': { value: 'TOTAL EXPENSES', bold: true, backgroundColor: '#FFEBEE' }, 'B28': { value: '=SUM(B13:B27)', formula: '=SUM(B13:B27)', bold: true, backgroundColor: '#FFEBEE' }, 'C28': { value: '=SUM(C13:C27)', formula: '=SUM(C13:C27)', bold: true, backgroundColor: '#FFEBEE' }, 'D28': { value: '=SUM(D13:D27)', formula: '=SUM(D13:D27)', bold: true, backgroundColor: '#FFEBEE' },
        'A30': { value: 'SAVINGS SUMMARY', bold: true, backgroundColor: '#1565C0', color: '#FFFFFF', fontSize: 13 },
        'A31': { value: 'Budgeted Savings', bold: true }, 'B31': { value: '=B10-B28', formula: '=B10-B28' },
        'A32': { value: 'Actual Savings', bold: true }, 'B32': { value: '=B10-C28', formula: '=B10-C28' },
        'A33': { value: 'Savings Rate %', bold: true }, 'B33': { value: '=B32/B10*100', formula: '=B32/B10*100' },
        'A34': { value: 'Monthly Savings Goal', bold: true }, 'B34': { value: '1000' },
        'A35': { value: 'Goal Achievement %', bold: true }, 'B35': { value: '=B32/B34*100', formula: '=B32/B34*100' },
      },
      template: {
        id: 'budget-planner',
        name: 'Monthly Budget Template',
        headers: ['Category', 'Budget ($)', 'Actual ($)', 'Difference'],
        columns: ['A', 'B', 'C', 'D'],
        formulas: {
          'B10': '=SUM(B5:B9)', 'C10': '=SUM(C5:C9)',
          'B28': '=SUM(B13:B27)', 'C28': '=SUM(C13:C27)', 'D28': '=SUM(D13:D27)',
          'B31': '=B10-B28', 'B32': '=B10-C28', 'B33': '=B32/B10*100',
        },
      },
    },
    'project-tracker': {
      cells: {
        'A1': { value: 'PROJECT TASK TRACKER', bold: true, fontSize: 16, backgroundColor: '#4A148C', color: '#FFFFFF' },
        'A2': { value: 'Project:', bold: true }, 'B2': { value: 'EtherX Platform Launch' }, 'C2': { value: 'Manager:', bold: true }, 'D2': { value: 'Sarah Connor' }, 'E2': { value: 'Start:', bold: true }, 'F2': { value: '2024-01-01' }, 'G2': { value: 'End:', bold: true }, 'H2': { value: '2024-03-31' },
        'A4': { value: 'Task ID', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'B4': { value: 'Task Name', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'C4': { value: 'Assignee', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'D4': { value: 'Status', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'E4': { value: 'Priority', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'F4': { value: 'Start Date', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'G4': { value: 'Due Date', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'H4': { value: 'Progress %', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'I4': { value: 'Est. Hours', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'J4': { value: 'Notes', bold: true, backgroundColor: '#6A1B9A', color: '#FFFFFF' },
        'A5': { value: 'T-001' }, 'B5': { value: 'Requirements Analysis' }, 'C5': { value: 'Alice' }, 'D5': { value: 'Completed', color: '#1B5E20' }, 'E5': { value: 'High', color: '#B71C1C' }, 'F5': { value: '2024-01-01' }, 'G5': { value: '2024-01-07' }, 'H5': { value: '100' }, 'I5': { value: '40' }, 'J5': { value: 'Done' },
        'A6': { value: 'T-002' }, 'B6': { value: 'System Architecture Design' }, 'C6': { value: 'Bob' }, 'D6': { value: 'Completed', color: '#1B5E20' }, 'E6': { value: 'High', color: '#B71C1C' }, 'F6': { value: '2024-01-05' }, 'G6': { value: '2024-01-14' }, 'H6': { value: '100' }, 'I6': { value: '60' }, 'J6': { value: 'Done' },
        'A7': { value: 'T-003' }, 'B7': { value: 'Database Schema Design' }, 'C7': { value: 'Carol' }, 'D7': { value: 'Completed', color: '#1B5E20' }, 'E7': { value: 'High', color: '#B71C1C' }, 'F7': { value: '2024-01-08' }, 'G7': { value: '2024-01-15' }, 'H7': { value: '100' }, 'I7': { value: '30' }, 'J7': { value: 'Done' },
        'A8': { value: 'T-004' }, 'B8': { value: 'Frontend UI Development' }, 'C8': { value: 'Alice' }, 'D8': { value: 'In Progress', color: '#E65100' }, 'E8': { value: 'High', color: '#B71C1C' }, 'F8': { value: '2024-01-15' }, 'G8': { value: '2024-02-15' }, 'H8': { value: '65' }, 'I8': { value: '160' }, 'J8': { value: 'On track' },
        'A9': { value: 'T-005' }, 'B9': { value: 'Backend API Development' }, 'C9': { value: 'David' }, 'D9': { value: 'In Progress', color: '#E65100' }, 'E9': { value: 'High', color: '#B71C1C' }, 'F9': { value: '2024-01-15' }, 'G9': { value: '2024-02-20' }, 'H9': { value: '50' }, 'I9': { value: '200' }, 'J9': { value: 'Slight delay' },
        'A10': { value: 'T-006' }, 'B10': { value: 'Smart Contract Integration' }, 'C10': { value: 'Eve' }, 'D10': { value: 'In Progress', color: '#E65100' }, 'E10': { value: 'Critical', color: '#B71C1C' }, 'F10': { value: '2024-01-20' }, 'G10': { value: '2024-02-25' }, 'H10': { value: '35' }, 'I10': { value: '120' }, 'J10': { value: 'On track' },
        'A11': { value: 'T-007' }, 'B11': { value: 'IPFS Storage Setup' }, 'C11': { value: 'Frank' }, 'D11': { value: 'Not Started', color: '#616161' }, 'E11': { value: 'Medium', color: '#E65100' }, 'F11': { value: '2024-02-01' }, 'G11': { value: '2024-02-15' }, 'H11': { value: '0' }, 'I11': { value: '40' }, 'J11': { value: 'Planned' },
        'A12': { value: 'T-008' }, 'B12': { value: 'Unit Testing' }, 'C12': { value: 'Grace' }, 'D12': { value: 'Not Started', color: '#616161' }, 'E12': { value: 'High', color: '#B71C1C' }, 'F12': { value: '2024-02-15' }, 'G12': { value: '2024-03-01' }, 'H12': { value: '0' }, 'I12': { value: '80' }, 'J12': { value: 'Planned' },
        'A13': { value: 'T-009' }, 'B13': { value: 'Integration Testing' }, 'C13': { value: 'Grace' }, 'D13': { value: 'Not Started', color: '#616161' }, 'E13': { value: 'High', color: '#B71C1C' }, 'F13': { value: '2024-03-01' }, 'G13': { value: '2024-03-15' }, 'H13': { value: '0' }, 'I13': { value: '60' }, 'J13': { value: 'Planned' },
        'A14': { value: 'T-010' }, 'B14': { value: 'User Acceptance Testing' }, 'C14': { value: 'Henry' }, 'D14': { value: 'Not Started', color: '#616161' }, 'E14': { value: 'High', color: '#B71C1C' }, 'F14': { value: '2024-03-15' }, 'G14': { value: '2024-03-25' }, 'H14': { value: '0' }, 'I14': { value: '40' }, 'J14': { value: 'Planned' },
        'A15': { value: 'T-011' }, 'B15': { value: 'Documentation' }, 'C15': { value: 'Ivy' }, 'D15': { value: 'In Progress', color: '#E65100' }, 'E15': { value: 'Medium', color: '#E65100' }, 'F15': { value: '2024-01-20' }, 'G15': { value: '2024-03-25' }, 'H15': { value: '30' }, 'I15': { value: '50' }, 'J15': { value: 'Ongoing' },
        'A16': { value: 'T-012' }, 'B16': { value: 'Deployment & Launch' }, 'C16': { value: 'Bob' }, 'D16': { value: 'Not Started', color: '#616161' }, 'E16': { value: 'Critical', color: '#B71C1C' }, 'F16': { value: '2024-03-26' }, 'G16': { value: '2024-03-31' }, 'H16': { value: '0' }, 'I16': { value: '24' }, 'J16': { value: 'Final stage' },
        'A18': { value: 'PROJECT SUMMARY', bold: true, backgroundColor: '#EDE7F6', fontSize: 13 },
        'A19': { value: 'Total Tasks:', bold: true }, 'B19': { value: '12' },
        'A20': { value: 'Completed:', bold: true }, 'B20': { value: '3' },
        'A21': { value: 'In Progress:', bold: true }, 'B21': { value: '4' },
        'A22': { value: 'Not Started:', bold: true }, 'B22': { value: '5' },
        'A23': { value: 'Overall Progress:', bold: true }, 'B23': { value: '=AVERAGE(H5:H16)&"%"' },
        'D19': { value: 'Total Est. Hours:', bold: true }, 'E19': { value: '=SUM(I5:I16)', formula: '=SUM(I5:I16)' },
      },
      template: {
        id: 'project-tracker',
        name: 'Project Tracker Template',
        headers: ['Task ID', 'Task Name', 'Assignee', 'Status', 'Priority', 'Start Date', 'Due Date', 'Progress %', 'Est. Hours', 'Notes'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      },
    },
    'sales-tracker': {
      cells: {
        'A1': { value: 'MONTHLY SALES PERFORMANCE REPORT', bold: true, fontSize: 16, backgroundColor: '#BF360C', color: '#FFFFFF' },
        'A2': { value: 'Sales Rep:', bold: true }, 'B2': { value: 'All Representatives' }, 'C2': { value: 'Period:', bold: true }, 'D2': { value: 'Q1 2024' },
        'A4': { value: 'Rep Name', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'B4': { value: 'Product', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'C4': { value: 'Region', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'D4': { value: 'Units Sold', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'E4': { value: 'Unit Price ($)', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'F4': { value: 'Discount %', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'G4': { value: 'Revenue ($)', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'H4': { value: 'Target ($)', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'I4': { value: '% Achieved', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'J4': { value: 'Status', bold: true, backgroundColor: '#E64A19', color: '#FFFFFF' },
        'A5': { value: 'Alice Cooper' }, 'B5': { value: 'EtherX Pro' }, 'C5': { value: 'North' }, 'D5': { value: '45' }, 'E5': { value: '299' }, 'F5': { value: '5' }, 'G5': { value: '=D5*E5*(1-F5/100)', formula: '=D5*E5*(1-F5/100)' }, 'H5': { value: '12000' }, 'I5': { value: '=G5/H5*100', formula: '=G5/H5*100' }, 'J5': { value: 'Exceeded', color: '#1B5E20' },
        'A6': { value: 'Bob Martin' }, 'B6': { value: 'EtherX Basic' }, 'C6': { value: 'South' }, 'D6': { value: '80' }, 'E6': { value: '149' }, 'F6': { value: '0' }, 'G6': { value: '=D6*E6*(1-F6/100)', formula: '=D6*E6*(1-F6/100)' }, 'H6': { value: '11000' }, 'I6': { value: '=G6/H6*100', formula: '=G6/H6*100' }, 'J6': { value: 'Met', color: '#2E7D32' },
        'A7': { value: 'Carol White' }, 'B7': { value: 'EtherX Enterprise' }, 'C7': { value: 'East' }, 'D7': { value: '12' }, 'E7': { value: '999' }, 'F7': { value: '10' }, 'G7': { value: '=D7*E7*(1-F7/100)', formula: '=D7*E7*(1-F7/100)' }, 'H7': { value: '10000' }, 'I7': { value: '=G7/H7*100', formula: '=G7/H7*100' }, 'J7': { value: 'Exceeded', color: '#1B5E20' },
        'A8': { value: 'David Lee' }, 'B8': { value: 'EtherX Pro' }, 'C8': { value: 'West' }, 'D8': { value: '30' }, 'E8': { value: '299' }, 'F8': { value: '5' }, 'G8': { value: '=D8*E8*(1-F8/100)', formula: '=D8*E8*(1-F8/100)' }, 'H8': { value: '9500' }, 'I8': { value: '=G8/H8*100', formula: '=G8/H8*100' }, 'J8': { value: 'Below', color: '#C62828' },
        'A9': { value: 'Eve Turner' }, 'B9': { value: 'EtherX Basic' }, 'C9': { value: 'North' }, 'D9': { value: '110' }, 'E9': { value: '149' }, 'F9': { value: '0' }, 'G9': { value: '=D9*E9*(1-F9/100)', formula: '=D9*E9*(1-F9/100)' }, 'H9': { value: '15000' }, 'I9': { value: '=G9/H9*100', formula: '=G9/H9*100' }, 'J9': { value: 'Met', color: '#2E7D32' },
        'A11': { value: 'SALES SUMMARY', bold: true, backgroundColor: '#FBE9E7', fontSize: 13 },
        'A12': { value: 'Total Revenue:', bold: true }, 'B12': { value: '=SUM(G5:G9)', formula: '=SUM(G5:G9)' },
        'A13': { value: 'Total Target:', bold: true }, 'B13': { value: '=SUM(H5:H9)', formula: '=SUM(H5:H9)' },
        'A14': { value: 'Overall Achievement:', bold: true }, 'B14': { value: '=B12/B13*100', formula: '=B12/B13*100' },
        'D12': { value: 'Top Performer:', bold: true }, 'E12': { value: 'Alice Cooper' },
        'D13': { value: 'Best Region:', bold: true }, 'E13': { value: 'North' },
      },
      template: {
        id: 'sales-tracker',
        name: 'Sales Tracker Template',
        headers: ['Rep Name', 'Product', 'Region', 'Units Sold', 'Unit Price ($)', 'Discount %', 'Revenue ($)', 'Target ($)', '% Achieved', 'Status'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        formulas: { 'G5': '=D5*E5*(1-F5/100)', 'I5': '=G5/H5*100', 'B12': '=SUM(G5:G9)', 'B14': '=B12/B13*100' },
      },
    },
    'inventory-management': {
      cells: {
        'A1': { value: 'INVENTORY MANAGEMENT SYSTEM', bold: true, fontSize: 16, backgroundColor: '#E65100', color: '#FFFFFF' },
        'A2': { value: 'Warehouse:', bold: true }, 'B2': { value: 'Main Warehouse - Block A' }, 'C2': { value: 'Updated:', bold: true }, 'D2': { value: 'January 2024' },
        'A4': { value: 'Item Name', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'B4': { value: 'SKU', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'C4': { value: 'Category', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'D4': { value: 'Qty in Stock', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'E4': { value: 'Reorder Level', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'F4': { value: 'Unit Cost ($)', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'G4': { value: 'Total Value ($)', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'H4': { value: 'Supplier', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'I4': { value: 'Status', bold: true, backgroundColor: '#F57C00', color: '#FFFFFF' },
        'A5': { value: 'Laptop Pro 15"' }, 'B5': { value: 'LAP-PRO-15' }, 'C5': { value: 'Electronics' }, 'D5': { value: '48' }, 'E5': { value: '10' }, 'F5': { value: '899' }, 'G5': { value: '=D5*F5', formula: '=D5*F5' }, 'H5': { value: 'TechSupply Co.' }, 'I5': { value: 'In Stock', color: '#1B5E20' },
        'A6': { value: 'Wireless Mouse' }, 'B6': { value: 'MOU-WL-001' }, 'C6': { value: 'Peripherals' }, 'D6': { value: '215' }, 'E6': { value: '50' }, 'F6': { value: '24.99' }, 'G6': { value: '=D6*F6', formula: '=D6*F6' }, 'H6': { value: 'GadgetWorld' }, 'I6': { value: 'In Stock', color: '#1B5E20' },
        'A7': { value: 'Mechanical Keyboard' }, 'B7': { value: 'KEY-MEC-BK' }, 'C7': { value: 'Peripherals' }, 'D7': { value: '7' }, 'E7': { value: '15' }, 'F7': { value: '79.99' }, 'G7': { value: '=D7*F7', formula: '=D7*F7' }, 'H7': { value: 'GadgetWorld' }, 'I7': { value: 'Low Stock', color: '#E65100' },
        'A8': { value: '27" Monitor 4K' }, 'B8': { value: 'MON-4K-27' }, 'C8': { value: 'Displays' }, 'D8': { value: '22' }, 'E8': { value: '8' }, 'F8': { value: '449' }, 'G8': { value: '=D8*F8', formula: '=D8*F8' }, 'H8': { value: 'DisplayTech' }, 'I8': { value: 'In Stock', color: '#1B5E20' },
        'A9': { value: 'USB-C Hub 7-in-1' }, 'B9': { value: 'HUB-USC-7' }, 'C9': { value: 'Accessories' }, 'D9': { value: '0' }, 'E9': { value: '30' }, 'F9': { value: '39.99' }, 'G9': { value: '=D9*F9', formula: '=D9*F9' }, 'H9': { value: 'ConnectPlus' }, 'I9': { value: 'Out of Stock', color: '#C62828' },
        'A10': { value: 'Office Chair Ergonomic' }, 'B10': { value: 'CHR-ERG-BK' }, 'C10': { value: 'Furniture' }, 'D10': { value: '12' }, 'E10': { value: '5' }, 'F10': { value: '299' }, 'G10': { value: '=D10*F10', formula: '=D10*F10' }, 'H10': { value: 'OfficeComfort' }, 'I10': { value: 'In Stock', color: '#1B5E20' },
        'A11': { value: 'Desk Standing Electric' }, 'B11': { value: 'DSK-ELC-W' }, 'C11': { value: 'Furniture' }, 'D11': { value: '6' }, 'E11': { value: '3' }, 'F11': { value: '599' }, 'G11': { value: '=D11*F11', formula: '=D11*F11' }, 'H11': { value: 'OfficeComfort' }, 'I11': { value: 'Low Stock', color: '#E65100' },
        'A12': { value: 'Webcam HD 1080p' }, 'B12': { value: 'CAM-HD-001' }, 'C12': { value: 'Electronics' }, 'D12': { value: '38' }, 'E12': { value: '10' }, 'F12': { value: '59.99' }, 'G12': { value: '=D12*F12', formula: '=D12*F12' }, 'H12': { value: 'TechSupply Co.' }, 'I12': { value: 'In Stock', color: '#1B5E20' },
        'A14': { value: 'INVENTORY SUMMARY', bold: true, backgroundColor: '#FFF3E0', fontSize: 13 },
        'A15': { value: 'Total SKUs:', bold: true }, 'B15': { value: '8' },
        'A16': { value: 'Total Stock Value:', bold: true }, 'B16': { value: '=SUM(G5:G12)', formula: '=SUM(G5:G12)' },
        'A17': { value: 'Items Low/Out:', bold: true }, 'B17': { value: '3' },
        'D15': { value: 'Top Value Item:', bold: true }, 'E15': { value: 'Laptop Pro 15"' },
        'D16': { value: 'Most Stocked:', bold: true }, 'E16': { value: 'Wireless Mouse (215 units)' },
      },
      template: {
        id: 'inventory-management',
        name: 'Inventory Management Template',
        headers: ['Item Name', 'SKU', 'Category', 'Qty in Stock', 'Reorder Level', 'Unit Cost ($)', 'Total Value ($)', 'Supplier', 'Status'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        formulas: { 'G5': '=D5*F5', 'G6': '=D6*F6', 'G7': '=D7*F7', 'G8': '=D8*F8', 'G9': '=D9*F9', 'G10': '=D10*F10', 'G11': '=D11*F11', 'G12': '=D12*F12', 'B16': '=SUM(G5:G12)' },
      },
    },
    'timesheet': {
      cells: {
        'A1': { value: 'EMPLOYEE WEEKLY TIMESHEET', bold: true, fontSize: 16, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'A2': { value: 'Week Starting:', bold: true }, 'B2': { value: '2024-01-15' }, 'C2': { value: 'Department:', bold: true }, 'D2': { value: 'Engineering' },
        'A4': { value: 'Employee Name', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'B4': { value: 'Mon', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'C4': { value: 'Tue', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'D4': { value: 'Wed', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'E4': { value: 'Thu', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'F4': { value: 'Fri', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'G4': { value: 'Sat', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'H4': { value: 'Total Hrs', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'I4': { value: 'OT Hrs', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'J4': { value: 'Bill Rate ($)', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'K4': { value: 'Total Pay ($)', bold: true, backgroundColor: '#283593', color: '#FFFFFF' },
        'A5': { value: 'John Doe' }, 'B5': { value: '8' }, 'C5': { value: '8' }, 'D5': { value: '8' }, 'E5': { value: '8' }, 'F5': { value: '8' }, 'G5': { value: '0' }, 'H5': { value: '=SUM(B5:G5)', formula: '=SUM(B5:G5)' }, 'I5': { value: '0' }, 'J5': { value: '45' }, 'K5': { value: '=H5*J5', formula: '=H5*J5' },
        'A6': { value: 'Jane Smith' }, 'B6': { value: '8' }, 'C6': { value: '7.5' }, 'D6': { value: '8' }, 'E6': { value: '8' }, 'F6': { value: '8' }, 'G6': { value: '4' }, 'H6': { value: '=SUM(B6:G6)', formula: '=SUM(B6:G6)' }, 'I6': { value: '4' }, 'J6': { value: '55' }, 'K6': { value: '=H6*J6', formula: '=H6*J6' },
        'A7': { value: 'Bob Johnson' }, 'B7': { value: '8' }, 'C7': { value: '8' }, 'D7': { value: '6' }, 'E7': { value: '8' }, 'F7': { value: '8' }, 'G7': { value: '0' }, 'H7': { value: '=SUM(B7:G7)', formula: '=SUM(B7:G7)' }, 'I7': { value: '0' }, 'J7': { value: '40' }, 'K7': { value: '=H7*J7', formula: '=H7*J7' },
        'A8': { value: 'Alice Brown' }, 'B8': { value: '8' }, 'C8': { value: '8' }, 'D8': { value: '8' }, 'E8': { value: '8' }, 'F8': { value: '8' }, 'G8': { value: '6' }, 'H8': { value: '=SUM(B8:G8)', formula: '=SUM(B8:G8)' }, 'I8': { value: '6' }, 'J8': { value: '60' }, 'K8': { value: '=H8*J8', formula: '=H8*J8' },
        'A9': { value: 'Charlie Wilson' }, 'B9': { value: '7' }, 'C9': { value: '8' }, 'D9': { value: '8' }, 'E9': { value: '7.5' }, 'F9': { value: '8' }, 'G9': { value: '0' }, 'H9': { value: '=SUM(B9:G9)', formula: '=SUM(B9:G9)' }, 'I9': { value: '0' }, 'J9': { value: '42' }, 'K9': { value: '=H9*J9', formula: '=H9*J9' },
        'A11': { value: 'TIMESHEET SUMMARY', bold: true, backgroundColor: '#E8EAF6', fontSize: 13 },
        'A12': { value: 'Total Hours Worked:', bold: true }, 'B12': { value: '=SUM(H5:H9)', formula: '=SUM(H5:H9)' },
        'A13': { value: 'Total OT Hours:', bold: true }, 'B13': { value: '=SUM(I5:I9)', formula: '=SUM(I5:I9)' },
        'A14': { value: 'Total Payroll ($):', bold: true }, 'B14': { value: '=SUM(K5:K9)', formula: '=SUM(K5:K9)' },
        'D12': { value: 'Avg Hours/Employee:', bold: true }, 'E12': { value: '=AVERAGE(H5:H9)', formula: '=AVERAGE(H5:H9)' },
      },
      template: {
        id: 'timesheet',
        name: 'Employee Timesheet Template',
        headers: ['Employee Name', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total Hrs', 'OT Hrs', 'Bill Rate ($)', 'Total Pay ($)'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
        formulas: { 'H5': '=SUM(B5:G5)', 'K5': '=H5*J5', 'B12': '=SUM(H5:H9)', 'B14': '=SUM(K5:K9)' },
      },
    },
    'school-gradebook': {
      cells: {
        'A1': { value: 'SCHOOL GRADEBOOK - CLASS REPORT', bold: true, fontSize: 16, backgroundColor: '#4527A0', color: '#FFFFFF' },
        'A2': { value: 'Class:', bold: true }, 'B2': { value: '10th Grade - Section A' }, 'C2': { value: 'Teacher:', bold: true }, 'D2': { value: 'Ms. Sarah Johnson' }, 'E2': { value: 'Term:', bold: true }, 'F2': { value: 'Spring 2024' },
        'A4': { value: 'Student Name', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'B4': { value: 'Math', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'C4': { value: 'Science', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'D4': { value: 'English', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'E4': { value: 'History', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'F4': { value: 'Art', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'G4': { value: 'PE', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'H4': { value: 'Average', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'I4': { value: 'Grade', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'J4': { value: 'Remarks', bold: true, backgroundColor: '#512DA8', color: '#FFFFFF' },
        'A5': { value: 'Alice Johnson' }, 'B5': { value: '95' }, 'C5': { value: '92' }, 'D5': { value: '98' }, 'E5': { value: '90' }, 'F5': { value: '85' }, 'G5': { value: '88' }, 'H5': { value: '=AVERAGE(B5:G5)', formula: '=AVERAGE(B5:G5)' }, 'I5': { value: 'A+', color: '#1B5E20' }, 'J5': { value: 'Outstanding' },
        'A6': { value: 'Bob Smith' }, 'B6': { value: '82' }, 'C6': { value: '88' }, 'D6': { value: '79' }, 'E6': { value: '85' }, 'F6': { value: '90' }, 'G6': { value: '92' }, 'H6': { value: '=AVERAGE(B6:G6)', formula: '=AVERAGE(B6:G6)' }, 'I6': { value: 'A', color: '#2E7D32' }, 'J6': { value: 'Excellent' },
        'A7': { value: 'Carol Lee' }, 'B7': { value: '78' }, 'C7': { value: '75' }, 'D7': { value: '82' }, 'E7': { value: '70' }, 'F7': { value: '88' }, 'G7': { value: '80' }, 'H7': { value: '=AVERAGE(B7:G7)', formula: '=AVERAGE(B7:G7)' }, 'I7': { value: 'B+', color: '#1565C0' }, 'J7': { value: 'Good' },
        'A8': { value: 'David Park' }, 'B8': { value: '91' }, 'C8': { value: '94' }, 'D8': { value: '88' }, 'E8': { value: '93' }, 'F8': { value: '76' }, 'G8': { value: '85' }, 'H8': { value: '=AVERAGE(B8:G8)', formula: '=AVERAGE(B8:G8)' }, 'I8': { value: 'A', color: '#2E7D32' }, 'J8': { value: 'Excellent' },
        'A9': { value: 'Eva Martinez' }, 'B9': { value: '65' }, 'C9': { value: '70' }, 'D9': { value: '74' }, 'E9': { value: '68' }, 'F9': { value: '82' }, 'G9': { value: '75' }, 'H9': { value: '=AVERAGE(B9:G9)', formula: '=AVERAGE(B9:G9)' }, 'I9': { value: 'C+', color: '#E65100' }, 'J9': { value: 'Needs Improvement' },
        'A10': { value: 'Frank Turner' }, 'B10': { value: '88' }, 'C10': { value: '85' }, 'D10': { value: '90' }, 'E10': { value: '87' }, 'F10': { value: '92' }, 'G10': { value: '89' }, 'H10': { value: '=AVERAGE(B10:G10)', formula: '=AVERAGE(B10:G10)' }, 'I10': { value: 'A', color: '#2E7D32' }, 'J10': { value: 'Excellent' },
        'A12': { value: 'CLASS STATISTICS', bold: true, backgroundColor: '#EDE7F6', fontSize: 13 },
        'A13': { value: 'Class Average:', bold: true }, 'B13': { value: '=AVERAGE(H5:H10)', formula: '=AVERAGE(H5:H10)' },
        'A14': { value: 'Highest Score:', bold: true }, 'B14': { value: '=MAX(H5:H10)', formula: '=MAX(H5:H10)' },
        'A15': { value: 'Lowest Score:', bold: true }, 'B15': { value: '=MIN(H5:H10)', formula: '=MIN(H5:H10)' },
        'D13': { value: 'Top Student:', bold: true }, 'E13': { value: 'Alice Johnson' },
        'D14': { value: 'Total Students:', bold: true }, 'E14': { value: '6' },
      },
      template: {
        id: 'school-gradebook',
        name: 'School Gradebook Template',
        headers: ['Student Name', 'Math', 'Science', 'English', 'History', 'Art', 'PE', 'Average', 'Grade', 'Remarks'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        formulas: { 'H5': '=AVERAGE(B5:G5)', 'H6': '=AVERAGE(B6:G6)', 'B13': '=AVERAGE(H5:H10)', 'B14': '=MAX(H5:H10)' },
      },
    },
    'business-report': {
      cells: {
        'A1': { value: 'QUARTERLY BUSINESS PERFORMANCE REPORT', bold: true, fontSize: 16, backgroundColor: '#1A237E', color: '#FFFFFF' },
        'A2': { value: 'Company:', bold: true }, 'B2': { value: 'EtherX Solutions Pvt. Ltd.' }, 'D2': { value: 'Period:', bold: true }, 'E2': { value: 'Q1 2024' }, 'F2': { value: 'Prepared by:', bold: true }, 'G2': { value: 'Finance Team' },
        'A4': { value: 'REVENUE METRICS', bold: true, backgroundColor: '#283593', color: '#FFFFFF', fontSize: 13 },
        'A5': { value: 'Metric', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'B5': { value: 'Q1 2023', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'C5': { value: 'Q2 2023', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'D5': { value: 'Q3 2023', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'E5': { value: 'Q4 2023', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'F5': { value: 'Q1 2024', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'G5': { value: 'YoY Growth', bold: true, backgroundColor: '#3949AB', color: '#FFFFFF' },
        'A6': { value: 'Total Revenue ($)' }, 'B6': { value: '450000' }, 'C6': { value: '520000' }, 'D6': { value: '610000' }, 'E6': { value: '680000' }, 'F6': { value: '530000' }, 'G6': { value: '=((F6-B6)/B6)*100', formula: '=((F6-B6)/B6)*100' },
        'A7': { value: 'Cost of Goods Sold' }, 'B7': { value: '180000' }, 'C7': { value: '210000' }, 'D7': { value: '240000' }, 'E7': { value: '265000' }, 'F7': { value: '200000' }, 'G7': { value: '=((F7-B7)/B7)*100', formula: '=((F7-B7)/B7)*100' },
        'A8': { value: 'Gross Profit', bold: true }, 'B8': { value: '=B6-B7', formula: '=B6-B7' }, 'C8': { value: '=C6-C7', formula: '=C6-C7' }, 'D8': { value: '=D6-D7', formula: '=D6-D7' }, 'E8': { value: '=E6-E7', formula: '=E6-E7' }, 'F8': { value: '=F6-F7', formula: '=F6-F7' }, 'G8': { value: '=((F8-B8)/B8)*100', formula: '=((F8-B8)/B8)*100' },
        'A9': { value: 'Operating Expenses' }, 'B9': { value: '95000' }, 'C9': { value: '110000' }, 'D9': { value: '125000' }, 'E9': { value: '140000' }, 'F9': { value: '108000' }, 'G9': { value: '=((F9-B9)/B9)*100', formula: '=((F9-B9)/B9)*100' },
        'A10': { value: 'Net Profit', bold: true }, 'B10': { value: '=B8-B9', formula: '=B8-B9' }, 'C10': { value: '=C8-C9', formula: '=C8-C9' }, 'D10': { value: '=D8-D9', formula: '=D8-D9' }, 'E10': { value: '=E8-E9', formula: '=E8-E9' }, 'F10': { value: '=F8-F9', formula: '=F8-F9' }, 'G10': { value: '=((F10-B10)/B10)*100', formula: '=((F10-B10)/B10)*100' },
        'A11': { value: 'Profit Margin %', bold: true }, 'B11': { value: '=B10/B6*100', formula: '=B10/B6*100' }, 'C11': { value: '=C10/C6*100', formula: '=C10/C6*100' }, 'D11': { value: '=D10/D6*100', formula: '=D10/D6*100' }, 'E11': { value: '=E10/E6*100', formula: '=E10/E6*100' }, 'F11': { value: '=F10/F6*100', formula: '=F10/F6*100' },
        'A13': { value: 'KEY PERFORMANCE INDICATORS', bold: true, backgroundColor: '#1565C0', color: '#FFFFFF', fontSize: 13 },
        'A14': { value: 'KPI', bold: true, backgroundColor: '#1976D2', color: '#FFFFFF' }, 'B14': { value: 'Target', bold: true, backgroundColor: '#1976D2', color: '#FFFFFF' }, 'C14': { value: 'Actual', bold: true, backgroundColor: '#1976D2', color: '#FFFFFF' }, 'D14': { value: 'Status', bold: true, backgroundColor: '#1976D2', color: '#FFFFFF' },
        'A15': { value: 'Revenue Growth %' }, 'B15': { value: '15' }, 'C15': { value: '17.8' }, 'D15': { value: 'Exceeded', color: '#1B5E20' },
        'A16': { value: 'Customer Acquisition' }, 'B16': { value: '500' }, 'C16': { value: '432' }, 'D16': { value: 'Below Target', color: '#C62828' },
        'A17': { value: 'Customer Retention %' }, 'B17': { value: '85' }, 'C17': { value: '91' }, 'D17': { value: 'Exceeded', color: '#1B5E20' },
        'A18': { value: 'NPS Score' }, 'B18': { value: '50' }, 'C18': { value: '62' }, 'D18': { value: 'Exceeded', color: '#1B5E20' },
        'A19': { value: 'Employee Satisfaction' }, 'B19': { value: '80' }, 'C19': { value: '78' }, 'D19': { value: 'Near Target', color: '#E65100' },
      },
      template: {
        id: 'business-report',
        name: 'Business Report Template',
        headers: ['Metric', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'YoY Growth'],
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        formulas: {
          'B8': '=B6-B7', 'B10': '=B8-B9', 'B11': '=B10/B6*100',
          'F8': '=F6-F7', 'F10': '=F8-F9', 'F11': '=F10/F6*100',
          'G6': '=((F6-B6)/B6)*100',
        },
      },
    },
  };

  // Return the requested template or a default one
  const templateData = templates[templateId];
  if (!templateData) {
    // Check if we have a generator for this type (migrated from Templates.tsx)
    const generatedData = generateLocalTemplate(templateId);
    if (generatedData) {
      return generatedData;
    }

    console.warn(`Template ${templateId} not found, returning default blank template`);
    return {
      cells: {},
      template: {
        id: templateId,
        name: 'Default Template',
        headers: [],
        columns: [],
      },
    };
  }

  console.log(`✅ Using hardcoded template data for: ${templateId}`);
  return templateData;
}

// Migrated from Templates.tsx
function generateLocalTemplate(type: string): TemplateData | null {
  const cells: Record<string, any> = {};

  switch (type) {
    case "budget":
      cells["A1"] = { value: "💰 Monthly Budget", bold: true, backgroundColor: "#10b981", color: "#ffffff" };
      cells["A3"] = { value: "Income", bold: true };
      cells["B3"] = { value: "Amount", bold: true };
      cells["A4"] = { value: "Salary" };
      cells["B4"] = { value: "0" };
      cells["A5"] = { value: "Side Hustle" };
      cells["B5"] = { value: "0" };
      cells["A6"] = { value: "Other" };
      cells["B6"] = { value: "0" };
      cells["A7"] = { value: "Total Income", bold: true };
      cells["B7"] = { value: "=SUM(B4:B6)", formula: "=SUM(B4:B6)", bold: true };

      cells["A9"] = { value: "Expenses", bold: true };
      cells["B9"] = { value: "Amount", bold: true };
      cells["A10"] = { value: "Rent" };
      cells["B10"] = { value: "0" };
      cells["A11"] = { value: "Food" };
      cells["B11"] = { value: "0" };
      cells["A12"] = { value: "Transport" };
      cells["B12"] = { value: "0" };
      cells["A13"] = { value: "Entertainment" };
      cells["B13"] = { value: "0" };
      cells["A14"] = { value: "Shopping" };
      cells["B14"] = { value: "0" };
      cells["A15"] = { value: "Total Expenses", bold: true };
      cells["B15"] = { value: "=SUM(B10:B14)", formula: "=SUM(B10:B14)", bold: true };

      cells["A17"] = { value: "Savings", bold: true, backgroundColor: "#dbeafe" };
      cells["B17"] = { value: "=B7-B15", formula: "=B7-B15", bold: true, backgroundColor: "#dbeafe" };
      return {
        cells,
        template: { id: 'budget', name: 'Monthly Budget', headers: [], columns: [] }
      };

    case "study":
      cells["A1"] = { value: "📚 Study Schedule", bold: true, backgroundColor: "#3b82f6", color: "#ffffff" };
      cells["A3"] = { value: "Day", bold: true };
      cells["B3"] = { value: "Subject", bold: true };
      cells["C3"] = { value: "Time", bold: true };
      cells["D3"] = { value: "Status", bold: true };

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const subjects = ["Math", "Science", "English", "History", "Art"];

      days.forEach((day, i) => {
        cells[`A${i + 4}`] = { value: day };
        cells[`B${i + 4}`] = { value: subjects[i] };
        cells[`C${i + 4}`] = { value: "2 hours" };
        cells[`D${i + 4}`] = { value: "⏳" };
      });
      return {
        cells,
        template: { id: 'study', name: 'Study Schedule', headers: [], columns: [] }
      };

    case "workout":
      cells["A1"] = { value: "💪 Workout Planner", bold: true, backgroundColor: "#ef4444", color: "#ffffff" };
      cells["A3"] = { value: "Exercise", bold: true };
      cells["B3"] = { value: "Sets", bold: true };
      cells["C3"] = { value: "Reps", bold: true };
      cells["D3"] = { value: "Done", bold: true };

      const exercises = ["Push-ups", "Squats", "Planks", "Lunges", "Burpees"];
      exercises.forEach((exercise, i) => {
        cells[`A${i + 4}`] = { value: exercise };
        cells[`B${i + 4}`] = { value: "3" };
        cells[`C${i + 4}`] = { value: "12" };
        cells[`D${i + 4}`] = { value: "☐" };
      });
      return {
        cells,
        template: { id: 'workout', name: 'Workout Planner', headers: [], columns: [] }
      };

    case "meal":
      cells["A1"] = { value: "🍱 Meal Prep", bold: true, backgroundColor: "#ec4899", color: "#ffffff" };
      cells["A3"] = { value: "Day", bold: true };
      cells["B3"] = { value: "Breakfast", bold: true };
      cells["C3"] = { value: "Lunch", bold: true };
      cells["D3"] = { value: "Dinner", bold: true };

      const mealDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      mealDays.forEach((day, i) => {
        cells[`A${i + 4}`] = { value: day };
      });
      return {
        cells,
        template: { id: 'meal', name: 'Meal Planner', headers: [], columns: [] }
      };

    case "habit":
      cells["A1"] = { value: "⚡ Habit Tracker", bold: true, backgroundColor: "#f59e0b", color: "#ffffff" };
      cells["A3"] = { value: "Habit", bold: true };

      for (let i = 1; i <= 7; i++) {
        cells[`${String.fromCharCode(65 + i)}3`] = { value: `Day ${i}`, bold: true };
      }

      const habits = ["Drink Water 💧", "Exercise 🏃", "Read 📖", "Meditate 🧘", "Sleep 8hrs 😴"];
      habits.forEach((habit, i) => {
        cells[`A${i + 4}`] = { value: habit };
        for (let j = 1; j <= 7; j++) {
          cells[`${String.fromCharCode(65 + j)}${i + 4}`] = { value: "☐" };
        }
      });
      return {
        cells,
        template: { id: 'habit', name: 'Habit Tracker', headers: [], columns: [] }
      };

    case "social":
      cells["A1"] = { value: "📱 Content Calendar", bold: true, backgroundColor: "#8b5cf6", color: "#ffffff" };
      cells["A3"] = { value: "Date", bold: true };
      cells["B3"] = { value: "Platform", bold: true };
      cells["C3"] = { value: "Content Idea", bold: true };
      cells["D3"] = { value: "Status", bold: true };

      const platforms = ["Instagram", "TikTok", "Twitter", "YouTube", "LinkedIn"];
      platforms.forEach((platform, i) => {
        cells[`B${i + 4}`] = { value: platform };
        cells[`D${i + 4}`] = { value: "📝 Draft" };
      });
      return {
        cells,
        template: { id: 'social', name: 'Content Calendar', headers: [], columns: [] }
      };

    case "playlist":
      cells["A1"] = { value: "🎵 Playlist Tracker", bold: true, backgroundColor: "#06b6d4", color: "#ffffff" };
      cells["A3"] = { value: "Song", bold: true };
      cells["B3"] = { value: "Artist", bold: true };
      cells["C3"] = { value: "Mood", bold: true };
      cells["D3"] = { value: "Rating", bold: true };
      return {
        cells,
        template: { id: 'playlist', name: 'Playlist Tracker', headers: [], columns: [] }
      };

    case "selfcare":
      cells["A1"] = { value: "💖 Self-Care Log", bold: true, backgroundColor: "#a855f7", color: "#ffffff" };
      cells["A3"] = { value: "Date", bold: true };
      cells["B3"] = { value: "Mood", bold: true };
      cells["C3"] = { value: "Activity", bold: true };
      cells["D3"] = { value: "Notes", bold: true };

      const moods = ["😊 Great", "🙂 Good", "😐 Okay", "😔 Low", "😌 Calm"];
      moods.forEach((mood, i) => {
        cells[`B${i + 4}`] = { value: mood };
      });
      return {
        cells,
        template: { id: 'selfcare', name: 'Self-Care Log', headers: [], columns: [] }
      };

    default:
      return null;
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
