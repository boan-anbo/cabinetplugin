import { window } from "vscode";

export function getPreviewHtmlTemplate(insertHtml: string, title: string, documentUri?: string) {
  if (!documentUri) {
    // get active editor's documentUri
    documentUri = window.activeTextEditor?.document.uri.toString() ?? undefined;
  }
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <style>
    h1 {
      counter-reset: section1;
    }

    h1:before {
      counter-increment: section1;
      content: "\\00A7 "counter(section1) " ";
      font-weight: bold;
    }


    h2:before {
      counter-increment: section2;
      content: counter(section1) "."counter(section2) " ";
    }

    h3:before {
      counter-increment: section3;
      content: counter(section1) "."counter(section2) "."counter(section3) " ";
    }

    h4:before {
      counter-increment: section4;
      content: counter(section1) "."counter(section2) "."counter(section3) "."counter(section4) " ";
    }

    h5:before {
      counter-increment: section5;
      content: counter(section1) "."counter(section2) "."counter(section3) "."counter(section4) "."counter(section5);
    }

    .hidden {
      display: none;
    }

    body {

      counter-reset: section1;

      background-color: rgba(255, 255, 255, 0.952);
      word-break: break-word;
      max-width: 1027px;

      font-size: 0.8em;
    }

    h1 {
      background-color: rgb(120, 33, 190);
      color: white;
      margin-top: 2em;
      margin-bottom: 1em;
      padding-top: 0.2em;
      padding-bottom: 0.2em;
      font-size: 1.8em;
    }

    h2 {
      text-indent: 1em;
      counter-reset: section2;
      color: rgb(0, 19, 102);
      text-decoration: underline;
      margin-top: 1em;
      font-size: 1.6em;
    }

    h3 {

      counter-reset: section3;
      text-indent: 1.6em;
      color: rgb(0, 26, 143);
      text-decoration: underline;
      margin-top: 1.em;
      font-size: 1.4em;
      line-height: 2em;
    }

    h4 {
      counter-reset: section4;
      text-indent: 2.4em;
      color: rgb(0, 35, 190);
      text-decoration: underline;
      margin-top: 1em;
      font-size: 1.4em;
    }

    h5 {
      counter-reset: section5;
      text-indent: 3.4em;
      color: rgb(0, 41, 226);
      text-decoration: underline;
      margin-top: 1em;
      font-size: 1.0em;
    }

    p {
      color: rgb(31, 31, 31);
    }

    code {
      color: rgb(0, 81, 92);
      font-weight: bold;
      margin-top: 5px;
      margin-bottom: 5px;
      line-height: 1.5em;
    }

    blockquote {
      border-radius: 20px;
      padding: 2px;
      padding-left: 20px;
      background-color: rgba(215, 238, 188, 0.582);
    }

    pre {
      background-color: rgba(255, 255, 255, 0.281);
      color: rgb(0, 9, 51);
      overflow-x: auto;
      white-space: pre-wrap;
      white-space: -moz-pre-wrap;
      white-space: -pre-wrap;
      white-space: -o-pre-wrap;
      word-wrap: break-word;
      padding-left: 20px;
      padding-right: 20px;
    }

    .table-of-contents {
      border-radius: 30px;
      font-size: small;
      margin: 2em;
      padding: 0.5em;
      background-color: rgb(249, 255, 231);
    }

    .table-of-contents li {
      margin: 0em;
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
      margin: 2px;
      line-height: 2em;
      padding-top: 2px;
      padding-bottom: 2px;
      padding-left: 10px;
      padding-right: 40px;
      border-radius: 30px;
    }

    button {
      cursor: pointer;
    }

    #goToTopButton {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      top: 20px;
      /* Place the button at the bottom of the page */
      right: 30px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: red;
      /* Set a background color */
      color: white;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #goToTopButton:hover {
      background-color: #555;
      /* Add a dark-grey background on hover */
    }


    #goBottomButton {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      bottom: 20px;
      /* Place the button at the bottom of the page */
      right: 30px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: rgb(0, 89, 255);
      /* Set a background color */
      color: white;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #goBottomButton:hover {
      background-color: #555;
      /* Add a dark-grey background on hover */
    }

    #updateCards {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      top: 20px;
      /* Place the button at the bottom of the page */
      right: 100px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: rgb(166, 255, 0);
      /* Set a background color */
      color: black;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #updateCards:hover {
      background-color: rgb(136,
          209,
          0);
      /* Add a dark-grey background on hover */
    }

    #toggle-all-cards-button {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      top: 20px;
      /* Place the button at the bottom of the page */
      left: 30px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: rgb(166, 255, 0);
      /* Set a background color */
      color: black;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #toggle-all-cards-button:hover {
      background-color: rgb(136,
          209,
          0);
      /* Add a dark-grey background on hover */
    }

    #toggle-all-points-button {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      top: 20px;
      /* Place the button at the bottom of the page */
      left: 200px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: rgb(166, 255, 0);
      /* Set a background color */
      color: black;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #toggle-used-cards-button {
      display: block;
      /* Hidden by default */
      position: fixed;
      /* Fixed/sticky position */
      top: 20px;
      /* Place the button at the bottom of the page */
      left: 130px;
      /* Place the button 30px from the right */
      z-index: 99;
      /* Make sure it does not overlap */
      border: none;
      /* Remove borders */
      outline: none;
      /* Remove outline */
      background-color: rgb(166, 255, 0);
      /* Set a background color */
      color: black;
      /* Text color */
      cursor: pointer;
      /* Add a mouse pointer on hover */
      padding: 15px;
      /* Some padding */
      border-radius: 10px;
      /* Rounded corners */
      font-size: 10px;
      /* Increase font size */
    }

    #toggle-used-cards-button:hover,
    #toggle-all-points-button:hover {
      background-color: rgb(136,
          209,
          0);
      /* Add a dark-grey background on hover */
    }
  </style>
</head>

<body>

  <button onclick="topFunction()" id="goToTopButton" title="Go to top">Top</button>
  <button onclick="bottomFunction()" id="goBottomButton" title="Go to Bottom">Bottom</button>
  <button onclick="askVscodeForUsedCards()" id="updateCards" title="Update Cards">Used Cards</button>
  <button onclick="toggleCardsDisplay()" id="toggle-all-cards-button" title="Show or Hide Cards">Toggle Cards</button>
  <button onclick="toggleAllUsedCardsDisplay()" id="toggle-used-cards-button" title="Show or Hide Cards">Toggle Used
    <button onclick="toggleAddPointButtons()" id="toggle-all-points-button" title="Show or Hide + Buttons">Toggle
      +</button>

    ${insertHtml}

    <script>
      const goTopButton = document.getElementById("goToTopButton");
      const goBottomButton = document.getElementById("goBottomButton");

      window.onscroll = function () {
        scrollFunction();
      };

      function scrollFunction() {
        if (
          document.body.scrollTop > 20 ||
          document.documentElement.scrollTop > 20
        ) {
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

      function getAllCciElements() {
        const allCodes = Array.from(document.querySelectorAll("code"));
        const allCCIs = allCodes.filter(
          (code) =>
            code.innerText.startsWith("{") && code.innerText.endsWith("}")
        );
        return allCCIs;
      }

      function generateCCIButtons() {
        const allCCIs = getAllCciElements();
        allCCIs.forEach((cci) => {
          const cciString = cci.innerText;
          // copy button
          const copyButton = document.createElement("button");
          copyButton.innerText = "Copy";
          copyButton.onclick = () => {
            navigator.clipboard.writeText(cciString);
          };

          cci.parentNode.insertBefore(copyButton, cci);
          // add to vscode markdown button
          if (vscode) {
            const vscodeButton = document.createElement("button");
            // use vs code blue for the background color of the button
            vscodeButton.style.backgroundColor = "#007acc";
            vscodeButton.style.color = "#f8f8f2";
            vscodeButton.innerText = "Add Card";
            vscodeButton.onclick = () => {
              const text = cci.innerText;
              vscode.postMessage({
                command: "addCCI",
                text: cciString,
              });
            };

            cci.parentNode.insertBefore(
              vscodeButton,
              cci.parentNode.firstChild
            );
          }

          // add to vscode latex button
          if (vscode) {
            const vscodeButton = document.createElement("button");
            // use vs code blue for the background color of the button
            vscodeButton.style.backgroundColor = "#007acc";
            vscodeButton.style.color = "#f8f8f2";
            vscodeButton.innerText = "Latex";
            vscodeButton.onclick = () => {
              const text = cci.innerText;
              vscode.postMessage({
                command: "insertLatex",
                text: cciString,
              });
            };

            cci.parentNode.insertBefore(
              vscodeButton,
              cci.parentNode.firstChild
            );
          }

          // add open file button
          if (vscode) {
            const openFileButton = document.createElement("button");
            // use vs code blue for the background color of the button
            openFileButton.innerText = "Open";
            openFileButton.onclick = () => {
              const text = cci.innerText;
              vscode.postMessage({
                command: "openFile",
                text: cciString,
              });
            };

            cci.parentNode.insertBefore(openFileButton, cci);
          }
        });

        console.log(allCCIs);
      }

      function generatePointButtons() {
        // get all elements
        const allPoints = Array.from(
          document.querySelectorAll(
            "ul, li, h1, h2, h3, h4, h5, h6, blockquote, code"
          )
        );

        // add add to vscode button before the text points.
        allPoints.forEach((point) => {
          if (vscode) {
            let text = point.innerText;
            const addPointButton = document.createElement("button");
            // use vs code blue for the background color of the button
            addPointButton.style.color = "#007acc";
            addPointButton.style.background = "Transparent";
            addPointButton.className = "add-point-button hidden";
            // button no border
            addPointButton.style.border = "none";
            addPointButton.style.outline = "none";
            addPointButton.style.padding = "6px";
            addPointButton.innerText = "+";
            addPointButton.onclick = function (event) {
              let finalText = text;
              // need to create a new variable for text. manipulate the text reference directly will change the value of the original elment.
              if (point.tagName === "UL") {
                finalText = finalText.split("\\n").join("\\n- ");
              }
              // change background color to green
              point.style.backgroundColor = "lightgreen";
              // change text color to white
              vscode.postMessage({
                command: "addPoint",
                text: finalText,
              });

              // otherwise it will trigger jump function
              event.stopPropagation();

            };

            // insert button after the element
            point.parentNode.insertBefore(addPointButton, point);
          }
        });
      }

      function getDocumentCards() {
        const results = [
          {
            id: "88110f81-9ccc-4528-b7e6-a0cf3a42b59b",
            line: 3,
            text: "this is the point the card is related to",
          },
        ];

        return results;
      }

      // remove all divs with the class name of 'usedCardDiv';
      function removeAllUsedCardDivs() {
        const usedCardDivs = Array.from(
          document.querySelectorAll(".used-card-div")
        );
        usedCardDivs.forEach((div) => {
          div.remove();
        });

      }
      function getUsedCardLabels(cardPlaces) {
        // create a label element to insert before the current element
        const allCardPlaceElements = [];
        cardPlaces.forEach((cardPlace) => {
          // creating an div to describe where and for what line the card is used.
          const div = document.createElement("div");
          div.className = "used-card-div";
          div.innerText = "Used: [" + cardPlace.line + "] ";
          div.style.paddingTop = "4px";
          div.style.marginTop = "4px";
          div.style.paddingLeft = "8px";
          div.style.marginBottom = "4px";
          div.style.paddingBottom = "4px";
          div.style.backgroundColor = "green";
          div.style.color = "white";
          // add a button to jump to the line
          const jumpToLineButton = document.createElement("button");
          jumpToLineButton.style.marginLeft = "8px";
          jumpToLineButton.style.marginRight = "8px";
          jumpToLineButton.innerText = "Go";
          // attach a function to the button to post message back to vscode to nativage to the line where the card is used.
          jumpToLineButton.onclick = () => {
            vscode.postMessage({
              command: "jumpToLineByCard",
              cardPlace: JSON.stringify(cardPlace),
            });
          };
          // add button to element
          div.appendChild(jumpToLineButton);
          allCardPlaceElements.push(div);
        });
        return allCardPlaceElements;
      }

      // get all the cards used in the current document. Match the used cards with the elements with same id. If id is matched, mark the card with a different color so the user knows that the card has been used already and can see where it is used in the document and navigate to the line.
      function markUsedCards(usedCardPlaces) {

        console.log("Checking if cards are used against", usedCardPlaces);
        const allCciElements = getAllCciElements();
        allCciElements.forEach((cci) => {
          const cciString = cci.innerText;
          const cciObject = JSON.parse(cciString);
          console.log("Checking cards in the HTML", cciObject);
          if (
            usedCardPlaces.some((cardPlace) => cardPlace.id === cciObject.id)
          ) {
            console.log("Found used card", cci);
            // set its grandparent background back to lightest blue
            cci.parentNode.parentNode.style.backgroundColor = "#e0f2f1";

            const allUsedPlacesOfTheCard = usedCardPlaces.filter(
              (cardPlace) => cardPlace.id === cciObject.id
            );
            const allUsedCardElements = getUsedCardLabels(
              allUsedPlacesOfTheCard
            );

            // insert all the usedCard Elements above the cci element
            allUsedCardElements.forEach((usedCardElement) => {
              cci.parentNode.insertBefore(usedCardElement, cci);
            });
          }
          {
            {
              /*  console.log(cciObject);  */
            }
          }
        });
      }

      function attachUpdateCardsListener() {

        window.addEventListener('message', event => {
          const message = event.data;

          switch (message.command) {
            case "updateUsedCards":
              console.log("received mark used cards request for", message.text);

              // clear previously added used card divs if any
              removeAllUsedCardDivs();

              const usedCardPlaces = JSON.parse(message.text);
              console.log("parsed used cards objects received by webview", usedCardPlaces);
              if (usedCardPlaces && Array.isArray(usedCardPlaces) && usedCardPlaces.length > 0) {
                markUsedCards(usedCardPlaces);
              }
              break;
          }
        });
      }
      function askVscodeForUsedCards() {
        if (vscode) {
          vscode.postMessage({
            command: "updateUsedCardsInPreview",
          });
        }
      };
      function hideAllCards() {
        const allBlockquoteEls = document.querySelectorAll("blockquote");
        allBlockquoteEls.forEach((el) => {
          el.classList.add("hidden");
        });
        isAllCardsShown = false;
      }



      function showAllCards() {

        const allBlockquoteEls = document.querySelectorAll("blockquote");

        // add hidden class to all blockquote elements
        allBlockquoteEls.forEach((el) => {
          // hide the element by adding className of 'hidden'
          el.classList.remove("hidden");
        });

        isAllCardsShown = true;
      }

      function toggleCardsDisplay() {
        if (isAllCardsShown) {
          hideAllCards();
        } else {
          showAllCards();
        }
      }

      function hideAllUsedCards() {
        const usedCardDivs = Array.from(
          document.querySelectorAll(".used-card-div")
        );
        console.log("hiding all used cards", usedCardDivs);
        usedCardDivs.forEach((div) => {
          div.parentNode.parentNode.classList.add("hidden");
        });
        isUsedCardsShown = false;
      }

      function showAllUsedCards() {
        const usedCardDivs = Array.from(
          document.querySelectorAll(".used-card-div")
        );
        usedCardDivs.forEach((div) => {
          div.parentNode.parentNode.parentNode.classList.remove("hidden");

        });
        isUsedCardsShown = true;
      }

      function toggleAllUsedCardsDisplay() {
        // if all cards are hiddle, show used cards directly

        if (isAllCardsShown && isUsedCardsShown) {
          hideAllUsedCards();
        } else if (!isAllCardsShown && !isUsedCardsShown) {
          showAllUsedCards();
        } else if (isAllCardsShown && !isUsedCardsShown) {
          hideAllCards();
          showAllUsedCards();
        } else if (!isAllCardsShown && isUsedCardsShown) {
          hideAllCards();
        }


      }

      let isAllAddPointButtonsShown = false;
      function showAllAddPointButtons() {
        const allAddPointButtons = document.querySelectorAll(".add-point-button");
        allAddPointButtons.forEach((button) => {
          button.classList.remove("hidden");
        });
        isAllAddPointButtonsShown = true;
      }
      function hideAllAddPointButtons() {
        const allAddPointButtons = document.querySelectorAll(".add-point-button");
        allAddPointButtons.forEach((button) => {
          button.classList.add("hidden");
        });
        isAllAddPointButtonsShown = false;
      }
      function toggleAddPointButtons() {
        if (isAllAddPointButtonsShown) {
          hideAllAddPointButtons();
        } else {
          showAllAddPointButtons();
        }
      }

      function getElementByLine(lineString) {
        const lineNumber = parseInt(lineString);
        // get element by unique attribute, use multiple conditions in case it's an empty line.
        const lineElement = document.querySelector(\`[line="$\{lineNumber}"]\`)
        return lineElement;
      }

      function navigateToElementByLine(lineNumber) {
        const lineElement = getElementByLine(lineNumber);
        if (lineElement) {
          lineElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }
      function attachLineNavigationListener() {

        window.addEventListener('message', event => {
          const message = event.data;

          switch (message.command) {
            case "goToLine":
              console.log("received go to line request for", {
                message});
              if (message.documentUri) {
                // if document uri is provided, check if it's the same as the current document
                if (message.documentUri !== documentUri) {
                  console.log('Jump request received, but the uri are different, so ignoring it');
                  return;
                }
              }
              navigateToElementByLine(message.line);
              break;
          }
        });
      }

      // add on click event listener to all add elements with line attribute 
      function addSourceLineButtons(documentUri) {
        const allElements = document.querySelectorAll("[line]");
        allElements.forEach((el) => {
          const lineNumber = el.getAttribute("line");
          if (lineNumber) {
            console.log('Adding uri to button', documentUri)
            el.addEventListener("click", (event) => askVscodeToJump(documentUri, lineNumber, event))
            // add clikable border to element
            el.style.border = "1px solid #00ff00";
            // add top and bottom padding to element
            el.style.paddingTop = "5px";
            el.style.paddingBottom = "5px";
            
          }
        });
      }

      function askVscodeToJump(documentUri, lineNumber, event) {
      // send message to vscode to add point
      if (vscode) {
        console.log("sending message to vscode to jump to line", lineNumber);
        vscode.postMessage({
          command: "jumpToLine",
          line: lineNumber,
          uri: documentUri
        });

      }
    }
      // add listener to watch for document uri set command

      function attachDocumentUriListener() {
        window.addEventListener('message', event => {
          const message = event.data;

          switch (message.command) {
            case "setDocumentUri":
              console.log("received set document uri request for", message.uri);
              if (documentUrl === undefined) {

              documentUri = message.uri;
              }
              break;
          }
        });
      }

      // request document uri from vscode
      function requestDocumentUri() {
        if (vscode) {
          vscode.postMessage({
            command: "requestDocumentUri",
          });
        }
      }

      // init
      let vscode =
        typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : undefined;
      let isAllCardsShown = true;

      let documentUri = "${documentUri}";
      let isUsedCardsShown = true;

      console.log(documentUri);

      console.log("Checking if this is in vscode", { vscode });

      generateCCIButtons();

      addSourceLineButtons(documentUri);

      if (vscode) {
        generatePointButtons();

        attachUpdateCardsListener();
        attachLineNavigationListener();

        // document uri listener
        attachDocumentUriListener();
     
      }


    </script>

</body>

</html>`;

}