
/* https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php */

let canvas:any = $("#globalMap")[0];
let ctx = canvas.getContext('2d');

let API_KEY = GOOGLE_API_KEY;

moment.locale("en-gb");


let height = 600;
let width = 900;

let content = $("#content");
let update = $("#update");
let selMag = $("#selectedMag");
let selPer = $("#selectedPeriod")
let sortby = $("#sortBy");

let baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";



$(function () {
    drawMap();
});

update.on("click", function () {
    drawMap();
});



function getData(){


    let url = baseUrl + selMag.val() + "_" +  selPer.val() + ".geojson";

    $.ajax({
        url:  url,
        type: "GET",
        dataType: "json"
    }).then(function (data:quakeData) {
        content.empty();
        let quake:features[];
        let sort = sortby.val();
        switch(sort){
            case "mag_desc":
                quake = _.sortBy(data.features, function (quake) {return quake.properties.mag;});
                quake.reverse();
                break;
            case "mag_asc":
                quake = _.sortBy(data.features, function (quake) {return quake.properties.mag;});
                break;
            case "time_desc":
                quake = _.sortBy(data.features, function (quake) {return quake.properties.time;});
                break;
            case "time_asc":
                quake = _.sortBy(data.features, function (quake) {return quake.properties.time;});
                quake.reverse();
                break;
        }

        drawData(quake);

    }, function (jqXHR, textStatus, errorThrown) {
        alert("An error occurred!");
    })
}


setInterval(getData,150000);


function drawData(quakes:features[]){
    content.append("<hr>");
    for(let i = 0;i<quakes.length; i++) {
        let quake:features = quakes[i];

        let quakeLon = quake.geometry.coordinates[0];
        let quakeLat = quake.geometry.coordinates[1];
        let quakeTs = quake.properties.tsunami;
        let quakePlace = quake.properties.place;
        let quakeTime = moment(quake.properties.time).format("dddd , DD-MM-YY , HH:mm:ss");

        let quakeAlert = quake.properties.alert;

        if(quakeAlert == null){
            quakeAlert = "gray";
        }

        let quakeMag = quake.properties.mag;

        if(quakeMag <= 0){
            quakeMag = 0.01;
        }

        let timeAgo = moment(quake.properties.time).fromNow();


        let item = $("<div></div>");
        item.addClass("row");


        let imageCol = $("<div></div>");
        imageCol.addClass("col-xs-4 col-xs-offset-1");

        let imageUrl = "https://maps.googleapis.com/maps/api/staticmap?"+ "center="+quakeLat+","+quakeLon+"&zoom=5&size=300x200&maptype=hybrid&markers=colors:red|size:mid|"+ quakeLat+","+quakeLon +"&key="+API_KEY;

        if(selPer.val() != "hour")
            imageCol.append("<img class='img-rounded img-responsive' src='Img/temp.jpg'>");
        else
            imageCol.append("<img class='img-rounded img-responsive' src='"+ imageUrl +"'>");


        let textCol = $("<div></div>");

        textCol.addClass("col-xs-6");
        textCol.append("<br><h3> Location: "+ quakePlace + "</h3>");
        textCol.append("<p> Magnitude: "+ quakeMag + "<br> Happened: "+  timeAgo  + "<br> Time: " + quakeTime + "</p>")

        if(quakeTs == 1){
            textCol.append("<p style='color:red'> <span class='glyphicon glyphicon-alert'> </span>  Tsunami risk!</p>");
        }

        drawCircle(convertLon(quakeLon),convertLat(quakeLat),quakeMag,quakeAlert,quakeTs);




        item.append(imageCol);
        item.append(textCol);
        content.append(item);
        content.append("<hr>");
    }

}

/* ____________________ */

function drawMap(){
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    let mapImg = new Image();
    mapImg.src = "Img/map.jpg";//Image Source: https://en.wikipedia.org/wiki/Equirectangular_projection
    mapImg.onload = function() {
        ctx.drawImage(mapImg, 0 , 0 ,width, height);
        getData();
    };

}

function convertLat(lat){
    return ((height/180.0) * (90 - lat));
}

function convertLon(lon){
    return ((width/360.0) * (180 + lon));
}

function drawCircle(x:number,y:number,r:number,color:string,tusnami:number){
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    if(tusnami == 1){
        ctx.strokeStyle = "red";
    }else {
        ctx.strokeStyle = "black";
    }
    ctx.stroke();
}



/* ____Interfaces______ */


interface quakeData{
    metadata:any,
    features:features[];
}

interface features{
    properties:properties,
    geometry: geometry;
}

interface properties{
    mag:number;
    alert:string;
    tsunami:number;
    time:number;
    detail:string;
    place:string;
}

interface geometry{
    coordinates: number[];
}
