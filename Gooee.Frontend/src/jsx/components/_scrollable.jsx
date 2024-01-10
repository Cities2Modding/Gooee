import React from 'react'

const Scrollable = ({ children }) => {
    const react = window.$_gooee.react;
    const scrollRef = react.useRef(null);
    const contentRef = react.useRef(null);
    const [thumbHeight, setThumbHeight] = react.useState(0);
    const [thumbTop, setThumbTop] = react.useState(0);
    const [mouseDown, setMouseDown] = react.useState(false);

    function getCurrentScrollPosition() {
        if (scrollRef.current) {
            return scrollRef.current.scrollTop;
        }
        return 0;
    }
    const calculateThumbSizeAndPosition = () => {
        if (scrollRef.current && contentRef.current) {
            const viewableHeight = scrollRef.current.clientHeight;
            const totalContentHeight = contentRef.current.scrollHeight;

            if (totalContentHeight > viewableHeight) {
                let newThumbHeight = Math.max((viewableHeight / totalContentHeight) * viewableHeight, 30);

                // Replace this with your method of getting the current scroll position
                const currentScrollPosition = getCurrentScrollPosition(); // Custom function

                let newThumbTop = (currentScrollPosition / totalContentHeight) * viewableHeight;

                if (newThumbTop + newThumbHeight > viewableHeight)
                    newThumbTop = viewableHeight - newThumbHeight;

                setThumbHeight(newThumbHeight);
                setThumbTop(newThumbTop);
            }
        }
    };

    const onMouseMove = (e) => {
        if (!mouseDown)
            return;
            
        if (scrollRef.current && contentRef.current) {
            const viewableHeight = scrollRef.current.clientHeight;
            const totalContentHeight = contentRef.current.scrollHeight;
            scrollRef.current.scrollTop += (e.movementY / viewableHeight) * totalContentHeight;
            calculateThumbSizeAndPosition();
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
        if (e.target != e.currentTarget)
            return;
        if (scrollRef.current && contentRef.current) {
            const viewableHeight = scrollRef.current.clientHeight;
            const totalContentHeight = contentRef.current.scrollHeight;
            var rect = scrollRef.current.getBoundingClientRect();
            scrollRef.current.scrollTop = ((e.screenY - Math.round(rect.top)) / viewableHeight) * totalContentHeight;
            calculateThumbSizeAndPosition();
            setMouseDown(true);
        }
    };

    const thumbContent = thumbHeight > 0 ? <div className="track" onMouseDown={onTrackMouseDown}>
        <div className="thumb" onMouseEnter={onMouseEnter} onMouseDown={onMouseDown} style={{ height: `${thumbHeight}px`, top: `${thumbTop}px` }}></div>
    </div> : <></>;

    react.useEffect(() => {
        calculateThumbSizeAndPosition();
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [mouseDown]);

    const classNames = "scrollable vertical" + (thumbHeight <= 0 ? " no-overflow" : "");
    return <div className={classNames} onMouseOver={calculateThumbSizeAndPosition}>
        <div ref={scrollRef} onScroll={calculateThumbSizeAndPosition} className="content">
            <div ref={contentRef}>
                {children}
            </div>
        </div>
        {thumbContent}
    </div>
}

export default Scrollable;