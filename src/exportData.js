const ObjectsToCsv = require("objects-to-csv");

module.exports = async (allContactsData, scriptMode) => {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;

    // push data to CSV and export
    const csv = new ObjectsToCsv(allContactsData.contacts);
    // Save to file
    await csv.toDisk(`./contactData_${scriptMode}_${date}.csv`);
    console.log("Exported CSV file...");
};
