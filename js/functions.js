/**
 * 
 * @param {*} degree 
 * 
 * @return a cosinus
 */
function degreeToCosinus(degree) {
    return Math.cos( degree * Math.PI / 180);
}

/**
 * 
 * @param {*} degree 
 * 
 * @return a sinus
 */
function degreeToSinus(degree) {
    return Math.sin( degree * Math.PI / 180);
}

/**
 * 
 * @param {*} degree 
 * 
 * @return a radian
 */
function degreeToRadian(degree) {
    return degree * Math.PI / 180
}

/**
 * @param {*} arrayOfKeys
 * 
 * @return the arrayOfKeys array sorted by object.key
 */
function sortByKeys(arrayOfKeys) {
    return arrayOfKeys.sort(function(a, b) {
        return d3.ascending(a.key, b.key);
    });
} 

/**
 * @param {*} data 
 * Convert ringsh.txt input to valuable data
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
};

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

    // needs to be sorted to generate clean small arcs
    return angles.sort(function(a, b) {
        return d3.ascending(a.angle, b.angle);
    });
};

/**
 * Takes ringsh.txt file as input
 * @param {*} ringData
 * 
 * @return computedSortedArrayOfKeys
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

/**
 * @param {*} nodeName
 * 
 * @return serverAddress
 * 
 * nodeName can be:
 * an IP address
 * a nodename in the format: RING-server-name-fqdn-nodenumber
 */
function getShortName(nodeName) {
    var aa = nodeName.indexOf("-");
    var ab = nodeName.lastIndexOf("-");
    var serverAddress = nodeName.substring(aa + 1, ab)

    return serverAddress
        .replace(/\./g, '_') // replace Dots with Underscore
        .replace(/:/g, "-"); // replace Semicolons with Dash
};

/**
 * @param {*} data 
 * 
 * @return data
 *  populated with range sizes and percents
 * 
 */
function computeRange(data) {
    var ringSizeLimit = parseInt("0x" + "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
        n = data.length,
        keySize,
        percent;

    var x = -1; while(++x < n) {
        if(x == 0) { // First element, we need to calcul the range from the last element in the array
            keySize = ringSizeLimit - data[n-1].key + data[x].key;
        } else if(x == n-1) { // Last element, same range as the first element
            keySize = data[0].keysize
        } else { // need to compare with the previous element
            keySize = data[x].key - data[x - 1].key;
        }
        percent = (keySize / ringSizeLimit)
        data[x].keysize = keySize;
        data[x].perc = percent;
    }
    return data;
};

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