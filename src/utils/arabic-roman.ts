/**
* Converts roman numerals to arabic numerals and arabic numerals to roman numerals.
* @author Daniel Wachsstock
* @internal Modified by khornberg
* @license MIT
* @link from http://bililite.com/blog/2009/03/09/roman-numerals-in-javascript/ Daniel's orginal post
*
*/
var romanNumerals = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
];


export const arabic2roman = (n: number | undefined, increment?: number): string => {
    if (n === undefined) {
        return "";
    }
    n = n + (increment || 0);
    var r = '';
    for (var i = 0; i < romanNumerals.length; ++i) {
        for (var x = romanNumerals[i]; n >= x[0]; n -= x[0] as number) {
            r += x[1];
        }
    }
    return r;
};
