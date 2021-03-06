"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATE_MANAGE_LIST = exports.OFFICIAL_ACCOUNTS = exports.GOOGLE_ACCOUNT = exports.FLUTTER_ACCOUNT = exports.FIREBASE_ACCOUNT = exports.PLATFORM_WINDOWS = exports.PLATFORM_WEB = exports.PLATFORM_MACOS = exports.PLATFORM_LINUX = exports.PLATFORM_IOS = exports.PLATFORM_ANDROID = exports.BADGE_NULL_SAFE = exports.BADGE_FLUTTER_FAV = exports.metadataSelector = exports.badgeSubSelector = exports.badgeSelector = exports.popularitySelector = exports.healthSelector = exports.likesSelector = exports.titleSelector = exports.packageItemSelector = exports.pubDevUrl = void 0;
exports.pubDevUrl = 'https://pub.dev/packages';
exports.packageItemSelector = '.packages-item';
exports.titleSelector = 'h3.packages-title > a';
exports.likesSelector = '.packages-score-like .packages-score-value-number';
exports.healthSelector = '.packages-score-health .packages-score-value-number';
exports.popularitySelector = '.packages-score-popularity .packages-score-value-number';
exports.badgeSelector = '.package-badge';
exports.badgeSubSelector = '.tag-badge-sub';
exports.metadataSelector = '.packages-metadata-block';
exports.BADGE_FLUTTER_FAV = 'flutter favorite';
exports.BADGE_NULL_SAFE = 'null safety';
exports.PLATFORM_ANDROID = 'android';
exports.PLATFORM_IOS = 'ios';
exports.PLATFORM_LINUX = 'linux';
exports.PLATFORM_MACOS = 'macos';
exports.PLATFORM_WEB = 'web';
exports.PLATFORM_WINDOWS = 'windows';
exports.FIREBASE_ACCOUNT = 'firebase.google.com';
exports.FLUTTER_ACCOUNT = 'flutter.dev';
exports.GOOGLE_ACCOUNT = 'google.dev';
exports.OFFICIAL_ACCOUNTS = [exports.GOOGLE_ACCOUNT, exports.FLUTTER_ACCOUNT];
exports.STATE_MANAGE_LIST = ['get', 'provider', 'bloc', 'riverpod', 'mobx', 'flutter_redux', 'rxdart'];
