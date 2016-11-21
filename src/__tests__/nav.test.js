import moment from 'moment';
import { nextOkay } from '../js/nav';

test("nextOkay(TODAY'S-DATE) should return true", () => {
    expect(nextOkay(moment().format('YYYY-MM-DD'))).toBe(true);
});