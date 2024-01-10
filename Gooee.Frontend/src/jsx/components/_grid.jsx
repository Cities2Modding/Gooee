import React from 'react';

const Grid = ({ children, noGutter = false, className, auto = null }) => {
    const maxRowSize = 12;

    const getColumnClass = (totalChildren) => {
        const numberOfColumns = Math.ceil(maxRowSize / totalChildren);
        return `col-${numberOfColumns}`;
    };

    const renderAutoRows = () => {
        const totalChildren = React.Children.count(children);
        const columnClass = getColumnClass(totalChildren);
        const row = React.Children.map(children, (child, index) => {
            const key = `col-auto-${index}`;
            const cs = child.props.className ? child.props.className : "";
            return React.cloneElement(child, {
                className: `${cs} ${columnClass}`.trim(),
                key: key
            });
        });
        const rowClassName = `row ${noGutter ? 'no-gutter' : ''}`;
        return <div className={rowClassName}>{row}</div>;
    };

    const renderManualRow = () => {
        const row = React.Children.map(children, (child, index) => {
            const key = `col-manual-${index}`;
            // Use child's className as is without auto-assigning column class
            return React.cloneElement(child, { key: key });
        });
        const rowClassName = `row ${noGutter ? 'no-gutter' : ''}`;
        return <div className={rowClassName}>{row}</div>;
    };

    return <div className={className}>{auto ? renderAutoRows() : renderManualRow()}</div>;
};

export default Grid;