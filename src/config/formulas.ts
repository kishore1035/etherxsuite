export interface FormulaDefinition {
  name: string;
  description: string;
  syntax: string;
  category: string;
}

export const FORMULAS: FormulaDefinition[] = [
  { name: 'SUM', description: 'Adds all numbers in a range', syntax: 'SUM(number1, [number2], ...)', category: 'Math' },
  { name: 'AVERAGE', description: 'Returns the average of numbers', syntax: 'AVERAGE(number1, [number2], ...)', category: 'Statistical' },
  { name: 'COUNT', description: 'Counts cells with numbers', syntax: 'COUNT(value1, [value2], ...)', category: 'Statistical' },
  { name: 'MIN', description: 'Returns the minimum value', syntax: 'MIN(number1, [number2], ...)', category: 'Statistical' },
  { name: 'MAX', description: 'Returns the maximum value', syntax: 'MAX(number1, [number2], ...)', category: 'Statistical' },
  { name: 'IF', description: 'Returns one value if true, another if false', syntax: 'IF(condition, value_if_true, value_if_false)', category: 'Logical' },
  { name: 'VLOOKUP', description: 'Looks up a value in a table', syntax: 'VLOOKUP(lookup_value, table_array, col_index)', category: 'Lookup' },
  { name: 'HLOOKUP', description: 'Looks up a value horizontally', syntax: 'HLOOKUP(lookup_value, table_array, row_index)', category: 'Lookup' },
  { name: 'CONCAT', description: 'Joins text strings together', syntax: 'CONCAT(text1, [text2], ...)', category: 'Text' },
  { name: 'LEN', description: 'Returns the length of text', syntax: 'LEN(text)', category: 'Text' },
  { name: 'ROUND', description: 'Rounds a number to specified digits', syntax: 'ROUND(number, num_digits)', category: 'Math' },
  { name: 'TODAY', description: 'Returns today\'s date', syntax: 'TODAY()', category: 'Date' },
  { name: 'NOW', description: 'Returns current date and time', syntax: 'NOW()', category: 'Date' },
  { name: 'MULTIPLY', description: 'Multiplies numbers', syntax: 'MULTIPLY(number1, number2)', category: 'Math' },
  { name: 'DIVIDE', description: 'Divides two numbers', syntax: 'DIVIDE(number1, number2)', category: 'Math' },
  { name: 'DIFFERENCE', description: 'Subtracts two numbers', syntax: 'DIFFERENCE(number1, number2)', category: 'Math' },
  { name: 'POWER', description: 'Raises a number to a power', syntax: 'POWER(number, power)', category: 'Math' },
  { name: 'SQRT', description: 'Returns the square root', syntax: 'SQRT(number)', category: 'Math' },
  { name: 'ABS', description: 'Returns absolute value', syntax: 'ABS(number)', category: 'Math' },
  { name: 'UPPER', description: 'Converts text to uppercase', syntax: 'UPPER(text)', category: 'Text' },
  { name: 'LOWER', description: 'Converts text to lowercase', syntax: 'LOWER(text)', category: 'Text' },
  { name: 'TRIM', description: 'Removes extra spaces', syntax: 'TRIM(text)', category: 'Text' },
];
