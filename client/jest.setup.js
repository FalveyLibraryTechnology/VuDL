import "@testing-library/jest-dom/extend-expect";

// Mock fetch globally for jsdom environment
global.fetch = jest.fn();

// Reset fetch mock before each test
beforeEach(() => {
    global.fetch.mockClear();
    global.fetch.mockRejectedValue(new Error("fetch not mocked in this test"));
});
