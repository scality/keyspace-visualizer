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

/**
 * Takes ringsh.txt file as input
 * @param {*} ringData
 * 
 * 1. convert ringData to a manipulable format
 * 2. sort the datas by key
 * 3. calculate the range between each keys (size & %)
 * 4. pick up a color per server
 * 5. compute the space used per server
 * 6. use the computed datas to write the legen table
 * 
 */
function formatInput(ringData) {
    // 1.
    data = convertRingsh(ringData)
 
    // 2.
    var ringkeysSorted = sortByKeys(data);
    
    // 3.
    computeRange(ringkeysSorted);
    
    // 4.
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
    
    // 5. use the previous hostColor dict to filter per host
    var servstats = []
    var servlist = Object.keys(hostColor);
    servlist.forEach(function(data) {
        var a = ringkeysSorted.filter(({host}) => host == data);
        var b = a.reduce((sum, value) => sum + value.keysize, 0);
        var c = a.reduce((sum, value) => sum + value.perc, 0);
        var d = hostColor[data];
        servstats.push({hostname: data, keysizes: b, percs: c, color: d});
    });
    
    // 6.
    writeLegend2(ringkeysSorted, servstats)
    return ringkeysSorted;
};