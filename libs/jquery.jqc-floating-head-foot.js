(function(
    $)
{
    var floatingList = [];
    var fixedPosition = true;

    function createContainer(
        className)
    {
        return $("<div>").addClass(className).css(
        {
            paddingLeft : 0,
            paddingRight : 0,
            borderLeft : 0,
            borderRight : 0,
            marginLeft : 0,
            marginRight : 0
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
        // Remove table duplicated id
        result.removeAttr('id');
        // Remove unwanted css properties
        result.css(
        {
            paddingTop : 0,
            paddingBottom : 0,
            borderTop : 0,
            borderBottom : 0,
            margin : 0
        });
        // Remove all duplicated ids in original thead/tfoot
        table.children(keepTag).find("*").andSelf().removeAttr('id');
        // Return duplicated table
        return result;
    }

    // Move thead/tfoot to the new scrolling position
    function moveHeadFoot()
    {
        for ( var i in floatingList)
        {
            var floating = floatingList[i];
            var newPosition = "";
            var forceUpdate = true;
            var cssProperties =
            {
                position : "absolute",
                top : "",
                bottom : ""
            };

            if (floating.t[0].tagName == "THEAD")
            {
                var tPos = $(window).scrollTop();
                var tOriginPos = floating.t.offset().top
                    + floating.t.outerHeight()
                    - floating.container.outerHeight(true);
                var tOppositePos = floating.parent.offset().top
                    + floating.parent.outerHeight()
                    - floating.container.outerHeight(true);

                // thead is at its original position
                if (tPos < tOriginPos)
                {
                    newPosition = "origin";
                    cssProperties["top"] = tOriginPos;
                }
                // thead is at the bottom of the table
                else if (tPos > tOppositePos)
                {
                    newPosition = "opposite";
                    cssProperties["top"] = tOppositePos;
                }
                // thead is fixed on top of the browser
                else
                {
                    newPosition = "fix-top";
                    if (fixedPosition)
                    {
                        forceUpdate = false;
                        cssProperties["position"] = "fixed";
                        cssProperties["top"] = 0;
                    }
                    // Unsupported fixed position
                    else
                    {
                        cssProperties["top"] = tPos;
                    }
                }
            }
            else if (floating.t[0].tagName == "TFOOT")
            {
                var tPos = $(window).scrollTop() + $(window).height()
                    - floating.container.outerHeight(true);
                var tOriginPos = floating.t.offset().top;
                var tOppositePos = floating.parent.offset().top;

                // tfoot is at its original position
                if (tPos > tOriginPos)
                {
                    newPosition = "origin";
                    cssProperties["top"] = tOriginPos;
                }
                // tfoot is at the top of the table
                else if (tPos < tOppositePos)
                {
                    newPosition = "opposite";
                    cssProperties["top"] = tOppositePos;
                }
                // tfoot is fixed on bottom of the browser
                else
                {
                    newPosition = "fix-btm";
                    if (fixedPosition)
                    {
                        forceUpdate = false;
                        cssProperties["position"] = "fixed";
                        cssProperties["bottom"] = 0;
                    }
                    // Unsupported fixed position
                    else
                    {
                        cssProperties["top"] = tPos;
                    }
                }
            }

            // Update div CSS properties
            if (forceUpdate || floating.position != newPosition)
            {
                floating.div.css(cssProperties);
                floating.position = newPosition;
            }

            // Move container horizontally
            floating.container.css("margin-left", floating.fitIn.offset().left
                - floating.div.offset().left);
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

            // Expand container
            floating.container.width(floating.fitIn.outerWidth());

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

            // Move parent table horizontally
            floating.clonedParent.css("margin-left",
                floating.parent.offset().left
                    - floating.container.offset().left);
        }
    }

    $.fn.floatingHeadFoot = function(
        params)
    {
        // Setting up default parameters
        var localParams = $.extend(
        {
            fitIn : null, // container alignment and width
            windowScrollCallback : null,
            windowResizeCallback : null
        }, params);

        // IE 6 detection
        if ($.browser.msie && parseInt($.browser.version, 10) < 7)
        {
            fixedPosition = false;
        }

        var refresh = false;
        this.each(function()
        {
            // Define new floating thead/tfoot
            if ($(this).is("thead") || $(this).is("tfoot"))
            {
                refresh = true;
                var floating =
                {
                    t : $(this), // thead/tfoot
                    parent : $(this).parent("table"), // Parent table
                    fitIn : $(this), // fitIn
                    position : "init", // Initial state
                    div : $("<div>").appendTo($("body"))
                };

                // Store fitIn parameter
                if (localParams.fitIn != null)
                    floating.fitIn = localParams.fitIn;

                // Create the container
                floating.container = createContainer(
                    "floating_" + floating.t[0].tagName.toLowerCase()
                        + "_container").appendTo(floating.div);
                // Create a copy of the parent table
                floating.clonedParent = cloneTable(floating.parent,
                    $(this)[0].tagName);
                // Append cloned table to container
                floating.container.append(floating.clonedParent);

                // Hide original thead/tfoot
                floating.t.css("visibility", "hidden");

                // Store floating head/foot into floatingList
                floatingList.push(floating);
            }
        });

        if (refresh)
        {
            // Move new floating thead/tfoot container
            moveHeadFoot();

            // Resize new floating thead/tfoot columns
            resizeHeadFoot();

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
                // Move the thead/tfoot containers
                moveHeadFoot();

                // Resize the thead/tfoot columns
                resizeHeadFoot();

                // User callback
                if (typeof localParams.windowResizeCallback == "function")
                {
                    localParams.windowResizeCallback.call(this);
                }
            });
        }
    };

})(jQuery);
