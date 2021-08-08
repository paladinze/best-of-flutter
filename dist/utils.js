"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printDivider = exports.printResults = exports.saveResultsToFile = exports.classifyResults = void 0;
var constants_1 = require("./constants");
var fs_1 = __importDefault(require("fs"));
function genDateStr() {
    var today = new Date();
    var year = today.getFullYear();
    var month = ("" + (today.getMonth() + 1)).padStart(2, "0");
    var day = ("" + today.getDate()).padStart(2, "0");
    return [year, month, day].join("-");
}
function classifyResults(allResults) {
    var all = allResults.map(function (item, index) { return (__assign({ rank: index + 1 }, item)); });
    return {
        official: all.filter(function (result) { return constants_1.OFFICIAL_ACCOUNTS.includes(result.developer); }),
        firebase: all.filter(function (result) { return result.developer === constants_1.FIREBASE_ACCOUNT; }),
        stateManagement: all.filter(function (result) { return constants_1.STATE_MANAGE_LIST.includes(result.name); }),
        all: all,
    };
}
exports.classifyResults = classifyResults;
function saveResultsToFile(classifiedResults) {
    var serializedData = JSON.stringify(classifiedResults, null, 4);
    var dataPath = "data/json/top_packages_" + genDateStr() + ".json";
    fs_1.default.writeFileSync(dataPath, serializedData, 'utf8');
}
exports.saveResultsToFile = saveResultsToFile;
function printResults(classifiedResults) {
    var all = classifiedResults.all, official = classifiedResults.official, firebase = classifiedResults.firebase, stateManagement = classifiedResults.stateManagement;
    var totalPackages = all.length;
    // Official packages
    console.log("Google own a total of " + official.length + "/" + totalPackages + " top packages");
    console.table(official);
    printDivider();
    // firebase packages
    console.log("Firebase Packages");
    console.table(firebase);
    printDivider();
    // State management packages
    console.log("State Management Packages");
    console.table(stateManagement);
    printDivider();
    // general summary
    console.log("Top " + totalPackages + " Flutter Packages");
    console.table(all);
}
exports.printResults = printResults;
function printDivider() {
    console.log('\n');
}
exports.printDivider = printDivider;
