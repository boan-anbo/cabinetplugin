import { CabinetNode, Card } from "cabinet-node";
import Token = require("markdown-it/lib/token");
import { MdItCore } from "./md-core-utils";
import { MarkdownPoint } from "./types/markdown-point";
import { MarkdownPointCard } from "./types/markdown-point-card";

const getNextInlineTokens = (tokens: Token[], currentIndex: number): Token | null => {
  const nextToken = tokens[currentIndex + 1];
  if (!nextToken) return null;
  if (nextToken && isInline(nextToken)) {
    return nextToken;
  } else {
    return getNextInlineTokens(tokens, currentIndex + 1);
  }
};

const getNextParagraphInline = (tokens: Token[], currentIndex: number): Token | null => {
  // console.log('Current token', tokens[currentIndex]);
  const nextToken = tokens[currentIndex + 1];
  if (!nextToken) return null;
  if (nextToken && nextToken.type === 'paragraph_open') {
    return getNextInlineTokens(tokens, currentIndex + 1);
    // return getNextInlineTokens(tokens, currentIndex + 1);
  } else {
    return getNextParagraphInline(tokens, currentIndex + 1);
  }
};

const getAllInlineParagraphsAfter = (tokens: Token[], currentIndex: number): Token[] => {
  const results: Token[] = [];
  for (let index = currentIndex + 1; index < tokens.length; index++) {
    const currentToken = tokens[index];
    if (currentToken.type === 'heading_open' || currentToken.type === 'list_item_open') {
      break;
    }

    if (currentToken.type === 'inline') {
      results.push(currentToken);
    }
  }
  return results;
};

export const parseMdStructure = (cabinetInstance: CabinetNode, mdString: string): MarkdownPoint[] => {
  const mdCore = new MdItCore();
  const tokens = mdCore.parseMd(mdString);


  const getCards = (fullText: string): Card[] | null => cabinetInstance.getAllCardsByCciFromText(fullText);

  let allPoints: MarkdownPoint[] = [];

  for (let index = 0; index < tokens.length; index++) {
    // get current token
    const token = tokens[index];
    // get next inline token, i.e. tokens under the current token.
    const nextToken = getNextInlineTokens(tokens, index);
    // if the current token is a node, i.e. it is a heading or a list item
    if (isNode(token)) {
      const markdownPoint = new MarkdownPoint();
      markdownPoint.mdMarkup = token.markup;
      markdownPoint.htmlMarkup = token.tag;
      markdownPoint.content = nextToken?.content ?? '';
      markdownPoint.line = token?.map ? token?.map[0] : 0;
      markdownPoint.subLevel = token.level;
      const headingLevel = token.markup.split('#').length - 1;
      markdownPoint.headingLevel = headingLevel > 0 ? headingLevel : null;
      markdownPoint.isHeading = token.type === 'heading_open';


      const followingInlineParagraphs = getAllInlineParagraphsAfter(tokens, index);

      followingInlineParagraphs.forEach(inlineToken => {

        const cards = getCards(inlineToken.content);
        // console.log('Found cards', cards?.length)
        if (cards && cards?.length > 0) {
          cards.forEach(card => {
            if (inlineToken.map) {
              const line = inlineToken.map[0];
              const markdownPointCard = new MarkdownPointCard(line, card);
              markdownPoint.cards.push(markdownPointCard);
            }
          });
        };
      });
      allPoints.push(markdownPoint);
    }
  }

  allPoints = populatePointsParentId(allPoints);

  return allPoints;
};

const populatePointsParentId = (allPoints: MarkdownPoint[]): MarkdownPoint[] => {
  const populatedPoints = [];
  let currentHeadingLevel: number | null = null;
  let currentHeadingId: string | null = null;
  for (let index = 0; index < allPoints.length; index++) {
    const point = allPoints[index];
    if (currentHeadingId && currentHeadingLevel) {
      if (point.isHeading && point.headingLevel) {
        if (point.headingLevel > currentHeadingLevel) {
          point.parentId = currentHeadingId;
        }
      }
      else {
        point.parentId = currentHeadingId;
      }
    }

    if (point.isHeading) {
      currentHeadingLevel = point.headingLevel;
      currentHeadingId = point.id;
    }

    populatedPoints.push(point);
  }
  return populatedPoints;
};




const isInline = (token: Token) => token.type === 'inline';

const isNode = (token: Token) => token.type === 'heading_open' || token.type === 'list_item_open';