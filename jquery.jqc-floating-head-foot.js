(function(
    $)
{
    var floatingList = [];

    function createContainer(
        class)
    {
        return $("<div>").addClass(class).css(
        {
            "position" : "absolute",
            "padding-left" : 0,
            "padding-right" : 0,
            "border-left" : 0,
            "border-right" : 0,
            "margin-left" : 0,
            "margin-right" : 0
        });
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
        result.css(
        {
            "padding-top" : 0,
            "padding-bottom" : 0,
            "border-top" : 0,
            "border-bottom" : 0,
            "margin" : 0
        });
        return result;
    }

    // Move thead/tfoot to the new scrolling position
    function moveHeadFoot()
    {
        for ( var i in floatingList)
        {
            var floating = floatingList[i];
            var tLimitPos = 0;
            var moveToLimit = false;
            var cssProperties =
            {
                top : "",
                bottom : ""
            };

            if (floating.t[0].tagName == "THEAD")
            {
                var tPos = $(window).scrollTop();
                tLimitPos = floating.t.offset().top + floating.t.outerHeight()
                    - floating.container.outerHeight(true);
                // thead is in its original position
                if (tPos < tLimitPos)
                    moveToLimit = true;
                else
                {
                    tLimitPos = floating.parent.offset().top
                        + floating.parent.outerHeight()
                        - floating.container.outerHeight(true);
                    if (tPos > tLimitPos)
                        moveToLimit = true;
                    else
                        cssProperties["top"] = 0;
                }
            }
            else if (floating.t[0].tagName == "TFOOT")
            {
                var tPos = $(window).scrollTop() + $(window).height()
                    - floating.container.outerHeight(true);
                tLimitPos = floating.t.offset().top;
                // tfoot is in its original position
                if (tPos > tLimitPos)
                    moveToLimit = true;
                else
                {
                    tLimitPos = floating.parent.offset().top;
                    if (tPos < tLimitPos)
                        moveToLimit = true;
                    else
                        cssProperties["bottom"] = 0;
                }
            }
            // thead/tfoot is in its original position
            if (moveToLimit)
            {
                if (floating.position != "absolute")
                {
                    floating.container.css($.extend(cssProperties,
                    {
                        position : "absolute",
                    }));
                    floating.position = "absolute";
                }
                floating.container.css("top", tLimitPos);
            }
            // thead/tfoot is in the top/bottom of the window
            else
            {
                if (floating.position != "fixed")
                {
                    floating.container.css($.extend(cssProperties,
                    {
                        position : "fixed"
                    }));
                    floating.position = "fixed";
                }
            }

            // Move container horizontally
            floating.container.css("left", floating.fitWith.offset().left
                - $(window).scrollLeft());

            // Move parent table horizontally
            floating.clonedParent.css("margin-left",
                floating.parent.offset().left
                    - floating.container.offset().left);
        }
    }

    // Resize thead/tfoot
    function resizeHeadFoot()
    {
        for ( var i in floatingList)
        {
            var floating = floatingList[i];
            var tColumns = floating.t.children().children("th,td");
            var tClonedColumns = floating.clonedParent.children().children()
                .children("th,td");

            // Expand container div
            floating.container.width(floating.fitWith.outerWidth());

            // Set cloned table width
            floating.clonedParent.width(floating.parent.outerWidth());

            // Set cloned table head cells width
            tClonedColumns.each(function(
                index)
            {
                var tClonedColumn = $(this);
                var theadColumn = tColumns.eq(index);
                tClonedColumn.width(theadColumn.width());
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

        this.each(function()
        {
            // Define new floating thead/tfoot
            if ($(this).is("thead") || $(this).is("tfoot"))
            {
                floatingList.push(
                {
                    refresh : true,
                    t : $(this)
                });
            }
        });

        var refresh = false;
        // Search for new floating thead/tfoot
        for ( var i in floatingList)
        {
            var floating = floatingList[i];

            // If new floating thead/tfoot
            if (floating.refresh)
            {
                refresh = true;
                floating.refresh = false;

                // Store fitWith parameter
                floating.fitWith = floating.t;
                if (localParams.fitWith != null)
                    floating.fitWith = localParams.fitWith;
                // Set state
                floating.position = "init";

                // Create a container
                floating.container = createContainer("floating_"
                    + floating.t[0].tagName.toLowerCase() + "_container");
                floating.container.appendTo($("body"));

                // Get parent table
                floating.parent = floating.t.parent("table");

                // Create a copy of the parent table
                floating.clonedParent = cloneTable(floating.parent,
                    floating.t[0].tagName);
                // Append cloned table to container
                floating.container.append(floating.clonedParent);

                // Hide original thead/tfoot
                floating.t.css("visibility", "hidden");
            }
        }

        if (refresh)
        {
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
