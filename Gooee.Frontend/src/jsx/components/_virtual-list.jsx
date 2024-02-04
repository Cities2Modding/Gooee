import React from "react";

const VirtualList = ({ className, contentClassName, data, onRenderItem, columns = 1, rows = 4, size = null }) => {
    const react = window.$_gooee.react;
    const scrollRef = react.useRef(null);
    const contentRef = react.useRef(null);
    const [visibleStartIndex, setVisibleStartIndex] = react.useState(0);
    const [visibleItemCount, setVisibleItemCount] = react.useState(0);
    const [thumbHeight, setThumbHeight] = react.useState(0);
    const [thumbTop, setThumbTop] = react.useState(0);
    const [mouseDown, setMouseDown] = react.useState(false);
    const [itemWidth, setItemWidth] = react.useState(`${100 / columns}%`);
    const [itemHeight, setItemHeight] = react.useState(`${100 / rows}%`);

    const sizeClass = size ? ` scrollable-${size}` : "";

    react.useEffect(() => {
        setItemWidth(`${100 / columns}%`);
        setItemHeight(`${100 / rows}%`);
        setVisibleItemCount((rows * columns));
    }, [columns, rows, itemWidth, itemHeight]);

    const onMouseWheel = (e) => {
        if (scrollRef.current) {
            //const viewableHeight = scrollRef.current.clientHeight;
            const totalRows = Math.ceil(data.length / rows * columns);

            var amt = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;

            if (amt != 0) {
                const startIndex = Math.min(totalRows - 1, Math.max(0, visibleStartIndex + (amt * columns)));

                //if (startIndex >= 0 && startIndex < data.length - 1 )
                setVisibleStartIndex(startIndex);

                //const itemHeightPx = viewableHeight / (rows * columns);

                //if (startIndex >= 0 && startIndex + ( rows * columns ) < data.length )
                setVisibleItemCount((rows * columns));
            }
            
        }
    };

    const calculateVisibleItems = () => {
        return;
        //if (scrollRef.current) {
        //    const viewableHeight = scrollRef.current.clientHeight;
        //    // Adjust totalItems calculation for multiple columns
        //    const totalRows = Math.ceil(data.length / columns);
        //    const totalContentHeight = totalRows * itemHeightPx;

        //    if (totalContentHeight <= viewableHeight) {
        //        setThumbHeight(0); // Hide thumb when content fits within viewable area
        //        setVisibleStartIndex(0);
        //        setVisibleItemCount(data.length);
        //    } else {

        //        // Calculate thumb height based on the proportion of viewable area to total content height
        //        const newThumbHeight = Math.max((viewableHeight / totalContentHeight) * viewableHeight, 30);
        //        const currentScrollPosition = scrollRef.current.scrollTop;
        //        let newThumbTop = (currentScrollPosition / totalContentHeight) * viewableHeight;

        //        if (newThumbTop + newThumbHeight > viewableHeight) {
        //            newThumbTop = viewableHeight - newThumbHeight;
        //        }

        //        setThumbHeight(newThumbHeight);
        //        setThumbTop(newThumbTop);

        //        const startIndex = Math.floor((currentScrollPosition / itemHeightPx) * columns);
        //        const endIndex = Math.min(data.length, startIndex + Math.ceil((viewableHeight / itemHeightPx) * columns));

        //        //setVisibleStartIndex(startIndex);
        //        //setVisibleItemCount(endIndex - startIndex);
        //    }
        //}
    };

    react.useEffect(() => {
        calculateVisibleItems();
        
        window.addEventListener("wheel", onMouseWheel);

        return () => {
            window.removeEventListener("wheel", onMouseWheel);
        }

    }, [data, rows, visibleStartIndex]);

    const onMouseMove = (e) => {
        //if (!mouseDown)
        //    return;

        //if (scrollRef.current && contentRef.current) {
        //    const viewableHeight = scrollRef.current.clientHeight;
        //    const totalContentHeight = contentRef.current.scrollHeight;
        //    scrollRef.current.scrollTop += (e.movementY / viewableHeight) * totalContentHeight;
        //    //calculateThumbSizeAndPosition();
        //    calculateVisibleItems();
        //}
    };

    const onMouseUp = (e) => {
        //if (mouseDown) {
        //    setMouseDown(false);
        //}
    };

    const onMouseDown = (e) => {
        //if (!mouseDown) {
        //    setMouseDown(true);
        //    return true;
        //}
    };

    const onMouseEnter = (e) => {
        //if (e.target !== e.currentTarget)
        //    return;

        //engine.trigger("audio.playSound", "hover-item", 1);
    };

    const onTrackMouseDown = (e) => {
        //if (e.target != e.currentTarget)
        //    return;
        //if (scrollRef.current && contentRef.current) {
        //    const viewableHeight = scrollRef.current.clientHeight;
        //    const totalContentHeight = contentRef.current.scrollHeight;
        //    var rect = scrollRef.current.getBoundingClientRect();
        //    scrollRef.current.scrollTop = ((e.screenY - Math.round(rect.top)) / viewableHeight) * totalContentHeight;
        //    //calculateThumbSizeAndPosition();
        //    calculateVisibleItems();
        //    setMouseDown(true);
        //}
    };

    const thumbContent = thumbHeight > 0 ? <div className="track" onMouseDown={onTrackMouseDown}>
        <div className="thumb" onMouseEnter={onMouseEnter} onMouseDown={onMouseDown} style={{ height: `${thumbHeight}px`, top: `${thumbTop}px` }}></div>
    </div> : <></>;

    react.useEffect(() => {
        //calculateThumbSizeAndPosition();
        calculateVisibleItems();
        window.addEventListener("resize", calculateVisibleItems);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("resize", calculateVisibleItems);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [data]); // Add these dependencies to recalculate when they change
    
    const visibleChildren = data.slice(visibleStartIndex, visibleStartIndex + visibleItemCount);

    const classNames = "scrollable vertical no-overflow" + (thumbHeight <= 0 + sizeClass + (className ? " " + className : ""));

    return (
        <div className={classNames} onMouseOver={calculateVisibleItems}>
            <div ref={scrollRef} onScroll={calculateVisibleItems} className="content">
                <div ref={contentRef} className={(contentClassName ? contentClassName : "") + " h-x flex-1"}>
                    {visibleChildren.map((child, index) => (<div style={{ width: itemWidth, height: itemHeight }} key={index}>{onRenderItem(child, index)}</div>))}
                </div>
            </div>
            {thumbContent}
        </div>
    );
}

export default VirtualList;
