export const isNumberNaN = (num) => Number(num).toString() === 'NaN';
export const timestamp = (date) => Math.round(new Date(date).getTime() / 1000);
export const isDateValid = (date) => new Date(date).toString() !== 'Invalid Date';
export const timeToString = (date) => JSON.stringify(new Date(date)).replace(/"/g, '');
