/**
 * @param {*} data 
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

/**
 * 
 * @param {*} data 
 * take a computed key nodes array to display an informative table
 */
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
            return " | Ring space: " + d3.format(".3%")(d.percs);
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
function degRad(degree) {
    return degree * Math.PI / 180
}

/**
 * Takes schema and slice numbers
 * Return array of angles
 */
function partsToAngles(data) {
    var angles = [],
        x = -1,
        n = data.part.length,
        slice_size = 360 / data.schema;
    while(++x < data.schema) {
        // Populate angle only with the desired angles
        var y = -1;
        while(++y < n) {
            if( x == data.part[y] ) {
                angles.push( {
                    "angle": (slice_size * x),
                    "radius": radius,
                    "schema": data.schema,
                    "nbpart": n
                });
                break;
            }
        }
    }

    // get the angle sizes
    n = angles.length;
    // if only one angle, take the whole circle
    if(n == 1) {
        angles[0].startAngle = 0;
        angles[0].endAngle = 360;
    } else {
        x = -1 ; while(++x < n) {
            if (x == 0) {
                angles[x].startAngle = angles[n - 1].angle;
                angles[x].endAngle = 360;
            } else {
                angles[x].startAngle = angles[x - 1].angle;
                angles[x].endAngle = angles[x].angle;
            }
        }
    }
    // needs to be sorted to generate small arcs cleanly
    return angles.sort(function(a, b) {
        return d3.ascending(a.angle, b.angle);
    });
};