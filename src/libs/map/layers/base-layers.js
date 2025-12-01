import TileLayer from 'ol/layer/Tile';
import { XYZ, OSM, BingMaps } from 'ol/source';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import Group from 'ol/layer/Group';

export default [
    new TileLayer({
        title: 'Open Street Map',
        type: 'base',
        // visible: !import.meta.env.DEV,
        visible: false,
        source: new OSM(),
    }),
    // new TileLayer({
    //     title: 'Google Map',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://maps.google.com/maps/api/js?key=d7287da0-a7ff-405f-8166-b6baf26d066c',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Google Map',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Google Route Map',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://www.google.com/maps/vt?lyrs=m&hl=en&x={x}&y={y}&z={z}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    new TileLayer({
        title: 'Google Satellite Map',
        type: 'base',
        visible: false,
        source: new XYZ({
            url: 'https://www.google.com/maps/vt?lyrs=s&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous',
        }),
    }),
    // new TileLayer({
    //     title: 'Google Satellite Map with labels',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://www.google.com/maps/vt?lyrs=y&hl=en&x={x}&y={y}&z={z}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Google Terrain Map',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://www.google.com/maps/vt?lyrs=p&hl=en&x={x}&y={y}&z={z}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    new TileLayer({
        title: 'Esri Light Gray',
        type: 'base',
        // visible: import.meta.env.DEV,
        visible: true,
        source: new XYZ({
            attributions: 'Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            crossOrigin: 'anonymous',
        }),
    }),
    // new TileLayer({
    //     title: 'Esri Satellite Map',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         attributions: 'Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community',
    //         url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'ArcGIS Raster',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' + 'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    //         url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Jawg Light',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://tiles.jawg.io/35c38ea4-f4e0-4af5-8fc8-a11a04285356/{z}/{x}/{y}.png?api-key=4cKtE4Rze1HrvxWa9a7mdolSk10lVThTFC8zadQYMIMxTjkpTeIDJAAmhReDGnCH&odsdomain=public',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Jawg Dark',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://tiles.jawg.io/aa1f80a0-bc95-461d-867a-cb50a814a2d2/{z}/{x}/{y}.png?api-key=4cKtE4Rze1HrvxWa9a7mdolSk10lVThTFC8zadQYMIMxTjkpTeIDJAAmhReDGnCH&odsdomain=public',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),

    // new TileLayer({
    //     title: 'Bing Map',
    //     type: 'base',
    //     visible: false,
    //     source: new BingMaps({
    //         imagerySet: 'Road',
    //         key: 'AkjzA7OhS4MIBjutL21bkAop7dc41HSE0CNTR5c6HJy8JKc7U9U9RveWJrylD3XJ',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Mapbox Light',
    //     type: 'base',
    //     visible: false,
    //     source: new XYZ({
    //         url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3BlbmRhdGFzb2Z0IiwiYSI6Im9taEJndlkifQ.gN6NtnubxT8HJ-AUY2o_rg',
    //         crossOrigin: 'anonymous',
    //     }),
    // }),
    // new TileLayer({
    //     title: 'Water color',
    //     type: 'base',
    //     visible: false,
    //     source: new StadiaMaps({
    //         layer: 'stamen_watercolor',
    //     }),
    // }),
    // new Group({
    //     title: 'Water color with labels',
    //     type: 'base',
    //     combine: true,
    //     visible: false,
    //     layers: [
    //         new TileLayer({
    //             source: new StadiaMaps({
    //                 layer: 'stamen_watercolor',
    //             }),
    //         }),
    //         new TileLayer({
    //             source: new StadiaMaps({
    //                 layer: 'stamen_terrain_labels',
    //             }),
    //         }),
    //     ],
    // }),
    // new TileLayer({
    //     title: 'None',
    //     type: 'base',
    //     visible: false,
    // }),
];
