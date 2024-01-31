import React from "react";

const MarkDown = ({ contents, url = null, className, style }) => {
    const react = window.$_gooee.react;
    const [cache, setCache] = react.useState({});
    const [content, setContent] = react.useState("");

    react.useEffect(() => {
        const download = async () => {
            if (cache && cache[url]) {
                setContent(cache[url]);
            }
            try {
                var req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.responseType = "text/html";
                req.onload = () => {
                    setContent(req.response);
                    let c = cache;
                    c[url] = req.response;
                    setCache(c);
                };
                req.send();
            } catch (error) {
                console.error(`Error fetching: ${url} - ${error}`);
            }
        };

        if (url) {
            download();
        } else {
            setContent(contents);
        }
    }, [url, contents, cache]);

    function processMarkdown(markdown) {
        const lines = markdown.split('\n');
        let html = '';
        let listStack = []; // Track nesting of lists

        const processBoldText = (line) => {
            let boldFlag = false;
            let boldText = '';
            let normalText = '';
            for (let i = 0; i < line.length; i++) {
                if (line[i] === '*' && line[i + 1] === '*') {
                    if (!boldFlag) {
                        boldFlag = true;
                        i++;
                    } else {
                        boldFlag = false;
                        i++;
                        normalText += `<b>${boldText}</b>`;
                        boldText = '';
                    }
                    continue;
                }
                if (boldFlag) {
                    boldText += line[i];
                } else {
                    normalText += line[i];
                }
            }
            if (boldFlag) { // If text ends while still in bold
                normalText += `<b>${boldText}</b>`;
            }
            return normalText;
        };

        lines.forEach(line => {
            const trimmedLine = line.trim();
            const indentation = line.match(/^\s*/)[0].length; // Count leading spaces
            const normalText = processBoldText(trimmedLine); // Process bold text within the line

            // Horizontal Rule
            if (trimmedLine === '---' || trimmedLine === '___') {
                html += '<hr />';
                return;
            }

            // Headers
            if (trimmedLine.startsWith('#')) {
                const headerLevel = trimmedLine.match(/^#+/)[0].length;
                html += `<h${headerLevel}>${trimmedLine.substring(headerLevel).trim()}</h${headerLevel}>`;
                return;
            }

            // Lists
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                while (listStack.length > 0 && indentation <= listStack[listStack.length - 1]) {
                    html += '</div>'; // Close a nested list
                    listStack.pop();
                }
                if (listStack.length === 0 || indentation > listStack[listStack.length - 1]) {
                    html += '<div class="list">'; // Start a new list
                    listStack.push(indentation);
                }
                html += `<div class="list-item"><div class="list-item-prepend list-item-depth-${indentation + 1}">&#8226;</div><p cohinline="cohinline" class="flex-1">${normalText.substring(1).trim()}</p></div>`;
            } else {
                while (listStack.length > 0) {
                    html += '</div>'; // Close all nested lists
                    listStack.pop();
                }
                if (trimmedLine) {
                    html += `<p>${normalText}</p>`; // Paragraphs
                }
            }
        });

        // Close any remaining open lists
        while (listStack.length > 0) {
            html += '</div>';
            listStack.pop();
        }

        return html;
    }


    const markdownHtml = content && content.length > 0 ? processMarkdown(content) : "";

    const md = content && content.length > 0 ? markdownHtml : null;

    const classNames = `markdown${className ? " " + className : ""}`;
    return <div className={classNames} style={style} dangerouslySetInnerHTML={{ __html: md }}></div>;
};

export default MarkDown;
