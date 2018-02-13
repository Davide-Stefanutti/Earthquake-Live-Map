/* https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php */
var canvas = $("#globalMap")[0];
var ctx = canvas.getContext('2d');
var API_KEY = GOOGLE_API_KEY;
moment.locale("en-gb");
var height = 600;
var width = 900;
var content = $("#content");
var update = $("#update");
var selMag = $("#selectedMag");
var selPer = $("#selectedPeriod");
var sortby = $("#sortBy");
var baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";
$(function () {
    drawMap();
});
update.on("click", function () {
    drawMap();
});
function getData() {
    var url = baseUrl + selMag.val() + "_" + selPer.val() + ".geojson";
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json"
    }).then(function (data) {
        content.empty();
        var quake;
        var sort = sortby.val();
        switch (sort) {
            case "mag_desc":
                quake = _.sortBy(data.features, function (quake) { return quake.properties.mag; });
                quake.reverse();
                break;
            case "mag_asc":
                quake = _.sortBy(data.features, function (quake) { return quake.properties.mag; });
                break;
            case "time_desc":
                quake = _.sortBy(data.features, function (quake) { return quake.properties.time; });
                break;
            case "time_asc":
                quake = _.sortBy(data.features, function (quake) { return quake.properties.time; });
                quake.reverse();
                break;
        }
        drawData(quake);
    }, function (jqXHR, textStatus, errorThrown) {
        alert("An error occurred!");
    });
}
setInterval(getData, 150000);
function drawData(quakes) {
    content.append("<hr>");
    for (var i = 0; i < quakes.length; i++) {
        var quake = quakes[i];
        var quakeLon = quake.geometry.coordinates[0];
        var quakeLat = quake.geometry.coordinates[1];
        var quakeTs = quake.properties.tsunami;
        var quakePlace = quake.properties.place;
        var quakeAlert = quake.properties.alert;
        if (quakeAlert == null) {
            quakeAlert = "gray";
        }
        var quakeMag = quake.properties.mag;
        if (quakeMag <= 0) {
            quakeMag = 0.01;
        }
        var timeAgo = moment(quake.properties.time).fromNow();
        var item = $("<div></div>");
        item.addClass("row");
        var imageCol = $("<div></div>");
        imageCol.addClass("col-xs-4 col-xs-offset-1");
        var imageUrl = "https://maps.googleapis.com/maps/api/staticmap?" + "center=" + quakeLat + "," + quakeLon + "&zoom=5&size=300x200&maptype=hybrid&markers=colors:red|size:mid|" + quakeLat + "," + quakeLon + "&key=" + API_KEY;
        if (selPer.val() != "hour")
            imageCol.append("<img src='Img/temp.jpg'>");
        else
            imageCol.append("<img src='" + imageUrl + "'>");
        var textCol = $("<div></div>");
        textCol.addClass("col-xs-6");
        textCol.append("<br><h3> Location: " + quakePlace + "</h3>");
        textCol.append("<p> Magnitude: " + quakeMag + "<br> Happened: " + timeAgo + "</p>");
        if (quakeTs == 1) {
            textCol.append("<p style='color:red'> <span class='glyphicon glyphicon-alert'> </span>  Tsunami risk!</p>");
        }
        drawCircle(convertLon(quakeLon), convertLat(quakeLat), quakeMag, quakeAlert, quakeTs);
        item.append(imageCol);
        item.append(textCol);
        content.append(item);
        content.append("<hr>");
    }
}
/* ____________________ */
function drawMap() {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    var mapImg = new Image();
    mapImg.src = "Img/map.jpg"; //Image Source: https://en.wikipedia.org/wiki/Equirectangular_projection
    mapImg.onload = function () {
        ctx.drawImage(mapImg, 0, 0, width, height);
        getData();
    };
}
function convertLat(lat) {
    return ((height / 180.0) * (90 - lat));
}
function convertLon(lon) {
    return ((width / 360.0) * (180 + lon));
}
function drawCircle(x, y, r, color, tusnami) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    if (tusnami == 1) {
        ctx.strokeStyle = "red";
    }
    else {
        ctx.strokeStyle = "black";
    }
    ctx.stroke();
}
//# sourceMappingURL=index.js.map