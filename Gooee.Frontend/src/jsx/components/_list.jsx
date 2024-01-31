import React from 'react';

const List = ({ children, className, ordered = null }) => {    
    const renderItems = () => {
        return React.Children.map(children, (child, index) => {
            const key = `list-item-${index}`;
            
            const innerContent = child.props.children;            
            return (
                <div className="list-item" key={key} cohinline="cohinline">
                    <div className="list-item-prepend">{ordered ? <>{`${index + 1}`}.</> : <>&#8226;</>}</div>
                    <p cohinline="cohinline" class="flex-1">
                        {innerContent}
                    </p>
                </div>
            );
        });
    };

    const classNames = "list" + (className ? " " + className : "") + (ordered ? " list-ordered" : "" ); 
    return <div className={classNames}>{renderItems()}</div>;
};

export default List;