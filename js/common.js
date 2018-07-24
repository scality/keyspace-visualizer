/**
 * 
 * @param {*} degree 
 */
function degreeToCosinus(degree) {
    return Math.cos( degree * Math.PI / 180);
}

/**
 * 
 * @param {*} degree 
 */
function degreeToSinus(degree) {
    return Math.sin( degree * Math.PI / 180);
}

/**
 * 
 * @param {*} degree 
 */
function degreeToRadian(degree) {
    return degree * Math.PI / 180
}

/**
 * @param {*} arrayOfKeys
 * Return the arrayOfKeys array sorted by obj.key
 */
function sortByKeys(arrayOfKeys) { // {{{
    return arrayOfKeys.sort(function(a, b) {
        return d3.ascending(a.key, b.key);
    });
} // }}}
