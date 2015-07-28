/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.chooser.Window
 * @extends Ext.window.Window
 * @author Ed Spencer
 * 
 * This is a simple subclass of the built-in Ext.window.Window class. Although it weighs in at 100+ lines, most of this
 * is just configuration. This Window class uses a border layout and creates a DataView in the central region and an
 * information panel in the east. It also sets up a toolbar to enable sorting and filtering of the items in the 
 * DataView. We add a few simple methods to the class at the bottom, see the comments inline for details.
 */

Ext.define('Chooser.Window', {
    extend: 'Ext.panel.Panel',      
	TPanel:'',	 
	mappanel:'',
    //height: 600,
    width : 440,
    title : 'Choose a layer',	
	collapsible:true,			
	//collapsed:true,
    //closeAction: 'hide',	
    //layout: 'border',
	layout:'fit',
    // modal: true,
    border: false,
    bodyBorder: false,
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
    
    /**
     * initComponent is a great place to put any code that needs to be run when a new instance of a component is
     * created. Here we just specify the items that will go into our Window, plus the Buttons that we want to appear
     * at the bottom. Finally we call the superclass initComponent.
     */
    initComponent: function() {
        this.items = [
            {
                xtype: 'panel',
                region: 'west',
                autoScroll: true,					
                items: [
				{
                    xtype: 'iconbrowser',
                    id: 'img-chooser-view',
                    listeners: {
                        scope: this,
                        selectionchange: this.onIconSelect,
                        itemdblclick: this.onIconSelect
                    }				
                }				
					
				
				]
            }					
			
        ];      
        
		
		
		
		
        //this.callParent(arguments);
		this.callParent();        
       
    },   
    /**
     * Called whenever the user clicks on an item in the DataView. 
     */	 
	 
	onIconSelect: function(dataview, selections) {
	
		var me=this;
		var selectedImage = this.down('iconbrowser').selModel.getSelection()[0];		
		Province = me.mappanel.dockedItems.items[1].items.items[6].getRawValue();		

		if(this.mappanel.map.getLayersByName('My Location').length > 0) {				
			this.mappanel.map.getLayersByName('My Location')[0].destroy();					
		};	
		
		/**
		Load selected layer
		*/	
		if (selectedImage){
		
			var layername = selectedImage.data.name;
			var layer = selectedImage.data.url;		
			
	
			//format layername						
			layername=capitalizeFirstLetter(layer) + ' Road (LGU-' + Province + ')'
			
			switch(Province){
				case 'Surigao del Sur':			
					layer='surigao_del_sur_road_' + layer;	
					break;
				case 'Agusan del Sur':
					layer='agusan_del_sur_road_' + layer;
					break;
				case 'Siquijor':
					layer='siquijor_road_' + layer;
					break;
			
			}
			
			function capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			}
			
			if(this.mappanel.map.getLayersByName(layername).length > 0) {				
					this.mappanel.map.getLayersByName(layername)[0].destroy();					
			};					
			
			//remove 
			/* layername = layername.replace('<br>', " ");
			layername = layername.replace('<br>', " "); */
			
			console.log(layer);
			var Layer1 = new OpenLayers.Layer.WMS(
				layername,
				//'http://geoserver.namria.gov.ph/geoserver/geoportal/wms', 
				'http://192.168.8.20:8080/geoserver/geoportal/wms', 
				{
					layers:layer,				
					transparent:true						
				},
				{
					//isBaseLayer:false,
					opacity:.7
				}
			); 		
			this.mappanel.map.addLayer(Layer1);	
			
			
			//zoom to data extent
			var wmsURL='http://192.168.8.20:8080/geoserver/wms/?request=GetCapabilities'
			wms = new OpenLayers.Format.WMSCapabilities();
				OpenLayers.Request.GET({
					url:'/webapi/get.ashx?url=' + escape(wmsURL),
					success: function(e){
						var response = wms.read(e.responseText);
						var capability = response.capability;
						console.log(capability);	
						for (var i=0, len=capability.layers.length; i<len; i+=1) { 
							var layerObj = capability.layers[i]; 	
							if (layerObj.name === 'geoportal:' + layer) { 
								console.log(layerObj.llbbox)	
								var bounds  = new OpenLayers.Bounds(layerObj.llbbox).transform('EPSG:4326', 'EPSG:900913')
								map.zoomToExtent(bounds); 
								break; 
							} 
						}
					}
				});
		}														

    },
   
	
    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function() {
        var selectedImage = this.down('iconbrowser').selModel.getSelection()[0];
        //console.log(selectedImage);
        if (selectedImage) {
            this.fireEvent('selected', selectedImage);
            //this.hide();
        }
    }
	
});
