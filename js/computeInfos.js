/**
 * extract the hostname from the node names
 */
function getShortName(name) { // {{{
    var aa = name.indexOf("-");
    var ab = name.lastIndexOf("-");
    // short name is beteen first and last dashes
    var shortname = name.substring(aa + 1, ab)

    // replace dots and semicolons
    shortname = shortname.replace(/\./g, '_');
    shortname = shortname.replace(/:/g, "-");

    return shortname;
} // }}}

function computeRange(data) { // {{{
    var ringSizeLimit = parseInt("0x" + "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
        n = data.length,
        keySizeA,
        keySizeB,
        keySize;

    var x = -1; while(++x < n) {
        if(x == 0) {
            // First element, we need to calcul the range from the last element in the array
            var keySizeA = data[x].key;
            var keySizeB = ringSizeLimit - data[n-1].key;
            var keySize = keySizeA + keySizeB;
        } else if(x == n) {
            // Last element, same range as the first element
            var keySize = data[0].keysize
        } else {
            // need to compare with the previous element
            var keySize = data[x].key - data[x - 1].key;
        }
        var percent = (keySize / ringSizeLimit)
        data[x].keysize = keySize;
        data[x].perc = percent;
    }
    //console.table(data)
    return data;
} // }}}

function writeLegend2(data, rawstats) {
    var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    function sortHost(obj) {
        return obj.sort(function(a, b) {
            return collator.compare(a.hostname, b.hostname);
        });
    }
    stats = sortHost(rawstats)


    var divinfo = d3.select("div#infos").html("");
    var table = divinfo.append("table");

    var headers = table
        .attr("class", "minimalistBlack")
        .append('thead')
        .append("tr")
        .style("border-left", "4px solid black")
    headers.append("th").text("Host");
    headers.append("th").text("Perc. Total");
    headers.append("th").attr("id", "members").text("Nodes");


    var colnumbers = 1;
    var rows = table.append('tbody');
    stats.forEach(function(d) {
        var myrow = rows
            .append("tr")
            .style("border-left", "4px solid " + d.color)

        myrow
            .append("td")
            .style("border-top", "4px solid " + d.color)
            .text(d.hostname)

        myrow
            .append("td").text(d3.format(".2%")(d.percs))
            .style("border-top", "4px solid " + d.color)

        var cntemp = 0;
        data.forEach(function(e) {
            if(e.host == d.hostname) {
                if(++cntemp > colnumbers) { ++colnumbers; }
                myrow.append("td")
                    .style("border-top", "4px solid " + d.color)
                    .text(d3.format(".2%")(e.perc))
            }
        })

    })
    d3.select("th#members").attr("colspan", colnumbers);
}