(function($){
    
    var floatingThead = null;
    var floatingTfoot = null;
    var theadContainer = null;
    var tfootContainer = null;
    var theadParentTable = null;
    var tfootParentTable = null;
    var clonedTheadParentTable = null;
    var clonedTfootParentTable = null;
    var theadAnimationSpeed = 0;
    var tfootAnimationSpeed = 0;
    var expandTheadContainer = false;
    var expandTfootContainer = false;

    function moveHeadFoot()
    {
        // Move thead to new scrolling position
        if(theadContainer != null)
        {
            var theadPos = $(window).scrollTop();
            var minTheadPos = floatingThead.offset().top + theadContainer.innerHeight() - theadContainer.outerHeight(true);
            // thead is in its original position
            if(theadPos < minTheadPos)
                theadContainer.stop().animate(
                    {
                        "top": minTheadPos
                    }, theadAnimationSpeed);
            // thead is in the top of the window
            else
                theadContainer.stop().animate(
                    {
                        "top":(theadPos)
                    }, theadAnimationSpeed);
        }
        
        // Move tfoot to new scrolling position
        if(tfootContainer != null)
        {
        	var tfootPos = $(window).scrollTop() + $(window).height() - tfootContainer.outerHeight(true);
            var maxTfootPos = floatingTfoot.offset().top;
            // tfoot is in its original position
            if(tfootPos > maxTfootPos)
                tfootContainer.stop().animate(
                    {
                        "top": maxTfootPos
                    }, tfootAnimationSpeed);
            // tfoot is in the bottom of the window
            else
                tfootContainer.stop().animate(
                    {
                        "top":(tfootPos)
                    }, tfootAnimationSpeed);
        }
    }
    
    function resizeHeadFoot()
    {
        // Resize thead
        if(theadContainer != null)
        {
            var theadColumns = floatingThead.children().children("th,td");
            var clonedThead = clonedTheadParentTable.children("thead");
            var clonedTheadColumns = clonedThead.children().children("th,td");
            
            // Expand container div
            if(expandTheadContainer)
            {
                if(theadParentTable.outerWidth(true) + theadParentTable.offset().left > $(window).width())
                    theadContainer.width(theadParentTable.outerWidth(true) + theadParentTable.offset().left - theadContainer.offset().left);
                else
                    theadContainer.width($(window).width() - theadContainer.offset().left);
            }
            
            // Set cloned table width
            clonedTheadParentTable.width(theadParentTable.outerWidth());
            
            // Set cloned table head cells width
            clonedTheadColumns.each( function(index) {
                var clonedTheadColumn = $(this);
                var theadColumn = theadColumns.eq(index);
                clonedTheadColumn.width(theadColumn.width());
            });
        }
        
        // Resize tfoot
        if(tfootContainer != null)
        {
            var tfootColumns = floatingTfoot.children().children("th,td");
            var clonedTfoot = clonedTfootParentTable.children("tfoot");
            var clonedTfootColumns = clonedTfoot.children().children("th,td");
            
            // Expand container div
            if(expandTfootContainer)
            {
                if(tfootParentTable.outerWidth(true) + tfootParentTable.offset().left > $(window).width())
                    tfootContainer.width(tfootParentTable.outerWidth(true) + tfootParentTable.offset().left - tfootContainer.offset().left);
                else
                    tfootContainer.width($(window).width() - tfootContainer.offset().left);
            }
            
            // Set cloned table width
            clonedTfootParentTable.width(tfootParentTable.outerWidth());
            
            // Set cloned table foot cells width
            clonedTfootColumns.each( function(index) {
                var clonedTfootColumn = $(this);
                var tfootColumn = tfootColumns.eq(index);
                clonedTfootColumn.width(tfootColumn.width());
            });
        }
    }
    
	$.fn.floatingHeadFoot = function(params) {
        
        // Setting up default parameters
		var localParams = $.extend( {
			speed: 500, // animation speed
            expand: false,
			appendTo: $("body"),
            windowScrollCallback: function() {},
            windowResizeCallback: function() {}
		}, params);
        
        var refreshTfoot = false;
        var refreshThead = false;
		this.each(function() {
    
            // Define new floating thead
            if($(this).is("thead"))
            {
                refreshThead = true;
                floatingThead = $(this);
            }
            
            // Define new floating tfoot
            else if($(this).is("tfoot"))
            {
                refreshTfoot = true;
                floatingTfoot = $(this);
            }
        });
        
        // If new floating thead/tfoot has been defined
        if(refreshTfoot || refreshThead)
        {
            // If new floating thead has been defined
            if(refreshThead)
            {
                // Remove old #floating_head_container div
                if(theadContainer != null)
                    theadContainer.remove();
                
                // Store animation speed parameter
                theadAnimationSpeed = localParams.speed;
                // Store expand parameter
                expandTheadContainer = localParams.expand;

                // Create #floating_head_container div
                theadContainer = $("<div>")
                    .attr("id", "floating_head_container")
                    .css("position", "absolute")
            		.css("padding-left", 0)
            		.css("padding-right", 0)
            		.css("border-left", 0)
            		.css("border-right", 0)
                    .css("top", floatingThead.offset().top);
                theadContainer.appendTo(localParams.appendTo);
                        
                // Get parent table of thead
                theadParentTable = floatingThead.parent("table");
                
                // Create a copy of the thead parent table
                clonedTheadParentTable = theadParentTable.clone();
                // Keep only thead in cloned table
                clonedTheadParentTable.children(":not(thead)").remove();
                // Remove all duplicated ids in cloned table
                clonedTheadParentTable.find("*").andSelf().removeAttr('id');
                // Append cloned table to #floating_head_container
                theadContainer.append(
                    $("<div>")
                        .css("margin-left", theadParentTable.offset().left - theadContainer.offset().left)
                        .append(clonedTheadParentTable
                        		.css("padding-top", 0)
                        		.css("padding-bottom", 0)
                        		.css("border-top", 0)
                        		.css("border-bottom", 0)
                        		.css("margin", 0)
                        )
                    );
                
                // Hide original thead
                floatingThead.css("visibility", "hidden");
            }
            
            // If new floating tfoot has been defined
            if(refreshTfoot)
            {
                // Remove old #floating_foot_container div
                if(tfootContainer != null)
                    tfootContainer.remove();
                
                // Store animation speed parameter
                tfootAnimationSpeed = localParams.speed;
                // Store expand parameter
                expandTfootContainer = localParams.expand;

                // Create #floating_foot_container div
                tfootContainer = $("<div>")
                    .attr("id", "floating_foot_container")
                    .css("position", "absolute")
                    .css("padding-left", 0)
                    .css("padding-right", 0)
            		.css("border-left", 0)
            		.css("border-right", 0)
                    .css("top", floatingTfoot.offset().top);
                tfootContainer.appendTo(localParams.appendTo);
                        
                // Get parent table of tfoot
                tfootParentTable = floatingTfoot.parent("table");
                
                // Create a copy of the tfoot parent table
                clonedTfootParentTable = tfootParentTable.clone();
                // Keep only tfoot in cloned table
                clonedTfootParentTable.children(":not(tfoot)").remove();
                // Remove all duplicated ids in cloned table
                clonedTfootParentTable.find("*").andSelf().removeAttr('id');
                // Append cloned table to #floating_foot_container
                tfootContainer.append(
                    $("<div>")
                        .css("margin-left", tfootParentTable.offset().left - tfootContainer.offset().left)
                        .append(clonedTfootParentTable
                        		.css("padding-top", 0)
                        		.css("padding-bottom", 0)
                        		.css("border-top", 0)
                        		.css("border-bottom", 0)
                        		.css("margin", 0)
                   		)
                    );
                
                // Hide original tfoot
                floatingTfoot.css("visibility", "hidden");
            }
            
            // Resize new floating thead/tfoot columns
            resizeHeadFoot();
            
            // Move new floating thead/tfoot container
            moveHeadFoot();

            // Window scroll callback
            $(window).scroll(function() {
                
                // Move the thead/tfoot containers
                moveHeadFoot();
                
                // User callback
                if (typeof localParams.windowScrollCallback == "function") {
                	localParams.windowScrollCallback.call(this);
                }
            });
            
            // Window resize callback
            $(window).resize(function() {
                
                // Resize the thead/tfoot columns
                resizeHeadFoot();
                
                // Move the thead/tfoot containers
                moveHeadFoot();
                
                // User callback
                if (typeof localParams.windowResizeCallback == "function") {
                	localParams.windowResizeCallback.call(this);
                }
            });            
        }
	};
    
})(jQuery);
