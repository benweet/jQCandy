(function(
    $)
{

    var floatingThead = null;
    var floatingTfoot = null;
    var theadContainer = null;
    var tfootContainer = null;
    var theadFitWith = null;
    var tfootFitWith = null;
    var theadParentTable = null;
    var tfootParentTable = null;
    var clonedTheadParentTable = null;
    var clonedTfootParentTable = null;
    var theadAnimationSpeed = 0;
    var tfootAnimationSpeed = 0;

    function createContainer(
        id,
        topPosition,
        leftPosition)
    {
        return $("<div>").attr("id", id).css("position", "absolute").css(
            "padding-left", 0).css("padding-right", 0).css("border-left", 0)
            .css("border-right", 0).css("margin-left", 0)
            .css("margin-right", 0).css("top", topPosition).css("left",
                leftPosition);
    }

    function animateContainer(
        container,
        topPosition,
        leftPosition,
        speed)
    {
        container.stop().css("left", leftPosition);
        if (speed == 0)
            container.css("top", topPosition);
        else
            container.animate(
            {
                "top" : topPosition
            }, speed);
    }

    function cloneTable(
        table,
        keepTag)
    {
        // Create a copy of the table
        var result = table.clone();
        // Keep only keepTag
        result.children(":not(" + keepTag + ")").remove();
        // Remove all duplicated ids in cloned table
        result.find("*").andSelf().removeAttr('id');
        // Remove unwanted css properties
        result.css("padding-top", 0).css("padding-bottom", 0).css("border-top",
            0).css("border-bottom", 0).css("margin", 0);
        return result;
    }

    function setClonedTableMarginLeft(
        clonedTable,
        originalTable,
        container)
    {
        clonedTable.css("margin-left", originalTable.offset().left
            - container.offset().left);
    }

    function moveHeadFoot()
    {
        // Move thead to new scrolling position
        if (theadContainer != null)
        {
            var theadPos = $(window).scrollTop();
            var minTheadPos = floatingThead.offset().top
                + floatingThead.outerHeight()
                - theadContainer.outerHeight(true);
            // thead is in its original position
            if (theadPos < minTheadPos)
                animateContainer(theadContainer, minTheadPos, theadFitWith
                    .offset().left, theadAnimationSpeed);
            // thead is in the top of the window
            else
                animateContainer(theadContainer, theadPos, theadFitWith
                    .offset().left, theadAnimationSpeed);

            // Move thead horizontally
            setClonedTableMarginLeft(clonedTheadParentTable, theadParentTable,
                theadContainer);
        }

        // Move tfoot to new scrolling position
        if (tfootContainer != null)
        {
            var tfootPos = $(window).scrollTop() + $(window).height()
                - tfootContainer.outerHeight(true);
            var maxTfootPos = floatingTfoot.offset().top;
            // tfoot is in its original position
            if (tfootPos > maxTfootPos)
                animateContainer(tfootContainer, maxTfootPos, tfootFitWith
                    .offset().left, tfootAnimationSpeed);
            // tfoot is in the bottom of the window
            else
                animateContainer(tfootContainer, tfootPos, tfootFitWith
                    .offset().left, tfootAnimationSpeed);

            // Move tfoot horizontally
            setClonedTableMarginLeft(clonedTfootParentTable, tfootParentTable,
                tfootContainer);
        }
    }

    function resizeHeadFoot()
    {
        // Resize thead
        if (theadContainer != null)
        {
            var theadColumns = floatingThead.children().children("th,td");
            var clonedThead = clonedTheadParentTable.children("thead");
            var clonedTheadColumns = clonedThead.children().children("th,td");

            // Expand container div
            theadContainer.width(theadFitWith.outerWidth());

            // Set cloned table width
            clonedTheadParentTable.width(theadParentTable.outerWidth());

            // Set cloned table head cells width
            clonedTheadColumns.each(function(
                index)
            {
                var clonedTheadColumn = $(this);
                var theadColumn = theadColumns.eq(index);
                clonedTheadColumn.width(theadColumn.width());
            });
        }

        // Resize tfoot
        if (tfootContainer != null)
        {
            var tfootColumns = floatingTfoot.children().children("th,td");
            var clonedTfoot = clonedTfootParentTable.children("tfoot");
            var clonedTfootColumns = clonedTfoot.children().children("th,td");

            // Expand container div
            tfootContainer.width(tfootFitWith.outerWidth());

            // Set cloned table width
            clonedTfootParentTable.width(tfootParentTable.outerWidth());

            // Set cloned table foot cells width
            clonedTfootColumns.each(function(
                index)
            {
                var clonedTfootColumn = $(this);
                var tfootColumn = tfootColumns.eq(index);
                clonedTfootColumn.width(tfootColumn.width());
            });
        }
    }

    $.fn.floatingHeadFoot = function(
        params)
    {

        // Setting up default parameters
        var localParams = $.extend(
        {
            speed : 500, // animation speed
            fitWith : null, // container alignment and width
            windowScrollCallback : function()
            {
            },
            windowResizeCallback : function()
            {
            }
        }, params);

        var refreshTfoot = false;
        var refreshThead = false;
        this.each(function()
        {

            // Define new floating thead
            if ($(this).is("thead"))
            {
                refreshThead = true;
                floatingThead = $(this);
            }

            // Define new floating tfoot
            else if ($(this).is("tfoot"))
            {
                refreshTfoot = true;
                floatingTfoot = $(this);
            }
        });

        // If new floating thead/tfoot has been defined
        if (refreshTfoot || refreshThead)
        {
            // If new floating thead has been defined
            if (refreshThead)
            {
                // Remove old #floating_head_container div
                if (theadContainer != null)
                    theadContainer.remove();

                // Store animation speed parameter
                theadAnimationSpeed = localParams.speed;
                // Store parent of #floating_head_container div
                theadFitWith = floatingThead;
                if (localParams.fitWith != null)
                    theadFitWith = localParams.fitWith;

                // Create #floating_head_container div
                theadContainer = createContainer("floating_head_container",
                    floatingThead.offset().top, theadFitWith.offset().left);
                theadContainer.appendTo($("body"));

                // Get parent table of thead
                theadParentTable = floatingThead.parent("table");

                // Create a copy of the thead parent table
                clonedTheadParentTable = cloneTable(theadParentTable, "thead");
                // Align cloned table horizontally
                setClonedTableMarginLeft(clonedTheadParentTable,
                    theadParentTable, theadContainer);
                // Append cloned table to #floating_head_container
                theadContainer.append(clonedTheadParentTable);

                // Hide original thead
                floatingThead.css("visibility", "hidden");
            }

            // If new floating tfoot has been defined
            if (refreshTfoot)
            {
                // Remove old #floating_foot_container div
                if (tfootContainer != null)
                    tfootContainer.remove();

                // Store animation speed parameter
                tfootAnimationSpeed = localParams.speed;
                // Store fitWith parameter
                tfootFitWith = floatingTfoot;
                if (localParams.fitWith != null)
                    tfootFitWith = localParams.fitWith;

                // Create #floating_foot_container div
                tfootContainer = createContainer("floating_foot_container",
                    floatingTfoot.offset().top, tfootFitWith.offset().left);
                tfootContainer.appendTo($("body"));

                // Get parent table of tfoot
                tfootParentTable = floatingTfoot.parent("table");

                // Create a copy of the tfoot parent table
                clonedTfootParentTable = cloneTable(tfootParentTable, "tfoot");
                // Align cloned table horizontally
                setClonedTableMarginLeft(clonedTfootParentTable,
                    tfootParentTable, tfootContainer);
                // Append cloned table to #floating_foot_container
                tfootContainer.append(clonedTfootParentTable);

                // Hide original tfoot
                floatingTfoot.css("visibility", "hidden");
            }

            // Resize new floating thead/tfoot columns
            resizeHeadFoot();

            // Move new floating thead/tfoot container
            moveHeadFoot();

            // Window scroll callback
            $(window).scroll(function()
            {

                // Move the thead/tfoot containers
                moveHeadFoot();

                // User callback
                if (typeof localParams.windowScrollCallback == "function")
                {
                    localParams.windowScrollCallback.call(this);
                }
            });

            // Window resize callback
            $(window).resize(function()
            {

                // Resize the thead/tfoot columns
                resizeHeadFoot();

                // Move the thead/tfoot containers
                moveHeadFoot();

                // User callback
                if (typeof localParams.windowResizeCallback == "function")
                {
                    localParams.windowResizeCallback.call(this);
                }
            });
        }
    };

})(jQuery);
