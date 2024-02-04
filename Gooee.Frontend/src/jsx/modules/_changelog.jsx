import React from "react";

const ChangeLog = ({ }) => {
    return <></>;
    //const react = window.$_gooee.react;
    //const { ToggleButtonGroup, Grid, Scrollable, Modal, MarkDown } = window.$_gooee.framework;
    //const [visible, setVisible] = react.useState(false);

    //react.useEffect(() => {
    //    const eventName = `gooee.showChangeLog`;
    //    const updateEvent = eventName + ".update";
    //    const subscribeEvent = eventName + ".subscribe";
    //    const unsubscribeEvent = eventName + ".unsubscribe";

    //    var sub = engine.on(updateEvent, (data) => {
    //        setVisible(data);
    //    })

    //    engine.trigger(subscribeEvent);
    //    return () => {
    //        engine.trigger(unsubscribeEvent);
    //        sub.clear();
    //    };
    //}, []);

    //const closeModal = () => {
    //    engine.trigger("gooee.onCloseChangeLog");
    //    engine.trigger("audio.playSound", "close-panel", 1);
    //    setVisible(false);
    //};

    //const newLogs = [...window.$_gooee_changeLogs];

    //const logUrls = ["coui://gooeeui/Plugins/DucksInARow.md"];

    //const [selectedLog, setSelectedLog] = react.useState(logUrls[0]);

    //const onModSelected = (index) => {
    //    setSelectedLog(logUrls[index]);
    //};

    //return visible ? <Modal title="Mod Changelogs" fixed size="lg" onClose={closeModal}>
    //    <Grid>
    //        <div className="col-3">
    //            <Scrollable className="h-100">
    //            </Scrollable>
    //        </div>
    //        <div className="col-9 bg-section-dark rounded-sm">
    //            <Scrollable className="h-100">
    //                <MarkDown className="p-5" url={selectedLog} />
    //            </Scrollable>
    //        </div>
    //    </Grid>
    //</Modal> : null;
};

export default ChangeLog;