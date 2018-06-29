/**
 * UnitCircle Visualization
 * (c) 2014 Derrick Cohodas
 */
function UnitCircle() {

    var main = d3.select('svg#ringa')
        .select("g");
    var width = 1000
      , height = 500
      , radius = 200
      , angleAliases = {}
      , labelType = 0

    $('input[name=labelType]:radio').on("change", function() {
        labelType = $(this).val()
        stdAngles()
        $(".angleSweep").remove()
        //drawAngleSweep(lastAngle)
    })

    //Lookup table
    angleAliases[parseFloat(0).toFixed(2)] = ["0 or 2π", "0° or 360°", "0", "1"] //Radians, degrees, sin, cos

    angleAliases[parseFloat(Math.PI/6).toFixed(2)] = ["π/6", "30°", "1/2", "√3/2"]
    angleAliases[parseFloat(Math.PI/4).toFixed(2)] = ["π/4", "45°", "1/√2", "1/√2"]
    angleAliases[parseFloat(Math.PI/3).toFixed(2)] = ["π/3", "60°", "√3/2", "1/2"]

    angleAliases[parseFloat(Math.PI/2).toFixed(2)] = ["π/2", "90°", "1", "0"]

    angleAliases[parseFloat(2*(Math.PI/3)).toFixed(2)] = ["2π/3", "120°", "√3/2", "-1/2"]
    angleAliases[parseFloat(3*(Math.PI/4)).toFixed(2)] = ["3π/4", "135°", "1/√2", "-1/√2"]
    angleAliases[parseFloat(5*(Math.PI/6)).toFixed(2)] = ["5π/6", "150°", "1/2", "-√3/2"]

    angleAliases[parseFloat(Math.PI).toFixed(2)] = ["π", "180°", "0", "1"]

    angleAliases[parseFloat(7*(Math.PI/6)).toFixed(2)] = ["7π/6", "210°", "-1/2", "-√3/2"]
    angleAliases[parseFloat(5*(Math.PI/4)).toFixed(2)] = ["5π/4", "225°", "-1/√2", "-1/√2"]
    angleAliases[parseFloat(4*(Math.PI/3)).toFixed(2)] = ["4π/3", "240°", "-√3/2", "-1/2"]

    angleAliases[parseFloat(3*(Math.PI/2)).toFixed(2)] = ["3π/2", "270°", "-1", "0"]

    angleAliases[parseFloat(5*(Math.PI/3)).toFixed(2)] = ["5π/3", "300°", "-√3/2", "1/2"]
    angleAliases[parseFloat(7*(Math.PI/4)).toFixed(2)] = ["7π/4", "315°", "-1/√2", "1/√2"]
    angleAliases[parseFloat(11*(Math.PI/6)).toFixed(2)] = ["11π/6", "330°", "-1/2", "√3/2"]

    //Main group
    var svg = main
      .insert("g")
      .attr("class", "circle")
      .attr("transform", "scale(1, -1)")
      .on("mousedown", function() {
         //console.log(d3.mouse(this))
      })
      //.attr("transform", "rotate(180deg)")

    //Axes and arrows
    var axisColor = "rgba(100,100,100,1)"
    svg.append("line")
       .attr("class", "y")
       .attr("y1", -(radius+30))
       .attr("y2", (radius+30))
       .style("fill", "none")
       .style("stroke", axisColor)
       .style("stroke-width", "2px")
    svg.append("line")
       .attr("class", "x")
       .attr("x1", -(radius+30))
       .attr("x2", (radius+30))
       .style("fill", "none")
       .style("stroke", axisColor)
       .style("stroke-width", "2px")
    svg.append("polygon")
       .attr("class", "ynArrow")
       .attr("points", "0,"+(radius+40)+" 5,"+(radius+30)+" -5,"+(radius+30))
       .style("fill", axisColor)
    svg.append("polygon")
       .attr("class", "ypArrow")
       .attr("points", "0,"+ -(radius+40)+" 5,"+ -(radius+30)+" -5,"+ -(radius+30))
       .style("fill", axisColor)
    svg.append("polygon")
       .attr("class", "xnArrow")
       .attr("points", -(radius+40)+",0 "+-(radius+30)+",5 "+-(radius+30)+",-5")
       .style("fill", axisColor)
    svg.append("polygon")
       .attr("class", "xpArrow")
       .attr("points",  (radius+40)+",0 "+(radius+30)+",5 "+(radius+30)+",-5")
       .style("fill", axisColor)
    //Center
    svg.append("circle")
      .attr("class", "center")
      .attr("r", "5px")
      .style("fill", "rgba(40, 40, 40, 1.0)")


    //Circle
    svg.append("circle")
      .attr("class", "uc")
      .attr("r", radius)
      .style("fill", "rgba(0,0,0,0)")
      .style("stroke", "rgba(40, 40, 40, 1)")
      .style("stroke-width", "4px")


    function drawAngleMark(angle) {
        var length = 30
          , width = 2
          , color = "rgba(40,40,40,1)"
          , cos = Math.cos(angle)
          , sin = Math.sin(angle)
          , coords = { inner: { x: (radius-(length/2))*cos
                              , y: (radius-(length/2))*sin }
                     , outer: { x: (radius+(length/2))*cos
                              , y: (radius+(length/2))*sin }
                     , text: { x: (radius+(2*length))*cos - length/2
                              , y: (radius+(2*length))*sin - length/4}
                     , center: { x: radius*cos
                               , y: radius*sin }
          }

        //Line mark
        svg.append("line")
           .attr("class", "angleMark")
           .attr("x1", coords.inner.x)
           .attr("y1", coords.inner.y)
           .attr("x2", coords.outer.x)
           .attr("y2", coords.outer.y)
           .style("fill", "none")
           .style("stroke", color)
           .style("stroke-width", "3.5px")

        /*
        //Circle
        svg.append("circle")
           .attr("class", "angleMark")
           .attr("cx", coords.center.x)
           .attr("cy", coords.center.y)
           .attr("r", 15)
           .style("fill", "rgba(0,0,0,0)")
           .style("stroke", "none")
        */

        //Text
        svg.append("text")
           .attr("class", "angleMark")
           .attr("x", coords.text.x)
           .attr("y", coords.text.y)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (coords.text.x-(1)*coords.text.x) +", "+ (coords.text.y-(-1)*coords.text.y) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", color)
           .text(angleAliases[parseFloat(angle).toFixed(2)][labelType])
    }

    var lastAngle = 1.23
    drawAngleSweep(lastAngle)

    function drawAngleSweep(angle) {

        lastAngle = angle

        var length = 30
          , width = 2
          , color = "rgba(40,40,40,1)"
          , cos = Math.cos(angle)
          , sin = Math.sin(angle)
          , coords = {  x: radius*cos
                     , y: radius*sin }
          , textCoords = {  x: (radius+5)*cos
                         , y: (radius+5)*sin }

        angleDisplay = (labelType == 0) ? parseFloat(angle).toFixed(2)+" rad" : parseFloat((180/Math.PI)*angle).toFixed(2) + "°"

        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 230)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (200-(1)*200) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(255,0,0,1)")
           .text("θ = "+angleDisplay)

        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 340)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (340-(1)*340) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(0,0,0,1)")
           .text("(")
        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 350)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (340-(1)*340) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(0,200,0,1)")
           .text(parseFloat(cos).toFixed(2))
        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 388)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (340-(1)*340) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(0,0,0,1)")
           .text(",")
        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 395)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (340-(1)*340) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(0,0,255,1)")
           .text(parseFloat(sin).toFixed(2))
        svg.append("text")
           .attr("class", "angleSweep")
           .attr("x", 435)
           .attr("y", 187)
           //.attr("transform", "rotate(90, "+coords.text.x+", "+coords.text.y+")")
           .attr("transform", "matrix(1, 0, 0, -1, "+ (340-(1)*340) +", "+ (187-(-1)*187) +")")
           .attr("font-family", "'Consolas', monospace, sans-serif")
           .attr("font-size", "12px")
           .attr("fill", "rgba(0,0,0,1)")
           .text(")")

        //Center to circle
        svg.append("line")
           .attr("class", "angleSweep")
           .attr("x1", 0)
           .attr("y1", 0)
           .attr("x2", coords.x)
           .attr("y2", coords.y)
           .style("fill", "none")
           .style("stroke", color)
           .style("stroke-width", "2px")

        //Y component
        svg.append("line")
           .attr("class", "angleSweep")
           .attr("x1", 0)
           .attr("y1", 0)
           .attr("x2", coords.x)
           .attr("y2", 0)
           .style("fill", "none")
           .style("stroke", "rgba(0,255,0,1)")
           .style("stroke-width", "2px")

        //X component
        svg.append("line")
           .attr("class", "angleSweep")
           .attr("x1", coords.x)
           .attr("y1", 0)
           .attr("x2", coords.x)
           .attr("y2", coords.y)
           .style("fill", "none")
           .style("stroke", "rgba(0,0,255,1)")
           .style("stroke-width", "2px")
           .attr("stroke-dasharray", "5, 5")

        //Right Angle Symbol and coordinates
        if(coords.x !== 0 && coords.y !== 0){
            var xSize = (coords.x < 0 ? -Math.floor(radius/18) : Math.floor(radius/18))
              , ySize = (coords.y < 0 ? -Math.floor(radius/18) : Math.floor(radius/18))

            svg.append("polyline")
               .attr("class", "angleSweep")
               .attr("points", (coords.x-xSize)+",0 "+
                               (coords.x-xSize)+","+ySize+" "+
                               (coords.x)+","+(ySize))
               .style("fill", "none")
               .style("stroke", color)
               .style("stroke-width", "2px")


        }
        //Point on circle
        svg.append("circle")
           .attr("class", "angleSweep")
           .attr("cx", coords.x)
           .attr("cy", coords.y)
           .attr("r", 5)
           .style("fill", color)
           .style("stroke", "none")

        /*
        //Angle arc
        var anglePath = d3.svg.arc()
           .outerRadius(21)
           .innerRadius(19)
           .startAngle(Math.PI/2)
           .endAngle(angle+(Math.PI/2))
        svg.append("path")
           .attr("class", "angleSweep")
           .attr("d", anglePath)
           .attr("r", 20)
           .style("stroke", "rgba(255,0,0,1)")
           .style("fill", "rgba(255,0,0,1)")
        */
    }

    var timedOut = 0
      , draw = function(that){

        var mousePos = d3.mouse(that)

        if(mousePos[0] === 0 || mousePos[1] === 0) return

        var referenceAngle = Math.atan(mousePos[1]/mousePos[0])
        referenceAngle += (referenceAngle < 0) ? Math.PI/2 : 0

        if(mousePos[0] >= 0 && mousePos[1] >= 0) angleToMouse = referenceAngle
        else if(mousePos[0] <= 0 && mousePos[1] >= 0) angleToMouse = referenceAngle + (Math.PI/2)
        else if(mousePos[0] <= 0 && mousePos[1] <= 0) angleToMouse = referenceAngle + Math.PI
        else if(mousePos[0] >= 0 && mousePos[1] <= 0) angleToMouse = referenceAngle + 3*(Math.PI/2)
        else return

        //console.log(angleToMouse);
        $(".angleSweep").remove()
        drawAngleSweep(angleToMouse)

        timedOut = 1
        setTimeout(function(){
            timedOut = 0
        }, 10)

    }

    svg.on("mousemove", function(){
        if(!timedOut) draw(this)
    })

    function stdAngles() {
        $('.angleMark').remove()

        drawAngleMark(0)

        drawAngleMark((Math.PI/6))
        drawAngleMark((Math.PI/3))
        drawAngleMark((Math.PI/4))

        drawAngleMark(Math.PI/2)

        drawAngleMark(5*(Math.PI/6))
        drawAngleMark(2*(Math.PI/3))
        drawAngleMark(3*(Math.PI/4))

        drawAngleMark(Math.PI)

        drawAngleMark(7*(Math.PI/6))
        drawAngleMark(4*(Math.PI/3))
        drawAngleMark(5*(Math.PI/4))

        drawAngleMark(3*Math.PI/2)

        drawAngleMark(11*(Math.PI/6))
        drawAngleMark(5*(Math.PI/3))
        drawAngleMark(7*(Math.PI/4))
    }

    stdAngles()

}

(function($){
    uc = new UnitCircle()
})(jQuery)
