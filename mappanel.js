Ext.define('mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal - Open Roads Map App",   			
	layout:'border',	
	region:'center',
	width:100,
	height:100,
	selLayer:'',
	execUrl:function(url, callback){
		Ext.Ajax.request({
				url:url,
				success: function(response){
					var obj = Ext.decode(response.responseText);					
					callback(obj)		
				}			
			});	
	
	},
	gCode:function(addr, callback){	  
				var geocoder = new google.maps.Geocoder();					
				geocoder.geocode({ 'address': addr + ' Philippines' }, function (results, status) {					
					if (status == google.maps.GeocoderStatus.OK) {		
						var xx=results[0].geometry.location.lng();			
						var yy=results[0].geometry.location.lat();		
						SourceDest={a:xx, b:yy};							
					}else{
						console.log("Geocoding failed: " + status); 
						Ext.Msg.alert("Geocoding failed", "Please enter location")
					}				
					callback(SourceDest);	
				})		
			},
	
	buildItems:function(){
		return[			
			{
				xtype:'textfield',
				itemId:'Search',
				width:200,
				emptyText:'Location Search',
			},{
				xtype:'button',
				text:'Go',
				itemId:'btnGo',
				//disabled:true,
				handler:function(){								
					var me=this.up();				
					var findThis = (me.getComponent('Search').getValue());					
					var me=this.up().up();					
					if  (me.map.getLayersByName('My Location').length > 0) {				
						me.map.getLayersByName('My Location')[0].destroy();					
					};	 				
					
					me.gCode(findThis, function(coord){					
						if  (me.map.getLayersByName('Gcode').length > 0) {				
							me.map.getLayersByName('Gcode')[0].destroy();					
						};		 				
						var currLoc = new OpenLayers.Geometry.Point(coord.a,coord.b).transform('EPSG:4326','EPSG:900913');
						var Location = new OpenLayers.Layer.Vector(	'Gcode', {
								 styleMap: new OpenLayers.StyleMap({'default':{										
										externalGraphic: "./chooser/icons/marker.png",				
										graphicYOffset: -25,
										graphicHeight: 35,
										graphicTitle: findThis
								}}), 	
								displayInLayerSwitcher: false,		
						});							
						Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
						me.map.addLayer(Location);						
						me.map.zoomToExtent(Location.getDataExtent());			 		
					})						
				}			
			},			
			{	
				xtype:'button',
				tooltip:'My current location',
				name:'rb',				
				itemId:'btnLoc',
				scale:'large',				
				icon:'./chooser/icons/myCurrLoc.png',
				width:25,
				height:25,	
				handler:function(){					
					var me=this.up('panel');			
					console.log(me);
					if(me.map.getLayersByName('Gcode').length > 0) {				
						me.map.getLayersByName('Gcode')[0].destroy();					
					};		
					
					if (navigator.geolocation) {   
						/** Overlay current location*/		
						navigator.geolocation.getCurrentPosition(
							function(position){					
								var currLoc = new OpenLayers.Geometry.Point(position.coords.longitude,position.coords.latitude).transform('EPSG:4326', 'EPSG:900913');
								console.log('myloc--',currLoc);
								var Location = new OpenLayers.Layer.Vector(	'My Location', {
										styleMap: new OpenLayers.StyleMap({'default':{
												externalGraphic: "./chooser/icons/MyLocation.png",				
												graphicYOffset: -25,
												graphicHeight: 35,
												graphicTitle: "You're here"
										}}) ,
										displayInLayerSwitcher: false,		
										
									});		
								Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
								me.map.addLayers([Location]);												
								me.map.zoomToExtent(Location.getDataExtent());		
								}
						)		
						
					} else {
						console.log("Geolocation is not supported by this browser.");
					}						
				}		
			},
			{			
				xtype:'button',
				tooltip:'Full extent',
				icon:'./chooser/icons/phil.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me=this.up().up();				
					
					OthoExtent = new OpenLayers.Bounds(120.613472,14.295979, 121.550385,14.827789).transform('EPSG:4326','EPSG:900913')
					
					var lonlat = new OpenLayers.LonLat(121,14).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
					map.setCenter(lonlat);
					if (map.baseLayer.name=="BING Aerial Map")
						map.zoomTo(5);
					else if (map.baseLayer.name=="OpenStreetMap")					  
						map.zoomTo(6);
					else if (map.baseLayer.name=="Google Map - Satellite")
						map.zoomTo(6);
					else if (map.baseLayer.name=="ArcGIS Online - Imagery")
						map.zoomTo(6);		
					else if (map.baseLayer.name=="Ortho Image 2011 - Metro Manila")	
						map.zoomToExtent(OthoExtent);
					else
						map.zoomTo(1);
				}
					
			}/*,{
				xtype:'button',
				tooltip:'Buffer tool',
				icon:'./chooser/icons/buffer.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me = this.up().up();
						console.log(me);						
					var win = Ext.create('BufferTool', {
						map:me.map
					})					
					win.show();					
					
				}
			}*/,
			'->',
			{
				//xtype:'label',
				
				xtype:'tbtext',
				text: 'Basemap: NAMRIA Basemaps'
			
			},
			'->',
			{
				   xtype:'combo',
				   fieldLabel:'Province',
				   itemId:'cmbProvince',				   				   				   
				   queryMode:'local',
				   store:['Surigao del Sur','Agusan del Sur','Siquijor'],
				   displayField:'Province',
				  // value:'Surigao del Sur',
				   labelPad:-40,
				   padding:'0, 20, 0, 0',
				   
				   editable: false,
				   autoSelect:true,
				   forceSelection:true,
				   listConfig: {
						listeners: {
							itemclick: function(list, record) {
								var me = this.up('panel')
								var bounds
								console.log('-------',me)
								var province = record.raw[0]; //get province
								


								switch(province){
									case 'Surigao del Sur':			
										 bounds = new OpenLayers.Bounds(125.865234375,7.88860368728638,126.416236877441,9.49994850158691).transform('EPSG:4326', 'EPSG:900913');
										break;
									case 'Agusan del Sur':
										 bounds = new OpenLayers.Bounds(125.360130310059,7.92923212051392,126.242874145508,8.99598026275635).transform('EPSG:4326', 'EPSG:900913');
										break;
									case 'Siquijor':
										 bounds = new OpenLayers.Bounds(123.460250854492,9.11301040649414,123.67113494873,9.30002880096436).transform('EPSG:4326', 'EPSG:900913');
										break;
								
								}		
								
								me.map.zoomToExtent(bounds);
								
								viewport = Ext.ComponentQuery.query('viewport')[0];
								var chooserWindow = viewport.down('[region=west]');
								iconStore = chooserWindow.down('#img-chooser-view').store;
									
									iconStore.clearFilter(true);
									iconStore.filterBy(function(record,id){
										var stringToMatch = (
											record.get('province'))
										var match = (stringToMatch.indexOf(province) >= 0 );
										return match;
									});
									
								
							}
						}
					}
			},
			{
				xtype:'button',
				scale:'large',
				itemId:'btnSwitch',
				icon:'./img/layers.png',				
				width:68,
				height:30,	
				tooltip:'Switch basemap',
				menu     : [
					{
						text: 'Philippine Geoportal',
						group: 'basemap',
						checked: true,
						handler: function(){
							map.setBaseLayer(map.layers[0]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Ortho Image 2011 - Metro Manila',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[1]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);				
							OthoExtent = new OpenLayers.Bounds(120.613472,14.295979, 121.550385,14.827789).transform('EPSG:4326','EPSG:900913')
							map.zoomToExtent(OthoExtent);	
							
						}
					},
					{
						text: 'Bing Maps - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[2]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
							
						}
					},
					{
						text: 'ArcGIS Online - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[3]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Open Street Map',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[4]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Google Map - Satellite',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(map.layers[5]);
							this.up().up().up().items.items[5].setText('Basemap : ' + this.text);
						}
					},
					'-',
					{
						text: '&nbsp &nbsp &nbsp &nbsp<b>NOTE:</b><br/>&nbsp &nbsp &nbsp &nbspWE HAVE OBSERVED SOME DISCREPANCIES <br/>&nbsp &nbsp &nbsp &nbspBY AS MUCH AS 10 METERS WHEN USING BASEMAPS<br/>&nbsp &nbsp &nbsp &nbspOTHER THAN THE NAMRIA BASEMAPS AND<br/>&nbsp &nbsp &nbsp &nbspORTHO IMAGE 2011-METRO MANILA.  USERS ARE <br/>&nbsp &nbsp &nbsp &nbspADVISED TO TAKE THE NECESSARY PRECAUTIONS<br/>&nbsp &nbsp &nbsp &nbspESPECIALLY WHEN VIEWING THE ACTIVE FAULTS<br/>&nbsp &nbsp &nbsp &nbsp(VALLEY FAULT SYSTEM) USING OTHER BASEMAPS.',
						plain: true
					}
			   ]
				
			}
		]	
	},
	
	
	
	initComponent:function(){		
		
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),				
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		console.log(map);
		//Map config
		var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
		var layerMaxExtent = new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);		
		var units = 'm';
		var resolutions = [ 3968.75793751588, 
							2645.83862501058, 
							1322.91931250529, 
							661.459656252646, 
							264.583862501058, 
							132.291931250529, 
							66.1459656252646, 
							26.4583862501058, 
							13.2291931250529, 
							6.61459656252646, 
							2.64583862501058, 
							1.32291931250529, 
							0.661459656252646 ];
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);
		//
		
		
	   //PGP Basemap			
      var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					displayInLayerSwitcher: false,				
				}
		);
		
		//Ortho
		var pgp_ortho_mm_cache = new OpenLayers.Layer.ArcGISCache( "Ortho Image 2011 - Metro Manila",
			"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_OrthoImage/MapServer", {
			//"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
			isBaseLayer: true,

			//From layerInfo above                        
			resolutions: resolutions,                        
			tileSize: tileSize,
			tileOrigin: tileOrigin,
			maxExtent: layerMaxExtent, 
			projection: projection,
			displayInLayerSwitcher: false
		},
		{
			//additional options
			transitionEffect: "resize"
		});
			
		//Bing
		
		var bing_aerial = new OpenLayers.Layer.Bing({
			name: "BING Aerial Map",
			key: 'AkRWcFAhv1-J1MxSfE5URc4jiUjoL96_frNidZic_5fLeQ54al4UqXcKKr04l2ud',
			type: "Aerial",
			displayInLayerSwitcher: false
			
		}, {
			isBaseLayer: true,
			visibility: false,
			transitionEffect: "resize"
		});
		
		//ArcGIS
		
		var arcgis_world_imagery = new OpenLayers.Layer.ArcGIS93Rest("ArcGIS Online - Imagery", 
		'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export',
		{
			layers: 'show:0,1,2,3',
			format: 'png24'
		}, 
		{
			//additional options
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});
		
		//Open Street Map
		var osm  = new OpenLayers.Layer.OSM("","",
		{
			sphericalMercator: true,
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});	
		
			
	   //Google
	   var google_satellite = new OpenLayers.Layer.Google(
                "Google Map - Satellite",
                {
					type: google.maps.MapTypeId.SATELLITE, 
					numZoomLevels: 22,
					sphericalMercator: true,
					transitionEffect: "resize",
					isBaseLayer: true,
					displayInLayerSwitcher: false
				}
        );

		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		map.addLayers([pgp_basemap_cache,pgp_ortho_mm_cache,bing_aerial, arcgis_world_imagery, osm, google_satellite, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		//new code for get feature info
		OpenLayers.Control.PGSGetFeatureInfo = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},
			maxFeatures: 1,
			queryVisible: true,
			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.click
					}, this.handlerOptions
				);
			}, 
			queryLayer: function(e, layer){
				console.log(layer);
				var layer_name = (layer.params.LAYERS || layer.params.layers).replace("geoportal:","");
				var url = layer.url + "?" + 
							"request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + layer_name + 
							//"&styles=" + (layer.params.STYLES || layer.params.styles) +  
							"&srs=" + (layer.params.SRS || layer.params.srs) + 
							"&format=" + (layer.params.FORMAT || layer.params.format) + 
							"&bbox=" + map.getExtent().toString()+  
							"&width=" + map.getSize().w + 
							"&height=" + map.getSize().h + 
							"&query_layers=" + (layer.params.LAYERS || layer.params.layers) + 
							"&info_format=application/json" + 
							"&feature_count=" + this.maxFeatures + 
							"&x=" + e.xy.x + 
							"&y=" + e.xy.y + 
							"&exceptions=application/json";
							//"&exceptions=application%2Fvnd.ogc.se_xml";
				
				var retVal;
				
				// temporary fix 24 SEP 2014 ghelo
				//url = url.replace('geoserver.namria.gov.ph','202.90.149.232');
				//
				console.log(url);

				
				
				Ext.Ajax.request({
					async: false,
					url: '/webapi/get.ashx?url=' + escape(url),
					success: function(response){
						var obj = Ext.decode(response.responseText);	
						retVal = obj.features;
 					}
				});
				
				return retVal;
			},
			click: function(e) {
				
				OpenLayers.Element.addClass(this.map.viewPortDiv, "olCursorWait");
				
				for(var index = map.layers.length-1;index >= 0;index--){
					var layer = this.map.layers[index];
					
					if(layer instanceof OpenLayers.Layer.WMS &&
						(!this.queryVisible || layer.getVisibility())) {
						// make sure this is a WMS layer and the layer is visible
						
						var features = this.queryLayer(e, layer);
						if(features.length == 0)
							continue;
						this.events.triggerEvent("getfeatureinfo", {xy: e.xy, 
																	layerName: (layer.params.LAYERS || layer.params.layers), 
																	layerTitle: layer.name, 
																	style: (layer.params.STYLES || layer.params.styles),
																	features: features});	
						OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
						break;
					}
				}
				
				OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
				
			}

		});
		
		
		
			var pgsGetFeatureInfo = new OpenLayers.Control.PGSGetFeatureInfo({
				eventListeners: {
					'getfeatureinfo' : function(e){
					
						if(e.features.length == 0)
							return;
							
						var feature = e.features[0];
					
						var layer_name = e.layerName.replace("geoportal:","");
						var style = e.style;
						var layer_config = Utilities.getLayerConfig(layer_name, style);

						var data = {};
						Ext.each(layer_config.config, function(item, index){
							data[item.alias] = feature.properties[item.attribute];
						});

						var popup = Ext.create('GeoExt.window.Popup', {
							maximizable: false,
							collapsible: true,
							anchorPosition: 'top-left',
							title: layer_config.title,
							maxHeight: 300,
							width: 250,
							layout: "fit",
							map: map,
							location: e.xy,
							items: {
								xtype:'propertygrid',
								source: data,
								hideHeaders: false,
								sortableColumns: false
							}
						});
						popup.show();
					}
				}
		});
		map.addControl(pgsGetFeatureInfo);
		pgsGetFeatureInfo.activate();
		
		
		
		//
		
		
		
/* 		map.events.register('click', map, function(e){			
			if (map.layers.length > 1) {
			
				mapIndex = map.layers.length-1
				
				if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
					mapIndex=mapIndex-1
					if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
						mapIndex=mapIndex-1
					}				
				}		
				
				var topLayer = map.layers[mapIndex].params
				console.log(map.layers[mapIndex].params)	
				//var url = "http://geoserver.namria.gov.ph/geoserver/geoportal/wms?" +
				var url = "http://192.168.8.20:8080/geoserver/geoportal/wms?" +
						    "request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + topLayer.LAYERS + 
							"&styles=" + topLayer.STYLES +  
							"&srs=" + topLayer.SRS + 			
							"&format=" + topLayer.FORMAT +							
							"&bbox=" + map.getExtent().toBBOX() +
							"&width=" + map.size.w + 
							"&height=" + map.size.h + 
							"&query_layers=geoportal:" + topLayer.LAYERS + 
							"&info_format=application/json" + 
							"&feature_count=" + 10 + 
							"&x=" + Math.round(e.xy.x) + 
							"&y=" + Math.round(e.xy.y) + 
							"&exceptions=application/json";
							
						url = "/webapi/get.ashx?url=" + escape(url);	
					
						console.log(url);
						me.execUrl(url, function(callback){		
								console.log(callback);	
								if (callback.features.length > 0){							
									var pos =  e.xy		
									
									var feature =callback.features[0]
									var layer_config = Utilities.getLayerConfig(topLayer.LAYERS, topLayer.STYLES );	
									console.log(layer_config);
									var data = {};
									Ext.each(layer_config.config, function(item, index){
										data[item.alias] = feature.properties[item.attribute];
									});
									
									if (popup) {
										popup.close();
									}
									popup = Ext.create('GeoExt.window.Popup', {
										title:layer_config.title,
										maximizable: false,	
										location: pos,
										map:map,	
										width: 300,	
										MaxHeight:150,							
										items: {
											xtype:'propertygrid',
											source:data,//callback.features[0].properties,
											hideHeaders: false,
											sortableColumns: false
										},
										autoScroll: true
									})
									popup.show();
								}	
									
						})	
					
			}
		});   */
		
		
		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  items: this.buildItems(),
				}
			],
			listeners:{
				afterrender:function(){
				
					viewport = Ext.ComponentQuery.query('viewport')[0];
					console.log(viewport);
					var chooserWindow = viewport.down('[region=west]');
					iconStore = chooserWindow.down('#img-chooser-view').store;
					
					var value = 'Agusan del Sur'; //get province
					iconStore.clearFilter(true);
					iconStore.filterBy(function(record,id){
						console.log(record);
						var stringToMatch = (
							record.get('province'))
						var match = (stringToMatch.indexOf(value) >= 0 );
						return match;
					});
					
					console.log(iconStore);
				}
			
			}	
		});		

		this.callParent();  
		
    }	
	
	
});


