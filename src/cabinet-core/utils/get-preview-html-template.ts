export function getPreviewHtmlTemplate(insertHtml: string, title: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      
      <style>
      h1 {counter-reset:subsection;}
      h1:before
      {
      counter-increment:section;
      content:"\\00A7 " counter(section) " ";
          font-weight:bold;
      }


      h2:before
      {
      counter-increment:subsection;
      content: counter(section) "." counter(subsection) " ";
      }

      h3:before
      {
      counter-increment:subsubsection;
      content:counter(section) "." counter(subsection) "." counter(subsubsection) " ";
      }

      h4:before
      {
      counter-increment:subsubsubsection;
      content:counter(section) "." counter(subsection) "." counter(subsubsection) "." counter(subsubsubsection) " ";
      }


    body {

      counter-reset:section;

      background-color: rgba(255, 255, 255, 0.952);
      word-break: break-word; 
      max-width: 1027px;

    }
    h1   {
      background-color: rgb(120, 33, 190);
      color: white;
      margin-top: 2em;
      margin-bottom: 1em;
      padding-top: 0.2em;
      padding-bottom: 0.2em;
    }
    h2   {
      text-indent: 0.8em;
      counter-reset: subsubsection;
      color: rgb(0, 19, 102);
      text-decoration: underline;
      margin-top: 1.5em;
      margin-bottom: 1em;
    }
    h3   {

      counter-reset: subsubsubsection;
      text-indent: 1.6em;
      color: rgb(0, 26, 143);
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    h4   {
      text-indent: 2.4em;
      color: rgb(0, 35, 190);
    }
    p    {color: rgb(31, 31, 31);}
    code {
      color: rgb(0, 81, 92); 
      background-color: rgba(0, 148, 185, 0.103);
      font-weight: bold;
    }
    blockquote {
      border-radius: 30px;
      padding: 0.5em;
      background-color: rgba(215, 238, 188, 0.322);
    }
    pre {
      background-color: rgb(0, 102, 116);
      color:rgb(0, 9, 51);
      overflow-x: auto;
      white-space: pre-wrap;
      white-space: -moz-pre-wrap;
      white-space: -pre-wrap;
      white-space: -o-pre-wrap;
      word-wrap: break-word;
    }

    .table-of-contents {
      border-radius: 30px;
      margin: 2em;
      padding: 0.5em;
      background-color: rgb(249, 255, 231);
    }

    .table-of-contents li {
      margin: 0.5em;
      background-color: rgb(249, 255, 231);
    }
    .table-of-contents a:link {
      color: rgb(11, 80, 170);
    }


    li {
      color: rgb(0, 90, 30);
      background-color: rgb(238, 252, 53);
      font-weight: bolder;
      font-size: 1em;
      padding-top: 0.1em;
      padding-bottom: 0.1em;
    }

    button {
      cursor: pointer;
    }

    #goToTopButton {
      display: block; /* Hidden by default */
      position: fixed; /* Fixed/sticky position */
      top: 20px; /* Place the button at the bottom of the page */
      right: 30px; /* Place the button 30px from the right */
      z-index: 99; /* Make sure it does not overlap */
      border: none; /* Remove borders */
      outline: none; /* Remove outline */
      background-color: red; /* Set a background color */
      color: white; /* Text color */
      cursor: pointer; /* Add a mouse pointer on hover */
      padding: 15px; /* Some padding */
      border-radius: 10px; /* Rounded corners */
      font-size: 10px; /* Increase font size */
    }
    
    #goToTopButton:hover {
      background-color: #555; /* Add a dark-grey background on hover */
    }

      
    #goBottomButton {
      display: block; /* Hidden by default */
      position: fixed; /* Fixed/sticky position */
      bottom: 20px; /* Place the button at the bottom of the page */
      right: 30px; /* Place the button 30px from the right */
      z-index: 99; /* Make sure it does not overlap */
      border: none; /* Remove borders */
      outline: none; /* Remove outline */
      background-color: rgb(0, 89, 255); /* Set a background color */
      color: white; /* Text color */
      cursor: pointer; /* Add a mouse pointer on hover */
      padding: 15px; /* Some padding */
      border-radius: 10px; /* Rounded corners */
      font-size: 10px; /* Increase font size */
    }
    
    #goBottomButton:hover {
      background-color: #555; /* Add a dark-grey background on hover */
    }

      </style>
  </head>
  <body>
  
  <button onclick="topFunction()" id="goToTopButton" title="Go to top">Top</button>
  <button onclick="bottomFunction()" id="goBottomButton" title="Go to Bottom">Bottom</button>
  ${insertHtml}

    <script>
const goTopButton = document.getElementById("goToTopButton");
const goBottomButton = document.getElementById("goBottomButton");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    goTopButton.style.display = "block";
  } else {
    goTopButton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
function bottomFunction() {
  window.scrollTo(0, document.body.scrollHeight);
}


function generateCCIButtons() {
  const allCodes = Array.from(document.querySelectorAll("code"))
  const allCCIs = allCodes.filter(code => code.innerText.startsWith('{') && code.innerText.endsWith('}'))

  allCCIs.forEach(cci => {

      const cciString = cci.innerText;
    // copy button
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copy";
    copyButton.onclick = () => {
      navigator.clipboard.writeText(cciString);
    }

    cci.parentNode.insertBefore(copyButton, cci);
    // add to vscode button
    if (vscode) {
      const vscodeButton = document.createElement("button");
      // use vs code blue for the background color of the button
      vscodeButton.style.backgroundColor = "#007acc";
      vscodeButton.style.color = "#f8f8f2";
      vscodeButton.innerText = "Add Card";
      vscodeButton.onclick = () => {
        const text = cci.innerText;
        vscode.postMessage({
          command: 'addCCI',
          text: cciString
        });
      }


    cci.parentNode.insertBefore(vscodeButton, cci.parentNode.firstChild); 
    }

      // add open file button
    if (vscode) {
      const openFileButton = document.createElement("button");
      // use vs code blue for the background color of the button
      openFileButton.innerText = "Open";
      openFileButton.onclick = () => {
        const text = cci.innerText;
        vscode.postMessage({
          command: 'openFile',
          text: cciString
        });
      }

    cci.parentNode.insertBefore(openFileButton, cci);
    }

  });

  console.log(allCCIs)
}
const vscode = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : undefined;
console.log('Checking if this is in vscode', {vscode})

function generatePointButtons() {
  // get all elements
  const allPoints = Array.from(document.querySelectorAll("ul, li, h1, h2, h3, h4, h5, h6, blockquote, code"))
  // add add to vscode button before the elements
  allPoints.forEach(point => {
    // add to vscode button
    if (vscode) {

        let text = point.innerText;
      const vscodeButton = document.createElement("button");
      // use vs code blue for the background color of the button
      vscodeButton.style.color = "#007acc";
      vscodeButton.style.background = 'Transparent';
      // button no border
      vscodeButton.style.border = 'none';
      vscodeButton.style.outline = 'none';
      vscodeButton.style.padding = '6px';
      vscodeButton.innerText = "+";
      vscodeButton.onclick = function ()  {

        if (point.tagName === 'UL') {
          text = text.split('\n').join('\n- ');
          
        }
        // change background color to green
        point.style.backgroundColor = "lightgreen";
        // change text color to white
        vscode.postMessage({
          command: 'addPoint',
          text: text
        });
      }

      // insert button after the element
      point.prepend(vscodeButton);

    }
  })
}


generateCCIButtons()

generatePointButtons();

      </script>

  </body>
  </html>`;
}
