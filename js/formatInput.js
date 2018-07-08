/**
 * Convert ringsh.txt input to valuable data {{{
 */
function convertRingsh(ringsh) {
    var data = []
    var lines = ringsh.split('\n');
    var x = -1 ; while(++x < lines.length) {
        var fields = lines[x].split(" ");

        if(fields[0] == "supervisor") {
            // Check the format
            if(fields.length != 6) {
                alert("Invalid ringsh format, I need 6 fields, space separated")
            }
            // generate unique hostname
            var host = fields[2] +"-"+ fields[3] +"-"+ fields[4];

            var key = parseInt("0x"+ fields[5]);
            data.push( {server: host, key: key, nativekey: fields[5]} )
        }
    }
    return data;
};/// }}}

function writeLegend(data) { // {{{
    var text = legend.selectAll("div.server")
        .data(data, function(d) { return d.hostname+d.percs;});

    text
        .enter()
        .append("div")
        .attr("class", "server")
        .style("width", 500)
        .style("border-top", function(d) { return "4px solid " + d.color; })
        .style("border-left", function(d) { return "2px solid " + d.color; })
        .append("span")
        .text(function(d) { return d.hostname; })
        .append("span")
        .attr("class", "ringspace")
        .text(function(d) { 
            return " | Ring space: " + d.percs; // d3.format(".2%")(d.percs);
        });

    text.exit()
        .remove();
}; // }}}


function cosDegree(degrees) {
    return Math.cos( degrees * Math.PI / 180);
}
function sinDegree(degrees) {
    return Math.sin( degrees * Math.PI / 180);
}

/**
 * Takes schema and slice numbers
 * Return array of angles
 */
function partsToAngles(data) {
    var angles = [],
        x = -1,
        n = data.part.length;
    while(++x < data.schema) {
        // Populate angle only with the desired angles
        var y = -1;
        while(++y < n) {
            if( x == data.part[y] ) {
                angles.push( { "angle": (360 / data.schema * x) } );
                break;
            }
        }
    }
    return angles;
};