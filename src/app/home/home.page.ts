import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Platform } from '@ionic/angular';

//import { Map, tileLayer, marker, icon, circle } from 'leaflet';
import * as Leaflet from 'leaflet';

import { map } from 'rxjs/operators';

declare const L: any; 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  map: any;
  backButtonSubscription; 

  ngAfterViewInit(): void {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }
  ngOnDestroy(): void {
    this.backButtonSubscription.unsubscribe();
  }
  ngOnInit(): void {
      this.leafletMap();
  }
  
  constructor(private platform: Platform) {}

  ionViewDidEnter() { }

  leafletMap(): void {
    // In setView add latLng and zoom
    this.map = Leaflet.map('mapId');

    //basemap using leaflet osm
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'IONICMap data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    

    //adding Layer group from geoserver WMS
  //  var basemaps = {
    //  OpenStreetMap: Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //  attribution: 'OpenStreetMap contributors © ionic',
      //})
    
     // Jalan_GSB: Leaflet.tileLayer.wms('http://peta.jogjakota.go.id:8080/geoserver/sitaru/wms',{
      //  layers: 'sitaru:jalan_gsb',
    //format: 'image/png',
    //transparent: true
     // })
    //};

    //adding Layer overlay 2 layer
    var overlays = Leaflet.layerGroup([Leaflet.tileLayer.wms('http://peta.jogjakota.go.id:8080/geoserver/sitaru/wms',
    {
      layers: 'sitaru:pola_ruang_rdtr',
  format: 'image/png',
  transparent: true,
    })]);

    var overlays1 = Leaflet.layerGroup([Leaflet.tileLayer.wms('http://peta.jogjakota.go.id:8080/geoserver/sitaru/wms',{
      layers: 'sitaru:jalan_gsb',
  format: 'image/png',
  transparent: true
    })]);

    var overlays2 = Leaflet.layerGroup([Leaflet.tileLayer.wms('http://peta.jogjakota.go.id:8080/geoserver/sitaru/wms',{
      layers: 'sitaru:bidang_tanah_tujuh_edit',
      format:'image/png',
      transparent:true
    })]);

    var overlayMaps ={
      "RDTR" : overlays,
      "Jalan" : overlays1,
      "Bidang tanah" : overlays2
    }
    

    Leaflet.control.layers(null, overlayMaps).addTo(this.map);
    overlays.addTo(this.map); //default layer to display

    var map = this.map;

    map.locate({setView: true, maxZoom: 20});

    //adding current position
    function onLocationFound(e) {
      Leaflet.circle(e.latlng).addTo(map);
    }
    map.on('locationfound', onLocationFound);
    
     //alert on location error
     function onLocationError(e) {
       alert("e.message");
       }
       this.map.on('locationerror', onLocationError);

       // -- Display information on click --
       map.addEventListener('click', onMapClick);

       function onMapClick(){
         filter: (feature) =>  {                    
           const kecamatanCon = ['pola_ruang'].includes(feature.properties.pola_ruang);
           const kelasCon = ['zona'].includes(feature.properties.zona);
           const area = ['sub_zona'].includes(feature.properties.sub_zona);
           return (kelasCon && kecamatanCon );
           onEachFeature: onEachFeature
         }
       }

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  var popupContent = "<table> " 
  + "<tr><td>Kecamatan </td><td>: "+ feature.properties.pola_ruang + "</td></tr>"
  + "<tr><td>Kelas Bencana </td><td>: "+ feature.properties.zona + "</td></tr>"
  + "<tr><td>Jenis Area Bencana </td><td>: "+ feature.properties.sub_zona + "</td></tr>"


if (feature.properties && feature.properties.popupContent) {
popupContent += feature.properties.popupContent;
  }
  layer.bindPopup(popupContent);
  layer.on({
      click: zoomToFeature
  });

}
  
  }

  /** Remove map when we have multiple map object */
  ionViewWillLeave() {
    this.map.remove();
  }
}

