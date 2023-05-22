import { http_statuses, randomSixDigit, generateToken } from './common.helper';

describe('Common Helper', () => {
  it('should return descriptive HTTP status code', () => {
    const data = [
      { code: '400', description: 'Bad Request' },
      { code: '401', description: 'Unauthorized' },
      { code: '403', description: 'Forbidden' },
      { code: '404', description: 'Not Found' },
      { code: '500', description: 'Internal Server Error' },
    ];
    const result = http_statuses(data);
    expect(result).toEqual({
      description: 'Error codes: 400 , 401 , 403 , 404 , 500 , ',
    });
  });
  it('should return random six digit number', () => {
    const result = randomSixDigit();
    expect(result).toHaveLength(6);
  });
  it('should return random hex string', () => {
    const result = generateToken();
    expect(result).toHaveLength(32);
  });
});
