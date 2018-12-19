/**
 *
 * @param {*} degree
 *
 * @return a cosinus
 */
function degreeToCosinus(degree) {
   return Math.cos(degree * Math.PI / 180);
}

/**
 *
 * @param {*} degree
 *
 * @return a sinus
 */
function degreeToSinus(degree) {
   return Math.sin(degree * Math.PI / 180);
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
   return arrayOfKeys.sort(function (ak, bk) {
      a = new BigNumber(ak.nativekey, 16);
      b = new BigNumber(bk.nativekey, 16)
      return a.isLessThan(b) ? -1 : a.isGreaterThan(b) ? 1 : a.isGreaterThanOrEqualTo(b) ? 0 : NaN;
   });
}

/**
 * @param {*} ringsh
 *
 * @return data
 *
 * Convert ringsh.txt input to json
 *
 * create a unique ID (host), dash separated, with:
 * the RING name
 * the element (rack, server, diskgroup, IP)
 * the chord port
 */
function convertRingsh(ringsh) {
   var data = []
   var lines = ringsh.split('\n');
   var x = -1; while (++x < lines.length) {
      var fields = lines[x].split(" ");

      // first field of ringsh.txt is "supervisor", ignore the rest (empty lines, etc..)
      if (fields[0] == "supervisor") {
         try {
            // TODO: add more checks
            if (fields.length != 6)
               throw "Invalid ringsh format, I need 6 fields, space separated";
         }
         catch (err) {
            alert(err);
         }
         var host = fields[2] + "-" + fields[3] + "-" + fields[4];

         var key = parseInt("0x" + fields[5]);
         data.push({ server: host, key: key, nativekey: fields[5] })
      }
   }
   return data;
};

/**
 * @param {*} data
 *
 * @return array of angles
 *
 * data is a json object, in the form of:
 * { "schema": 6, "part": [0, 2, 4] }
 *
 */
function partsToAngles(data) {
   var angles = [],
      n = data.part.length,
      slice_size = 360 / data.schema;

   var x = -1; while (++x < data.schema) {
      var y = -1; while (++y < n) {
         if (x == data.part[y]) {
            angles.push({
               "angle": (slice_size * x),
               "schema": data.schema,
               "nbpart": n // need nbpart to handle a dynamic change in d3js
            });
            break;
         }
      }
   }

   if (n == 1) {
      angles[0].startAngle = 0;
      angles[0].endAngle = 360;
   } else {
      x = -1; while (++x < n) {
         if (x == 0) {
            angles[x].startAngle = angles[n - 1].angle;
            angles[x].endAngle = 360;
         } else {
            angles[x].startAngle = angles[x - 1].angle;
            angles[x].endAngle = angles[x].angle;
         }
      }
   }

   // needs to be sorted by angle to generate clean small arcs
   return angles.sort(function (a, b) {
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
 * 6. use the computed datas to write the legend table
 *
 */
function formatInput(ringData) {
   var numberOfColors = colorsAvailable.length;
   // 1. convert ringData to a manipulable format
   data = convertRingsh(ringData)

   // 2. sort the datas by key
   var ringkeysSorted = sortByKeys(data);

   // 3. calculate the range between each keys (size & %)
   computeRange(ringkeysSorted);

   // 4. pick up a color per server
   var hostColor = {};
   ringkeysSorted.forEach(function (data) {
      // add the shortname in the array
      data.host = getShortName(data.server)

      if (!(data.host in hostColor)) {
         var sz = Object.keys(hostColor).length
         if (sz > numberOfColors) {
            hostColor[data.host] = "white";
         } else {
            hostColor[data.host] = colorsAvailable[sz];
         }
      }
      //key = hexPadded(data.key, 40);
      data.colour = hostColor[data.host];
      data.label = data.server + "<br/>" + data.nativekey + "<br/>" + data.colour;
   });

   // 5. compute the space used per server
   // use the previous hostColor dict to filter per host
   var servstats = []
   var servlist = Object.keys(hostColor);
   servlist.forEach(function (data) {
      var a = ringkeysSorted.filter(({ host }) => host == data);
      var b = a.reduce((sum, value) => sum + value.keysize, 0);
      var c = a.reduce((sum, value) => sum.plus(value.perc), new BigNumber(0));
      var d = hostColor[data];
      servstats.push({ hostname: data, keysizes: b, percs: c, color: d });
   });

   // 6. use the computed datas to write the legend table
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
   var ringSizeLimit = new BigNumber("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", 16);
   var n = data.length;
   var cur, prv, lst;

   var x = -1; while (++x < n) {
      if (x == 0) { // First element, we need to calcul the range from the last element in the array
         cur = new BigNumber(data[x].nativekey, 16);
         lst = new BigNumber(data[n - 1].nativekey, 16);
         data[x].keysize = ringSizeLimit.minus(lst).plus(cur);
      } else { // need to compare with the previous element
         cur = new BigNumber(data[x].nativekey, 16);
         prv = new BigNumber(data[x - 1].nativekey, 16);
         data[x].keysize = cur.minus(prv);
      }
      data[x].perc = data[x].keysize.dividedBy(ringSizeLimit).toNumber();
   }
   return data;
};

/**
 * @param {*} data
 * @param {*} rawstats
 *
 * Write a table of legend in div#infos
 */
function writeLegend2(data, rawstats) {
   // collator used to sort alphanumerically
   var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
   function sortHost(obj) {
      return obj.sort(function (a, b) {
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
   stats.forEach(function (d) {
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
      data.forEach(function (e) {
         if (e.host == d.hostname) {
            if (++cntemp > colnumbers) { ++colnumbers; }
            myrow.append("td")
               .style("border-top", "4px solid " + d.color)
               .text(d3.format(".2%")(e.perc.toPrecision(5).toString(10)))
         }
      })
   })
   d3.select("th#members").attr("colspan", colnumbers);
}

function LightenDarkenColor(col, amt) {
   var usePound = false;
   if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
   }

   var num = parseInt(col, 16);

   var r = (num >> 16) + amt;

   if (r > 255) r = 255;
   else if (r < 0) r = 0;

   var b = ((num >> 8) & 0x00FF) + amt;

   if (b > 255) b = 255;
   else if (b < 0) b = 0;

   var g = (num & 0x0000FF) + amt;

   if (g > 255) g = 255;
   else if (g < 0) g = 0;

   return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}