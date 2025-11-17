import { convertToDateTimeStringForApp, convertToDateTimeStringForDB } from "../dbUtils";

describe("dataUtils", () => {
    describe("convertToDateTimeStringForDB", () => {
        it.each([
            [null, null],
            ["2023-01-02T03:04:05Z", "2023-01-02 03:04:05"],
            [new Date("2023-01-02T03:04:05Z"), "2023-01-02 03:04:05"]
        ])
            ("should convert %s to %s", (input, expected) => {
            expect(convertToDateTimeStringForDB(input)).toBe(expected);
        });
    });

    describe("convertToDateTimeStringForApp", () => {
        it.each([
            [null, null],
            ["2023-01-02 03:04:05", "2023-01-02T03:04:05.000Z"],
            ["2023-01-02T03:04:05Z", "2023-01-02T03:04:05.000Z"],
            [new Date("2023-01-02T03:04:05Z"), "2023-01-02T03:04:05.000Z"]
        ])
            ("should convert %s to %s", (input, expected) => {
            expect(convertToDateTimeStringForApp(input)).toBe(expected);
        });
    });
});