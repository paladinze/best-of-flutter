"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var cheerio = require("cheerio");
var pubDevUrl = 'https://pub.dev/flutter/packages';
var packageItemSelector = '.packages-item';
var titleSelector = 'h3.packages-title > a';
var likesSelector = '.packages-score-like .packages-score-value-number';
var healthSelector = '.packages-score-health .packages-score-value-number';
var popularitySelector = '.packages-score-popularity .packages-score-value-number';
var badgeSelector = '.package-badge';
var metadataSelector = '.packages-metadata-block';
var BADGE_FLUTTER_FAV = 'flutter favorite';
var BADGE_NULL_SAFE = 'null safety';
var GOOGLE_ID = 'flutter.dev';
function fetchHtmlFromUrl(url, page) {
    if (page === void 0) { page = 1; }
    return axios_1.default
        .get(url, {
        params: {
            page: page,
            sort: 'like',
        }
    })
        .then(function (response) { return cheerio.load(response.data); });
}
function getPackageData($, packageEl) {
    var packageItem = $(packageEl);
    var name = packageItem.find(titleSelector).text();
    // main stats
    var likes = parseInt(packageItem.find(likesSelector).text());
    var health = parseInt(packageItem.find(healthSelector).text());
    var popularity = parseInt(packageItem.find(popularitySelector).text());
    var badges = packageItem.find(badgeSelector).map(function (index, el) {
        return $(el).text().trim().toLowerCase();
    }).get();
    // badges
    var isNullSafe = badges.includes(BADGE_NULL_SAFE);
    var isFlutterFav = badges.includes(BADGE_FLUTTER_FAV);
    // developer
    var _a = packageItem.find(metadataSelector).map(function (index, el) {
        return $(el).find('a').text().trim();
    }).get(), version = _a[0], developer = _a[1];
    return { name: name, likes: likes, health: health, popularity: popularity, isNullSafe: isNullSafe, isFlutterFav: isFlutterFav, version: version, developer: developer };
}
function getPageData(pageNum) {
    return __awaiter(this, void 0, void 0, function () {
        var $, packages, pageData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchHtmlFromUrl(pubDevUrl, pageNum)];
                case 1:
                    $ = _a.sent();
                    packages = $(packageItemSelector);
                    pageData = [];
                    packages.each(function (index, el) {
                        pageData.push(getPackageData($, el));
                    }).get();
                    return [2 /*return*/, pageData];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var totalPages, pageSize, totalPackages, allResults, i, pageData, officialPackages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('starts fetching pub dev stats...');
                    totalPages = 10;
                    pageSize = 10;
                    totalPackages = totalPages * pageSize;
                    allResults = [];
                    i = 1;
                    _a.label = 1;
                case 1:
                    if (!(i <= totalPages)) return [3 /*break*/, 4];
                    console.log("Fetching " + pageSize * i + "/" + totalPackages);
                    return [4 /*yield*/, getPageData(i)];
                case 2:
                    pageData = _a.sent();
                    allResults = __spreadArray(__spreadArray([], allResults), pageData);
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.table(allResults);
                    officialPackages = allResults.filter(function (result) { return result.developer === GOOGLE_ID; });
                    console.log("A total of " + officialPackages.length + "/" + totalPackages + " top packages come from Google");
                    console.table(officialPackages);
                    return [2 /*return*/];
            }
        });
    });
}
main();
