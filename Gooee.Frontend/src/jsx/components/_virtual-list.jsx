import React from "react";

const VirtualList = ({ className, contentClassName, border = null, data, onRenderItem, columns = 1, rows = 4, size = null, watch = [] }) => {
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
    const [itemCount, setItemCount] = react.useState(data ? data.length : 0);    

    const [batchCount, setBatchCount] = react.useState(rows * columns);
    const [batchSize, setBatchSize] = react.useState(batchCount / data.length);
    const [totalRowCount, setTotalRowCount] = react.useState(data.length / columns);
    const sizeClass = size ? ` scrollable-${size}` : "";

    react.useEffect(() => {
        setItemWidth(`${100 / columns}%`);
        setItemHeight(`${100 / rows}%`);

        const newBatchCount = (rows * columns);
        setVisibleItemCount(newBatchCount);
        setBatchCount(newBatchCount);

        const newBatchSize = newBatchCount / data.length;
        setBatchSize(newBatchSize);
        setTotalRowCount(data.length / columns);

        clampValues(visibleStartIndex);
    }, [columns, rows, itemWidth, itemHeight, data, data.length]);

    const clampValues = (startIndex) => {
        if (data.length <= batchCount) {
            setVisibleStartIndex(0);
            setVisibleItemCount(batchCount);
            setThumbHeight(0);
            setThumbTop(0);
            return;
        }

        let newStartIndex = startIndex;

        const endIndex = calculateEndIndex();
        newStartIndex = Math.max(0, Math.min(newStartIndex, endIndex));
                        
        setVisibleStartIndex(newStartIndex);        
        setVisibleItemCount(batchCount);

        if (scrollRef.current) {
            const viewHeight = scrollRef.current.clientHeight;

            const newThumbHeight = Math.max(viewHeight * batchSize, 30);
            setThumbHeight(newThumbHeight);

            const thumbPos = ((newStartIndex / columns) / totalRowCount) * viewHeight;

            const newThumbTop = Math.max(0, Math.min(thumbPos, viewHeight - newThumbHeight));

            setThumbTop(newThumbTop);
        }
    };

    react.useEffect(() => {
        const tryClampValues = () => {
            if (scrollRef.current && scrollRef.current.clientHeight > 0) {

                //console.log(`bc: ${batchCount} data.length: ${data.length}`);
                if (data.length <= batchCount) {
                    setVisibleStartIndex(0);
                    setVisibleItemCount(batchCount);
                    setThumbHeight(0);
                    setThumbTop(0);
                    return;
                }
                
                const viewHeight = scrollRef.current.clientHeight;
                let newThumbHeight = Math.max(viewHeight * batchSize, 30);
                setThumbHeight(newThumbHeight);
                setThumbTop(0);
            } else {
                setTimeout(tryClampValues, 10);
            }
        };

        tryClampValues();
    }, [itemCount, data, data.length, batchCount]);

    const calculateEndIndex = () => {
        let endIndex = columns == 1 ? data.length - 1 : parseInt(data.length / columns) * columns;

        const itemsOverhanging = Math.max(0, data.length - endIndex);
        const rowsOverhanging = itemsOverhanging / columns;
        const hasBlankRows = rowsOverhanging > 0 && rowsOverhanging < rows;
        const rowsToInset = hasBlankRows ? Math.floor(rows - rowsOverhanging) : 0;

        if (rowsToInset > 0)
            endIndex -= (rowsToInset * columns);
        else if (rowsOverhanging >= 1)
            endIndex -= batchCount;

        console.log(`itemsOverhanging: ${itemsOverhanging} hasBlankRows: ${hasBlankRows} rowsOverhanging: ${rowsOverhanging} endIndex: ${endIndex} rowsToInset: ${rowsToInset}`);
        return endIndex;
    };

    const doScroll = (amt, updateThumb = true) => {
        //if (amt == 0)
        //    return;

        const viewHeight = scrollRef.current.clientHeight;
        const rowIndex = parseInt(visibleStartIndex / columns);

        let startIndex = (rowIndex * columns) + amt;
        const endIndex = calculateEndIndex();

        startIndex = Math.max(0, Math.min(startIndex, endIndex));

        setVisibleStartIndex(startIndex);
        setVisibleItemCount(batchCount);

        if (updateThumb) {
            const newThumbHeight = Math.max(viewHeight * batchSize, 30);
            const newThumbTop = Math.max(0, Math.min(((viewHeight - newThumbHeight) * (startIndex / endIndex)), viewHeight - newThumbHeight));
            setThumbTop(newThumbTop);
            setThumbHeight(newThumbHeight);
        }
    };

    const onMouseWheel = (e) => {
        if (scrollRef.current && scrollRef.current.contains(e.target)) {
            if (data.length < batchCount) {
                setVisibleStartIndex(0);
                setVisibleItemCount(batchCount);
                setThumbHeight(0);
                setThumbTop(0);
                return;
            }

            var amt = e.deltaY > 0 ? columns : e.deltaY < 0 ? -columns : 0;
            doScroll(amt);
        }
    };    

    const onMouseMove = (e) => {
        if (!mouseDown)
            return;        

        if (scrollRef.current && e.movementY != 0) {
            const viewHeight = scrollRef.current.clientHeight;
            const itemHeightPx = viewHeight * (parseInt(itemHeight.replaceAll("%", "")) / 100.0);

            if (data.length < batchCount || itemHeightPx <= 0)
                return;

            const adjustedMovement = e.movementY;

            let newThumbHeight = Math.max(viewHeight * batchSize, 30);
            setThumbHeight(newThumbHeight);

            let newThumbTop = Math.max(0, Math.min(thumbTop + adjustedMovement, viewHeight - newThumbHeight));
            setThumbTop(newThumbTop);

            const endIndex = calculateEndIndex();

            let newStartIndex = Math.floor(totalRowCount * (newThumbTop / (viewHeight - newThumbHeight)) * columns);

            newStartIndex = parseInt(newStartIndex / columns) * columns;
            newStartIndex = Math.max(0, Math.min(newStartIndex, endIndex));

            setVisibleStartIndex(newStartIndex);
            setVisibleItemCount(batchCount);
        }
    };

    const onMouseUp = (e) => {
        if (mouseDown) {
            setMouseDown(false);
        }
    };

    const onMouseDown = (e) => {
        if (!mouseDown) {
            setMouseDown(true);
            return true;
        }
    };

    const onMouseEnter = (e) => {
        if (e.target !== e.currentTarget)
            return;

        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const onTrackMouseDown = (e) => {
        if (e.target !== e.currentTarget) return;

        if (scrollRef.current) {
            const viewHeight = scrollRef.current.clientHeight;
            
            const rect = scrollRef.current.getBoundingClientRect();
            const clickPositionRelative = e.clientY - rect.top;            
            const clickProportion = clickPositionRelative / viewHeight;
            const rowStartIndex = Math.floor(totalRowCount * clickProportion) * columns;

            let newThumbHeight = Math.max(viewHeight * batchSize, 30);
            setThumbHeight(newThumbHeight);

            const endIndex = calculateEndIndex();

            let newThumbTop = Math.max(0, Math.min(((viewHeight - newThumbHeight) * (rowStartIndex / endIndex)), viewHeight - newThumbHeight));

            setThumbTop(newThumbTop);
            setVisibleStartIndex(Math.min(endIndex, rowStartIndex));
            setVisibleItemCount(batchCount);
        }
    };

    react.useEffect(() => {
        if (data.length != itemCount) {
            setItemCount(data.length);
            setVisibleStartIndex(0);
            setVisibleItemCount((rows * columns));
            setThumbTop(0);
        }

        window.addEventListener("wheel", onMouseWheel);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("wheel", onMouseWheel);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }

    }, [data, columns, rows, visibleStartIndex, itemCount, mouseDown, thumbTop]);

    const thumbContent = react.useMemo(() => (
        thumbHeight > 0 ? (
            <div className="track" onMouseDown={onTrackMouseDown}>
                <div className="thumb" onMouseEnter={onMouseEnter} onMouseDown={onMouseDown} style={{ height: `${thumbHeight}px`, top: `${thumbTop}px` }}></div>
            </div>
        ) : null
    ), [thumbHeight, thumbTop, onMouseDown, onMouseEnter, onTrackMouseDown, ...watch]);
 
    
    const visibleChildren = data ? data.slice(visibleStartIndex, visibleStartIndex + visibleItemCount) : [];

    const classNames = "scrollable vertical no-overflow" + (thumbHeight <= 0 + sizeClass + (className ? " " + className : ""));

    const getCellClassName = (index) => {
        if (!border)
            return "";

        let x = parseInt(index % columns);
        let y = parseInt(index / columns);
        let cs = "";

        if (x !== (columns - 1))
            cs += "border-right";

        if (y !== (rows - 1))
            cs += " border-bottom";

        return cs;
    };

    const dummies = react.useMemo(() => {
        const dummyCount = Math.max(0, (rows * columns) - visibleChildren.length);
        return Array.from({ length: dummyCount }, (_, index) => (
            <div key={index} style={{ width: itemWidth, height: itemHeight }}></div>
        ));
    }, [visibleChildren.length, rows, columns, itemWidth, itemHeight]);

    const renderChild = react.useCallback((child, index) => {
        return <div key={index} className={getCellClassName(index)} style={{ width: itemWidth, height: itemHeight }}>
            {onRenderItem(child, index)}
        </div>
    }, [itemWidth, itemHeight, rows, columns, ...watch]);

    return (
        <div className={classNames} style={{ overflowY: 'hidden' }}>
            <div ref={scrollRef} className="content" style={{ overflowY: 'hidden' }}>
                <div ref={contentRef} className={(contentClassName ? contentClassName : "") + " h-x flex-1"} style={{ overflowY: 'hidden' }}>
                    {visibleChildren.map((child, index) => (renderChild(child, index)))}
                    {dummies}
                </div>
            </div>
            {thumbContent}
        </div>
    );
}

export default VirtualList;
