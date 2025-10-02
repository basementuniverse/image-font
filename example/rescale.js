// Rescale character dimensions in an ImageFont JSON config file.
// Usage: node rescale.js <source_json_path> <target_json_path> <scale_factor>

const fs = require('fs');

if (process.argv.length !== 5) {
  console.error('Usage: node rescale.js <source_json_path> <target_json_path> <scale_factor>');
  process.exit(1);
}

const sourcePath = process.argv[2];
const targetPath = process.argv[3];
const scaleFactor = parseFloat(process.argv[4]);

if (isNaN(scaleFactor) || scaleFactor <= 0) {
  console.error('Scale factor must be a positive number.');
  process.exit(1);
}

function rescaleCharacter(character, scale) {
  if (character.height) {
    character.height = Math.round(character.height * scale);
  }
  if (character.width) {
    character.width = Math.round(character.width * scale);
  }
  if (character.offset) {
    if (character.offset.x) {
      character.offset.x = Math.round(character.offset.x * scale);
    }
    if (character.offset.y) {
      character.offset.y = Math.round(character.offset.y * scale);
    }
  }
}

fs.readFile(sourcePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch (parseErr) {
    console.error(`Error parsing JSON: ${parseErr}`);
    process.exit(1);
  }

  if (json.defaultCharacterConfig) {
    rescaleCharacter(json.defaultCharacterConfig, scaleFactor);
  }

  if (json.characters) {
    for (const charKey in json.characters) {
      if (json.characters.hasOwnProperty(charKey)) {
        rescaleCharacter(json.characters[charKey], scaleFactor);
      }
    }
  }

  fs.writeFile(targetPath, JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
    if (writeErr) {
      console.error(`Error writing file to disk: ${writeErr}`);
      process.exit(1);
    }
    console.log(`Rescaled JSON written to ${targetPath}`);
  });
});
