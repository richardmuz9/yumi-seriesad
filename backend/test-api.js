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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var dotenv = require("dotenv");
dotenv.config();
var API_URL = process.env.API_URL || 'http://localhost:3001';
var authToken;
function testEndpoint(method, endpoint, data) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    headers = authToken ? { Authorization: "Bearer ".concat(authToken) } : {};
                    return [4 /*yield*/, (0, axios_1.default)({
                            method: method,
                            url: "".concat(API_URL).concat(endpoint),
                            data: data,
                            headers: headers
                        })];
                case 1:
                    response = _b.sent();
                    console.log("\u2705 ".concat(method.toUpperCase(), " ").concat(endpoint, " succeeded:"), response.data);
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _b.sent();
                    console.error("\u274C ".concat(method.toUpperCase(), " ").concat(endpoint, " failed:"), ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var authData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting API tests...\n');
                    // Test health endpoint
                    return [4 /*yield*/, testEndpoint('get', '/api/health')
                        // Test auth endpoints
                    ];
                case 1:
                    // Test health endpoint
                    _a.sent();
                    // Test auth endpoints
                    console.log('\n📝 Testing auth endpoints...');
                    return [4 /*yield*/, testEndpoint('post', '/api/auth/login', {
                            email: 'test@example.com',
                            password: 'testpass123'
                        })];
                case 2:
                    authData = _a.sent();
                    if (authData === null || authData === void 0 ? void 0 : authData.token) {
                        authToken = authData.token;
                        console.log('✅ Got auth token:', authToken);
                    }
                    else {
                        console.error('❌ Failed to get auth token');
                        return [2 /*return*/];
                    }
                    // Test writing helper endpoints
                    console.log('\n📝 Testing writing helper endpoints...');
                    return [4 /*yield*/, testEndpoint('post', '/api/writing-helper/generate', {
                            contentType: 'social-media',
                            platform: 'twitter',
                            topic: 'AI and creativity',
                            keyPoints: ['AI enhances creativity', 'Human input still essential'],
                            generateVariations: true,
                            variationCount: 2
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('post', '/api/writing-helper/analyze', {
                            content: 'This is a test post about AI and creativity. #AI #Tech',
                            platform: 'twitter'
                        })
                        // Test anime character helper endpoints
                    ];
                case 4:
                    _a.sent();
                    // Test anime character helper endpoints
                    console.log('\n🎨 Testing anime character helper endpoints...');
                    return [4 /*yield*/, testEndpoint('post', '/api/anime-chara/start-session', {
                            style: 'anime',
                            theme: 'fantasy'
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('post', '/api/anime-chara/generate-outline', {
                            character: {
                                name: 'Sakura',
                                type: 'protagonist',
                                personality: 'cheerful',
                                features: ['pink hair', 'green eyes']
                            }
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('get', '/api/anime-chara/marketplace/styles')
                        // Test billing endpoints
                    ];
                case 7:
                    _a.sent();
                    // Test billing endpoints
                    console.log('\n💰 Testing billing endpoints...');
                    return [4 /*yield*/, testEndpoint('post', '/api/billing/create-checkout-session', {
                            packageId: 'basic',
                            successUrl: 'http://localhost:3000/success',
                            cancelUrl: 'http://localhost:3000/cancel'
                        })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('get', '/api/billing/packages')];
                case 9:
                    _a.sent();
                    console.log('\n✨ All tests completed!');
                    return [2 /*return*/];
            }
        });
    });
}
runTests().catch(console.error);
