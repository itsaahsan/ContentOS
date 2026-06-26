const slugifyLib = require('slugify');

const generateSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

module.exports = generateSlug;
