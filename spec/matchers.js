module.exports = {
  toHaveSize: (util, customEqualityTesters) => {
    return {
      compare: (actual, expected) => {
        const pass =
          util.equals(actual.size, expected, customEqualityTesters);

        let message;
        if (pass) {
          message = `Expected size to be ${expected} but got ${actual.size}`;
        }
        else {
          message = `Expected size to not be ${expected}`;
        }

        return {pass, message};
      }
    };
  }
};
