import React from "react";

const Code = ({ htmlString }) => {
    const encodeHtml = (str) => {
        // This will replace spaces with `&nbsp;` except for new lines
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/ /g, "&nbsp;")
            .replace(/"/g, "&quot;")
            .replace(/=/g, "&equals;");
    };

    const addSyntaxColoring = (encodedHtml) => {
        const regexTag = /(&lt;\/?)(.*?)(&gt;)/g;
        const regextringTag = /(&quot;.*?&quot;)/g;
        const regexEqualsTag = /(&equals;)/g;
        // This will replace new lines with `<br />` after the syntax coloring is applied
        return encodedHtml
            .replace(regexTag, (_, p1, p2, p3) => `${p1}<p cohinline="cohinline" class="text-primary-light w-x">${p2}</p>${p3}`)
            .replace(regextringTag, (_, p1) => `<p cohinline="cohinline" class="text-danger-light w-x">${p1}</p>`)
            .replace(regexEqualsTag, (_, p1 ) => `<p cohinline="cohinline" class="text-light w-x">${p1}</p>`)
            .replace(/\n/g, "<div className='w-100'></div>");
    };

    const renderHtml = () => {
        const encodedHtml = encodeHtml(htmlString);
        const coloredHtml = addSyntaxColoring(encodedHtml);
        return { __html: coloredHtml };
    };

    return (
        <code className="d-flex flex-wrap flex-row" dangerouslySetInnerHTML={renderHtml()} />
    );
};

export default Code;
