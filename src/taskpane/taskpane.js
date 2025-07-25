// /* global Excel console */

// export async function viewCells(cells) {
//   // Write text to the top left cell.
//   try {
//     const result = await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const range = sheet.getRange(cells);
//       range.load('address')
//       range.load('values')
//       await context.sync();
//       console.log(`Range ${range.address} with values `, range.values);
//       return {
//         address: range.address,
//         values: range.values,
//       }
//     });
//     return result;
//   } catch (error) {
//     console.log("Error: " + error);
//     throw error;
//   }
// }

// export async function editCells(cells, data) {
//   // Write text to the top left cell.
//   try {
//     await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const range = sheet.getRange(cells);
//       range.values = data;
//       range.format.autofitColumns();
//       await context.sync();
//       return `Successfully updated cells ${cells}`
//     });
//   } catch (error) {
//     console.log("Error: " + error);
//     throw error;
//   }
// }

// export async function insertText(text) {
//   // Write text to the top left cell.
//   try {
//     await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const range = sheet.getRange("A1");
//       range.values = [[text]];
//       range.format.autofitColumns();
//       await context.sync();
//     });
//   } catch (error) {
//     console.log("Error: " + error);
//     throw error;
//   }
// }

// export async function getSelectedRange() {
//   // Get the user's current selected range
//   try {
//     return await Excel.run(async (context) => {
//       const range = context.workbook.getSelectedRange();
//       range.load("address");
//       range.load("values");
//       await context.sync();
//       console.log('Range Address ', range.address);
//       console.log('Range Values', range.values);
//       return {
//         address: range.address,
//         range: range,
//         values: range.values,
//       };
//     });
//   } catch (error) {
//     console.log("Error getting selected range: " + error);
//     throw new Error("Could not get selected range");
//   }
// }

// export async function insertFormula(formula, targetRange = null) {
//   // Insert a formula into the selected range or specified range
//   try {
//     return await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       let range;

//       if (targetRange) {
//         range = sheet.getRange(targetRange);
//       } else {
//         // Use selected range or default to A1
//         try {
//           range = context.workbook.getSelectedRange();
//         } catch {
//           range = sheet.getRange("A1");
//         }
//       }

//       range.formulas = [[formula]];
//       range.format.autofitColumns();
//       range.load("address");
//       await context.sync();

//       return {
//         success: true,
//         address: range.address,
//       };
//     });
//   } catch (error) {
//     console.log("Error inserting formula: " + error);
//     throw new Error(`Failed to insert formula: ${error.message}`);
//   }
// }

// export async function insertValue(value, targetRange = null) {
//   // Insert a value into the selected range or specified range
//   try {
//     return await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       let range;

//       if (targetRange) {
//         range = sheet.getRange(targetRange);
//       } else {
//         // Use selected range or default to A1
//         try {
//           range = context.workbook.getSelectedRange();
//         } catch {
//           range = sheet.getRange("A1");
//         }
//       }

//       range.values = [[value]];
//       range.format.autofitColumns();
//       range.load("address");
//       await context.sync();

//       return {
//         success: true,
//         address: range.address,
//       };
//     });
//   } catch (error) {
//     console.log("Error inserting value: " + error);
//     throw new Error(`Failed to insert value: ${error.message}`);
//   }
// }

// export async function getSheetData(rangeAddress = "A1:Z100") {
//   // Get data from a specified range for context
//   try {
//     return await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const range = sheet.getRange(rangeAddress);

//       range.load("values");
//       range.load("formulas");
//       range.load("address");
//       await context.sync();

//       return {
//         values: range.values,
//         formulas: range.formulas,
//         address: range.address,
//       };
//     });
//   } catch (error) {
//     console.log("Error getting sheet data: " + error);
//     throw new Error("Could not read sheet data");
//   }
// }

// export async function getWorksheetInfo() {
//   // Get information about the current worksheet
//   try {
//     return await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const usedRange = sheet.getUsedRange();

//       sheet.load("name");
//       usedRange.load("address");
//       await context.sync();

//       return {
//         name: sheet.name,
//         usedRange: usedRange.address,
//       };
//     });
//   } catch (error) {
//     console.log("Error getting worksheet info: " + error);
//     throw new Error("Could not get worksheet information");
//   }
// }

// export async function detectErrors() {
//   // Simple error detection by looking for #ERROR patterns
//   try {
//     return await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       const usedRange = sheet.getUsedRange();

//       if (!usedRange) {
//         return { errors: [], hasErrors: false };
//       }

//       usedRange.load("values");
//       usedRange.load("address");
//       await context.sync();

//       const errors = [];
//       const values = usedRange.values;

//       for (let row = 0; row < values.length; row++) {
//         for (let col = 0; col < values[row].length; col++) {
//           const value = values[row][col];
//           if (typeof value === "string" && value.startsWith("#")) {
//             errors.push({
//               address: `${String.fromCharCode(65 + col)}${row + 1}`,
//               error: value,
//               type: "Formula Error",
//             });
//           }
//         }
//       }

//       return {
//         errors,
//         hasErrors: errors.length > 0,
//         totalCells: values.length * (values[0]?.length || 0),
//       };
//     });
//   } catch (error) {
//     console.log("Error detecting errors: " + error);
//     throw new Error("Could not analyze worksheet for errors");
//   }
// }
