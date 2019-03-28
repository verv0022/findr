let app = {
  map: null,
  input: "",
  currentMarker: null,
  position:"",
  key: "key",
  markerList:[],
  defaultPos: {
    coords: {
      latitude: 45.555,
      longitude: -75.555
    }
  }, //default location to use if geolocation fails
  init: function () {
    document.addEventListener("deviceready", app.ready);
  },
  ready: function () {
    //load the google map script
    let s = document.createElement("script");
    document.head.appendChild(s);
    s.addEventListener("load", app.mapScriptReady);
    s.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAzARTnU23VBqS5oKpm5fvChuSb7a06xos`;
  },
  mapScriptReady: function () {
    //script has loaded. Now get the location
    if (navigator.geolocation) {
      
      let options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000 * 60 * 60
      };
      navigator.geolocation.getCurrentPosition(
        app.gotPosition,
        app.failPosition,
        options
      );
    } else {
      //not supported
      //pass default location to gotPosition
      app.gotPosition(app.defaultPos);
    }
  },
  gotPosition: function (position) {
    console.log("gotPosition", position.coords);
    //build the map - we have deviceready, google script, and geolocation coords
    app.map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      zoom: 10,
      disableDoubleClickZoom: true,
      clickableIcons: false,
      disableDefaultUI: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ["roadmap", "terrain", "satellite"],
        position: google.maps.ControlPosition.LEFT_TOP
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },

    });
    //add map event listeners
    app.addMapListeners();
    app.localStorage();
  },
  addMapListeners: function () {
    console.log("addMapListeners");
    //add double click listener to the map object
    app.map.addListener("dblclick", app.markerDblClick);

  },
  addMarker: function () {

    let marker = new google.maps.Marker({
      map: app.map,
      draggable: false,
      position: app.position
    });


    let infoWindow = new google.maps.InfoWindow({ map:app.map });
  
      let contentDiv = document.createElement("div");
      let p = document.createElement("p");
      p.textContent = app.input;
      contentDiv.appendChild(p);
      let deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function(){

        app.markerDelete(marker,infoWindow)
      });


      contentDiv.appendChild(deleteBtn);
      infoWindow.setContent(contentDiv);

      marker.addListener('click', function () {
        infoWindow.open(map, marker)
    });

    let mkrObject = {
      "title": app.input,
      "position": {
        lat: app.position.lat(),
        lng: app.position.lng()
      }
  }

  app.markerList.push(mkrObject);

  localStorage.setItem(app.key,JSON.stringify(app.markerList))

    //add click listener to Marker
    marker.addListener("click", app.markerClick);
    //add double click listener to Marker
    marker.addListener("dblclick", app.markerDblClick);


  },
  markerClick: function (ev) {
    console.log("Click", ev);
    console.log(this);

    let marker = this; // to use the marker locally
    app.currentMarker = marker; //to use the marker globally
    app.map.panTo(marker.getPosition());
  },

  markerDblClick: function (ev) {
     console.log("Double Click", ev);

    app.position = ev.latLng;
    
    //console.log(app.position.lat());

    app.showPrompt();
    
 
    

  },

  showPrompt: function () {
    let buttons = ["Cancel", "Confirm"];

    navigator.notification.prompt("Enter a title for this marker",
      (response) => {


        app.input = response.input1;
        
        if (response.buttonIndex == 1){
          return;
        }
        else{
          app.addMarker();          
        } 

        
      }, "Hello", buttons);

  },

  markerDelete: function(marker,infoWindow){
    console.log("delete button inside info window was clicked");
    infoWindow.close();
    marker.setMap(null);
    app.currentMarker = null;
  },



  localStorage: function () {
    console.log("Called local storage");
    let storage = localStorage.getItem(app.key);
    
    if (storage) {
      console.log("In if statement");
        app.markerList = JSON.parse(storage);
        console.log(app.markerlist, "list");
        console.log("markerList",app.markerList);
        app.markerList.forEach(item => {

          let marker = new google.maps.Marker({
            map: app.map,
            draggable: false,
            position: item.position
          });
          
          console.log(item,"item");
          let infoWindow = new google.maps.InfoWindow({ map:app.map });
        
            let contentDiv = document.createElement("div");
            let p = document.createElement("p");
            p.textContent = item.title;
            contentDiv.appendChild(p);
            let deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", function(){
      
              app.markerDelete(marker,infoWindow)
            });
      
      
            contentDiv.appendChild(deleteBtn);
            infoWindow.setContent(contentDiv);
      
            marker.addListener('click', function () {
              infoWindow.open(map, marker)
          });
        })
        
    }
},


  failPosition: function (err) {
    console.log("failPosition", err);
    //failed to get the user's location for whatever reason
    app.gotPosition(app.defaultPos);
  }
};

app.init();

/**
 * google.maps.Marker object can listen to:
 * click
 * dblclick
 * mouseup
 * mousedown
 * mousemove
 * mousecancel... and more
 * See: https: //developers.google.com/maps/documentation/javascript/reference/#Marker
 */