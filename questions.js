const readline = require("readline");

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
