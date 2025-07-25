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