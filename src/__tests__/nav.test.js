import moment from 'moment';
import { nextOkay, prevOkay } from '../js/nav';

describe("nextOkay()", () => {
    it("should return true when called with today's date", () => {
        expect(nextOkay(moment().format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return true when called with yesterday's date", () => {
        expect(nextOkay(moment().subtract(1, 'd').format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return true when called with date from 7 days ago", () => {
        expect(nextOkay(moment().subtract(7, 'd').format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return false when called with tomorrow's date", () => {
        expect(nextOkay(moment().add(1, 'd').format('YYYY-MM-DD'))).toBe(false);
    });
    it("should return false when called with date 7 days from now", () => {
        expect(nextOkay(moment().add(7, 'd').format('YYYY-MM-DD'))).toBe(false);
    });
});

describe("prevOkay()", () => {
    it("should return true when called with today's date", () => {
        expect(prevOkay(moment().format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return true when called with yesterday's date", () => {
        expect(prevOkay(moment().subtract(1, 'd').format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return true when called with date from 7 days ago", () => {
        expect(prevOkay(moment().subtract(7, 'd').format('YYYY-MM-DD'))).toBe(true);
    });
    it("should return false when called with tomorrow's date", () => {
        expect(prevOkay(moment().add(1, 'd').format('YYYY-MM-DD'))).toBe(false);
    });
    it("should return false when called with date 7 days from now", () => {
        expect(prevOkay(moment().add(7, 'd').format('YYYY-MM-DD'))).toBe(false);
    });
    it("should return true when called with the APOD start date", () => {
        expect(prevOkay(moment('1996-06-16', 'YYYY-MM-DD'))).toBe(true);
    });
    it("should return false when called with the day after the APOD start date", () => {
        expect(prevOkay(moment('1996-06-15', 'YYYY-MM-DD'))).toBe(false);
    });
});