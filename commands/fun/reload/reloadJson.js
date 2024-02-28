const fs = require('fs');
const path = require('path');

// Function to recursively search for a JSON file in a specific folder
function findJsonFile(folderPath, fileName) {
	if (!fs.existsSync(folderPath)) {
		return null;
	}

	const files = fs.readdirSync(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileStat = fs.statSync(filePath);

		if (fileStat.isDirectory()) {
			// If it's a directory, recursively search for the JSON file
			const result = findJsonFile(filePath, fileName);
			if (result) {
				return result;
			}
		} else if (file === `${fileName}.json`) {
			// If it's a JSON file with the specified name, return its path
			return filePath;
		}
	}

	return null;
}

module.exports = {
	name: 'reloadjson',
	description: 'Reloads a specified JSON file.',
	execute(client, message, args) {
		if (args.length !== 1) {
			return message.reply('Please AKAII provide the name of the JSON file to reload.');
		}

		const [fileName] = args;
		const commandsPath = path.join(__dirname, 'commands');
		const jsonFilePath = findJsonFile(commandsPath, fileName);

		if (!jsonFilePath) {
			return message.reply('That JSON file does not exist.');
		}

		try {
			// Delete the require cache for the specified file
			delete require.cache[require.resolve(jsonFilePath)];
			// Re-require the JSON file
			const reloadedJson = require(jsonFilePath);
			// You can now use reloadedJson in your code
			message.reply(`JSON file '${fileName}' reloaded successfully!`);
		} catch (error) {
			console.error('Error reloading JSON file:', error);
			message.reply(`An error occurred while reloading the JSON file '${fileName}'.`);
		}
	},
};
