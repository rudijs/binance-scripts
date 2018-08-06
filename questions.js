const readline = require("readline");

// multiple questions
// https://stackoverflow.com/questions/36540996/how-to-take-two-consecutive-input-with-the-readline-module-of-node-js

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const confirmOrder = () => {
  return new Promise((resolve, reject) => {
    rl.question("\n==> Place real Order? y/n ", answer => {
      resolve(answer.toLowerCase());
    });
  });
};

module.exports = {
  rl,
  confirmOrder
};
