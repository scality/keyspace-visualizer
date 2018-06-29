function sortKeys(obj) { // {{{
    return obj.sort(function(a, b) {
        return d3.ascending(a.key, b.key);
    });
} // }}}

/**
 * extract the hostname from the node names
 */
function getShortName(name) { // {{{
    var aa = name.indexOf("-");
    var ab = name.lastIndexOf("-");
    // short name is beteen first and last dashes
    var shortname = name.substring(aa + 1, ab)

    // replace dots and semicolons
    shortname.replace(/\./g, '_');
    shortname.replace(/:/g, "-");

    return shortname;
} // }}}

function computeRange(data) { // {{{
    //hexa limit, 12 first chars, no need BigInt
    var ringSizeLimit   = parseInt("0x" + "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF".substr(0,12)),
        n = data.length,
        keySizeA,
        keySizeB,
        keySize;
    var x = -1; while(++x < n) {
        if(x == 0) {
            // First element, we need to calcul the range from the last element in the array
            keySizeA = data[x].key;
            keySizeB = ringSizeLimit - data[n-1].key;
            keySize = keySizeA + keySizeB;
        } else if(x == n) {
            // Last element, same range as the first element
            keySize = data[0].keysize
        } else {
            // need to compare with the previous element
            keySize = data[x].key - data[x - 1].key;
        }
        percent = (keySize / ringSizeLimit)
        data[x].keysize = keySize;
        data[x].perc = percent;
    }
    return data;
} // }}}

/**
 * return a padded hexadecimal string {{{
 */
function hexPadded(num, len) {
    str = num.toString(16);
    return "0".repeat(len - str.length) + str;
} // }}}

/**
 * ringsh.txt file as input {{{
 * sort by key
 * return the result
 * +
 * define a color per server
 * compute the percent usage per server
 * write the legend with these informations
 */
function formatInput(dataraw) {
    data = convertRingsh(dataraw)

    /**
     * First: Need to sort by key
     */
    var ringkeysSorted = sortKeys(data);
    
    /**
     * Second: Calculate the range between each slices
     * Calculate the percent usage
     * push infos in the dict
     */
    computeRange(ringkeysSorted);
    
    /**
     * Select one color per server + set the label for tooltips {{{
     */
    var hostColor = {};
    
    ringkeysSorted.forEach(function(data) {
        // add the shortname in the array
        data.host = getShortName(data.server)

        if(!(data.host in hostColor)) {
            var sz = Object.keys(hostColor).length
            hostColor[data.host] = colorsAvailable[sz];
        }
        //key = hexPadded(data.key, 40);
        data.colour = hostColor[data.host];
        data.label = data.server + "<br/>" + data.nativekey + "<br/>" + data.colour;
    });
    // }}}
    
    /**
     * accumulate the range of keys per server {{{
     * use the hostColor dict to filter per host
     */
    var servstats = []
    var servlist = Object.keys(hostColor);
    
    servlist.forEach(function(data) {
        var a = ringkeysSorted.filter(({host}) => host == data);
        var b = a.reduce((sum, value) => sum + value.keysize, 0);
        var c = a.reduce((sum, value) => sum + value.perc, 0);
        var d = hostColor[data];
        servstats.push({hostname: data, keysizes: b, percs: c, color: d});
    }); // }}}
    
    // Need to move writeLegend to a better place
    writeLegend(servstats);
    return ringkeysSorted;
}; // }}}
