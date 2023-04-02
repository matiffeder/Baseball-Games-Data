/* ***** function output() *****
Appends the provided String to an HTML element called "output". String may be output as plain text or as HTML.

Requirements: An element with id="output" in the current Document Object (generally the index.html)

Parameters:
content     String to be added to "output"
htmlFlag    Boolean (default false):
            if false, add content within a <p> tag
            if true, treat content as HTML ready to output

Returns: Nothing
******************************** */

function output(content, htmlFlag) {
    if (content == undefined) {
        console.log("WARNING: You did not provide anything to output");
    } else {
        let o = document.getElementById("output");
        if (!htmlFlag) {
            let p = document.createElement("p");
            let tn = document.createTextNode(content);
            p.appendChild(tn);
            o.appendChild(p);
        } else {
            o.innerHTML += content;
        }
    }
}

/* ***** function preformattedOutput() *****
Appends the provided String to an HTML element called "fixedOutput" inside of a pair of <pre> tags.

Requirements: An element with id="fixedOutput" in the current Document Object (generally the index.html) with a direct child <pre></pre>

Parameters:
content     String to be added to "output"
noLineBreak Boolean (default false):
            if false, place a linebreak at end of output
            if true, continue next preformattedOutput() on same line

Returns: Nothing
******************************** */

function preformattedOutput(content, noLineBreak) {
    if (content == undefined) {
        console.log("WARNING: You did not provide anything to output");
    } else {
        let o = document.getElementById("fixedOutput");
        let p = o.getElementsByTagName("pre")[0];
        p.innerHTML += content;
        if (!noLineBreak) {
            p.innerHTML += "\n";
        }
    }
}

/* ***** function endOutput() *****
Appends a horizontal rule (<hr> element) to Document Object with id="output".

Requirements: An element with id="output" in the current Document Object (generally the index.html)

Parameters: None

Returns: Nothing 
*********************************** */

function endOutput() {
    let o = document.getElementById("output");
    o.appendChild(document.createElement("hr"));
}