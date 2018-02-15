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
var quakes;
var offsetMin = 0;
var offsetSet = 10;
var offsetMax = offsetSet;
var currentPage = 0;
$(function () {
    drawMap(true);
});
update.on("click", function () {
    drawMap(true);
});
function getData() {
    var url = baseUrl + selMag.val() + "_" + selPer.val() + ".geojson";
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json"
    }).then(function (data) {
        var sort = sortby.val();
        switch (sort) {
            case "mag_desc":
                quakes = _.sortBy(data.features, function (quake) { return quake.properties.mag; });
                quakes.reverse();
                break;
            case "mag_asc":
                quakes = _.sortBy(data.features, function (quake) { return quake.properties.mag; });
                break;
            case "time_desc":
                quakes = _.sortBy(data.features, function (quake) { return quake.properties.time; });
                break;
            case "time_asc":
                quakes = _.sortBy(data.features, function (quake) { return quake.properties.time; });
                quakes.reverse();
                break;
        }
        currentPage = 0;
        offsetMin = 0;
        offsetMax = offsetSet;
        drawData();
    }, function (jqXHR, textStatus, errorThrown) {
        alert("An error occurred!");
    });
}
setInterval(getData, 150000);
function drawData() {
    content.empty();
    content.append("<hr>");
    for (var i = 0; i < quakes.length; i++) {
        var quake = quakes[i];
        var quakeLon = quake.geometry.coordinates[0];
        var quakeLat = quake.geometry.coordinates[1];
        var quakeTs = quake.properties.tsunami;
        var quakePlace = quake.properties.place;
        var quakeTime = moment(quake.properties.time).format("dddd , DD-MM-YY , HH:mm:ss");
        var quakeAlert = quake.properties.alert;
        if (quakeAlert == null) {
            quakeAlert = "gray";
        }
        var quakeMag = quake.properties.mag;
        if (quakeMag <= 0) {
            quakeMag = 0.01;
        }
        var timeAgo = moment(quake.properties.time).fromNow();
        if (i >= offsetMin && i < offsetMax) {
            var item = $("<div></div>");
            item.addClass("row");
            var imageCol = $("<div></div>");
            imageCol.addClass("col-xs-4 col-xs-offset-1");
            var imageUrl = "https://maps.googleapis.com/maps/api/staticmap?" + "center=" + quakeLat + "," + quakeLon + "&zoom=5&size=300x200&maptype=hybrid&markers=colors:red|size:mid|" + quakeLat + "," + quakeLon + "&key=" + API_KEY;
            /* Sample image can be removed with pagination
            if (selPer.val() != "hour")
                imageCol.append("<img class='img-rounded img-responsive' src='Img/temp.jpg'>");
            else*/
            imageCol.append("<img class='img-rounded img-responsive' src='" + imageUrl + "'>");
            var textCol = $("<div></div>");
            textCol.addClass("col-xs-6");
            textCol.append("<br><h3> Location: " + quakePlace + "</h3>");
            textCol.append("<p> Magnitude: " + quakeMag + "<br> Happened: " + timeAgo + "<br> Time: " + quakeTime + "</p>");
            if (quakeTs == 1) {
                textCol.append("<p style='color:red'> <span class='glyphicon glyphicon-alert'> </span>  Tsunami risk!</p>");
            }
            item.append(imageCol);
            item.append(textCol);
            content.append(item);
            content.append("<hr>");
            drawCircle(convertLon(quakeLon), convertLat(quakeLat), quakeMag, quakeAlert, quakeTs);
        }
        else {
            drawCircle(convertLon(quakeLon), convertLat(quakeLat), quakeMag, quakeAlert, quakeTs);
        }
    }
    /* PAGINATION */
    var pagContainer = $("<div> </div>");
    pagContainer.addClass("text-center");
    var pagination = $("<ul> </ul>");
    pagination.addClass("pagination");
    var pageN = Math.ceil(quakes.length / offsetSet);
    var list = $("");
    var index = currentPage - 5;
    if (index < 0) {
        index = 0;
    }
    else if (index > 0) {
        pagination.append("<li><a href='#' onclick='changePage(0)'> \<\< </a></li>");
    }
    for (var i = index; i < pageN && i < currentPage + 5; i++) {
        list = $("<li></li>");
        if (i == currentPage) {
            list.addClass("active");
        }
        list.append("<a href='#' onclick='changePage(" + i + ")'>" + (i + 1) + "</a>");
        pagination.append(list);
        if (i + 1 >= currentPage + 5 && (i + 1) < pageN) {
            pagination.append("<li><a href='#' onclick='changePage(" + (pageN - 1) + ")'> \>\> </a></li>");
        }
    }
    pagContainer.append(pagination);
    content.append(pagContainer);
}
function changePage(page) {
    currentPage = page;
    offsetMin = offsetSet * (page);
    offsetMax = offsetMin + offsetSet;
    drawMap(false);
}
/* ____________________ */
function drawMap(updateData) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    var mapImg = new Image();
    mapImg.src = "Img/map.jpg"; //Image Source: https://en.wikipedia.org/wiki/Equirectangular_projection
    mapImg.onload = function () {
        ctx.drawImage(mapImg, 0, 0, width, height);
        if (updateData)
            getData();
        else
            drawData();
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