const setData = require("../data/setData");
const themeData = require("../data/themeData");
let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    sets = [];
    setData.forEach(function(set) {
      var theme = themeData.find(function(theme) {
        return theme.id === set.theme_id;
      });
      if (theme) {
        sets.push({ ...set, theme: theme.name });
      }
    });
    resolve(); // Resolve the promise once the operation is complete
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    if (sets.length === 0) {
      reject("No sets available");
    } else {
      resolve(sets);
    }
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const check = sets.find(function(set) {
      if (set.set_num === setNum) {
        return 1;
      }
    });

    if (check) {
      resolve(check);
    } else {
      reject("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const themeToSearch = theme.toLowerCase();
    var resSet = sets.filter(function(set) {
      const setTheme = set.theme.toLowerCase();
      return setTheme.includes(themeToSearch);
    });
    if (resSet.length > 0) {
      resolve(resSet);
    } else {
      reject("Unable to find requested sets");
    }
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };


/*********************************************************************************************** 
                                         CODE TESTER CODE
      initialize();

      console.log("All LEGO sets:");
      console.log(sets);
      
      console.log("\nLEGO sets with theme 'Technic':");
      console.log(getSetsByTheme("Technic"));
      
      console.log("\nLEGO set with set number '001-1':");
      console.log(getSetByNum("001-1"));
      
 ************************************************************************************************/   
     
      
      
      
      