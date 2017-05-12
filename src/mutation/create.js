const fs = require('fs');
const path = require('path');

module.exports = async (_, {id}) => {
  const exists = await spaceExists(id);

  if (exists) {
    throw new Error('Space Exists');
  }

  await createSpace(id);

  return true;
};

function createSpace(id) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path.join(process.env.DATA_PATH, id), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

function spaceExists(id) {
  return new Promise((resolve, reject) => {
    fs.stat(path.join(process.env.DATA_PATH, id), (error) => {
      if (error) {
        if (error.code === 'ENOENT') {
          resolve(false);
        } else {
          reject(error);
        }
      } else {
        resolve(true);
      }
    });
  });
}
