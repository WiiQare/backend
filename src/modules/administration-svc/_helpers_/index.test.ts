import { getCountryNameFromCode } from '.';

it('should return country name from country code', () => {
  expect(getCountryNameFromCode('IN')).toBe('India');
});
