import { calculateOrderTotal } from '../../server/utils/helpers';

describe('calculateOrderTotal', () => {
    it('should calculate the total correctly for multiple items', () => {
        const items = [
            { price: 10, qty: 2 }, // 20
            { price: 5, qty: 1 },  // 5
        ];
        expect(calculateOrderTotal(items)).toBe(25);
    });

    it('should return 0 for empty items', () => {
        expect(calculateOrderTotal([])).toBe(0);
    });

    it('should handle floating point numbers correctly', () => {
        const items = [
            { price: 10.50, qty: 2 }, // 21.00
        ];
        expect(calculateOrderTotal(items)).toBe(21.00);
    });
});
