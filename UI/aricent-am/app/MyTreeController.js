var app = angular.module('myApp')
app.controller('MyTreeController', function($scope, $rootScope, $stateParams, $state, $http) {
	console.log("inside mytree controller");
	
var markThisTargetAsSource = function(linkDataList,parentLink){
			 for(j=0;j<linkDataList.length;j++){
			  if(linkDataList[j].from !=parentLink.from){
			     if(parentLink.to === linkDataList[j].to){
				    linkDataList[j].to = linkDataList[j].from;
				    linkDataList[j].from = parentLink.to;
				 }else if(parentLink.to === linkDataList[j].from){
				   var node = linkDataList[j];
				   markThisTargetAsSource(linkDataList,node);
				 }
			   }
	    }
	}
    $scope.init = function() {
    	console.log("inside init mmmmmmmmmmmmmmmm=========");
     // if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make;  // for conciseness in defining templates
      myDiagram =
        $(go.Diagram, "myDiagramDiv",
          { allowCopy: false,
            initialContentAlignment: go.Spot.Center,
            "draggingTool.dragsTree": true,
            "commandHandler.deletesTree": true,
            layout:
              $(go.TreeLayout,
                { angle: 90 }),
            "undoManager.isEnabled": true
          });

      // when the document is modified, add a "*" to the title and enable the "Save" button
      myDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
      });

      var bluegrad = $(go.Brush, "Linear", { 0: "#C4ECFF", 1: "#70D4FF" });
      var greengrad = $(go.Brush, "Linear", { 0: "#B1E2A5", 1: "#7AE060" });

      // each action is represented by a shape and some text
      var actionTemplate =
        $(go.Panel, "Horizontal",
          $(go.Shape,
            { width: 12, height: 12 },
            new go.Binding("figure"),
            new go.Binding("fill")
          ),
          $(go.TextBlock,
            { font: "10pt Verdana, sans-serif" },
            new go.Binding("text")
          )
        );

      // each regular Node has body consisting of a title followed by a collapsible list of actions,
      // controlled by a PanelExpanderButton, with a TreeExpanderButton underneath the body
      myDiagram.nodeTemplate =  // the default node template
        $(go.Node, "Vertical",
          { selectionObjectName: "BODY", deletable: false },
          // the main "BODY" consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, "Auto",
            { name: "BODY" },
            $(go.Shape, "Rectangle",
              { fill: bluegrad, stroke: null }
            ),
            $(go.Panel, "Vertical",
              { margin: 3 },
              // the title
              $(go.TextBlock,
                { stretch: go.GraphObject.Horizontal,
                font: "bold 12pt Verdana, sans-serif"
                },
                new go.Binding("text", "label")
              ),
              // the optional list of actions
              $(go.Panel, "Vertical",
                { stretch: go.GraphObject.Horizontal, visible: false },  // not visible unless there is more than one action
                new go.Binding("visible", "actions", function(acts) {
                  return (Array.isArray(acts) && acts.length > 0);
                }),
                // headered by a label and a PanelExpanderButton inside a Table
                $(go.Panel, "Table",
                  { stretch: go.GraphObject.Horizontal },
                  $(go.TextBlock, "Detail",
                    { alignment: go.Spot.Left,
                    font: "10pt Verdana, sans-serif"
                    }
                  ),
                  $("PanelExpanderButton", "COLLAPSIBLE",  // name of the object to make visible or invisible
                    { column: 1, alignment: go.Spot.Right }
                  )
                ), // end Table panel
                // with the list data bound in the Vertical Panel
                $(go.Panel, "Vertical",
                  { name: "COLLAPSIBLE",  // identify to the PanelExpanderButton
                    padding: 2,
                    stretch: go.GraphObject.Horizontal,  // take up whole available width
                    background: "white",  // to distinguish from the node's body
                    defaultAlignment: go.Spot.Left,  // thus no need to specify alignment on each element
                    itemTemplate: actionTemplate  // the Panel created for each item in Panel.itemArray
                  },
                  new go.Binding("itemArray", "actions")  // bind Panel.itemArray to nodedata.actions
                )  // end action list Vertical Panel
              )  // end optional Vertical Panel
            )  // end outer Vertical Panel
          ),  // end "BODY"  Auto Panel
          $(go.Panel,  // this is underneath the "BODY"
            { height: 15 },  // always this height, even if the TreeExpanderButton is not visible
            $("TreeExpanderButton")
          )
        );

      // define a second kind of Node:
      myDiagram.nodeTemplateMap.add("Terminal",
        $(go.Node, "Spot",
          { deletable: false },
          $(go.Shape, "Circle",
            { width: 100, height: 100, fill: greengrad, stroke: null }
          ),
          $(go.TextBlock,
            { font: "10pt Verdana, sans-serif" },
            new go.Binding("text")
          )
        )
      );

      myDiagram.linkTemplate =
        $(go.Link, go.Link.Orthogonal,
          { deletable: false, corner: 10 },
          $(go.Shape,
            { strokeWidth: 2 }
          ),
          $(go.TextBlock, go.Link.OrientUpright,
            { background: "white",
              visible: false,  // unless the binding sets it to true for a non-empty string
              segmentIndex: -2,
              segmentOrientation: go.Link.None
            },
            new go.Binding("text", "answer"),
            // hide empty string;
            // if the "answer" property is undefined, visible is false due to above default setting
            new go.Binding("visible", "answer", function(a) { return (a ? true : false); })
          )
        );

      var nodeDataArray = [
        { key: 1, label: "Cloud"},
        { key: 2, label: "asr1001-x.abc.inc"},
        { key: 3, label: "cs3850.abc.inc"},
        { key: 4, label: "cat_9k_1.abc.inc" },
        { key: 5, label: "cat_9k_2.abc.inc" },
        { key: 6, category: "Terminal", text: "10.10.22.98" },
        { key: 7, category: "Terminal", text: "10.10.22.114" }
      ];
      var linkDataArray = [
	    { from: 3, to: 4},
        { from: 3, to: 5},
        { from: 4, to: 6},
        { from: 1, to: 2},
        { from: 2, to: 3},
        { from: 5, to: 7}
      ];

      // create the Model with the above data, and assign to the Diagram
      /*myDiagram.model =
        $(go.GraphLinksModel,
          { nodeDataArray: nodeDataArray,
            linkDataArray: linkDataArray });*/
			
			
			
			var nodesData = {
    "response": {
        "nodes": [
            {
                "deviceType": "Cisco Catalyst 9300 Switch",
                "label": "cat_9k_2.abc.inc",
                "ip": "10.10.22.70",
                "softwareVersion": "16.6.1",
                "nodeType": "device",
                "family": "Switches and Hubs",
                "platformId": "C9300-24UX",
                "tags": [],
                "role": "ACCESS",
                "roleSource": "AUTO",
                "customParam": {},
                "additionalInfo": {
                    "macAddress": "f8:7b:20:71:4d:80",
                    "latitude": "-33.837053",
                    "siteid": "5f0c35d5-bc8f-4923-97e7-51a530393d15",
                    "longitude": "151.206266"
                },
                "id": "4757da48-3730-4833-86db-a0ebfbdf0009"
            },
            {
                "deviceType": "Cisco ASR 1001-X Router",
                "label": "asr1001-x.abc.inc",
                "ip": "10.10.22.74",
                "softwareVersion": "16.6.1",
                "nodeType": "device",
                "family": "Routers",
                "platformId": "ASR1001-X",
                "tags": [],
                "role": "BORDER ROUTER",
                "roleSource": "AUTO",
                "customParam": {},
                "additionalInfo": {
                    "macAddress": "00:c8:8b:80:bb:00",
                    "latitude": "-37.814542",
                    "siteid": "c0b7b7de-b96d-46c7-b494-336077d54b5b",
                    "fabricRoles": [
                        "BORDER",
                        "MAPSERVER",
                        "INTERMEDIATE"
                    ],
                    "longitude": "144.970501"
                },
                "id": "5337536f-0bb4-40eb-abd6-676894c9712c"
            },
            {
                "deviceType": "Cisco Catalyst 9300 Switch",
                "label": "cat_9k_1.abc.inc",
                "ip": "10.10.22.66",
                "softwareVersion": "16.6.1",
                "nodeType": "device",
                "family": "Switches and Hubs",
                "platformId": "C9300-24UX",
                "tags": [],
                "role": "ACCESS",
                "roleSource": "AUTO",
                "customParam": {},
                "additionalInfo": {
                    "macAddress": "f8:7b:20:67:62:80",
                    "latitude": "-33.837053",
                    "siteid": "5f0c35d5-bc8f-4923-97e7-51a530393d15",
                    "longitude": "151.206266"
                },
                "id": "7db64c76-60d6-4ba7-a3cd-3c9efe8b652b"
            },
            {
                "deviceType": "Cisco Catalyst38xx stack-able ethernet switch",
                "label": "cs3850.abc.inc",
                "ip": "10.10.22.69",
                "softwareVersion": "16.6.2s",
                "nodeType": "device",
                "family": "Switches and Hubs",
                "platformId": "WS-C3850-48U-E",
                "tags": [],
                "role": "DISTRIBUTION",
                "roleSource": "AUTO",
                "customParam": {},
                "additionalInfo": {
                    "macAddress": "cc:d8:c1:15:d2:80",
                    "latitude": "-33.837053",
                    "siteid": "5f0c35d5-bc8f-4923-97e7-51a530393d15",
                    "fabricRoles": [
                        "EDGE",
                        "BORDER",
                        "MAPSERVER",
                        "INTERMEDIATE"
                    ],
                    "longitude": "151.206266"
                },
                "id": "99b1ec00-3dcb-44b8-9b6e-2ad6fc141f36"
            },
            {
                "deviceType": "cloud node",
                "label": "cloud node",
                "ip": "UNKNOWN",
                "softwareVersion": "UNKNOWN",
                "nodeType": "cloud node",
                "family": "cloud node",
                "platformId": "UNKNOWN",
                "tags": [
                    "cloud node"
                ],
                "role": "cloud node",
                "roleSource": "AUTO",
                "customParam": {},
                "id": "2f24d45f-d457-42be-b84d-32c98fef9c3d"
            }
        ],
        "links": [
            {
                "source": "4757da48-3730-4833-86db-a0ebfbdf0009",
                "startPortID": "535d395d-f230-43d6-adf1-a65841a58eb9",
                "startPortName": "TenGigabitEthernet1/1/1",
                "startPortIpv4Address": "10.10.22.70",
                "startPortIpv4Mask": "255.255.255.252",
                "startPortSpeed": "10000000",
                "target": "99b1ec00-3dcb-44b8-9b6e-2ad6fc141f36",
                "endPortID": "b01a254f-c433-4953-ac74-304856d98477",
                "endPortName": "TenGigabitEthernet1/1/3",
                "endPortIpv4Address": "10.10.22.69",
                "endPortIpv4Mask": "255.255.255.252",
                "endPortSpeed": "10000000",
                "linkStatus": "up",
                "additionalInfo": {},
                "id": "188189"
            },
            {
                "source": "5337536f-0bb4-40eb-abd6-676894c9712c",
                "startPortID": "7359b20a-a42c-4580-966a-c15d332617aa",
                "startPortName": "TenGigabitEthernet0/0/1",
                "startPortIpv4Address": "10.10.22.74",
                "startPortIpv4Mask": "255.255.255.252",
                "startPortSpeed": "10000000",
                "target": "99b1ec00-3dcb-44b8-9b6e-2ad6fc141f36",
                "endPortID": "eaf256e8-8f8e-4cbd-a479-3aac9219f6bb",
                "endPortName": "TenGigabitEthernet1/1/1",
                "endPortIpv4Address": "10.10.22.73",
                "endPortIpv4Mask": "255.255.255.252",
                "endPortSpeed": "10000000",
                "linkStatus": "up",
                "additionalInfo": {},
                "id": "188190"
            },
            {
                "source": "7db64c76-60d6-4ba7-a3cd-3c9efe8b652b",
                "startPortID": "eaee1436-0461-40b1-83fe-4822b13ba481",
                "startPortName": "TenGigabitEthernet1/1/1",
                "startPortIpv4Address": "10.10.22.66",
                "startPortIpv4Mask": "255.255.255.252",
                "startPortSpeed": "10000000",
                "target": "99b1ec00-3dcb-44b8-9b6e-2ad6fc141f36",
                "endPortID": "53e2ff1e-90fe-4308-a0a6-1bd52dc5158d",
                "endPortName": "TenGigabitEthernet1/1/2",
                "endPortIpv4Address": "10.10.22.65",
                "endPortIpv4Mask": "255.255.255.252",
                "endPortSpeed": "10000000",
                "linkStatus": "up",
                "additionalInfo": {},
                "id": "188188"
            },
            {
                "source": "2f24d45f-d457-42be-b84d-32c98fef9c3d",
                "target": "5337536f-0bb4-40eb-abd6-676894c9712c",
                "linkStatus": "up"
            }
        ]
    },
    "version": "1.0"
  }
            var nodeDataList = [];
			var linkDataList = [];
            var nodes = nodesData.response.nodes;
		    var links = nodesData.response.links;
            var cloudKey;			
			for(i=0;i<nodes.length;i++){
			  var node = nodes[i];
			      node.key = node.id;
				  if(node.deviceType ==='cloud node'){
				    cloudKey = node.id;
				    node.isCloudNode = true;
				  }
			      nodeDataList.push(node);
			}
			for(i=0;i<links.length;i++){
			  var link = links[i];
			  var map = {};
			  map.from = link.source;
			  map.to = link.target;
			  if(cloudKey === link.source){
			     map.isCloudLink = true;
			  }
			  linkDataList.push(map);
			}
			
			for(i=0;i<linkDataList.length;i++){
			   if(linkDataList[i].isCloudLink){
			     var parentLink = linkDataList[i]; 
                 markThisTargetAsSource(linkDataList,parentLink);			 
			   }
			}
			//console.log('linkDataList:-'+JSON.stringify(linkDataList));
      myDiagram.model =
        $(go.GraphLinksModel,
          { nodeDataArray: nodeDataList,
            linkDataArray: linkDataList });
}
});
