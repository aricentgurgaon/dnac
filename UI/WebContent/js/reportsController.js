var app = angular.module('myApp')
app.controller('ReportsController', function($scope, $rootScope, $stateParams, $state, $http,$location,$cookies, cfg) {
	$scope.username = $cookies.username;
	console.log("username---- "+ $scope.username);
	  if(!$scope.username){
		  $location.path('/login/');
	  }
	$scope.myDiagram='';
	$('#myDiagramDiv').hide();
	$scope.templateList = [];
	//$scope.hostList =[];
	$scope.hostId ='';
	$scope.template = '';
	console.log("inside reports controller");
	$scope.nodesData = '';
	
	 $http({
        url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/template',
        method: "GET",
        headers: {'Content-Type': 'application/json'}
    })
    .then(function(response) {
		console.log(response);
		for (var i=0;i<response.data.length;i++){
			if(response.data[i].templateName)
				$scope.templateList.push(response.data[i]);
		}
		console.log($scope.templateList);
        }, 
        function(response) { // optional
            // failed
        	console.log(response);
			console.log("failed to post");
        });
	 
	 //API to get all DNA host configured..
	 $http({
	        url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/config',
	        method: "GET",
	        headers: {'Content-Type': 'application/json'}
	    })
	    .then(function(response) {
			console.log(response);
			/*for (var i=0;i<response.data.length;i++){
				$scope.hostList.push(response.data[i]._id);
			}*/
			$scope.hostId = response.data[0]._id;
			console.log($scope.hostId);
	        }, 
	        function(error) {
	            // failed
	        	console.log(error);
				console.log("failed to get");
	        });
	
	$scope.run = function(){
		var data = $scope.template;
		console.log("template   "+data);
		console.log("dna host id ==  "+$scope.hostId);
		 $http({
			url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/'+$scope.hostId+'/topology',
	        method: "GET",
	        //data: data,
	        //headers: {'Content-Type': 'application/json'}
	        headers: {'Authorization':'Basic ZGV2bmV0dXNlcjpDaXNjbzEyMyE=','Content-Type': 'application/json','Access-Control-Allow-Origin':'*'}
	    })
	    .then(function(response) {
	    	console.log("success");
			console.log(response);
			$scope.nodesData = response.data;
			console.log($scope.nodesData);
			$('#myDiagramDiv').show();
			$scope.init();
	        }, 
	        function(error) { // optional
	            // failed
	        	console.log(error);
				console.log("failed to post");
	        }
	    );
	}

	$scope.markThisTargetAsSource = function(linkDataList,parentLink){
				 for(j=0;j<linkDataList.length;j++){
				  if(linkDataList[j].from !=parentLink.from){
				     if(parentLink.to === linkDataList[j].to){
					    linkDataList[j].to = linkDataList[j].from;
					    linkDataList[j].from = parentLink.to;
					 }else if(parentLink.to === linkDataList[j].from){
					   var node = linkDataList[j];
					   $scope.markThisTargetAsSource(linkDataList,node);
					 }
				   }
		    }
		}
	    $scope.init = function() {var $ = go.GraphObject.make;  // for conciseness in defining templates
	    if($scope.myDiagram != ''){
	    	$scope.myDiagram.div =null;
	    }
	    $scope.myDiagram =
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
	        var bluegrad = $(go.Brush, "Linear", { 0: "#70D4FF", 1: "#70D4FF" });
	        var greengrad = $(go.Brush, "Linear", { 0: "#B1E2A5", 1: "#7AE060" });
	        // each regular Node has body consisting of a title followed by a collapsible list of actions,
	        // controlled by a PanelExpanderButton, with a TreeExpanderButton underneath the body
	        $scope.myDiagram.nodeTemplate =  // the default node template
	          $(go.Node, "Vertical",
	            { selectionObjectName: "BODY", deletable: false },
	            // the main "BODY" consists of a RoundedRectangle surrounding nested Panels
	            $(go.Panel, "Auto",
	              { name: "BODY" },
	              /*$(go.Shape, "Rectangle",
	                { fill: bluegrad, stroke: null }
	              ),*/
	              $(go.Panel, "Vertical",
	                { margin: 3 },
	                // the title
	                $(go.Picture,
	                		//{background:"white"},
	                		new go.Binding("source", "image")),
	                $(go.TextBlock,
	                        { stretch: go.GraphObject.Horizontal,
	                         //font: "bold 12pt Verdana, sans-serif",background:'#70D4FF',text: "textAlign: 'center'"
	        	             font: "bold 10pt Verdana, sans-serif",width: 150,text: "textAlign: 'center'"
	                        },
	                        new go.Binding("text", "label"),
	        	new go.Binding("visible", "label", function(label) { return (label ==='cloud node' ? false : true); }),
	        	new go.Binding("stroke", "color", function (clr) {
	        	  if (clr ==='red') {
	        	return "red";
	        	  } 
	        	})
	           )
	  			  //$(go.Picture, "../assets/images/Cloud_128x128.png"),
	              )  // end outer Vertical Panel
	            ),  // end "BODY"  Auto Panel
	            $(go.Panel,  // this is underneath the "BODY"
	              { height: 15 },  // always this height, even if the TreeExpanderButton is not visible
	              $("TreeExpanderButton")
	            ),
	  		  {
	  			 toolTip:
	  			  $(go.Adornment, "Auto",
	  			    //#F4E71A,#FFC300,#DAF7A6
	  				$(go.Shape, { fill: "#F4E71A" }),
	  				$(go.TextBlock, { margin: 10,font: "italic 10pt sans-serif"},
	  				  new go.Binding("text", "",diagramInfo))
	  			  )  
	             }
	          );
	  // a function that produces the content of the diagram tooltip
	    function diagramInfo(model) {
	       if(model.label ==='cloud node')
	  	 return model.deviceType+"\n\nThe Internet\n\n"+"IP Address:"+ model.ip + "\n\nNetwork Role:"+model.role;
	      return model.deviceType+"\n\n"+model.label +"\n\n"+"IP Address:"+ model.ip + "\n\nNetwork Role:"+model.role;
	    }
	        // define a second kind of Node:
	    $scope.myDiagram.nodeTemplateMap.add("WIRED",
	          $(go.Node, "Spot",
	            { deletable: false },
	            /*$(go.Shape, "circle",
	              { width: 100, height: 100, fill: bluegrad, stroke: null }
	            ),*/
	  		 //$(go.Picture,'assets/images/Desktop48x48.png'),
	            $(go.Picture,'assets/images/wireddeviceicon.png'),
	            $(go.TextBlock,
	              //{ font: "10pt Verdana, sans-serif",textAlign :"center"},
	            	{font: "bold 10pt Verdana, sans-serif",width: 150},
	              new go.Binding("text","label")
	            ),
	  		  {
	  			 toolTip:
	  			  $(go.Adornment, "Auto",
	  			    //#F4E71A,#FFC300,#DAF7A6
	  				$(go.Shape, { fill: "#F4E71A" }),
	  				$(go.TextBlock, { margin: 10,font: "italic 10pt sans-serif"},
	  				  new go.Binding("text", "",diagramInfo))
	  			  )  
	             }
	          )
	        );

	    $scope.myDiagram.linkTemplate =
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
	              }
	            )
	          );
	              var nodeDataList = [];
	  			var linkDataList = [];
	              var nodes = $scope.nodesData.nodes;
	  		    var links = $scope.nodesData.links;
	              var cloudKey;			
	  			for(i=0;i<nodes.length;i++){
	  			  var node = nodes[i];
	  			      node.key = node.id;
	  				  if(node.deviceType ==='cloud node'){
	  				    cloudKey = node.id;
	  				    node.isCloudNode = true;
	  					node.image='assets/images/cloud.png';
	  				  }
	  				else if(i==2||i==3){
	  				   node.color='red';
	  				  }
	  				  
	  				  if(node.deviceType.toLowerCase().indexOf("switch")!=-1){
	  				    node.image='assets/images/switchicon.png';
	  				  }else if(node.deviceType.toLowerCase().indexOf("router")!=-1){
	  				   node.image='assets/images/routericon.png';
	  				  }
	  				  if(node.family ==='WIRED'){
	  				    node.category = 'WIRED';
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
	                   $scope.markThisTargetAsSource(linkDataList,parentLink);			 
	  			   }
	  			}
	  			//console.log('linkDataList:-'+JSON.stringify(linkDataList));
	  		$scope.myDiagram.model =
	          $(go.GraphLinksModel,
	            { nodeDataArray: nodeDataList,
	              linkDataArray: linkDataList });
	          // console.log('myDiagram.div = '+myDiagram.div);
	}
});
