module.exports = {
    "roots": ["<rootDir>/src", "<rootDir>/test"],
    "testMatch": [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "moduleFileExtensions": [
        "ts",
        "js",
    ],
};