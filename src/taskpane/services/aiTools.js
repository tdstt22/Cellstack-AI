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