const {formatDate} = require('utils/misc')

test('formatDate formats the date to look nice', () => {
  const date = new Date('5/19/22')
  const formatted = formatDate(date)
  expect(formatted).toBe('May 22')
})
