const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("Express Error Handler Tests (BUG-05 verification)", () => {
    function createMockRes() {
        const res = {
            statusCode: 200,
            body: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                this.body = data;
                return this;
            }
        };
        return res;
    }

    // Extracted middleware logic matching server.js
    function errorHandler(err, req, res, next) {
        const status = err.status || err.statusCode || (
            err.name === 'UnauthorizedError' ||
            (err.message && (err.message.includes('unauthenticated') || err.message.includes('Unauthorized')))
                ? 401
                : 500
        );
        const message = err.message || (status === 401 ? 'Unauthenticated or invalid token' : 'Internal Server Error');
        res.status(status).json({ success: false, error: message });
    }

    test("returns 500 for generic unhandled server exceptions, NOT 401", () => {
        const res = createMockRes();
        const err = new Error("Database connection lost");
        errorHandler(err, {}, res, () => {});

        assert.strictEqual(res.statusCode, 500, "Generic internal error must return status 500");
        assert.strictEqual(res.body.error, "Database connection lost");
        assert.strictEqual(res.body.success, false);
    });

    test("returns 401 when the error is genuinely an unauthorized authentication error", () => {
        const res = createMockRes();
        const err = new Error("Unauthenticated user session");
        err.status = 401;
        errorHandler(err, {}, res, () => {});

        assert.strictEqual(res.statusCode, 401, "Auth error must return status 401");
        assert.strictEqual(res.body.error, "Unauthenticated user session");
    });

    test("preserves custom status codes like 400 Bad Request or 404 Not Found", () => {
        const res = createMockRes();
        const err = new Error("Invalid graph format");
        err.status = 400;
        errorHandler(err, {}, res, () => {});

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "Invalid graph format");
    });
});
