import { z } from "zod";
import { tool } from "@langchain/core/tools";

const viewCellsSchema = z.object({
  cells: z.string().describe("Cell range to read in A1 notation (e.g., 'A1', 'A1:C3', 'B2:D5'). Can be a single cell or a range of cells."),
})

const editCellsSchema = z.object({
  cells: z.string().describe("Cell range to edit in A1 notation (e.g., 'A1', 'A1:C3', 'B2:D5'). Can be a single cell or a range of cells."),
  data: z.string(). describe("JSON formatted data for the cells that need to be edited. The JSON data should have one element called `data` which is a 2D array representing the data. For example, { data: [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ] }"),
})

export const viewCellsTool = tool(
  async (input) => {
    try {
      const result = await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange(input.cells);
        range.load('address')
        range.load('values')
        await context.sync();
        // const jsonValues = range.values;
        console.log(`Viewing range ${range.address} with values `, JSON.stringify(range.values, null, 4));
        // return {
        //   address: range.address,
        //   values: range.values,
        // }

        return JSON.stringify(range.values, null, 4);
      });
      return result;
    } catch (error) {
      console.log("Error: " + error);
      return "Error: " + error;
    }
  },
  {
    name: "view_cells",
    description: "Read the values of cells within a specified range in the active Excel worksheet. Use this tool to view current spreadsheet data before making changes or to understand the spreadsheet structure.",
    schema: viewCellsSchema,
  }
)

export const editCellsTool = tool(
  async (input) => {
    try {
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange(input.cells);
        const json_data = JSON.parse(input.data);
        range.values = json_data.data;
        // range.format.autofitColumns();
        await context.sync();
      });
      console.log(`Updated cells ${input.cells} with values ${input.data}`);
      return `Successfully updated cells ${input.cells}`
    } catch (error) {
      console.log("Error: " + error);
      return "Error: " + error;
    }
  },
  {
    name: "edit_cells",
    description: "Update the values of cells within a specified range in the active Excel worksheet. Use this tool to modify spreadsheet data, enter formulas, or update existing values.",
    schema: editCellsSchema,
  }
)

/** 
* Reads value of the cells within the specified range
* @param {string} cells - Cell range to read the values in A1 notation (i.e "A1:C2")
* @return {string} Returns a string with the adress of the cells and the values of the cells at that location
*/
export async function viewCells(cells) {
  try {
    const result = await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(cells);
      range.load('address')
      range.load('values')
      await context.sync();
      console.log(`Range ${range.address} with values `, range.values);
      // return {
      //   address: range.address,
      //   values: range.values,
      // }
      return range.values;
    });
    return result;
  } catch (error) {
    console.log("Error: " + error);
    return "Error: " + error;
  }
}

/** 
* Edit the values of the cells within the specified range
* @param {string} cells - Cell range to read the values in A1 notation (i.e "A1:C2")
* @param {string[]} data - 2D array of values for the specified vells
* @return {string} Returns success of failure messsage 
*/
export async function editCells(cells, data) {
  // Write text to the top left cell.
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(cells);
      range.values = data;
      // range.format.autofitColumns();
      await context.sync();
    });
    return `Successfully updated cells ${cells}`
  } catch (error) {
    console.log("Error: " + error);
    return "Error: " + error;
  }
}

/**
 * Execute a tool call from the AI agent
 * @param {Object} toolCall - Tool call object with id, name, and input
 * @returns {Promise<Object>} - Tool result with tool_use_id and content
 */
export async function executeToolCall(toolCall) {
  console.log('Executing tool call:', toolCall.name, 'with input:', toolCall.input);
  
  try {
    let result;
    
    switch (toolCall.name) {
      case 'viewCells':
        result = await viewCells(toolCall.input.cells);
        break;
        
      case 'editCells':
        result = await editCells(toolCall.input.cells, toolCall.input.data);
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolCall.name}`);
    }
    
    // Format result for Anthropic API
    return {
      tool_use_id: toolCall.id,
      content: typeof result === 'string' ? result : JSON.stringify(result)
    };
    
  } catch (error) {
    console.error(`Error executing tool ${toolCall.name}:`, error);
    
    return {
      tool_use_id: toolCall.id,
      content: `Error executing ${toolCall.name}: ${error.message}`
    };
  }
}

/**
 * Execute multiple tool calls and return results
 * @param {Array} toolCalls - Array of tool call objects
 * @returns {Promise<Array>} - Array of tool results
 */
export async function executeToolCalls(toolCalls) {
  const results = [];
  
  for (const toolCall of toolCalls) {
    const result = await executeToolCall(toolCall);
    results.push(result);
  }
  
  return results;
}
