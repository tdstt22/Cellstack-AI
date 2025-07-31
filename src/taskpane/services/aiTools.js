import { z } from "zod";
import { tool } from "@langchain/core/tools";

const CELL_PROPERTIES = {
  address: true,
  format: {
    fill: {
      color: true,
      tintAndShade:true,
    },
    font: {
      color: true,
      bold: true,
      name: true,
      size: true,
    }
  },
  style: true
}

const EDIT_CELL_DATA_DESCRIPTION = `JSON formatted data for the cells that need to be edited in sheet. Only supply data for the cells that need to be updated. DO NOT provide data for cells that remain the same.
The JSON data should have keys being the cell coordinates in A1 Notation (such as "A1" or "B3"). 
The values should be a dictionary containing the properties of the cell. The cell properties are as follows:
{
  "value": Value of the cell (String/Number/Boolean)
  "format": {
    "fill": {
      "color": Color in Hex Value (String)
      "nofill": true or false (String)
    },
    "font": {
      "color": Color in Hex Value (String)
      "bold": true or false (Boolean)
      "name": Font name (String)
      "size": Font size (Integer)
    }
  }
}

Here is an example of a properly formatted data:
{
  "A1": {
    "value": "Hello"
    "format": {
      "fill": {
        "color": "#FF0000",
      },
      "font": {
        "color": "#000000",
        "bold": true,
        "name": "Avenir",
        "size": 12,
      }
    }
  }
}

If any cell property DOES NOT need to be updated, leave it out of the JSON data. For example, if you want to update the just the fill color of A1 to red then supply to following data:
{
  "A1": {
    "format": {
      "fill": {
        "color": "#FF0000",
      }
    }
  }
}
`

const viewCellsSchema = z.object({
  sheetName: z.string().describe("Name of sheet to view (e.g. 'Sheet1', 'Index', 'Output')"),
  cells: z.string().describe("Cell range in sheetName to view in A1 notation (e.g. 'A1', 'A1:C3', 'B2:D5'). Range can be a single cell or a range of cells."),
})

const editCellsSchema = z.object({
  sheetName: z.string().describe("Name of sheet to edit (e.g. 'Sheet1', 'Index', 'Output')"),
  data: z.string(). describe(EDIT_CELL_DATA_DESCRIPTION),
})

// const editCellsSchema = z.object({
//   cells: z.string().describe("Cell range to edit in A1 notation (e.g., 'A1', 'A1:C3', 'B2:D5'). Can be a single cell or a range of cells."),
//   data: z.string(). describe("JSON formatted data for the cells that need to be edited. The JSON data should have one element called `data` which is a 2D array representing the data. For example, { data: [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ] }"),
// })

export const viewCellsTool = tool(
  async (input) => {
    try {
      const result = await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem(input.sheetName);
        const range = sheet.getRange(input.cells);
        range.load(['address', 'values', 'valuesAsJson', 'formulas', 'rowIndex', 'columnIndex', 'format']);
        await context.sync();
        // const jsonValues = range.values;
        // console.log(`Viewing range ${range.address} with values `, JSON.stringify(range.values, null, 4));
        // console.log(`Values JSON ${JSON.stringify(range.valuesAsJson, null, 4)}`);
        // console.log(`Formulas ${JSON.stringify(range.formulas, null, 4)}`);
        // console.log(`rowIndex ${range.rowIndex} columnIndex ${range.columnIndex}`);

        // console.log(`font ${JSON.stringify(range.format, null, 4)}`);
        console.log("Running View Cells...");


        const values = range.values;
        const formulas = range.formulas;
        
        // Offset to add
        const topLeftRowIndex = range.rowIndex;
        const topLeftColumnIndex = range.columnIndex;

        const data = {};

        for (let row = 0; row < values.length; row++) {
          for (let col = 0; col < values[row].length; col++) {
            const cell = range.getCell(row, col);
            const propertiesToGet = cell.getCellProperties(CELL_PROPERTIES);
            // Sync to get the data from the workbook.
            await context.sync();
            const cellProperties = propertiesToGet.value[0][0];
            const cellValue = values[row][col];
            const formulaValue = formulas[row][col];
            const adj_row = row + topLeftRowIndex;
            const adj_col = col + topLeftColumnIndex;
            data[`${String.fromCharCode(65 + adj_col)}${adj_row + 1}`] = {
              value: cellValue,
              formula: formulaValue,
              format: {
                fill: {
                  color: cellProperties.format.fill.color,
                  nofill: cellProperties.format.fill.tintAndShade === null ? true : false,
                },
                font: {
                  color: cellProperties.format.font.color,
                  bold: cellProperties.format.font.bold,
                  name: cellProperties.format.font.name,
                  size: cellProperties.format.font.size,
                }
              },
            }
            // Perform operations with cellValue
            // console.log(`Cell at row ${row + 1}, column ${col + 1} (A1 equivalent: ${String.fromCharCode(65 + col)}${row + 1}): ${cellValue}`);
          }
      }
        // return {
        //   address: range.address,
        //   values: range.values,
        // }
        // console.log(JSON.stringify(data, null, 4));

        return JSON.stringify(data, null, 4);
      });
      return result;
    } catch (error) {
      console.log("Error: " + error);
      return "Error: " + error;
    }
  },
  {
    name: "view_cells",
    description: "View the cells within a specified range in specific a sheet. This includes the value, style, and other cell properties. Use this tool to view data on a specific sheet.",
    schema: viewCellsSchema,
  }
)

export const editCellsTool = tool(
    async (input) => {
      try {
        await Excel.run(async (context) => {
          // const sheet = context.workbook.worksheets.getActiveWorksheet();
          const sheet = context.workbook.worksheets.getItem(input.sheetName);
          // const range = sheet.getRange(input.cells);
          const json_data = JSON.parse(input.data);

          // console.log(json_data);
          console.log("Running Edit Cells...");
          console.log(input.data);

          // Iterate through JSON data
          Object.keys(json_data).forEach(key => {
            const cell = sheet.getRange(key);
            //Update value
            if (json_data[key]?.value !== undefined) cell.values = [[json_data[key].value]];
          
            // Update Font
            if (json_data[key]?.format?.font?.color !== undefined) cell.format.font.color = json_data[key].format.font.color;
            if (json_data[key]?.format?.font?.bold !== undefined) cell.format.font.bold = json_data[key].format.font.bold;
            if (json_data[key]?.format?.font?.name !== undefined) cell.format.font.name = json_data[key].format.font.name;
            if (json_data[key]?.format?.font?.size !== undefined) cell.format.font.size = json_data[key].format.font.size;
            
            // Update Fill
            if (json_data[key]?.format?.fill?.color !== undefined) cell.format.fill.color = json_data[key].format.fill.color;
            if (json_data[key]?.format?.fill?.nofill === true) cell.format.fill.clear();

            // Auto-fit columns
            cell.format.autofitColumns();
            // // Round to 2 decimal
            // cell.numberFormat = [["0.00"]]; 
          });
          // range.values = json_data.data;
          // range.format.autofitColumns();
          await context.sync();
        });
        console.log(`Updated cells successfully`);
        return `Successfully updated cells ${input.cells} on sheet ${input.sheetName}`
      } catch (error) {
        console.log("Error: " + error);
        return "Error: " + error;
      }
    },
    {
      name: "edit_cells",
      description: "Update the properties of cells within a specified range in the specified sheet. Use this tool to modify a sheet's cell data.",
      schema: editCellsSchema,
    }
  )

// export const editCellsTool = tool(
//   async (input) => {
//     try {
//       await Excel.run(async (context) => {
//         const sheet = context.workbook.worksheets.getActiveWorksheet();
//         const range = sheet.getRange(input.cells);
//         const json_data = JSON.parse(input.data);
//         range.values = json_data.data;
//         // range.format.autofitColumns();
//         await context.sync();
//       });
//       console.log(`Updated cells ${input.cells} with values ${input.data}`);
//       return `Successfully updated cells ${input.cells}`
//     } catch (error) {
//       console.log("Error: " + error);
//       return "Error: " + error;
//     }
//   },
//   {
//     name: "edit_cells",
//     description: "Update the values of cells within a specified range in the active Excel worksheet. Use this tool to modify spreadsheet data, enter formulas, or update existing values.",
//     schema: editCellsSchema,
//   }
// )


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
